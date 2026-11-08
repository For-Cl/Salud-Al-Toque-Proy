import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LoadingView } from '../../components/LoadingView';
import { StatusBadge } from '../../components/StatusBadge';
import PatientContactModal from '../../components/PatientContactModal';
import { useAuth } from '../../contexts/AuthContext';
import { useFetch } from '../../hooks/useFetch';
import { appointmentService } from '../../services/appointmentService';

export const ProfessionalDashboardScreen = ({ navigation }: any) => {
  const { user, logout } = useAuth();
  const [contactApt, setContactApt] = React.useState<any>(null);

  const {
    data: appointments,
    loading,
    refetch,
  } = useFetch(() => appointmentService.getMyProfessionalAppointments());

  const total = appointments?.length ?? 0;
  const pending = appointments?.filter((a) => a.status === 'PENDIENTE').length ?? 0;
  const accepted = appointments?.filter((a) => a.status === 'ACEPTADA').length ?? 0;
  const completed = appointments?.filter((a) => a.status === 'COMPLETADA').length ?? 0;

  if (loading) return <LoadingView message="Cargando panel médico..." />;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={false} onRefresh={refetch} colors={['#0d9488']} />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Dr. {user?.name || 'Profesional'} 🩺</Text>
          <Text style={styles.subgreeting}>Panel de Gestión de Pacientes</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Ionicons name="log-out-outline" size={20} color="#64748b" />
        </TouchableOpacity>
      </View>

      {/* Metric Cards */}
      <View style={styles.metricsGrid}>
        <View style={[styles.metricCard, { backgroundColor: '#f1f5f9' }]}>
          <Text style={[styles.metricNumber, { color: '#334155' }]}>{total}</Text>
          <Text style={styles.metricLabel}>Total Citas</Text>
        </View>
        <View style={[styles.metricCard, { backgroundColor: '#fef3c7' }]}>
          <Text style={[styles.metricNumber, { color: '#92400e' }]}>{pending}</Text>
          <Text style={styles.metricLabel}>Por Confirmar</Text>
        </View>
        <View style={[styles.metricCard, { backgroundColor: '#dbeafe' }]}>
          <Text style={[styles.metricNumber, { color: '#1e40af' }]}>{accepted}</Text>
          <Text style={styles.metricLabel}>Aceptadas</Text>
        </View>
        <View style={[styles.metricCard, { backgroundColor: '#dcfce7' }]}>
          <Text style={[styles.metricNumber, { color: '#166534' }]}>{completed}</Text>
          <Text style={styles.metricLabel}>Completadas</Text>
        </View>
      </View>

      {/* Action Shortcut */}
      <TouchableOpacity
        style={styles.actionBanner}
        onPress={() => navigation.navigate('ProfessionalAppointments')}
        activeOpacity={0.85}
      >
        <View style={styles.actionIcon}>
          <Ionicons name="calendar" size={24} color="#ffffff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.actionTitle}>Gestionar Solicitudes de Citas</Text>
          <Text style={styles.actionSubtitle}>
            Tienes {pending} cita{pending !== 1 ? 's' : ''} pendiente{pending !== 1 ? 's' : ''} de revisión
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#0d9488" />
      </TouchableOpacity>

      {/* Recent Appointments List */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Solicitudes Recientes</Text>
      </View>

      <View style={styles.listContainer}>
        {appointments && appointments.length > 0 ? (
          appointments.slice(0, 6).map((apt) => (
            <TouchableOpacity
              key={apt.id}
              style={styles.aptCard}
              onPress={() => setContactApt(apt)}
              activeOpacity={0.7}
            >
              <View style={styles.aptCardHeader}>
                <View>
                  <Text style={styles.aptCardTitle}>
                    {apt.patientName || `Paciente #${apt.patientId}`}
                  </Text>
                  <Text style={styles.aptCardSub}>
                    Cita #{apt.id} {apt.medicalServiceName ? `• ${apt.medicalServiceName}` : ''}
                  </Text>
                  <Text style={{ fontSize: 10, color: '#0d9488', fontWeight: '600', marginTop: 1 }}>
                    Ver contacto ↗
                  </Text>
                </View>
                <StatusBadge status={apt.status} />
              </View>
              <View style={styles.aptCardDetails}>
                <Text style={styles.aptCardTime}>
                  📅 {apt.date} a las {apt.time}
                </Text>
                <Text style={styles.aptCardPrice}>
                  S/ {apt.price ? apt.price.toFixed(2) : '—'}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.emptyText}>No tienes citas registradas.</Text>
        )}
      </View>

      <PatientContactModal
        visible={!!contactApt}
        appointment={contactApt}
        onClose={() => setContactApt(null)}
      />
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
    paddingBottom: 14,
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
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 10,
    marginTop: 6,
  },
  metricCard: {
    width: '48%',
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  metricNumber: {
    fontSize: 24,
    fontWeight: '800',
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 2,
  },
  actionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdfa',
    marginHorizontal: 20,
    marginTop: 18,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ccfbf1',
    gap: 12,
  },
  actionIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#0d9488',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f766e',
  },
  actionSubtitle: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginTop: 22,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  aptCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  aptCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  aptCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
  aptCardSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
  },
  aptCardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  aptCardTime: {
    fontSize: 12,
    color: '#475569',
  },
  aptCardPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0d9488',
  },
  emptyText: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    paddingVertical: 24,
  },
});

