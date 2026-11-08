import { Ionicons } from '@expo/vector-icons';
import React, { useCallback } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LoadingView } from '../../components/LoadingView';
import { ProfessionalCard } from '../../components/ProfessionalCard';
import { useAuth } from '../../contexts/AuthContext';
import { useFetch } from '../../hooks/useFetch';
import { useLocation } from '../../hooks/useLocation';
import { useShake } from '../../hooks/useShake';
import { appointmentService } from '../../services/appointmentService';
import { favoriteService } from '../../services/favoriteService';
import { professionalService } from '../../services/professionalService';
import { calculateDistanceKm, getEstimatedCoords } from '../../utils/distance';

export const HomeScreen = ({ navigation }: any) => {
  const { user, logout } = useAuth();
  const { address, coords, loading: loadingLocation, requestLocation } = useLocation();

  const {
    data: appointments,
    loading: loadingApts,
    refetch: refetchApts,
  } = useFetch(() => appointmentService.getMyAppointments());

  const {
    data: professionals,
    loading: loadingProfs,
    refetch: refetchProfs,
  } = useFetch(() => professionalService.getAll());

  const {
    data: favorites,
    refetch: refetchFavs,
  } = useFetch(() => favoriteService.getMyFavorites());

  // Sensor 2: Shake gesture handler
  const handleShake = useCallback(() => {
    Alert.alert(
      '¡Gesto de Sacudida Detectado! 📱',
      '¿Deseas refrescar tus citas médicas o ver los servicios de emergencia?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Refrescar Citas', onPress: () => refetchApts() },
        {
          text: 'Emergencias SAMU',
          style: 'destructive',
          onPress: () => navigation.navigate('EmergencySensor'),
        },
      ]
    );
  }, [refetchApts, navigation]);

  useShake(handleShake);

  const onRefresh = async () => {
    await Promise.all([refetchApts(), refetchProfs(), refetchFavs(), requestLocation()]);
  };

  const isFavorite = (id: number) => favorites?.some((f) => f.professionalId === id);

  const handleToggleFavorite = async (profId: number) => {
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

  const pendingCount = appointments?.filter((a) => a.status === 'PENDIENTE').length ?? 0;
  const acceptedCount = appointments?.filter((a) => a.status === 'ACEPTADA').length ?? 0;

  // Augment professionals with distance in km using device GPS coordinates
  const nearbyProfessionals = (professionals || [])
    .map((p) => {
      if (!coords) return p;
      const targetCoords = getEstimatedCoords(p.location);
      const dist = calculateDistanceKm(
        coords.latitude,
        coords.longitude,
        targetCoords.lat,
        targetCoords.lon
      );
      return { ...p, distanceKm: dist };
    })
    .sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999))
    .slice(0, 4);

  const loading = loadingApts && loadingProfs;

  if (loading) return <LoadingView message="Cargando tu panel de salud..." />;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={false} onRefresh={onRefresh} colors={['#0d9488']} />
      }
    >
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hola, {user?.name || 'Paciente'} 👋</Text>
          <Text style={styles.subgreeting}>Cuida tu bienestar hoy</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Ionicons name="log-out-outline" size={20} color="#64748b" />
        </TouchableOpacity>
      </View>

      {/* GPS Location Bar (External API Geocoding) */}
      <TouchableOpacity
        style={styles.locationBar}
        onPress={requestLocation}
        activeOpacity={0.8}
      >
        <Ionicons name="navigate-circle" size={24} color="#0d9488" />
        <View style={styles.locationInfo}>
          <Text style={styles.locationLabel}>Ubicación GPS actual:</Text>
          <Text style={styles.locationValue} numberOfLines={1}>
            {loadingLocation ? 'Detectando GPS...' : address?.displayName || 'Miraflores, Lima'}
          </Text>
        </View>
        <Ionicons name="refresh" size={16} color="#94a3b8" />
      </TouchableOpacity>

      {/* Quick Stats Banner */}
      <View style={styles.statsRow}>
        <TouchableOpacity
          style={[styles.statCard, { backgroundColor: '#fef3c7' }]}
          onPress={() => navigation.navigate('MyAppointments')}
        >
          <Text style={[styles.statValue, { color: '#92400e' }]}>{pendingCount}</Text>
          <Text style={[styles.statLabel, { color: '#b45309' }]}>Citas Pendientes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.statCard, { backgroundColor: '#dbeafe' }]}
          onPress={() => navigation.navigate('MyAppointments')}
        >
          <Text style={[styles.statValue, { color: '#1e40af' }]}>{acceptedCount}</Text>
          <Text style={[styles.statLabel, { color: '#1d4ed8' }]}>Citas Aceptadas</Text>
        </TouchableOpacity>
      </View>

      {/* Emergency & Sensor Banner */}
      <TouchableOpacity
        style={styles.emergencyBanner}
        onPress={() => navigation.navigate('EmergencySensor')}
        activeOpacity={0.85}
      >
        <View style={styles.emergencyIcon}>
          <Ionicons name="shield-checkmark" size={22} color="#ffffff" />
        </View>
        <View style={styles.emergencyTextCol}>
          <Text style={styles.emergencyTitle}>Sensores y Asistencia Médica</Text>
          <Text style={styles.emergencyDesc}>GPS, acelerómetro (sacudida) y cámara de recetas</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#0d9488" />
      </TouchableOpacity>

      {/* Nearby Doctors Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Especialistas Cercanos a ti</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Professionals')}>
          <Text style={styles.sectionAction}>Ver todos</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listContainer}>
        {nearbyProfessionals.map((prof) => (
          <ProfessionalCard
            key={prof.id}
            professional={prof}
            isFavorite={isFavorite(prof.id)}
            onToggleFavorite={() => handleToggleFavorite(prof.id)}
            onPress={() => navigation.navigate('ProfessionalDetail', { id: prof.id })}
          />
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },
  subgreeting: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  logoutBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
  },
  locationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 10,
  },
  locationInfo: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0d9488',
    textTransform: 'uppercase',
  },
  locationValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 1,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginTop: 14,
  },
  statCard: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  emergencyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdfa',
    marginHorizontal: 20,
    marginTop: 14,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ccfbf1',
    gap: 12,
  },
  emergencyIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#0d9488',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emergencyTextCol: {
    flex: 1,
  },
  emergencyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f766e',
  },
  emergencyDesc: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 22,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  sectionAction: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0d9488',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
});

