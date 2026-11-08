import { useState } from 'react';
import { FiCalendar, FiCheck, FiClock, FiDollarSign, FiUser, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/ConfirmModal';
import EmptyState from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';
import LoadingSpinner from '../components/LoadingSpinner';
import Pagination from '../components/Pagination';
import PatientContactModal from '../components/PatientContactModal';
import StatusBadge from '../components/StatusBadge';
import { useFetch } from '../hooks/useFetch';
import { usePagination } from '../hooks/usePagination';
import { appointmentService } from '../services/appointmentService';
import type { AppointmentDTO } from '../types';

export default function ProfessionalAppointmentsPage() {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [selectedApt, setSelectedApt] = useState<AppointmentDTO | null>(null);
  const [contactApt, setContactApt] = useState<AppointmentDTO | null>(null);
  const [actionType, setActionType] = useState<'accept' | 'reject' | 'complete' | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const {
    data: appointments,
    loading,
    error,
    refetch,
  } = useFetch((signal) => appointmentService.getMyProfessionalAppointments(signal));

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

  const handleAction = async () => {
    if (!selectedApt || !actionType) return;
    setActionLoading(true);
    try {
      if (actionType === 'accept') {
        await appointmentService.accept(selectedApt.id);
        toast.success(`Cita #${selectedApt.id} aceptada con éxito`);
      } else if (actionType === 'reject') {
        await appointmentService.reject(selectedApt.id);
        toast.success(`Cita #${selectedApt.id} rechazada`);
      } else if (actionType === 'complete') {
        await appointmentService.complete(selectedApt.id);
        toast.success(`Cita #${selectedApt.id} marcada como completada`);
      }
      refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Error al procesar la cita');
    } finally {
      setActionLoading(false);
      setSelectedApt(null);
      setActionType(null);
    }
  };

  const modalConfig = {
    accept: {
      title: 'Aceptar Cita',
      message: `¿Estás seguro de que deseas confirmar la cita #${selectedApt?.id} para el ${selectedApt?.date} a las ${selectedApt?.time}?`,
      confirmLabel: 'Aceptar Cita',
      variant: 'info' as const,
    },
    reject: {
      title: 'Rechazar Cita',
      message: `¿Estás seguro de que deseas rechazar la cita #${selectedApt?.id}? Esta acción no se puede deshacer.`,
      confirmLabel: 'Rechazar Cita',
      variant: 'danger' as const,
    },
    complete: {
      title: 'Marcar Cita como Completada',
      message: `¿Confirmas que la atención de la cita #${selectedApt?.id} ha finalizado exitosamente? El paciente podrá calificar el servicio.`,
      confirmLabel: 'Completar Atención',
      variant: 'info' as const,
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Citas de Pacientes</h1>
          <p className="text-gray-600 mt-1">Revisa solicitudes, acepta horarios y gestiona la atención médica</p>
        </div>

        {/* Status Filter */}
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
        <LoadingSpinner text="Cargando solicitudes de citas..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={refetch} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No hay citas en este estado"
          description={
            filterStatus === 'ALL'
              ? 'Aún no has recibido solicitudes de citas.'
              : `No se encontraron citas con estado "${filterStatus}".`
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
                  <button
                    type="button"
                    onClick={() => setContactApt(apt)}
                    className="flex items-center gap-3 text-left group focus:outline-none"
                    title="Click para ver ficha y datos de contacto del paciente"
                  >
                    <div className="h-10 w-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold group-hover:bg-teal-600 group-hover:text-white transition-colors">
                      <FiUser className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 group-hover:text-teal-600 transition-colors flex items-center gap-1.5">
                        {apt.patientName || `Paciente #${apt.patientId}`}
                        <span className="text-[10px] font-normal text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                          Ver contacto
                        </span>
                      </p>
                      <p className="text-xs text-gray-500">
                        Cita #{apt.id} {apt.medicalServiceName ? `• ${apt.medicalServiceName}` : ''}
                      </p>
                    </div>
                  </button>
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
                  <p className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-lg border-l-2 border-teal-500">
                    <strong className="text-gray-700">Motivo:</strong> {apt.notes}
                  </p>
                )}

                {/* Action buttons based on lifecycle */}
                <div className="pt-2 border-t border-gray-100 flex items-center justify-end gap-2">
                  {apt.status === 'PENDIENTE' && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedApt(apt);
                          setActionType('reject');
                        }}
                        className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-1"
                      >
                        <FiX className="h-3.5 w-3.5" />
                        Rechazar
                      </button>
                      <button
                        onClick={() => {
                          setSelectedApt(apt);
                          setActionType('accept');
                        }}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-1"
                      >
                        <FiCheck className="h-3.5 w-3.5" />
                        Aceptar
                      </button>
                    </>
                  )}

                  {apt.status === 'ACEPTADA' && (
                    <button
                      onClick={() => {
                        setSelectedApt(apt);
                        setActionType('complete');
                      }}
                      className="px-3.5 py-1.5 text-xs font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-1.5"
                    >
                      <FiCheck className="h-3.5 w-3.5" />
                      Marcar como Completada
                    </button>
                  )}
                </div>
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

      {actionType && (
        <ConfirmModal
          open={!!actionType}
          title={modalConfig[actionType].title}
          message={modalConfig[actionType].message}
          confirmLabel={modalConfig[actionType].confirmLabel}
          variant={modalConfig[actionType].variant}
          loading={actionLoading}
          onConfirm={handleAction}
          onCancel={() => {
            setActionType(null);
            setSelectedApt(null);
          }}
        />
      )}

      <PatientContactModal
        open={!!contactApt}
        appointment={contactApt}
        onClose={() => setContactApt(null)}
      />
    </div>
  );
}

