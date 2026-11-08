import { useState, useEffect } from 'react';
import { FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiShield, FiSave, FiLock, FiKey } from 'react-icons/fi';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/userService';
import { patientService } from '../services/patientService';
import { professionalService } from '../services/professionalService';

export default function ProfilePage() {
  const { user, role, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [location, setLocation] = useState('');
  const [specialtyName, setSpecialtyName] = useState('');
  const [rating, setRating] = useState<number | null>(null);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      setError(null);
      try {
        // Base user data
        const baseUser = await userService.getMe();
        setName(baseUser.name || '');
        setPhone(baseUser.phone || '');

        if (role === 'PATIENT') {
          try {
            const pat = await patientService.getMyProfile();
            setAddress(pat.address || '');
            setDateOfBirth(pat.dateOfBirth || '');
          } catch {
            // Patient details might be blank initially
          }
        } else if (role === 'PROFESSIONAL') {
          try {
            const prof = await professionalService.getMyProfile();
            setLocation(prof.location || '');
            setSpecialtyName(prof.specialty || '');
            setRating(prof.rating);
          } catch {
            // Professional details fallback
          }
        }
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Error al cargar tu perfil.');
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // 1. Update basic user data (name, phone)
      const updatedUser = await userService.updateMe({
        name: name.trim(),
        phone: phone.trim(),
      });

      // 2. Role-specific updates
      if (role === 'PATIENT') {
        await patientService.updateMyProfile({
          address: address.trim(),
          dateOfBirth: dateOfBirth || undefined,
        });
      } else if (role === 'PROFESSIONAL') {
        await professionalService.updateMyProfile({
          location: location.trim(),
        });
      }

      // 3. Update global AuthContext user
      updateUser({
        name: updatedUser.name,
        phone: updatedUser.phone,
      });

      toast.success('¡Perfil actualizado con éxito!');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Error al guardar cambios del perfil.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error('Ingresa tu contraseña actual.');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden.');
      return;
    }

    setChangingPassword(true);
    try {
      await userService.changePassword({
        currentPassword,
        newPassword,
      });
      toast.success('¡Contraseña actualizada con éxito!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Error al cambiar la contraseña.');
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) return <LoadingSpinner text="Cargando tus datos de perfil..." />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Banner / Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center gap-6">
        <div className="h-20 w-20 rounded-2xl bg-gradient-to-tr from-teal-500 to-teal-600 text-white flex items-center justify-center text-3xl font-bold shadow-md shadow-teal-500/20">
          {name ? name.charAt(0).toUpperCase() : 'U'}
        </div>

        <div className="text-center sm:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="text-2xl font-bold text-gray-900">{name || 'Mi Perfil'}</h1>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                role === 'ADMIN'
                  ? 'bg-purple-100 text-purple-700'
                  : role === 'PROFESSIONAL'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-teal-100 text-teal-700'
              }`}
            >
              {role === 'ADMIN' ? 'ADMINISTRADOR' : role === 'PROFESSIONAL' ? 'MÉDICO / PROFESIONAL' : 'PACIENTE'}
            </span>
          </div>

          <p className="text-xs text-gray-500 mt-1 flex items-center justify-center sm:justify-start gap-1">
            <FiMail className="h-3.5 w-3.5" />
            {user?.email}
          </p>

          {role === 'PROFESSIONAL' && specialtyName && (
            <p className="text-xs font-semibold text-teal-700 mt-2 bg-teal-50 inline-block px-2.5 py-1 rounded-lg">
              Especialista en {specialtyName} {rating ? `· ⭐ ${rating.toFixed(1)}` : ''}
            </p>
          )}
        </div>
      </div>

      {/* Formulario de Edición */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
        <div className="border-b border-gray-100 pb-4 mb-6">
          <h2 className="text-lg font-bold text-gray-900">Editar Información Personal</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Mantén tus datos de contacto y ubicación actualizados para tus citas
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Datos Generales de la Cuenta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                <FiUser className="h-3.5 w-3.5 text-gray-400" />
                Nombre Completo *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                <FiMail className="h-3.5 w-3.5 text-gray-400" />
                Correo Electrónico (No modificable)
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full border border-gray-200 bg-gray-50 text-gray-500 rounded-xl px-3.5 py-2.5 text-sm cursor-not-allowed"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                <FiPhone className="h-3.5 w-3.5 text-gray-400" />
                Teléfono / Celular de Contacto
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ej: 999123456"
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Campos específicos de Paciente */}
          {role === 'PATIENT' && (
            <div className="pt-4 border-t border-gray-100 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800">
                Información de Paciente
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                    <FiMapPin className="h-3.5 w-3.5 text-gray-400" />
                    Dirección o Distrito de Residencia
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Ej: Surco, Miraflores, San Borja..."
                    className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                    <FiCalendar className="h-3.5 w-3.5 text-gray-400" />
                    Fecha de Nacimiento
                  </label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Campos específicos de Profesional */}
          {role === 'PROFESSIONAL' && (
            <div className="pt-4 border-t border-gray-100 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-800">
                Información Profesional y Consultorio
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                    <FiMapPin className="h-3.5 w-3.5 text-gray-400" />
                    Ubicación del Consultorio / Distrito
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Ej: San Isidro, Miraflores, Lima..."
                    className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                    <FiShield className="h-3.5 w-3.5 text-gray-400" />
                    Especialidad Asignada
                  </label>
                  <input
                    type="text"
                    value={specialtyName || 'Asignada por administración'}
                    disabled
                    className="w-full border border-gray-200 bg-gray-50 text-gray-500 rounded-xl px-3.5 py-2.5 text-sm cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium text-sm transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              {saving ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <FiSave className="h-4 w-4" />
              )}
              {saving ? 'Guardando cambios...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>

      {/* Seguridad y Cambio de Contraseña */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
        <div className="border-b border-gray-100 pb-4 mb-6">
          <div className="flex items-center gap-2">
            <FiLock className="h-5 w-5 text-teal-600" />
            <h2 className="text-lg font-bold text-gray-900">Seguridad de la Cuenta</h2>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Actualiza tu contraseña para mantener tu cuenta protegida
          </p>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                <FiKey className="h-3.5 w-3.5 text-gray-400" />
                Contraseña Actual *
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••"
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                <FiLock className="h-3.5 w-3.5 text-gray-400" />
                Nueva Contraseña *
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                <FiLock className="h-3.5 w-3.5 text-gray-400" />
                Confirmar Contraseña *
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite la contraseña"
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={changingPassword}
              className="px-6 py-2.5 bg-gray-900 hover:bg-black text-white rounded-xl font-medium text-sm transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              {changingPassword ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <FiKey className="h-4 w-4" />
              )}
              {changingPassword ? 'Actualizando clave...' : 'Actualizar Contraseña'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
