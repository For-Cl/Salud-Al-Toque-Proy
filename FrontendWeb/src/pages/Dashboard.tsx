import React, { useState } from 'react';
import {
  FiCalendar,
  FiCheckCircle,
  FiHeart,
  FiSearch,
  FiShield,
  FiStar,
  FiTrash2,
  FiUsers,
  FiPlus,
  FiClock,
  FiActivity,
  FiX,
  FiMail,
  FiPhone,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import PatientContactModal from '../components/PatientContactModal';
import { useAuth } from '../contexts/AuthContext';
import { useFetch } from '../hooks/useFetch';
import { appointmentService } from '../services/appointmentService';
import { favoriteService } from '../services/favoriteService';
import { professionalService } from '../services/professionalService';
import { specialtyService } from '../services/specialtyService';
import { userService } from '../services/userService';
import type { UserDTO, AppointmentDTO } from '../types';

export default function DashboardPage() {
  const { role, resolving } = useAuth();

  if (resolving) {
    return <LoadingSpinner text="Cargando tu panel..." />;
  }

  if (role === 'ADMIN') return <AdminDashboard />;
  if (role === 'PROFESSIONAL') return <ProfessionalDashboard />;
  return <PatientDashboard />;
}

// ============================================================================
// ADMIN DASHBOARD
// ============================================================================
function AdminDashboard() {
  const { data: users, loading: loadingUsers, refetch: refetchUsers } = useFetch(
    (signal) => userService.getAll(signal)
  );
  const { data: specialties } = useFetch((signal) => specialtyService.getAll(signal));

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'PATIENT' | 'PROFESSIONAL' | 'ADMIN'>('ALL');

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserDTO | null>(null);

  // New Professional Form state
  const [profName, setProfName] = useState('');
  const [profEmail, setProfEmail] = useState('');
  const [profPassword, setProfPassword] = useState('123456');
  const [profPhone, setProfPhone] = useState('');
  const [profSpecialtyId, setProfSpecialtyId] = useState<number | ''>('');
  const [profLocation, setProfLocation] = useState('Lima');
  const [creatingProf, setCreatingProf] = useState(false);

  const handleDeleteUser = async (u: UserDTO) => {
    if (u.role === 'ADMIN') {
      toast.error('No se puede eliminar una cuenta de Administrador.');
      return;
    }
    if (!confirm(`¿Eliminar al usuario ${u.name} (${u.email})?`)) return;

    try {
      await userService.delete(u.id);
      toast.success(`Usuario ${u.name} eliminado.`);
      refetchUsers();
    } catch {
      toast.error('No se pudo eliminar al usuario.');
    }
  };

  const handleCreateProfessional = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profSpecialtyId) {
      toast.error('Por favor selecciona una especialidad médica.');
      return;
    }

    setCreatingProf(true);
    try {
      // 1. Create User account with role PROFESSIONAL
      const createdUser = await userService.create({
        name: profName.trim(),
        email: profEmail.trim(),
        password: profPassword,
        phone: profPhone.trim(),
        role: 'PROFESSIONAL',
      });

      // 2. Link to Professional entity
      await professionalService.createByAdmin({
        user: { id: createdUser.id },
        specialty: { id: Number(profSpecialtyId) },
        location: profLocation.trim(),
        rating: 5.0,
      });

      toast.success(`¡Profesional ${profName} registrado con éxito!`);
      setCreateModalOpen(false);
      setProfName('');
      setProfEmail('');
      setProfPassword('123456');
      setProfPhone('');
      setProfLocation('Lima');
      setProfSpecialtyId('');
      refetchUsers();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Error al registrar al profesional.');
    } finally {
      setCreatingProf(false);
    }
  };

  if (loadingUsers) return <LoadingSpinner text="Cargando panel de administración..." />;

  // Filter users by search term and role
  const filteredUsers = (users || []).filter((u) => {
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      u.name.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      (u.phone && u.phone.includes(term)) ||
      String(u.id).includes(term);
    return matchesRole && matchesSearch;
  });

  const patientCount = users?.filter((u) => u.role === 'PATIENT').length ?? 0;
  const professionalCount = users?.filter((u) => u.role === 'PROFESSIONAL').length ?? 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
              ADMINISTRADOR
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">
            Panel de Control y Usuarios 🛡️
          </h1>
          <p className="text-gray-600 mt-1">
            Supervisa cuentas registradas, registra nuevos doctores y realiza búsquedas avanzadas.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium text-sm transition-colors shadow-sm self-start sm:self-auto"
        >
          <FiPlus className="h-4 w-4" />
          Nuevo Profesional
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Usuarios', value: users?.length ?? 0, icon: FiUsers, color: 'bg-indigo-50 text-indigo-700' },
          { label: 'Pacientes', value: patientCount, icon: FiUsers, color: 'bg-teal-50 text-teal-700' },
          { label: 'Profesionales', value: professionalCount, icon: FiShield, color: 'bg-blue-50 text-blue-700' },
          { label: 'Especialidades', value: specialties?.length ?? 0, icon: FiCheckCircle, color: 'bg-amber-50 text-amber-700' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
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

      {/* Users Management Section */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Directorio de Usuarios</h2>
            <p className="text-xs text-gray-500">
              Mostrando {filteredUsers.length} de {users?.length || 0} usuarios registrados
            </p>
          </div>

          {/* Search bar & Role filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative">
              <FiSearch className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre, email o tel..."
                className="w-full sm:w-64 pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  <FiX className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
              {(['ALL', 'PATIENT', 'PROFESSIONAL', 'ADMIN'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    roleFilter === r
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {r === 'ALL' ? 'Todos' : r === 'PATIENT' ? 'Pacientes' : r === 'PROFESSIONAL' ? 'Médicos' : 'Admins'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Usuario</th>
                <th className="py-3 px-4">Contacto</th>
                <th className="py-3 px-4">Rol</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm text-gray-500">
                    No se encontraron usuarios coincidentes con tu búsqueda.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono text-xs text-gray-400">#{u.id}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => setSelectedUser(u)}
                        className="text-left group focus:outline-none"
                        title="Ver ficha de usuario"
                      >
                        <p className="font-semibold text-gray-900 group-hover:text-teal-600 transition-colors">
                          {u.name}
                        </p>
                        <p className="text-xs text-gray-500">{u.email}</p>
                      </button>
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-600">
                      {u.phone ? (
                        <span className="flex items-center gap-1 font-mono">
                          <FiPhone className="h-3 w-3 text-gray-400" /> {u.phone}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">Sin teléfono</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          u.role === 'ADMIN'
                            ? 'bg-purple-100 text-purple-700'
                            : u.role === 'PROFESSIONAL'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-teal-100 text-teal-700'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedUser(u)}
                          className="px-2.5 py-1 text-xs font-medium text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                        >
                          Ver ficha
                        </button>
                        {u.role !== 'ADMIN' && (
                          <button
                            onClick={() => handleDeleteUser(u)}
                            className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar usuario"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Crear Profesional */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100 animate-in zoom-in-95">
            <div className="bg-teal-600 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FiShield className="h-5 w-5" />
                <h3 className="text-base font-bold text-white">Registrar Nuevo Médico</h3>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-white/80 hover:text-white"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProfessional} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  value={profName}
                  onChange={(e) => setProfName(e.target.value)}
                  placeholder="Ej: Dr. Roberto Sanchez"
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  value={profEmail}
                  onChange={(e) => setProfEmail(e.target.value)}
                  placeholder="roberto@saludaltoque.pe"
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Contraseña *
                  </label>
                  <input
                    type="password"
                    value={profPassword}
                    onChange={(e) => setProfPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={profPhone}
                    onChange={(e) => setProfPhone(e.target.value)}
                    placeholder="999888777"
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Especialidad Médica *
                </label>
                <select
                  value={profSpecialtyId}
                  onChange={(e) => setProfSpecialtyId(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                >
                  <option value="">Selecciona especialidad</option>
                  {specialties?.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Ubicación del Consultorio / Distrito *
                </label>
                <input
                  type="text"
                  value={profLocation}
                  onChange={(e) => setProfLocation(e.target.value)}
                  placeholder="Ej: Miraflores, San Isidro, Surco"
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creatingProf}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                >
                  {creatingProf ? 'Registrando...' : 'Registrar Médico'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Ficha de Usuario */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100 animate-in zoom-in-95">
            <div className="bg-gray-900 px-6 py-4 text-white flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Ficha de Usuario #{selectedUser.id}</h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-white/80 hover:text-white"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-lg">
                  {selectedUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-base">{selectedUser.name}</h4>
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold mt-0.5 ${
                      selectedUser.role === 'ADMIN'
                        ? 'bg-purple-100 text-purple-700'
                        : selectedUser.role === 'PROFESSIONAL'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-teal-100 text-teal-700'
                    }`}
                  >
                    {selectedUser.role}
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-2 text-xs">
                <p className="flex items-center gap-2 text-gray-700">
                  <FiMail className="h-4 w-4 text-gray-400" />
                  <strong>Email:</strong> {selectedUser.email}
                </p>
                <p className="flex items-center gap-2 text-gray-700">
                  <FiPhone className="h-4 w-4 text-gray-400" />
                  <strong>Teléfono:</strong> {selectedUser.phone || 'No registrado'}
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-semibold"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// PROFESSIONAL DASHBOARD
// ============================================================================
function ProfessionalDashboard() {
  const { user } = useAuth();
  const { data: appointments, loading } = useFetch(
    (signal) => appointmentService.getMyProfessionalAppointments(signal)
  );

  const [contactApt, setContactApt] = useState<AppointmentDTO | null>(null);

  if (loading) return <LoadingSpinner text="Cargando tu dashboard..." />;

  const pending = appointments?.filter((a) => a.status === 'PENDIENTE').length ?? 0;
  const accepted = appointments?.filter((a) => a.status === 'ACEPTADA').length ?? 0;
  const completed = appointments?.filter((a) => a.status === 'COMPLETADA').length ?? 0;
  const total = appointments?.length ?? 0;

  return (
    <div className="space-y-8">
      {/* Saludo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
              MÉDICO / PROFESIONAL
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">
            ¡Hola, {user?.name || 'Doctor'}! 👋
          </h1>
          <p className="text-gray-600 mt-1">
            Supervisa tus citas de pacientes, define tus horarios y publica tus servicios médicos.
          </p>
        </div>

        {/* Atajos Rápidos */}
        <div className="flex items-center gap-2">
          <Link
            to="/professional/schedule"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-gray-300 text-gray-700 rounded-xl text-xs font-semibold hover:border-teal-500 hover:text-teal-600 transition-colors shadow-sm"
          >
            <FiClock className="h-4 w-4" />
            Mis Horarios
          </Link>
          <Link
            to="/professional/services"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-teal-600 text-white rounded-xl text-xs font-semibold hover:bg-teal-700 transition-colors shadow-sm"
          >
            <FiActivity className="h-4 w-4" />
            Mis Servicios
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Citas', value: total, color: 'bg-gray-50 text-gray-700' },
          { label: 'Pendientes', value: pending, color: 'bg-amber-50 text-amber-700' },
          { label: 'Aceptadas', value: accepted, color: 'bg-blue-50 text-blue-700' },
          { label: 'Completadas', value: completed, color: 'bg-green-50 text-green-700' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className={`p-2.5 rounded-lg ${stat.color} inline-block mb-2`}>
              <FiCalendar className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Accesos rápidos de gestión */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          to="/professional/schedule"
          className="bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-100 p-5 rounded-2xl hover:border-teal-300 transition-all flex items-center justify-between group"
        >
          <div>
            <div className="flex items-center gap-2 text-teal-800 font-bold text-base mb-1">
              <FiClock className="h-5 w-5 text-teal-600" />
              Gestión de Horarios Semanales
            </div>
            <p className="text-xs text-teal-700">
              Define los días y rangos en los que recibirás citas de tus pacientes.
            </p>
          </div>
          <span className="text-teal-600 font-bold text-lg group-hover:translate-x-1 transition-transform">
            →
          </span>
        </Link>

        <Link
          to="/professional/services"
          className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 p-5 rounded-2xl hover:border-blue-300 transition-all flex items-center justify-between group"
        >
          <div>
            <div className="flex items-center gap-2 text-blue-800 font-bold text-base mb-1">
              <FiActivity className="h-5 w-5 text-blue-600" />
              Catálogo de Servicios y Precios
            </div>
            <p className="text-xs text-blue-700">
              Crea los procedimientos que ofreces con sus tarifas en Soles (S/).
            </p>
          </div>
          <span className="text-blue-600 font-bold text-lg group-hover:translate-x-1 transition-transform">
            →
          </span>
        </Link>
      </div>

      {/* Solicitudes Recientes */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Solicitudes Recientes de Pacientes</h2>
            <p className="text-xs text-gray-500">Haz click en un paciente para ver su ficha de contacto</p>
          </div>
          <Link to="/professional/appointments" className="text-sm text-teal-600 hover:text-teal-700 font-medium">
            Ver todas →
          </Link>
        </div>

        {appointments && appointments.length > 0 ? (
          <div className="space-y-3">
            {appointments.slice(0, 8).map((apt) => (
              <div
                key={apt.id}
                className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0 hover:bg-gray-50/70 -mx-2 px-2 rounded-xl transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setContactApt(apt)}
                  className="text-left group focus:outline-none"
                  title="Click para ver teléfono y correo del paciente"
                >
                  <p className="text-sm font-semibold text-gray-900 group-hover:text-teal-600 transition-colors flex items-center gap-1.5">
                    {apt.patientName ? apt.patientName : `Paciente #${apt.patientId}`}
                    <span className="text-[10px] text-teal-600 font-normal bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                      Ver contacto
                    </span>
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {apt.medicalServiceName ? `${apt.medicalServiceName} • ` : ''}
                    {apt.date} a las {apt.time}
                  </p>
                </button>
                <StatusBadge status={apt.status} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-8">No tienes citas asignadas</p>
        )}
      </div>

      {/* Modal de Contacto del Paciente */}
      <PatientContactModal
        open={!!contactApt}
        appointment={contactApt}
        onClose={() => setContactApt(null)}
      />
    </div>
  );
}

// ============================================================================
// PATIENT DASHBOARD
// ============================================================================
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

  if (loadingApts || loadingFavs || loadingProfs) {
    return <LoadingSpinner text="Cargando tu panel de salud..." />;
  }

  const pendingApts = appointments?.filter((a) => a.status === 'PENDIENTE').length ?? 0;
  const completedApts = appointments?.filter((a) => a.status === 'COMPLETADA').length ?? 0;
  const favCount = favorites?.length ?? 0;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-6 sm:p-8 text-white shadow-md">
        <h1 className="text-2xl sm:text-3xl font-bold">¡Hola, {user?.name || 'Paciente'}! 👋</h1>
        <p className="text-teal-100 mt-2 max-w-xl text-sm sm:text-base">
          Encuentra especialistas médicos en Lima, agenda citas y accede a tu historial clínico en segundos.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            to="/professionals"
            className="px-5 py-2.5 bg-white text-teal-700 font-semibold rounded-xl text-sm hover:bg-teal-50 transition-colors shadow-sm"
          >
            Buscar Especialistas
          </Link>
          <Link
            to="/appointments"
            className="px-5 py-2.5 bg-teal-500/50 text-white font-semibold rounded-xl text-sm hover:bg-teal-500/70 transition-colors border border-white/20"
          >
            Mis Citas Médicas
          </Link>
          <Link
            to="/profile"
            className="px-5 py-2.5 bg-teal-800/60 text-white font-semibold rounded-xl text-sm hover:bg-teal-800 transition-colors border border-white/20"
          >
            Mi Perfil
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Citas Pendientes', value: pendingApts, icon: FiCalendar, color: 'bg-amber-50 text-amber-700' },
          { label: 'Atenciones Completadas', value: completedApts, icon: FiCheckCircle, color: 'bg-teal-50 text-teal-700' },
          { label: 'Doctores Guardados', value: favCount, icon: FiHeart, color: 'bg-rose-50 text-rose-700' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
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

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Appointments */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
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
                      {apt.medicalServiceName || `${apt.date} a las ${apt.time}`}
                    </p>
                    <p className="text-xs text-gray-500">
                      {apt.professionalName ? `Dr(a). ${apt.professionalName} • ` : ''}{apt.date} a las {apt.time}
                    </p>
                  </div>
                  <StatusBadge status={apt.status} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">No tienes citas aún</p>
          )}
        </div>

        {/* Featured Professionals */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
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
    </div>
  );
}
