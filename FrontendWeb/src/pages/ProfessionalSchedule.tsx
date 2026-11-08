import React, { useState, useEffect } from 'react';
import { FiCalendar, FiClock, FiPlus, FiTrash2, FiAlertCircle, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import { availabilityService } from '../services/availabilityService';
import { professionalService } from '../services/professionalService';
import type { AvailabilityDTO } from '../types';

const DAYS_OF_WEEK = [
  { value: 'LUNES', label: 'Lunes' },
  { value: 'MARTES', label: 'Martes' },
  { value: 'MIERCOLES', label: 'Miércoles' },
  { value: 'JUEVES', label: 'Jueves' },
  { value: 'VIERNES', label: 'Viernes' },
  { value: 'SABADO', label: 'Sábado' },
  { value: 'DOMINGO', label: 'Domingo' },
];

export default function ProfessionalSchedulePage() {
  const [schedules, setSchedules] = useState<AvailabilityDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [dayOfWeek, setDayOfWeek] = useState('LUNES');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('13:00');
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadSchedules = async () => {
    setLoading(true);
    setError(null);
    try {
      const prof = await professionalService.getMyProfile();
      const data = await availabilityService.getByProfessional(prof.id);
      setSchedules(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'No se pudieron cargar los horarios de atención.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedules();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startTime || !endTime) {
      toast.error('Por favor especifica la hora de inicio y fin.');
      return;
    }
    if (startTime >= endTime) {
      toast.error('La hora de inicio debe ser anterior a la hora de fin.');
      return;
    }

    setSubmitting(true);
    try {
      await availabilityService.create({
        dayOfWeek,
        startTime,
        endTime,
      });
      toast.success('Horario de atención añadido exitosamente.');
      await loadSchedules();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Error al registrar el horario.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este bloque de horario?')) return;
    setDeletingId(id);
    try {
      await availabilityService.remove(id);
      toast.success('Horario eliminado.');
      setSchedules((prev) => prev.filter((s) => s.id !== id));
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'No se pudo eliminar el horario.');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <LoadingSpinner text="Cargando tu horario de atención..." />;
  if (error) return <ErrorMessage message={error} onRetry={loadSchedules} />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800">
            GESTIÓN PROFESIONAL
          </span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">
          Definir Horarios de Atención Semanales 📅
        </h1>
        <p className="text-gray-600 mt-1">
          Configura los días y rangos horarios en los que tus pacientes podrán reservar citas médicas.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulario de creación */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm sticky top-24">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-teal-50 text-teal-600 rounded-lg">
                <FiPlus className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Añadir Nuevo Bloque</h2>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Día de la Semana
                </label>
                <select
                  value={dayOfWeek}
                  onChange={(e) => setDayOfWeek(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {DAYS_OF_WEEK.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                    <FiClock className="h-3.5 w-3.5 text-gray-400" /> Hora Inicio
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                    <FiClock className="h-3.5 w-3.5 text-gray-400" /> Hora Fin
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
              </div>

              <div className="p-3 bg-teal-50/70 border border-teal-100 rounded-xl text-xs text-teal-800 flex items-start gap-2">
                <FiAlertCircle className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" />
                <p>
                  El sistema validará que las citas de los pacientes coincidan estrictamente con estos turnos.
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                {submitting ? (
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <FiCheck className="h-4 w-4" />
                )}
                {submitting ? 'Guardando horario...' : 'Guardar Horario'}
              </button>
            </form>
          </div>
        </div>

        {/* Listado de horarios registrados */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">
              Horarios Activos ({schedules.length})
            </h2>
            <span className="text-xs text-gray-500">Visualización de tu jornada semanal</span>
          </div>

          {schedules.length === 0 ? (
            <EmptyState
              title="Aún no has registrado horarios"
              description="Agrega tus primeros bloques de atención con el formulario a la izquierda para que los pacientes puedan solicitar citas."
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {schedules.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:border-teal-200 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                      <FiCalendar className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{item.dayOfWeek}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <FiClock className="h-3 w-3" />
                        {item.startTime} — {item.endTime}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={deletingId === item.id}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
                    title="Eliminar este bloque"
                  >
                    {deletingId === item.id ? (
                      <div className="h-4 w-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                    ) : (
                      <FiTrash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

