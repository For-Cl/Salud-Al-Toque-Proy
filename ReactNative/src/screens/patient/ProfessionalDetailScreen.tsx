import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { EmptyStateView } from '../../components/EmptyStateView';
import { ErrorView } from '../../components/ErrorView';
import { LoadingView } from '../../components/LoadingView';
import { StarRating } from '../../components/StarRating';
import { useAuth } from '../../contexts/AuthContext';
import { useFetch } from '../../hooks/useFetch';
import { appointmentService } from '../../services/appointmentService';
import { availabilityService } from '../../services/availabilityService';
import { favoriteService } from '../../services/favoriteService';
import { medicalServiceService } from '../../services/medicalServiceService';
import { professionalService } from '../../services/professionalService';
import { reviewService } from '../../services/reviewService';

export const ProfessionalDetailScreen = ({ route, navigation }: any) => {
  const { id } = route.params;
  const profId = Number(id);
  const { user } = useAuth();

  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [notes, setNotes] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  const {
    data: professional,
    loading: loadingProf,
    error,
  } = useFetch(() => professionalService.getById(profId), [profId]);

  const { data: services } = useFetch(() => medicalServiceService.getByProfessional(profId), [profId]);
  const { data: availabilities } = useFetch(() => availabilityService.getByProfessional(profId), [profId]);
  const { data: reviews } = useFetch(() => reviewService.getByProfessional(profId), [profId]);
  const { data: favorites, refetch: refetchFavs } = useFetch(() => favoriteService.getMyFavorites());

  const isFav = favorites?.some((f) => f.professionalId === profId);

  const handleToggleFavorite = async () => {
    try {
      const existing = favorites?.find((f) => f.professionalId === profId);
      if (existing) {
        await favoriteService.removeFavorite(existing.id);
      } else {
        await favoriteService.addFavorite(profId);
      }
      refetchFavs();
    } catch {
      Alert.alert('Error', 'No se pudo actualizar favoritos');
    }
  };

  const handleBookAppointment = async () => {
    if (!selectedServiceId) {
      Alert.alert('Selecciona un servicio', 'Por favor elige un servicio médico antes de reservar.');
      return;
    }
    if (!appointmentDate.trim() || !appointmentTime.trim()) {
      Alert.alert('Fecha y hora requeridas', 'Ingresa la fecha (YYYY-MM-DD) y la hora (HH:mm) para tu cita.');
      return;
    }

    setBookingLoading(true);
    try {
      await appointmentService.create({
        medicalServiceId: selectedServiceId,
        date: appointmentDate.trim(),
        time: appointmentTime.trim(),
        notes: notes.trim() || undefined,
      });

      Alert.alert('¡Cita Solicitada!', 'Tu cita ha sido registrada con estado PENDIENTE.', [
        {
          text: 'Ver Mis Citas',
          onPress: () => navigation.navigate('MyAppointments'),
        },
      ]);
    } catch (err: any) {
      Alert.alert('No se pudo reservar', err?.friendlyMessage || 'El horario solicitado no está disponible.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loadingProf) return <LoadingView message="Cargando perfil..." />;
  if (error || !professional) return <ErrorView message={error || 'No se encontró el profesional'} />;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Profile Info */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{professional.name.charAt(0)}</Text>
          </View>
          <View style={styles.profileDetails}>
            <Text style={styles.name}>{professional.name}</Text>
            <Text style={styles.specialty}>{professional.specialty || 'Medicina General'}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={14} color="#64748b" />
              <Text style={styles.locationText}>{professional.location || 'Lima'}</Text>
            </View>
            <View style={styles.ratingRow}>
              <StarRating rating={professional.rating} />
              <Text style={styles.reviewCount}>({reviews?.length || 0} opiniones)</Text>
            </View>
          </View>
          <TouchableOpacity onPress={handleToggleFavorite} style={styles.favBtn}>
            <Ionicons
              name={isFav ? 'heart' : 'heart-outline'}
              size={24}
              color={isFav ? '#ef4444' : '#94a3b8'}
            />
          </TouchableOpacity>
        </View>

        {/* Services Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Servicios Médicos</Text>
          {services && services.length > 0 ? (
            services.map((srv) => (
              <TouchableOpacity
                key={srv.id}
                style={[
                  styles.serviceCard,
                  selectedServiceId === srv.id && styles.selectedServiceCard,
                ]}
                onPress={() => setSelectedServiceId(srv.id)}
                activeOpacity={0.8}
              >
                <View style={styles.serviceRadio}>
                  {selectedServiceId === srv.id && <View style={styles.serviceRadioDot} />}
                </View>
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName}>{srv.name}</Text>
                  {srv.description ? (
                    <Text style={styles.serviceDesc}>{srv.description}</Text>
                  ) : null}
                </View>
                <Text style={styles.servicePrice}>S/ {srv.price.toFixed(2)}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.emptyText}>No hay servicios disponibles.</Text>
          )}
        </View>

        {/* Weekly Availability Schedule */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Horarios de Atención</Text>
          {availabilities && availabilities.length > 0 ? (
            <View style={styles.availGrid}>
              {availabilities.map((av) => (
                <View key={av.id} style={styles.availItem}>
                  <Text style={styles.availDay}>{av.dayOfWeek}</Text>
                  <Text style={styles.availHours}>
                    {av.startTime} - {av.endTime}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>No hay horarios registrados.</Text>
          )}
        </View>

        {/* Booking Form */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reservar Cita</Text>
          <View style={styles.bookingCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Fecha de la cita (YYYY-MM-DD) *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Ej. 2026-10-05"
                value={appointmentDate}
                onChangeText={setAppointmentDate}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Hora de la cita (HH:mm) *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Ej. 10:30"
                value={appointmentTime}
                onChangeText={setAppointmentTime}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Notas o Síntomas (opcional)</Text>
              <TextInput
                style={[styles.textInput, styles.multilineInput]}
                placeholder="Breve descripción del motivo de consulta..."
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
              />
            </View>

            <TouchableOpacity
              style={[styles.bookButton, bookingLoading && styles.disabledButton]}
              onPress={handleBookAppointment}
              disabled={bookingLoading}
            >
              {bookingLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.bookButtonText}>Confirmar y Reservar Cita</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Reviews Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reseñas de Pacientes</Text>
          {reviews && reviews.length > 0 ? (
            reviews.map((rev) => (
              <View key={rev.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewAuthor}>Paciente #{rev.patientId}</Text>
                  <StarRating rating={rev.rating} size={14} showText={false} />
                </View>
                {rev.comment ? <Text style={styles.reviewComment}>{rev.comment}</Text> : null}
              </View>
            ))
          ) : (
            <EmptyStateView
              title="Aún sin reseñas"
              description="Sé el primero en calificar al especialista al completar tu cita."
            />
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 36,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ccfbf1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f766e',
  },
  profileDetails: {
    flex: 1,
  },
  name: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
  },
  specialty: {
    fontSize: 13,
    color: '#0d9488',
    fontWeight: '600',
    marginTop: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  locationText: {
    fontSize: 12,
    color: '#64748b',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  reviewCount: {
    fontSize: 11,
    color: '#94a3b8',
  },
  favBtn: {
    padding: 6,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 10,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 8,
  },
  selectedServiceCard: {
    borderColor: '#0d9488',
    backgroundColor: '#f0fdfa',
  },
  serviceRadio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#0d9488',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  serviceRadioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0d9488',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
  serviceDesc: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  servicePrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0d9488',
    marginLeft: 8,
  },
  availGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  availItem: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  availDay: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0d9488',
    textTransform: 'uppercase',
  },
  availHours: {
    fontSize: 12,
    color: '#334155',
    marginTop: 2,
  },
  bookingCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 4,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 42,
    fontSize: 13,
    backgroundColor: '#f8fafc',
    color: '#1e293b',
  },
  multilineInput: {
    height: 72,
    textAlignVertical: 'top',
    paddingTop: 8,
  },
  bookButton: {
    backgroundColor: '#0d9488',
    height: 46,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  disabledButton: {
    opacity: 0.6,
  },
  bookButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  reviewCard: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    marginBottom: 8,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewAuthor: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  reviewComment: {
    fontSize: 12,
    color: '#334155',
    marginTop: 6,
  },
  emptyText: {
    fontSize: 12,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
});

