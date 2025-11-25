"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import DashboardActionButtons from "./DashboardActionButtons";

export default function DashboardContent({ initialData, userName }) {
  const [filter, setFilter] = useState(null);
  const [period, setPeriod] = useState(null);

  // Función para calcular fechas según el periodo
  const getPeriodDates = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    if (!period) return null;

    switch (period.value) {
      case "mes-actual":
        return {
          start: new Date(now.getFullYear(), now.getMonth(), 1),
          end: new Date(now.getFullYear(), now.getMonth() + 1, 0),
        };
      case "mes-anterior":
        return {
          start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
          end: new Date(now.getFullYear(), now.getMonth(), 0),
        };
      case "ultimos-3-meses":
        return {
          start: new Date(now.getFullYear(), now.getMonth() - 3, 1),
          end: now,
        };
      case "ultimos-6-meses":
        return {
          start: new Date(now.getFullYear(), now.getMonth() - 6, 1),
          end: now,
        };
      case "año-actual":
        return {
          start: new Date(now.getFullYear(), 0, 1),
          end: now,
        };
      default:
        return null;
    }
  };

  // Filtrar actividad reciente
  const filteredActivity = useMemo(() => {
    let activity = [...initialData.formattedActivity];
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Aplicar filtro por estado
    if (filter) {
      switch (filter.value) {
        case "enviados":
          activity = activity.filter((item) => item.status === "sent");
          break;
        case "pendientes":
          activity = activity.filter((item) => item.status === "draft");
          break;
        case "hoy": {
          activity = activity.filter((item) => {
            if (!item.date) return false;
            const itemDate = new Date(item.date);
            itemDate.setHours(0, 0, 0, 0);
            return itemDate.getTime() === today.getTime();
          });
          break;
        }
        case "semana": {
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          activity = activity.filter((item) => {
            if (!item.date) return false;
            const itemDate = new Date(item.date);
            return itemDate >= weekAgo && itemDate <= now;
          });
          break;
        }
        case "mes": {
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          activity = activity.filter((item) => {
            if (!item.date) return false;
            const itemDate = new Date(item.date);
            return itemDate >= monthAgo && itemDate <= now;
          });
          break;
        }
        default:
          break;
      }
    }

    // Aplicar filtro por periodo
    const periodDates = getPeriodDates();
    if (periodDates && periodDates.start && periodDates.end) {
      activity = activity.filter((item) => {
        if (!item.date) return false;
        const itemDate = new Date(item.date);
        return itemDate >= periodDates.start && itemDate <= periodDates.end;
      });
    }

    return activity;
  }, [filter, period, initialData.formattedActivity]);

  // Calcular estadísticas filtradas
  const filteredStats = useMemo(() => {
    let stats = { ...initialData.stats };
    const periodDates = getPeriodDates();

    if (periodDates) {
      // Aquí podrías recalcular las estadísticas según el periodo
      // Por ahora mantenemos las originales ya que necesitaríamos datos más detallados del servidor
    }

    return stats;
  }, [period, initialData.stats]);

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 18) return "Buenas tardes";
    return "Buenas noches";
  };

  return (
    <div className="space-y-6">
      {/* Header with Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            {getGreeting()}, {userName || "Administrador"}!
          </h1>
          <p className="text-gray-600">
            Aquí tienes un resumen de tu actividad
          </p>
        </div>
        
        {/* Action Buttons */}
        <DashboardActionButtons 
          onFilterChange={setFilter}
          onPeriodChange={setPeriod}
          selectedFilter={filter}
          selectedPeriod={period}
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow relative">
          <p className="text-sm text-gray-600 mb-2 min-h-[2.5rem]">Total Suscriptores</p>
          <div className="flex items-start justify-between">
            <p className="text-3xl font-bold text-gray-800 leading-tight">
              {filteredStats.totalSubscribers.toLocaleString()}
            </p>
            <div className="w-12 h-12 bg-gradient-to-br from-[#2b3e81] to-[#4d6fff] rounded-lg flex items-center justify-center flex-shrink-0 ml-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow relative">
          <p className="text-sm text-gray-600 mb-2 min-h-[2.5rem]">Newsletters Enviados</p>
          <div className="flex items-start justify-between">
            <p className="text-3xl font-bold text-gray-800 leading-tight">
              {filteredStats.newslettersSent.toLocaleString()}
            </p>
            <div className="w-12 h-12 bg-gradient-to-br from-[#4d6fff] to-[#6b8eff] rounded-lg flex items-center justify-center flex-shrink-0 ml-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow relative">
          <p className="text-sm text-gray-600 mb-2 min-h-[2.5rem]">Último Envío</p>
          <div className="flex items-start justify-between">
            <p className="text-3xl font-bold text-gray-800 leading-tight">
              {filteredStats.lastNewsletter}
            </p>
            <div className="w-12 h-12 bg-gradient-to-br from-[#6b8eff] to-[#89a6ff] rounded-lg flex items-center justify-center flex-shrink-0 ml-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow relative">
          <p className="text-sm text-gray-600 mb-2 min-h-[2.5rem]">Pendientes</p>
          <div className="flex items-start justify-between">
            <p className="text-3xl font-bold text-gray-800 leading-tight">
              {filteredStats.pendingNewsletters}
            </p>
            <div className="w-12 h-12 bg-gradient-to-br from-[#89a6ff] to-[#a7c4ff] rounded-lg flex items-center justify-center flex-shrink-0 ml-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link 
            href="/dashboard/generate" 
            className="bg-gradient-to-br from-[#2b3e81] to-[#4d6fff] text-white px-6 py-4 rounded-lg font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
            Generar Newsletter
          </Link>
          
          <Link 
            href="/dashboard/newsletters" 
            className="bg-white border-2 border-gray-200 text-gray-700 px-6 py-4 rounded-lg font-medium hover:border-[#2b3e81] hover:text-[#2b3e81] transition-all flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            Ver Newsletters
          </Link>
          
          <Link 
            href="/dashboard/subscribers" 
            className="bg-white border-2 border-gray-200 text-gray-700 px-6 py-4 rounded-lg font-medium hover:border-[#2b3e81] hover:text-[#2b3e81] transition-all flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
            Gestionar Suscriptores
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Actividad Reciente</h2>
        {filteredActivity.length > 0 ? (
          <div className="space-y-3">
            {filteredActivity.map((activity, index) => (
              <div key={index} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="text-2xl">{activity.icon}</div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{activity.description}</p>
                  <p className="text-sm text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No hay actividad reciente{filter ? ` con el filtro "${filter.label}"` : ""}</p>
          </div>
        )}
      </div>
    </div>
  );
}

