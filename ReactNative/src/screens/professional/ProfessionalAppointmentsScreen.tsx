import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { EmptyStateView } from '../../components/EmptyStateView';
import { ErrorView } from '../../components/ErrorView';
import { LoadingView } from '../../components/LoadingView';
import { StatusBadge } from '../../components/StatusBadge';
import { useFetch } from '../../hooks/useFetch';
import { appointmentService } from '../../services/appointmentService';
import type { AppointmentDTO } from '../../types';

export const ProfessionalAppointmentsScreen = () => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const {
    data: appointments,
    loading,
    error,
    refetch,
  } = useFetch(() => appointmentService.getMyProfessionalAppointments());

  const filteredList = useMemo(() => {
    if (!appointments) return [];
    if (filterStatus === 'ALL') return appointments;
    return appointments.filter((a) => a.status === filterStatus);
  }, [appointments, filterStatus]);

  const handleAccept = (apt: AppointmentDTO) => {
    Alert.alert('Aceptar Cita', `¿Confirmar la cita #${apt.id} para el ${apt.date} a las ${apt.time}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Aceptar',
        onPress: async () => {
          setActionLoadingId(apt.id);
          try {
            await appointmentService.accept(apt.id);
            Alert.alert('Éxito', `Cita #${apt.id} aceptada.`);
            refetch();
          } catch (err: any) {
            Alert.alert('Error', err?.friendlyMessage || 'No se pudo aceptar la cita.');
          } finally {
            setActionLoadingId(null);
          }
        },
      },
    ]);
  };

  const handleReject = (apt: AppointmentDTO) => {
    Alert.alert('Rechazar Cita', `¿Deseas rechazar la cita #${apt.id}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Rechazar',
        style: 'destructive',
        onPress: async () => {
          setActionLoadingId(apt.id);
          try {
            await appointmentService.reject(apt.id);
            Alert.alert('Cita Rechazada', `La cita #${apt.id} ha sido rechazada.`);
            refetch();
          } catch (err: any) {
            Alert.alert('Error', err?.friendlyMessage || 'No se pudo rechazar la cita.');
          } finally {
            setActionLoadingId(null);
          }
        },
      },
    ]);
  };

  const handleComplete = (apt: AppointmentDTO) => {
    Alert.alert(
      'Completar Cita',
      `¿Marcar la cita #${apt.id} como completada? El paciente podrá calificar el servicio.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Completar',
          onPress: async () => {
            setActionLoadingId(apt.id);
            try {
              await appointmentService.complete(apt.id);
              Alert.alert('Completada', `Cita #${apt.id} finalizada exitosamente.`);
              refetch();
            } catch (err: any) {
              Alert.alert('Error', err?.friendlyMessage || 'No se pudo completar la cita.');
            } finally {
              setActionLoadingId(null);
            }
          },
        },
      ]
    );
  };

  if (loading) return <LoadingView message="Cargando solicitudes de pacientes..." />;
  if (error) return <ErrorView message={error} onRetry={refetch} />;

  return (
    <View style={styles.container}>
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {['ALL', 'PENDIENTE', 'ACEPTADA', 'COMPLETADA', 'RECHAZADA'].map((st) => (
            <TouchableOpacity
              key={st}
              style={[styles.pill, filterStatus === st && styles.activePill]}
              onPress={() => setFilterStatus(st)}
            >
              <Text style={[styles.pillText, filterStatus === st && styles.activePillText]}>
                {st === 'ALL' ? 'Todas' : st}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredList}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={refetch} colors={['#0d9488']} />
        }
        ListEmptyComponent={
          <EmptyStateView
            title="Sin citas aquí"
            description={
              filterStatus === 'ALL'
                ? 'No tienes citas registradas actualmente.'
                : `No tienes citas con estado ${filterStatus}.`
            }
          />
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.title}>Cita #{item.id}</Text>
                <Text style={styles.sub}>Paciente #{item.patientId}</Text>
              </View>
              <StatusBadge status={item.status} />
            </View>

            <View style={styles.detailsBox}>
              <Text style={styles.detailText}>📅 {item.date} a las {item.time}</Text>
              <Text style={styles.detailText}>
                💵 S/ {item.price ? item.price.toFixed(2) : '—'}
              </Text>
            </View>

            {item.notes ? (
              <View style={styles.notesBox}>
                <Text style={styles.notesText}>Motivo: {item.notes}</Text>
              </View>
            ) : null}

            {/* Action buttons */}
            <View style={styles.actionsRow}>
              {item.status === 'PENDIENTE' && (
                <>
                  <TouchableOpacity
                    style={styles.rejectBtn}
                    onPress={() => handleReject(item)}
                    disabled={actionLoadingId === item.id}
                  >
                    <Ionicons name="close-circle-outline" size={16} color="#ef4444" style={{ marginRight: 4 }} />
                    <Text style={styles.rejectBtnText}>Rechazar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.acceptBtn}
                    onPress={() => handleAccept(item)}
                    disabled={actionLoadingId === item.id}
                  >
                    <Ionicons name="checkmark-circle-outline" size={16} color="#ffffff" style={{ marginRight: 4 }} />
                    <Text style={styles.acceptBtnText}>Aceptar Cita</Text>
                  </TouchableOpacity>
                </>
              )}

              {item.status === 'ACEPTADA' && (
                <TouchableOpacity
                  style={styles.completeBtn}
                  onPress={() => handleComplete(item)}
                  disabled={actionLoadingId === item.id}
                >
                  <Ionicons name="checkmark-done" size={16} color="#ffffff" style={{ marginRight: 4 }} />
                  <Text style={styles.completeBtnText}>Completar Atención</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  filterBar: {
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
  },
  activePill: {
    backgroundColor: '#0d9488',
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  activePillText: {
    color: '#ffffff',
  },
  listContent: {
    padding: 16,
    paddingBottom: 28,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  sub: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 1,
  },
  detailsBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 10,
    marginTop: 12,
  },
  detailText: {
    fontSize: 12,
    color: '#334155',
  },
  notesBox: {
    marginTop: 10,
    padding: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
  },
  notesText: {
    fontSize: 12,
    color: '#475569',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  rejectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fca5a5',
    backgroundColor: '#fef2f2',
  },
  rejectBtnText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '700',
  },
  acceptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#0d9488',
  },
  acceptBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  completeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#16a34a',
  },
  completeBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
});

