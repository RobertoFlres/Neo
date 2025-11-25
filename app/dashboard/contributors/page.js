'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

export default function ContributorsPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [contributors, setContributors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [deleting, setDeleting] = useState(null);

  // Fetch contributors on component mount
  useEffect(() => {
    fetchContributors();
  }, []);

  const fetchContributors = async () => {
    try {
      const response = await fetch('/api/contributors');
      const data = await response.json();
      
      if (data.success) {
        setContributors(data.contributors);
      } else {
        toast.error(data.error || 'Error al cargar colaboradores');
      }
    } catch (error) {
      console.error('Error fetching contributors:', error);
      toast.error('Error al cargar colaboradores');
    } finally {
      setFetching(false);
    }
  };

  const addContributor = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Por favor ingresa un email');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/contributors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, name }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Colaborador agregado exitosamente');
        setEmail('');
        setName('');
        fetchContributors(); // Refresh the list
      } else {
        toast.error(data.error || 'Error al agregar colaborador');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al agregar colaborador');
    } finally {
      setLoading(false);
    }
  };

  const deleteContributor = async (id) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este colaborador?')) {
      return;
    }

    setDeleting(id);

    try {
      const response = await fetch(`/api/contributors?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Colaborador eliminado exitosamente');
        fetchContributors(); // Refresh the list
      } else {
        toast.error(data.error || 'Error al eliminar colaborador');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al eliminar colaborador');
    } finally {
      setDeleting(null);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2b3e81]"></div>
          <p className="mt-4 text-gray-600">Cargando colaboradores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Gestión de Colaboradores
        </h1>
        <p className="text-gray-600">
          Administra los colaboradores que pueden acceder al dashboard de contribuidores
        </p>
      </div>

      {/* Add Contributor Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Agregar Colaborador</h2>
        <form onSubmit={addContributor} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colaborador@ejemplo.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2b3e81] focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nombre (opcional)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre del colaborador"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2b3e81] focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-br from-[#2b3e81] to-[#4d6fff] text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Agregando...
              </>
            ) : (
              'Agregar Colaborador'
            )}
          </button>
        </form>
      </div>

      {/* Contributors List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            Colaboradores Activos ({contributors.filter(c => c.isActive).length})
          </h2>
          <button
            onClick={fetchContributors}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-[#2b3e81] hover:text-[#2b3e81] transition-all flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Actualizar
          </button>
        </div>

        {contributors.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-lg font-medium">No hay colaboradores registrados</p>
            <p className="text-sm mt-2">
              Agrega colaboradores para que puedan acceder al dashboard de contribuidores
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Nombre</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Estado</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Agregado por</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Fecha de Registro</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {contributors.map((contributor) => (
                  <tr key={contributor._id || contributor.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-gray-800 font-medium">{contributor.email}</td>
                    <td className="py-3 px-4 text-gray-600">{contributor.name || '-'}</td>
                    <td className="py-3 px-4">
                      {contributor.isActive ? (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">Activo</span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">Inactivo</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                        {contributor.addedBy || '-'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-sm">
                      {contributor.createdAt
                        ? new Date(contributor.createdAt).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : '-'}
                    </td>
                    <td className="py-3 px-4">
                      {contributor.isActive && (
                        <button
                          onClick={() => deleteContributor(contributor._id || contributor.id)}
                          disabled={deleting === (contributor._id || contributor.id)}
                          className="px-3 py-1.5 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 hover:border-red-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {deleting === (contributor._id || contributor.id) ? (
                            <>
                              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Eliminando...
                            </>
                          ) : (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Eliminar
                            </>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-gradient-to-br from-[#2b3e81]/5 to-[#4d6fff]/5 rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[#2b3e81]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Información
        </h3>
        <ul className="text-gray-700 space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-[#2b3e81] mt-0.5">•</span>
            <span>Los colaboradores pueden acceder al dashboard de contribuidores en <code className="bg-white px-2 py-0.5 rounded border border-gray-300 text-xs font-mono">/contributor</code></span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#2b3e81] mt-0.5">•</span>
            <span>Los colaboradores pueden crear y editar artículos que luego pueden ser aprobados por el admin</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#2b3e81] mt-0.5">•</span>
            <span>Al eliminar un colaborador, se desactiva su acceso pero no se borra de la base de datos</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

