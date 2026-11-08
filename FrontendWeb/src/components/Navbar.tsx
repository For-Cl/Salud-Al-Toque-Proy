import { useState } from 'react';
import {
  FiCalendar,
  FiHeart,
  FiHome,
  FiLogOut,
  FiMenu,
  FiSearch,
  FiUser,
  FiX,
  FiClock,
  FiActivity,
} from 'react-icons/fi';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { isAuthenticated, user, role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  const navLinks = isAuthenticated
    ? role === 'ADMIN'
      ? [
          { to: '/dashboard', label: 'Panel Admin', icon: FiHome },
          { to: '/professionals', label: 'Médicos', icon: FiSearch },
          { to: '/profile', label: 'Mi Perfil', icon: FiUser },
        ]
      : role === 'PROFESSIONAL'
      ? [
          { to: '/dashboard', label: 'Inicio', icon: FiHome },
          { to: '/professional/appointments', label: 'Mis Citas', icon: FiCalendar },
          { to: '/professional/schedule', label: 'Mis Horarios', icon: FiClock },
          { to: '/professional/services', label: 'Mis Servicios', icon: FiActivity },
          { to: '/profile', label: 'Mi Perfil', icon: FiUser },
        ]
      : [
          { to: '/dashboard', label: 'Inicio', icon: FiHome },
          { to: '/professionals', label: 'Buscar', icon: FiSearch },
          { to: '/appointments', label: 'Mis Citas', icon: FiCalendar },
          { to: '/favorites', label: 'Favoritos', icon: FiHeart },
          { to: '/profile', label: 'Mi Perfil', icon: FiUser },
        ]
    : [];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="h-8 w-8 bg-teal-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="font-bold text-gray-900 text-lg hidden sm:block">
                Salud al Toque
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.to)
                      ? 'bg-teal-50 text-teal-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-teal-50 rounded-lg transition-colors border border-transparent hover:border-teal-200 group"
                  title="Ver y editar mi perfil"
                >
                  <FiUser className="h-4 w-4 text-gray-500 group-hover:text-teal-600 transition-colors" />
                  <span className="text-sm text-gray-700 font-medium group-hover:text-teal-700 transition-colors">
                    {user?.name || user?.email}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-bold ${
                      role === 'ADMIN'
                        ? 'bg-purple-100 text-purple-700'
                        : role === 'PROFESSIONAL'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-teal-100 text-teal-700'
                    }`}
                  >
                    {role}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Cerrar sesión"
                >
                  <FiLogOut className="h-5 w-5" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors"
                >
                  Registrarse
                </Link>
              </div>
            )}

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
            >
              {mobileOpen ? <FiX className="h-5 w-5" /> : <FiMenu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive(link.to)
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}

