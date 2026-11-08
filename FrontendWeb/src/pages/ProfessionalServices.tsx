import React, { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiDollarSign, FiActivity, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import { medicalServiceService } from '../services/medicalServiceService';
import { professionalService } from '../services/professionalService';
import type { MedicalServiceDTO } from '../types';

export default function ProfessionalServicesPage() {
  const [services, setServices] = useState<MedicalServiceDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadServices = async () => {
    setLoading(true);
    setError(null);
    try {
      const prof = await professionalService.getMyProfile();
      const data = await medicalServiceService.getByProfessional(prof.id);
      setServices(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'No se pudieron cargar los servicios médicos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedPrice = parseFloat(price);
    if (!name.trim()) {
      toast.error('Ingresa el nombre del servicio médico.');
      return;
    }
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      toast.error('El precio debe ser un número válido mayor a 0.');
      return;
    }

    setSubmitting(true);
    try {
      await medicalServiceService.create({
        name: name.trim(),
        description: description.trim(),
        price: parsedPrice,
      });
      toast.success('Servicio médico publicado exitosamente.');
      setName('');
      setDescription('');
      setPrice('');
      await loadServices();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Error al registrar el servicio médico.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este servicio médico?')) return;
    setDeletingId(id);
    try {
      await medicalServiceService.remove(id);
      toast.success('Servicio eliminado.');
      setServices((prev) => prev.filter((s) => s.id !== id));
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'No se pudo eliminar el servicio médico.');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <LoadingSpinner text="Cargando tu catálogo de servicios médicos..." />;
  if (error) return <ErrorMessage message={error} onRetry={loadServices} />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
            GESTIÓN PROFESIONAL
          </span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">
          Catálogo de Servicios Médicos y Tarifas 🩺
        </h1>
        <p className="text-gray-600 mt-1">
          Define los procedimientos, tratamientos o consultas que ofreces a tus pacientes y sus tarifas en Soles (S/).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulario */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm sticky top-24">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <FiPlus className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Añadir Nuevo Servicio</h2>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nombre del Servicio *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Consulta Cardiológica Integral"
                  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Precio (S/) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400 text-sm font-semibold">
                    S/
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="80.00"
                    className="w-full border border-gray-300 rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Descripción Detallada
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explica qué incluye este servicio para que el paciente lo conozca..."
                  className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                {submitting ? (
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <FiCheck className="h-4 w-4" />
                )}
                {submitting ? 'Publicando...' : 'Publicar Servicio'}
              </button>
            </form>
          </div>
        </div>

        {/* Listado de servicios */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">
              Servicios Disponibles ({services.length})
            </h2>
            <span className="text-xs text-gray-500">Tarifario público para pacientes</span>
          </div>

          {services.length === 0 ? (
            <EmptyState
              title="Aún no tienes servicios registrados"
              description="Publica los servicios médicos que brindas para que los pacientes puedan seleccionarlos al reservar."
            />
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {services.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:border-gray-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold mt-0.5 flex-shrink-0">
                      <FiActivity className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-base">{item.name}</h3>
                      {item.description && (
                        <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                      <p className="text-xs font-semibold text-teal-600 mt-2 flex items-center gap-1">
                        <FiDollarSign className="h-3.5 w-3.5" />
                        S/ {item.price.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={deletingId === item.id}
                    className="self-end sm:self-center p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
                    title="Eliminar este servicio"
                  >
                    {deletingId === item.id ? (
                      <div className="h-4 w-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                    ) : (
                      <FiTrash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
