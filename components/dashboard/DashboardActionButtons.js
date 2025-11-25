"use client";

import { useState, useRef, useEffect } from "react";

export default function DashboardActionButtons({ 
  onFilterChange, 
  onPeriodChange, 
  selectedFilter: externalFilter, 
  selectedPeriod: externalPeriod 
}) {
  const [filterOpen, setFilterOpen] = useState(false);
  const [periodOpen, setPeriodOpen] = useState(false);
  const [internalFilter, setInternalFilter] = useState(null);
  const [internalPeriod, setInternalPeriod] = useState(null);
  const filterRef = useRef(null);
  const periodRef = useRef(null);

  // Usar props externos si están disponibles, sino usar estado interno
  const selectedFilter = externalFilter !== undefined ? externalFilter : internalFilter;
  const selectedPeriod = externalPeriod !== undefined ? externalPeriod : internalPeriod;

  // Cerrar dropdowns al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setFilterOpen(false);
      }
      if (periodRef.current && !periodRef.current.contains(event.target)) {
        setPeriodOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filterOptions = [
    { value: "todos", label: "Todos" },
    { value: "enviados", label: "Solo Enviados" },
    { value: "pendientes", label: "Solo Pendientes" },
    { value: "hoy", label: "Hoy" },
    { value: "semana", label: "Esta Semana" },
    { value: "mes", label: "Este Mes" },
  ];

  const periodOptions = [
    { value: "todos", label: "Todos los períodos" },
    { value: "mes-actual", label: "Este mes" },
    { value: "mes-anterior", label: "Mes anterior" },
    { value: "ultimos-3-meses", label: "Últimos 3 meses" },
    { value: "ultimos-6-meses", label: "Últimos 6 meses" },
    { value: "año-actual", label: "Este año" },
  ];

  const handleDownload = async () => {
    try {
      const response = await fetch("/api/dashboard/export");
      if (!response.ok) throw new Error("Error al generar reporte");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `reporte-dashboard-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error al descargar reporte:", error);
      alert("Error al descargar el reporte. Por favor, intenta nuevamente.");
    }
  };

  const handleFilterChange = (filterValue) => {
    const newFilter = filterValue === "todos" 
      ? null 
      : filterOptions.find((opt) => opt.value === filterValue);
    
    if (onFilterChange) {
      onFilterChange(newFilter);
    } else {
      setInternalFilter(newFilter);
    }
    setFilterOpen(false);
  };

  const handlePeriodChange = (periodValue) => {
    const newPeriod = periodValue === "todos"
      ? null
      : periodOptions.find((opt) => opt.value === periodValue);
    
    if (onPeriodChange) {
      onPeriodChange(newPeriod);
    } else {
      setInternalPeriod(newPeriod);
    }
    setPeriodOpen(false);
  };

  return (
    <div className="hidden lg:flex items-center gap-3">
      {/* Filtro */}
      <div className="relative" ref={filterRef}>
        <button
          onClick={() => setFilterOpen(!filterOpen)}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
            selectedFilter
              ? "text-[#2b3e81] bg-[#2b3e81]/10 border border-[#2b3e81]/20"
              : "text-gray-700 hover:text-[#2b3e81] hover:bg-gray-100"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          {selectedFilter ? selectedFilter.label : "Filtrar"}
          {selectedFilter && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onFilterChange) {
                  onFilterChange(null);
                } else {
                  setInternalFilter(null);
                }
              }}
              className="ml-1 text-[#2b3e81] hover:text-[#1a2d5f]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-3 h-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`w-3 h-3 transition-transform ${filterOpen ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {filterOpen && (
          <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleFilterChange(option.value)}
                className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                  selectedFilter?.value === option.value
                    ? "bg-[#2b3e81] text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Periodo Mensual */}
      <div className="relative" ref={periodRef}>
        <button
          onClick={() => setPeriodOpen(!periodOpen)}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
            selectedPeriod
              ? "text-[#2b3e81] bg-[#2b3e81]/10 border border-[#2b3e81]/20"
              : "text-gray-700 hover:text-[#2b3e81] hover:bg-gray-100"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          {selectedPeriod ? selectedPeriod.label : "Mensual"}
          {selectedPeriod && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onPeriodChange) {
                  onPeriodChange(null);
                } else {
                  setInternalPeriod(null);
                }
              }}
              className="ml-1 text-[#2b3e81] hover:text-[#1a2d5f]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-3 h-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`w-3 h-3 transition-transform ${periodOpen ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {periodOpen && (
          <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
            {periodOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handlePeriodChange(option.value)}
                className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                  selectedPeriod?.value === option.value
                    ? "bg-[#2b3e81] text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Descargar */}
      <button
        onClick={handleDownload}
        className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-[#2b3e81] hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
        Descargar
      </button>
    </div>
  );
}

