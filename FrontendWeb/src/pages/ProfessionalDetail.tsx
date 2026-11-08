import { useState } from 'react';
import { FiCalendar, FiClock, FiHeart, FiMapPin, FiUser } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';
import LoadingSpinner from '../components/LoadingSpinner';
import StarRating from '../components/StarRating';
import { useAuth } from '../contexts/AuthContext';
import { useFetch } from '../hooks/useFetch';
import { appointmentService } from '../services/appointmentService';
import { availabilityService } from '../services/availabilityService';
import { favoriteService } from '../services/favoriteService';
import { medicalServiceService } from '../services/medicalServiceService';
import { professionalService } from '../services/professionalService';
import { reviewService } from '../services/reviewService';

export default function ProfessionalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const profId = Number(id);
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();

  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  const { data: prof, loading: loadingProf, error } = useFetch(
    (signal) => professionalService.getById(profId, signal),
    [profId]
  );
  const { data: services } = useFetch(
    (signal) => medicalServiceService.getByProfessional(profId, signal),
    [profId]
  );
  const { data: availabilities } = useFetch(
    (signal) => availabilityService.getByProfessional(profId, signal),
    [profId]
  );
  const { data: reviews } = useFetch(
    (signal) => reviewService.getByProfessional(profId, signal),
    [profId]
  );
  const { data: favorites, refetch: refetchFavs } = useFetch(
    (signal) => (isAuthenticated && role === 'PATIENT' ? favoriteService.getMyFavorites(signal) : Promise.resolve([])),
    [isAuthenticated, role]
  );

  const isFav = favorites?.some((f) => f.professionalId === profId);

  const handleToggleFav = async () => {
    if (!isAuthenticated) {
      toast.error('Inicia sesión para guardar en favoritos');
      return;
    }
    try {
      const existing = favorites?.find((f) => f.professionalId === profId);
      if (existing) {
        await favoriteService.removeFavorite(existing.id);
        toast.success('Eliminado de favoritos');
      } else {
        await favoriteService.addFavorite(profId);
        toast.success('Agregado a favoritos');
      }
      refetchFavs();
    } catch {
      toast.error('Error al actualizar favoritos');
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Debes iniciar sesión como paciente para reservar');
      navigate('/login');
      return;
    }
    if (role !== 'PATIENT') {
      toast.error('Solo los pacientes pueden reservar citas');
      return;
    }
    if (!selectedService || !selectedDate || !selectedTime) {
      toast.error('Por favor completa todos los campos de la reserva');
      return;
    }

    setBookingLoading(true);
    try {
      await appointmentService.create({
        medicalServiceId: selectedService,
        date: selectedDate,
        time: selectedTime,
        notes: notes.trim() || undefined,
      });
      toast.success('¡Cita solicitada exitosamente!');
      navigate('/appointments');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Error al solicitar la cita';
      toast.error(msg);
    } finally {
      setBookingLoading(false);
    }
  };

  if (loadingProf) return <LoadingSpinner text="Cargando detalles del profesional..." />;
  if (error || !prof) return <ErrorMessage message={error || 'Profesional no encontrado'} />;

  return (
    <div className="space-y-8">
      {/* Header Profile Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="h-20 w-20 rounded-2xl bg-teal-600 flex items-center justify-center font-bold text-white text-3xl shadow-sm">
              {prof.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">{prof.name}</h1>
                <span className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-xs font-semibold">
                  {prof.specialty || 'General'}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                <div className="flex items-center gap-1.5">
                  <FiMapPin className="h-4 w-4 text-gray-400" />
                  <span>{prof.location || 'Lima, Perú'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <StarRating rating={prof.rating} />
                  <span className="text-xs text-gray-400">({reviews?.length ?? 0} reseñas)</span>
                </div>
              </div>
            </div>
          </div>

          {isAuthenticated && role === 'PATIENT' && (
            <button
              onClick={handleToggleFav}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                isFav
                  ? 'border-red-200 bg-red-50 text-red-600'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FiHeart className={`h-4 w-4 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
              {isFav ? 'En Favoritos' : 'Guardar en Favoritos'}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Services & Reviews & Availability */}
        <div className="lg:col-span-2 space-y-8">
          {/* Services */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Servicios Médicos Disponibles</h2>
            {services && services.length > 0 ? (
              <div className="space-y-3">
                {services.map((srv) => (
                  <div
                    key={srv.id}
                    onClick={() => setSelectedService(srv.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      selectedService === srv.id
                        ? 'border-teal-600 bg-teal-50/50 ring-1 ring-teal-600'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{srv.name}</h3>
                        <p className="text-xs text-gray-500 mt-1">{srv.description || 'Sin descripción'}</p>
                      </div>
                      <span className="text-lg font-bold text-teal-700">S/ {srv.price?.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-6">Este profesional no tiene servicios publicados</p>
            )}
          </div>

          {/* Availability schedule */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Horarios de Atención Semanal</h2>
            {availabilities && availabilities.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availabilities.map((av) => (
                  <div key={av.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <FiClock className="h-5 w-5 text-teal-600" />
                    <div>
                      <p className="text-xs font-semibold text-gray-800 uppercase">{av.dayOfWeek}</p>
                      <p className="text-xs text-gray-500">
                        {av.startTime} - {av.endTime}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-6">No hay horarios registrados</p>
            )}
          </div>

          {/* Reviews */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Reseñas de Pacientes</h2>
              <span className="text-xs text-gray-500">{reviews?.length ?? 0} opiniones verificadas</span>
            </div>
            {reviews && reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div key={rev.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                          <FiUser />
                        </div>
                        <span className="text-sm font-medium text-gray-800">
                          {rev.patientName || `Paciente #${rev.patientId}`}
                        </span>
                      </div>
                      <StarRating rating={rev.rating} size="sm" />
                    </div>
                    {rev.comment && <p className="text-xs text-gray-600 mt-1 pl-9">{rev.comment}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="Sin reseñas todavía" description="Sé el primer paciente en dejar una reseña tras completar una cita." />
            )}
          </div>
        </div>

        {/* Right Column: Booking Form */}
        <div>
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Reservar Cita</h2>

            <form onSubmit={handleBooking} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">1. Servicio Médico</label>
                <select
                  value={selectedService || ''}
                  onChange={(e) => setSelectedService(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  <option value="">Selecciona un servicio</option>
                  {services?.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} — S/ {s.price}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">2. Fecha de la Cita</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">3. Hora de la Cita</label>
                <input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
                <p className="text-[11px] text-gray-400 mt-1">Asegúrate de que coincida con los horarios semanales del profesional.</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Notas o Síntomas (opcional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Describe brevemente el motivo de tu consulta..."
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <button
                type="submit"
                disabled={bookingLoading}
                className="w-full py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors font-medium text-sm disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
              >
                {bookingLoading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <FiCalendar className="h-4 w-4" />
                )}
                {bookingLoading ? 'Reservando...' : 'Confirmar Reserva'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
