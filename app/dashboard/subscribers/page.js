'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';

// Predefined colors for groups
const GROUP_COLORS = [
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#ef4444', // Red
  '#f97316', // Orange
  '#eab308', // Yellow
  '#22c55e', // Green
  '#14b8a6', // Teal
  '#0ea5e9', // Sky
  '#3b82f6', // Blue
];

export default function SubscribersPage() {
  const [email, setEmail] = useState('');
  const [selectedGroupsForNew, setSelectedGroupsForNew] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Groups state
  const [groups, setGroups] = useState([]);
  const [selectedGroupFilter, setSelectedGroupFilter] = useState('');
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [groupForm, setGroupForm] = useState({ name: '', description: '', color: GROUP_COLORS[0] });
  const [savingGroup, setSavingGroup] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState(null);
  const [deletingGroup, setDeletingGroup] = useState(false);

  // CSV Import states
  const [showImportModal, setShowImportModal] = useState(false);
  const [csvData, setCsvData] = useState([]);
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState(null);
  const [importSelectedGroups, setImportSelectedGroups] = useState([]);
  const fileInputRef = useRef(null);

  // Delete subscriber states
  const [subscriberToDelete, setSubscriberToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Edit subscriber groups states
  const [subscriberToEdit, setSubscriberToEdit] = useState(null);
  const [editingGroups, setEditingGroups] = useState([]);
  const [savingSubscriber, setSavingSubscriber] = useState(false);

  // Fetch data on component mount
  useEffect(() => {
    fetchGroups();
    fetchSubscribers();
  }, []);

  // Refetch subscribers when filter changes
  useEffect(() => {
    fetchSubscribers();
  }, [selectedGroupFilter]);

  const fetchGroups = async () => {
    try {
      const response = await fetch('/api/groups');
      const data = await response.json();
      if (data.success) {
        setGroups(data.groups);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const fetchSubscribers = async () => {
    try {
      const url = selectedGroupFilter
        ? `/api/subscribers?group=${selectedGroupFilter}`
        : '/api/subscribers';
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setSubscribers(data.subscribers || []);
      } else {
        console.error('API error:', data.error);
        toast.error(data.error || 'Error al cargar suscriptores');
        setSubscribers([]);
      }
    } catch (error) {
      console.error('Error fetching subscribers:', error);
      toast.error('Error de conexión al cargar suscriptores');
      setSubscribers([]);
    } finally {
      setFetching(false);
    }
  };

  const addSubscriberByEmail = async (emailToAdd, groupIds = []) => {
    if (!emailToAdd) {
      toast.error('Por favor ingresa un email');
      return false;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToAdd, groups: groupIds }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Suscriptor agregado exitosamente');
        setEmail('');
        setSelectedGroupsForNew([]);
        fetchSubscribers();
        fetchGroups();
        return true;
      } else {
        toast.error(data.error || 'Error al agregar suscriptor');
        return false;
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al agregar suscriptor');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const addSubscriber = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    await addSubscriberByEmail(email, selectedGroupsForNew);
  };

  // Group CRUD functions
  const openGroupModal = (group = null) => {
    if (group) {
      setEditingGroup(group);
      setGroupForm({ name: group.name, description: group.description, color: group.color });
    } else {
      setEditingGroup(null);
      setGroupForm({ name: '', description: '', color: GROUP_COLORS[Math.floor(Math.random() * GROUP_COLORS.length)] });
    }
    setShowGroupModal(true);
  };

  const closeGroupModal = () => {
    setShowGroupModal(false);
    setEditingGroup(null);
    setGroupForm({ name: '', description: '', color: GROUP_COLORS[0] });
  };

  const saveGroup = async () => {
    if (!groupForm.name.trim()) {
      toast.error('El nombre del grupo es requerido');
      return;
    }

    setSavingGroup(true);
    try {
      const response = await fetch('/api/groups', {
        method: editingGroup ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingGroup ? { id: editingGroup.id, ...groupForm } : groupForm),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(editingGroup ? 'Grupo actualizado' : 'Grupo creado');
        fetchGroups();
        closeGroupModal();
      } else {
        toast.error(data.error || 'Error al guardar grupo');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al guardar grupo');
    } finally {
      setSavingGroup(false);
    }
  };

  const confirmDeleteGroup = async () => {
    if (!groupToDelete) return;

    setDeletingGroup(true);
    try {
      const response = await fetch(`/api/groups?id=${groupToDelete.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Grupo eliminado');
        if (selectedGroupFilter === groupToDelete.id) {
          setSelectedGroupFilter('');
        }
        fetchGroups();
        fetchSubscribers();
      } else {
        toast.error(data.error || 'Error al eliminar grupo');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al eliminar grupo');
    } finally {
      setDeletingGroup(false);
      setGroupToDelete(null);
    }
  };

  // CSV Import functions
  const parseCSV = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];

    const firstLine = lines[0];
    const delimiter = firstLine.includes(';') ? ';' : ',';
    const headers = lines[0].split(delimiter).map(h => h.trim().toLowerCase().replace(/["']/g, ''));
    const emailIndex = headers.findIndex(h =>
      h === 'email' || h === 'correo' || h === 'e-mail' || h === 'mail'
    );

    const hasHeader = emailIndex !== -1;
    const emailCol = hasHeader ? emailIndex : 0;
    const startRow = hasHeader ? 1 : 0;

    const parsed = [];
    for (let i = startRow; i < lines.length; i++) {
      const values = lines[i].split(delimiter).map(v => v.trim().replace(/["']/g, ''));
      const email = values[emailCol];
      if (email && email.includes('@')) {
        parsed.push({ email });
      }
    }
    return parsed;
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const parsed = parseCSV(text);

      if (parsed.length === 0) {
        toast.error('No se encontraron emails válidos en el archivo');
        return;
      }

      setCsvData(parsed);
      setImportResults(null);
      setImportSelectedGroups([]);
      setShowImportModal(true);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleImport = async () => {
    if (csvData.length === 0) return;

    setImporting(true);
    try {
      const response = await fetch('/api/subscribers/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscribers: csvData,
          groupIds: importSelectedGroups,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setImportResults(data.results);
        toast.success(`Importación completada: ${data.results.imported} nuevos, ${data.results.reactivated} reactivados`);
        fetchSubscribers();
        fetchGroups();
      } else {
        toast.error(data.error || 'Error al importar');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al importar suscriptores');
    } finally {
      setImporting(false);
    }
  };

  const closeImportModal = () => {
    setShowImportModal(false);
    setCsvData([]);
    setImportResults(null);
    setImportSelectedGroups([]);
  };

  // Delete subscriber functions
  const handleDeleteClick = (subscriber) => {
    setSubscriberToDelete(subscriber);
  };

  const handleDeleteConfirm = async () => {
    if (!subscriberToDelete) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/subscribers?id=${subscriberToDelete.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Suscriptor eliminado exitosamente');
        fetchSubscribers();
        fetchGroups();
      } else {
        toast.error(data.error || 'Error al eliminar suscriptor');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al eliminar suscriptor');
    } finally {
      setDeleting(false);
      setSubscriberToDelete(null);
    }
  };

  // Edit subscriber groups functions
  const openEditSubscriberGroups = (subscriber) => {
    setSubscriberToEdit(subscriber);
    // Handle both populated groups (with id) and raw ObjectIds
    const groupIds = (subscriber.groups || [])
      .map(g => g?.id?.toString() || g?._id?.toString() || g?.toString())
      .filter(Boolean);
    setEditingGroups(groupIds);
  };

  const toggleGroupForSubscriber = (groupId) => {
    const gid = groupId?.toString();
    setEditingGroups(prev => {
      const exists = prev.some(id => id?.toString() === gid);
      if (exists) {
        return prev.filter(id => id?.toString() !== gid);
      }
      return [...prev, gid];
    });
  };

  const saveSubscriberGroups = async () => {
    if (!subscriberToEdit) return;

    setSavingSubscriber(true);
    try {
      const subscriberId = subscriberToEdit.id?.toString() || subscriberToEdit._id?.toString();

      const response = await fetch('/api/subscribers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: subscriberId,
          groups: editingGroups,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Grupos actualizados');
        fetchSubscribers();
        fetchGroups();
        setSubscriberToEdit(null);
      } else {
        toast.error(data.error || 'Error al actualizar grupos');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al actualizar grupos');
    } finally {
      setSavingSubscriber(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2b3e81]"></div>
          <p className="mt-4 text-gray-600">Cargando suscriptores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Gestión de Suscriptores</h1>
        <p className="text-gray-600">Administra los suscriptores del newsletter</p>
      </div>

      {/* Groups Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Grupos</h2>
          <button
            onClick={() => openGroupModal()}
            className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-br from-[#2b3e81] to-[#4d6fff] rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Grupo
          </button>
        </div>

        {groups.length === 0 ? (
          <p className="text-gray-500 text-sm">No hay grupos creados. Crea uno para segmentar tus suscriptores.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {groups.map((group) => (
              <div
                key={group.id}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors group"
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: group.color }}
                />
                <span className="font-medium text-gray-700">{group.name}</span>
                <span className="text-xs text-gray-500">({group.subscriberCount})</span>
                <div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openGroupModal(group)}
                    className="p-1 text-gray-400 hover:text-[#2b3e81] rounded"
                    title="Editar"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setGroupToDelete(group)}
                    className="p-1 text-gray-400 hover:text-red-500 rounded"
                    title="Eliminar"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Subscriber Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Agregar Suscriptor</h2>
        <form onSubmit={addSubscriber} className="space-y-4">
          <div className="flex gap-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@ejemplo.com"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2b3e81] focus:border-transparent"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-br from-[#2b3e81] to-[#4d6fff] text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Agregando...
                </>
              ) : (
                'Agregar'
              )}
            </button>
          </div>
          {groups.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Asignar a grupos (opcional):
              </label>
              <div className="flex flex-wrap gap-2">
                {groups.map((group) => (
                  <label
                    key={group.id}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                      selectedGroupsForNew.includes(group.id)
                        ? 'border-[#2b3e81] bg-[#2b3e81]/5'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedGroupsForNew.includes(group.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedGroupsForNew([...selectedGroupsForNew, group.id]);
                        } else {
                          setSelectedGroupsForNew(selectedGroupsForNew.filter(id => id !== group.id));
                        }
                      }}
                      className="w-4 h-4 text-[#2b3e81] rounded focus:ring-[#2b3e81]"
                    />
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: group.color }} />
                    <span className="text-sm font-medium text-gray-700">{group.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Subscribers List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            Suscriptores Activos ({subscribers.length})
          </h2>
          <div className="flex flex-wrap gap-2">
            {/* Group filter */}
            <select
              value={selectedGroupFilter}
              onChange={(e) => setSelectedGroupFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2b3e81]"
            >
              <option value="">Todos los grupos</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>{group.name}</option>
              ))}
            </select>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".csv,.txt"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-br from-[#2b3e81] to-[#4d6fff] rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Importar CSV
            </button>
            <button
              onClick={fetchSubscribers}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-[#2b3e81] hover:text-[#2b3e81] transition-all flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Actualizar
            </button>
          </div>
        </div>

        {subscribers.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <p className="text-lg font-medium">No hay suscriptores activos</p>
            <p className="text-sm mt-2">
              {selectedGroupFilter ? 'No hay suscriptores en este grupo' : 'Agrega algunos emails para poder enviar newsletters'}
            </p>
          </div>
        ) : (
          <div className="overflow-auto max-h-[400px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <table className="w-full">
              <thead className="sticky top-0 bg-white z-10">
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 bg-white">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 bg-white">Grupos</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 bg-white">Fuente</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 bg-white">Fecha</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 bg-white">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((subscriber) => (
                  <tr key={subscriber.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-gray-800">{subscriber.email}</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {subscriber.groups?.length > 0 ? (
                          subscriber.groups.map((group) => (
                            <span
                              key={group.id}
                              className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                              style={{ backgroundColor: group.color }}
                            >
                              {group.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400 text-sm">Sin grupo</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                        {subscriber.source}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-sm">
                      {new Date(subscriber.createdAt).toLocaleDateString('es-ES')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openEditSubscriberGroups(subscriber)}
                          className="p-2 text-gray-400 hover:text-[#2b3e81] hover:bg-blue-50 rounded-lg transition-all"
                          title="Editar grupos"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteClick(subscriber)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Eliminar suscriptor"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Add Test Emails */}
      <div className="bg-gradient-to-br from-[#2b3e81]/5 to-[#4d6fff]/5 rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-2">Emails de Prueba Rápida</h3>
        <p className="text-gray-600 text-sm mb-4">
          Para probar el envío de newsletters, puedes agregar estos emails de prueba:
        </p>
        <div className="flex flex-wrap gap-2">
          {['test1@gmail.com', 'test2@yahoo.com', 'test3@hotmail.com'].map((testEmail) => (
            <button
              key={testEmail}
              onClick={() => addSubscriberByEmail(testEmail)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-[#2b3e81] hover:text-[#2b3e81] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              + {testEmail}
            </button>
          ))}
        </div>
      </div>

      {/* Group Modal */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">
                {editingGroup ? 'Editar Grupo' : 'Nuevo Grupo'}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  value={groupForm.name}
                  onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                  placeholder="Ej: Emprendedores"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2b3e81]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción (opcional)</label>
                <input
                  type="text"
                  value={groupForm.description}
                  onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })}
                  placeholder="Ej: Suscriptores que son emprendedores"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2b3e81]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                <div className="flex flex-wrap gap-2">
                  {GROUP_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setGroupForm({ ...groupForm, color })}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        groupForm.color === color ? 'border-gray-800 scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={closeGroupModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={saveGroup}
                disabled={savingGroup}
                className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-br from-[#2b3e81] to-[#4d6fff] rounded-lg hover:shadow-lg disabled:opacity-50 flex items-center gap-2"
              >
                {savingGroup ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Group Modal */}
      {groupToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 text-center mb-2">Eliminar Grupo</h3>
              <p className="text-gray-600 text-center mb-6">
                ¿Estás seguro de que deseas eliminar el grupo <span className="font-medium text-gray-800">{groupToDelete.name}</span>? Los suscriptores no serán eliminados, solo se les quitará este grupo.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setGroupToDelete(null)}
                  disabled={deletingGroup}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDeleteGroup}
                  disabled={deletingGroup}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {deletingGroup ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Subscriber Modal */}
      {subscriberToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 text-center mb-2">Eliminar Suscriptor</h3>
              <p className="text-gray-600 text-center mb-6">
                ¿Estás seguro de que deseas eliminar a <span className="font-medium text-gray-800">{subscriberToDelete.email}</span>? Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setSubscriberToDelete(null)}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {deleting ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Subscriber Groups Modal */}
      {subscriberToEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">Asignar Grupos</h3>
              <p className="text-sm text-gray-600 mt-1">{subscriberToEdit.email}</p>
            </div>
            <div className="p-6">
              {groups.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No hay grupos creados. Crea uno primero.</p>
              ) : (
                <div className="space-y-2">
                  {groups.map((group) => (
                    <label
                      key={group.id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={editingGroups.some(id => id?.toString() === group.id?.toString())}
                        onChange={() => toggleGroupForSubscriber(group.id)}
                        className="w-4 h-4 text-[#2b3e81] rounded focus:ring-[#2b3e81]"
                      />
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: group.color }}
                      />
                      <span className="font-medium text-gray-700">{group.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setSubscriberToEdit(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={saveSubscriberGroups}
                disabled={savingSubscriber || groups.length === 0}
                className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-br from-[#2b3e81] to-[#4d6fff] rounded-lg hover:shadow-lg disabled:opacity-50"
              >
                {savingSubscriber ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import CSV Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">Importar Suscriptores</h3>
                <button
                  onClick={closeImportModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[50vh]">
              {!importResults ? (
                <>
                  <p className="text-gray-600 mb-4">
                    Se encontraron <span className="font-bold text-[#2b3e81]">{csvData.length}</span> emails en el archivo.
                  </p>

                  {/* Group selection for import */}
                  {groups.length > 0 && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Asignar a grupos (opcional):
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {groups.map((group) => (
                          <label
                            key={group.id}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                              importSelectedGroups.includes(group.id)
                                ? 'border-[#2b3e81] bg-[#2b3e81]/5'
                                : 'border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={importSelectedGroups.includes(group.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setImportSelectedGroups([...importSelectedGroups, group.id]);
                                } else {
                                  setImportSelectedGroups(importSelectedGroups.filter(id => id !== group.id));
                                }
                              }}
                              className="w-4 h-4 text-[#2b3e81] rounded focus:ring-[#2b3e81]"
                            />
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: group.color }} />
                            <span className="text-sm font-medium text-gray-700">{group.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-gray-700 mb-2">Vista previa:</h4>
                    <div className="max-h-48 overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-2 px-2 text-gray-600">#</th>
                            <th className="text-left py-2 px-2 text-gray-600">Email</th>
                          </tr>
                        </thead>
                        <tbody>
                          {csvData.slice(0, 10).map((item, index) => (
                            <tr key={index} className="border-b border-gray-100">
                              <td className="py-2 px-2 text-gray-500">{index + 1}</td>
                              <td className="py-2 px-2 text-gray-800">{item.email}</td>
                            </tr>
                          ))}
                          {csvData.length > 10 && (
                            <tr>
                              <td colSpan={2} className="py-2 px-2 text-gray-500 text-center">
                                ... y {csvData.length - 10} más
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 rounded-lg p-4 text-center">
                      <p className="text-3xl font-bold text-green-600">{importResults.imported}</p>
                      <p className="text-sm text-green-700">Nuevos importados</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                      <p className="text-3xl font-bold text-blue-600">{importResults.reactivated}</p>
                      <p className="text-sm text-blue-700">Reactivados</p>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4 text-center">
                      <p className="text-3xl font-bold text-yellow-600">{importResults.duplicates}</p>
                      <p className="text-sm text-yellow-700">Ya existían</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4 text-center">
                      <p className="text-3xl font-bold text-red-600">{importResults.errors.length}</p>
                      <p className="text-sm text-red-700">Errores</p>
                    </div>
                  </div>

                  {importResults.errors.length > 0 && (
                    <div className="bg-red-50 rounded-lg p-4">
                      <h4 className="font-medium text-red-700 mb-2">Errores:</h4>
                      <ul className="text-sm text-red-600 max-h-32 overflow-y-auto">
                        {importResults.errors.map((err, index) => (
                          <li key={index}>{err.email}: {err.error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              {!importResults ? (
                <>
                  <button
                    onClick={closeImportModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={importing}
                    className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-br from-[#2b3e81] to-[#4d6fff] rounded-lg hover:shadow-lg disabled:opacity-50 flex items-center gap-2"
                  >
                    {importing ? (
                      <>
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Importando...
                      </>
                    ) : (
                      <>Importar {csvData.length} suscriptores</>
                    )}
                  </button>
                </>
              ) : (
                <button
                  onClick={closeImportModal}
                  className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-br from-[#2b3e81] to-[#4d6fff] rounded-lg hover:shadow-lg"
                >
                  Cerrar
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
