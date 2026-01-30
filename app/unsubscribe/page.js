'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';

function UnsubscribeForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const searchParams = useSearchParams();

  // Get email from URL params if available
  const emailFromUrl = searchParams.get('email');

  useEffect(() => {
    if (emailFromUrl) {
      setEmail(emailFromUrl);
    }
  }, [emailFromUrl]);

  const handleUnsubscribe = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error('Por favor ingresa tu email');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        toast.success('Te has dado de baja exitosamente');
      } else {
        toast.error(data.error || 'Error al procesar la solicitud');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 text-green-500">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              ¡Desuscripción exitosa!
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Te has dado de baja de nuestro newsletter exitosamente.
            </p>
            <p className="mt-4 text-sm text-gray-500">
              Si cambias de opinión, siempre puedes volver a suscribirte desde nuestra página principal.
            </p>
            <div className="mt-6">
              <a
                href="/"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#2b3e81] hover:bg-[#1e2a5a] transition-colors duration-200"
              >
                Volver al inicio
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 text-[#2b3e81]">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Darse de baja del newsletter
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ingresa tu email para darte de baja de nuestro newsletter
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleUnsubscribe}>
          <div>
            <label htmlFor="email" className="sr-only">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#2b3e81] focus:border-[#2b3e81] focus:z-10 sm:text-sm"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#2b3e81] hover:bg-[#1e2a5a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2b3e81] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Procesando...
                </>
              ) : (
                'Darse de baja'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              ¿Cambiaste de opinión?{' '}
              <a href="/" className="font-medium text-[#2b3e81] hover:text-[#1e2a5a]">
                Volver al inicio
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="animate-spin mx-auto h-12 w-12 border-4 border-[#2b3e81] border-t-transparent rounded-full"></div>
        <p className="text-gray-600">Cargando...</p>
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <UnsubscribeForm />
    </Suspense>
  );
}
