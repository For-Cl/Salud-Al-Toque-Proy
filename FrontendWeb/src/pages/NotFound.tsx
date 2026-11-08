import { FiAlertCircle, FiArrowLeft } from 'react-icons/fi';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="h-20 w-20 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-6">
        <FiAlertCircle className="h-10 w-10" />
      </div>
      <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">404</h1>
      <p className="text-xl font-semibold text-gray-700 mt-2">Página no encontrada</p>
      <p className="text-sm text-gray-500 max-w-sm mt-2">
        La ruta a la que intentas acceder no existe o fue movida a otra ubicación.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-medium hover:bg-teal-700 transition-colors shadow-sm"
      >
        <FiArrowLeft className="h-4 w-4" />
        Volver al Inicio
      </Link>
    </div>
  );
}

