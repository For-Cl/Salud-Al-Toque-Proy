import { FiX, FiMail, FiPhone, FiMapPin, FiCalendar, FiClock, FiFileText, FiMessageCircle } from 'react-icons/fi';
import StatusBadge from './StatusBadge';
import type { AppointmentDTO } from '../types';

interface PatientContactModalProps {
  open: boolean;
  appointment: AppointmentDTO | null;
  onClose: () => void;
}

export default function PatientContactModal({ open, appointment, onClose }: PatientContactModalProps) {
  if (!open || !appointment) return null;

  const patientName = appointment.patientName || `Paciente #${appointment.patientId}`;
  const phone = appointment.patientPhone || 'No registrado';
  const email = appointment.patientEmail || 'No registrado';
  const address = appointment.patientAddress || 'No especificada';
  const birthDate = appointment.patientDateOfBirth || 'No registrada';

  const cleanPhone = appointment.patientPhone?.replace(/\D/g, '') || '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-lg font-bold text-white border border-white/30">
              {patientName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white leading-tight">{patientName}</h3>
              <p className="text-xs text-teal-100">Ficha de Información y Contacto</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-colors"
            title="Cerrar"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Cita vinculada */}
          <div className="bg-teal-50/70 border border-teal-100 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-teal-900">
                {appointment.medicalServiceName || `Cita #${appointment.id}`}
              </p>
              <div className="flex items-center gap-3 text-xs text-teal-700 mt-1">
                <span className="flex items-center gap-1">
                  <FiCalendar className="h-3.5 w-3.5" />
                  {appointment.date}
                </span>
                <span className="flex items-center gap-1">
                  <FiClock className="h-3.5 w-3.5" />
                  {appointment.time}
                </span>
              </div>
            </div>
            <StatusBadge status={appointment.status} />
          </div>

          {/* Información de Contacto Directo */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Canales de Comunicación
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Teléfono */}
              <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200/80 flex flex-col justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                  <FiPhone className="h-4 w-4 text-teal-600" />
                  <span>Teléfono / Celular</span>
                </div>
                <p className="font-semibold text-gray-900 text-sm">{phone}</p>
                {cleanPhone && (
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-200">
                    <a
                      href={`tel:${cleanPhone}`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-teal-600 hover:text-teal-700"
                    >
                      <FiPhone className="h-3 w-3" /> Llamar
                    </a>
                    <span className="text-gray-300">|</span>
                    <a
                      href={`https://wa.me/51${cleanPhone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700"
                    >
                      <FiMessageCircle className="h-3 w-3" /> WhatsApp
                    </a>
                  </div>
                )}
              </div>

              {/* Correo Electrónico */}
              <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200/80 flex flex-col justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                  <FiMail className="h-4 w-4 text-blue-600" />
                  <span>Correo Electrónico</span>
                </div>
                <p className="font-semibold text-gray-900 text-sm truncate" title={email}>
                  {email}
                </p>
                {email !== 'No registrado' && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <a
                      href={`mailto:${email}?subject=Consulta Médica - Cita %23${appointment.id}`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
                    >
                      <FiMail className="h-3 w-3" /> Redactar mensaje
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Datos Personales y Clínicos */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Datos Generales del Paciente
            </h4>

            <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50 p-4 rounded-xl border border-gray-200/80">
              <div>
                <p className="text-gray-500 flex items-center gap-1 mb-0.5">
                  <FiMapPin className="h-3.5 w-3.5 text-rose-500" /> Dirección / Distrito
                </p>
                <p className="font-semibold text-gray-800">{address}</p>
              </div>

              <div>
                <p className="text-gray-500 flex items-center gap-1 mb-0.5">
                  <FiCalendar className="h-3.5 w-3.5 text-indigo-500" /> Fecha de Nacimiento
                </p>
                <p className="font-semibold text-gray-800">{birthDate}</p>
              </div>
            </div>
          </div>

          {/* Motivo o notas de la cita */}
          {appointment.notes && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                <FiFileText className="h-3.5 w-3.5 text-teal-600" />
                Motivo / Síntomas reportados
              </h4>
              <p className="text-xs text-gray-700 bg-amber-50/60 border border-amber-200/70 p-3 rounded-xl italic leading-relaxed">
                "{appointment.notes}"
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
