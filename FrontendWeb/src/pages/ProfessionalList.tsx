import { useMemo, useState } from 'react';
import { FiHeart, FiMapPin, FiSearch, FiSliders } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { Link, useSearchParams } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';
import LoadingSpinner from '../components/LoadingSpinner';
import Pagination from '../components/Pagination';
import StarRating from '../components/StarRating';
import { useAuth } from '../contexts/AuthContext';
import { useDebounce } from '../hooks/useDebounce';
import { useFetch } from '../hooks/useFetch';
import { usePagination } from '../hooks/usePagination';
import { favoriteService } from '../services/favoriteService';
import { professionalService } from '../services/professionalService';
import { specialtyService } from '../services/specialtyService';

export default function ProfessionalListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated, role } = useAuth();

  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedSpecialty, setSelectedSpecialty] = useState(searchParams.get('specialty') || '');
  const [selectedLocation, setSelectedLocation] = useState(searchParams.get('location') || '');
  const [maxPrice, setMaxPrice] = useState<number | undefined>(
    searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined
  );
  const [minRating, setMinRating] = useState<number>(0);
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearch = useDebounce(searchTerm, 300);

  const { data: specialties } = useFetch((signal) => specialtyService.getAll(signal));
  const {
    data: professionals,
    loading,
    error,
    refetch,
  } = useFetch(
    (signal) =>
      professionalService.getAll(
        {
          specialty: selectedSpecialty || undefined,
          location: selectedLocation || undefined,
          maxPrice: maxPrice || undefined,
        },
        signal
      ),
    [selectedSpecialty, selectedLocation, maxPrice]
  );

  const { data: favorites, refetch: refetchFavs } = useFetch(
    (signal) => (isAuthenticated && role === 'PATIENT' ? favoriteService.getMyFavorites(signal) : Promise.resolve([])),
    [isAuthenticated, role]
  );

  const isFavorite = (profId: number) => favorites?.some((f) => f.professionalId === profId);

  const handleToggleFavorite = async (profId: number) => {
    if (!isAuthenticated) {
      toast.error('Inicia sesión para guardar favoritos');
      return;
    }
    const existing = favorites?.find((f) => f.professionalId === profId);
    try {
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

  const filteredProfessionals = useMemo(() => {
    if (!professionals) return [];
    return professionals.filter((prof) => {
      const matchSearch =
        !debouncedSearch ||
        prof.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        prof.specialty?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        prof.location?.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchRating = prof.rating >= minRating;
      return matchSearch && matchRating;
    });
  }, [professionals, debouncedSearch, minRating]);

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
  } = usePagination(filteredProfessionals, 10);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedSpecialty('');
    setSelectedLocation('');
    setMaxPrice(undefined);
    setMinRating(0);
    setSearchParams({});
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Encuentra a tu Especialista</h1>
        <p className="text-gray-600 mt-1">Busca y compara profesionales de la salud según tus necesidades</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, especialidad o ubicación..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <FiSliders className="h-4 w-4" />
            Filtros
          </button>
        </div>

        {showFilters && (
          <div className="pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Especialidad</label>
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                <option value="">Todas las especialidades</option>
                {specialties?.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Ubicación</label>
              <input
                type="text"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                placeholder="Ej. Lima, Miraflores..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Precio máximo: {maxPrice ? `S/ ${maxPrice}` : 'Sin límite'}
              </label>
              <input
                type="range"
                min="0"
                max="500"
                step="10"
                value={maxPrice || 500}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-teal-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Calificación mínima</label>
              <select
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                <option value="0">Cualquiera</option>
                <option value="3">3+ estrellas</option>
                <option value="4">4+ estrellas</option>
                <option value="4.5">4.5+ estrellas</option>
              </select>
            </div>

            <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
              <button
                onClick={handleResetFilters}
                className="text-xs text-gray-500 hover:text-teal-600 font-medium"
              >
                Limpiar filtros
              </button>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <LoadingSpinner text="Buscando profesionales..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={refetch} />
      ) : paginatedData.length === 0 ? (
        <EmptyState
          title="No encontramos profesionales"
          description="Intenta cambiar los filtros de búsqueda o restablecerlos."
          action={{ label: 'Limpiar filtros', onClick: handleResetFilters }}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginatedData.map((prof) => {
              const fav = isFavorite(prof.id);
              return (
                <div
                  key={prof.id}
                  className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow relative flex flex-col justify-between"
                >
                  {isAuthenticated && role === 'PATIENT' && (
                    <button
                      onClick={() => handleToggleFavorite(prof.id)}
                      className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
                        fav ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-red-500 hover:bg-gray-50'
                      }`}
                    >
                      <FiHeart className={`h-4 w-4 ${fav ? 'fill-red-500' : ''}`} />
                    </button>
                  )}

                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-12 w-12 rounded-full bg-teal-100 flex items-center justify-center font-bold text-teal-700 text-lg">
                        {prof.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 line-clamp-1">{prof.name}</h3>
                        <p className="text-xs font-medium text-teal-600">{prof.specialty || 'General'}</p>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-gray-500 my-3">
                      <div className="flex items-center gap-1.5">
                        <FiMapPin className="h-3.5 w-3.5 text-gray-400" />
                        <span>{prof.location || 'No especificada'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <StarRating rating={prof.rating} size="sm" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400">Desde</p>
                      <p className="text-base font-bold text-gray-900">
                        {prof.price ? `S/ ${prof.price}` : 'Consultar'}
                      </p>
                    </div>
                    <Link
                      to={`/professionals/${prof.id}`}
                      className="px-3.5 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-medium hover:bg-teal-700 transition-colors"
                    >
                      Ver Perfil
                    </Link>
                  </div>
                </div>
              );
            })}
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
