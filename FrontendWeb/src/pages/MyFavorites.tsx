import { FiMapPin, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';
import LoadingSpinner from '../components/LoadingSpinner';
import Pagination from '../components/Pagination';
import StarRating from '../components/StarRating';
import { useFetch } from '../hooks/useFetch';
import { usePagination } from '../hooks/usePagination';
import { favoriteService } from '../services/favoriteService';

export default function MyFavoritesPage() {
  const {
    data: favorites,
    loading,
    error,
    refetch,
  } = useFetch((signal) => favoriteService.getMyFavorites(signal));

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
  } = usePagination(favorites || [], 6);

  const handleRemove = async (favId: number) => {
    try {
      await favoriteService.removeFavorite(favId);
      toast.success('Profesional eliminado de favoritos');
      refetch();
    } catch {
      toast.error('No se pudo eliminar de favoritos');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mis Profesionales Favoritos</h1>
        <p className="text-gray-600 mt-1">Guarda y accede rápidamente a los especialistas que prefieres</p>
      </div>

      {loading ? (
        <LoadingSpinner text="Cargando tus favoritos..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={refetch} />
      ) : !favorites || favorites.length === 0 ? (
        <EmptyState
          title="No tienes favoritos guardados"
          description="Explora el catálogo de especialistas y guarda tus favoritos con el icono de corazón."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginatedData.map((fav) => (
              <div
                key={fav.id}
                className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-teal-100 flex items-center justify-center font-bold text-teal-700 text-lg">
                        {fav.professionalName ? fav.professionalName.charAt(0) : 'P'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 line-clamp-1">{fav.professionalName}</h3>
                        <p className="text-xs font-medium text-teal-600">{fav.specialty || 'General'}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemove(fav.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                      title="Quitar de favoritos"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="space-y-1.5 text-xs text-gray-500 my-3">
                    <div className="flex items-center gap-1.5">
                      <FiMapPin className="h-3.5 w-3.5 text-gray-400" />
                      <span>{fav.location || 'Lima, Perú'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <StarRating rating={fav.rating || 0} size="sm" />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex justify-end">
                  <Link
                    to={`/professionals/${fav.professionalId}`}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg text-xs font-medium hover:bg-teal-700 transition-colors"
                  >
                    Ver Perfil & Reservar
                  </Link>
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
    </div>
  );
}
