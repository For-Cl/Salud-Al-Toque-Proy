import { FiCalendar, FiHeart, FiSearch, FiStar, FiUsers } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useFetch } from '../hooks/useFetch';
import { appointmentService } from '../services/appointmentService';
import { favoriteService } from '../services/favoriteService';
import { professionalService } from '../services/professionalService';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';

export default function DashboardPage() {
  const { role } = useAuth();

  if (role === 'PROFESSIONAL') return <ProfessionalDashboard />;
  return <PatientDashboard />;
}

function PatientDashboard() {
  const { user } = useAuth();
  const { data: appointments, loading: loadingApts } = useFetch(
    (signal) => appointmentService.getMyAppointments(signal)
  );
  const { data: favorites, loading: loadingFavs } = useFetch(
    (signal) => favoriteService.getMyFavorites(signal)
  );
  const { data: professionals, loading: loadingProfs } = useFetch(
    (signal) => professionalService.getAll(undefined, signal)
  );

  const pending = appointments?.filter((a) => a.status === 'PENDIENTE').length ?? 0;
  const accepted = appointments?.filter((a) => a.status === 'ACEPTADA').length ?? 0;
  const completed = appointments?.filter((a) => a.status === 'COMPLETADA').length ?? 0;

  const loading = loadingApts || loadingFavs || loadingProfs;

  if (loading) return <LoadingSpinner text="Cargando tu dashboard..." />;

  const stats = [
    { label: 'Citas Pendientes', value: pending, icon: FiCalendar, color: 'bg-amber-50 text-amber-700' },
    { label: 'Citas Aceptadas', value: accepted, icon: FiCalendar, color: 'bg-blue-50 text-blue-700' },
    { label: 'Citas Completadas', value: completed, icon: FiStar, color: 'bg-green-50 text-green-700' },
    { label: 'Favoritos', value: favorites?.length ?? 0, icon: FiHeart, color: 'bg-pink-50 text-pink-700' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          ¡Hola, {user?.name || 'Paciente'}! 👋
        </h1>
        <p className="text-gray-600 mt-1">Bienvenido a tu panel de Salud al Toque</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-lg ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Citas Recientes</h2>
            <Link to="/appointments" className="text-sm text-teal-600 hover:text-teal-700 font-medium">
              Ver todas →
            </Link>
          </div>
          {appointments && appointments.length > 0 ? (
            <div className="space-y-3">
              {appointments.slice(0, 5).map((apt) => (
                <div key={apt.id} className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {apt.date} a las {apt.time}
                    </p>
                    <p className="text-xs text-gray-500">{apt.notes || 'Sin notas'}</p>
                  </div>
                  <StatusBadge status={apt.status} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">No tienes citas aún</p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Profesionales Destacados</h2>
            <Link to="/professionals" className="text-sm text-teal-600 hover:text-teal-700 font-medium">
              Buscar más →
            </Link>
          </div>
          {professionals && professionals.length > 0 ? (
            <div className="space-y-3">
              {professionals
                .sort((a, b) => b.rating - a.rating)
                .slice(0, 5)
                .map((prof) => (
                  <Link
                    to={`/professionals/${prof.id}`}
                    key={prof.id}
                    className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0 hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 bg-teal-100 rounded-full flex items-center justify-center">
                        <FiUsers className="h-4 w-4 text-teal-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{prof.name}</p>
                        <p className="text-xs text-gray-500">{prof.specialty} · {prof.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <FiStar className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span className="font-medium text-gray-700">{prof.rating.toFixed(1)}</span>
                    </div>
                  </Link>
                ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">No hay profesionales disponibles</p>
          )}
        </div>
      </div>

      <div className="flex justify-center">
        <Link
          to="/professionals"
          className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors font-medium"
        >
          <FiSearch className="h-5 w-5" />
          Buscar Profesionales
        </Link>
      </div>
    </div>
  );
}

function ProfessionalDashboard() {
  const { user } = useAuth();
  const { data: appointments, loading } = useFetch(
    (signal) => appointmentService.getMyProfessionalAppointments(signal)
  );

  if (loading) return <LoadingSpinner text="Cargando tu dashboard..." />;

  const pending = appointments?.filter((a) => a.status === 'PENDIENTE').length ?? 0;
  const accepted = appointments?.filter((a) => a.status === 'ACEPTADA').length ?? 0;
  const completed = appointments?.filter((a) => a.status === 'COMPLETADA').length ?? 0;
  const total = appointments?.length ?? 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          ¡Hola, Dr. {user?.name || 'Profesional'}! 👋
        </h1>
        <p className="text-gray-600 mt-1">Gestiona tus citas desde tu panel</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Citas', value: total, color: 'bg-gray-50 text-gray-700' },
          { label: 'Pendientes', value: pending, color: 'bg-amber-50 text-amber-700' },
          { label: 'Aceptadas', value: accepted, color: 'bg-blue-50 text-blue-700' },
          { label: 'Completadas', value: completed, color: 'bg-green-50 text-green-700' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className={`p-2.5 rounded-lg ${stat.color} inline-block mb-2`}>
              <FiCalendar className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Citas Recientes</h2>
          <Link to="/professional/appointments" className="text-sm text-teal-600 hover:text-teal-700 font-medium">
            Ver todas →
          </Link>
        </div>
        {appointments && appointments.length > 0 ? (
          <div className="space-y-3">
            {appointments.slice(0, 8).map((apt) => (
              <div key={apt.id} className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-800">Cita #{apt.id} — {apt.date} a las {apt.time}</p>
                  <p className="text-xs text-gray-500">Precio: S/ {apt.price?.toFixed(2) ?? '—'}</p>
                </div>
                <StatusBadge status={apt.status} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-8">No tienes citas asignadas</p>
        )}
      </div>
    </div>
  );
}

