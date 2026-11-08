import { useState } from 'react';
import { FiCalendar, FiClock, FiDollarSign, FiStar, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import EmptyState from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';
import LoadingSpinner from '../components/LoadingSpinner';
import Pagination from '../components/Pagination';
import StarRating from '../components/StarRating';
import StatusBadge from '../components/StatusBadge';
import { useFetch } from '../hooks/useFetch';
import { usePagination } from '../hooks/usePagination';
import { appointmentService } from '../services/appointmentService';
import { reviewService } from '../services/reviewService';
import type { AppointmentDTO } from '../types';

export default function MyAppointmentsPage() {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentDTO | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const {
    data: appointments,
    loading,
    error,
    refetch,
  } = useFetch((signal) => appointmentService.getMyAppointments(signal));

  const filtered = appointments
    ? appointments.filter((apt) => (filterStatus === 'ALL' ? true : apt.status === filterStatus))
    : [];

  const {
    currentPage,
    totalPages,
    paginatedData,
    pageSize,
    setPage,
    setPageSize,
    startIndex,
    endIndex,
    totalItems,
  } = usePagination(filtered, 8);

  const handleOpenReview = (apt: AppointmentDTO) => {
    setSelectedAppointment(apt);
    setReviewRating(5);
    setReviewComment('');
    setReviewModalOpen(true);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointment) return;
    setSubmittingReview(true);
    try {
      await reviewService.create({
        appointmentId: selectedAppointment.id,
        rating: reviewRating,
        comment: reviewComment.trim() || undefined,
      });
      toast.success('¡Reseña enviada con éxito!');
      setReviewModalOpen(false);
      refetch();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Error al enviar la reseña';
      toast.error(msg);
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Citas Médicas</h1>
          <p className="text-gray-600 mt-1">Historial y estado de tus citas programadas</p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
          {['ALL', 'PENDIENTE', 'ACEPTADA', 'COMPLETADA', 'RECHAZADA'].map((st) => (
            <button
              key={st}
              onClick={() => {
                setFilterStatus(st);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterStatus === st
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {st === 'ALL' ? 'Todas' : st}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Cargando tus citas..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={refetch} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No hay citas registradas"
          description={
            filterStatus === 'ALL'
              ? 'Aún no has reservado ninguna cita médica.'
              : `No tienes citas con estado ${filterStatus}.`
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paginatedData.map((apt) => (
              <div
                key={apt.id}
                className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-teal-50 text-teal-600 rounded-lg">
                      <FiCalendar className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {apt.medicalServiceName || `Cita #${apt.id}`}
                      </p>
                      <p className="text-xs text-gray-500">
                        {apt.professionalName ? `Dr(a). ${apt.professionalName} • ` : ''}Cita #{apt.id}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={apt.status} />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-1.5">
                    <FiCalendar className="h-3.5 w-3.5 text-gray-400" />
                    <span>{apt.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FiClock className="h-3.5 w-3.5 text-gray-400" />
                    <span>{apt.time}</span>
                  </div>
                  <div className="flex items-center gap-1.5 col-span-2">
                    <FiDollarSign className="h-3.5 w-3.5 text-gray-400" />
                    <span className="font-semibold text-gray-900">
                      S/ {apt.price?.toFixed(2) ?? '—'}
                    </span>
                  </div>
                </div>

                {apt.notes && (
                  <p className="text-xs text-gray-600 italic border-l-2 border-teal-500 pl-2">
                    "{apt.notes}"
                  </p>
                )}

                {apt.status === 'COMPLETADA' && (
                  <div className="pt-2 border-t border-gray-100 flex justify-end">
                    <button
                      onClick={() => handleOpenReview(apt)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-medium hover:bg-amber-600 transition-colors"
                    >
                      <FiStar className="h-3.5 w-3.5" />
                      Dejar Reseña
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setPage}
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
            startIndex={startIndex}
            endIndex={endIndex}
            totalItems={totalItems}
          />
        </>
      )}

      {/* Review Modal */}
      {reviewModalOpen && selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Dejar Reseña</h3>
              <button
                onClick={() => setReviewModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Calificación (1 a 5 estrellas)
                </label>
                <StarRating
                  rating={reviewRating}
                  interactive
                  size="lg"
                  onChange={setReviewRating}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Comentario (opcional)
                </label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={4}
                  placeholder="¿Cómo fue tu experiencia con el profesional?"
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {submittingReview && (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  )}
                  Publicar Reseña
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
