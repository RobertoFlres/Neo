'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

export default function SubscribersPage() {
  const [email, setEmail] = useState('');
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Fetch subscribers on component mount
  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      const response = await fetch('/api/subscribers');
      const data = await response.json();
      
      if (data.success) {
        setSubscribers(data.subscribers);
      }
    } catch (error) {
      console.error('Error fetching subscribers:', error);
    } finally {
      setFetching(false);
    }
  };

  const addSubscriberByEmail = async (emailToAdd) => {
    if (!emailToAdd) {
      toast.error('Por favor ingresa un email');
      return false;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/subscribers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: emailToAdd }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Suscriptor agregado exitosamente');
        setEmail('');
        fetchSubscribers();
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
    
    await addSubscriberByEmail(email);
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
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Gestión de Suscriptores
        </h1>
        <p className="text-gray-600">
          Administra los suscriptores del newsletter
        </p>
      </div>

      {/* Add Subscriber Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Agregar Suscriptor</h2>
        <form onSubmit={addSubscriber} className="flex gap-4">
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
        </form>
      </div>

      {/* Subscribers List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            Suscriptores Activos ({subscribers.length})
          </h2>
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

        {subscribers.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <p className="text-lg font-medium">No hay suscriptores activos</p>
            <p className="text-sm mt-2">
              Agrega algunos emails de prueba para poder enviar newsletters
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Fuente</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Fecha de Registro</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((subscriber, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-gray-800">{subscriber.email}</td>
                    <td className="py-3 px-4">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                        {subscriber.source}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-sm">
                      {new Date(subscriber.createdAt).toLocaleDateString('es-ES')}
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
        <h3 className="text-lg font-bold text-gray-800 mb-2">
          Emails de Prueba Rápida
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          Para probar el envío de newsletters, puedes agregar estos emails de prueba:
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            'test1@gmail.com',
            'test2@yahoo.com',
            'test3@hotmail.com'
            ].map((testEmail) => (
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
    </div>
  );
}
