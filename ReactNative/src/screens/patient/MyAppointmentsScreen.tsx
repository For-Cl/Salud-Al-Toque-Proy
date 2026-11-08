import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
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
import { StatusBadge } from '../../components/StatusBadge';
import { useFetch } from '../../hooks/useFetch';
import { appointmentService } from '../../services/appointmentService';
import { reviewService } from '../../services/reviewService';
import type { AppointmentDTO } from '../../types';

export const MyAppointmentsScreen = ({ navigation }: any) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [selectedApt, setSelectedApt] = useState<AppointmentDTO | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const {
    data: appointments,
    loading,
    error,
    refetch,
  } = useFetch(() => appointmentService.getMyAppointments());

  const filteredList = useMemo(() => {
    if (!appointments) return [];
    if (filterStatus === 'ALL') return appointments;
    return appointments.filter((a) => a.status === filterStatus);
  }, [appointments, filterStatus]);

  const handleOpenReview = (apt: AppointmentDTO) => {
    setSelectedApt(apt);
    setReviewRating(5);
    setReviewComment('');
    setReviewModalVisible(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedApt) return;
    setSubmittingReview(true);
    try {
      await reviewService.create({
        appointmentId: selectedApt.id,
        rating: reviewRating,
        comment: reviewComment.trim() || undefined,
      });
      Alert.alert('¡Muchas gracias!', 'Tu reseña ha sido registrada exitosamente.');
      setReviewModalVisible(false);
      refetch();
    } catch (err: any) {
      Alert.alert('Error', err?.friendlyMessage || 'No se pudo registrar la reseña.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <LoadingView message="Cargando tus citas médicas..." />;
  if (error) return <ErrorView message={error} onRetry={refetch} />;

  return (
    <View style={styles.container}>
      {/* Status filter bar */}
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
            title="No tienes citas aquí"
            description={
              filterStatus === 'ALL'
                ? 'Aún no has solicitado citas médicas.'
                : `No tienes citas con estado ${filterStatus}.`
            }
            actionText="Buscar Especialistas"
            onAction={() => navigation.navigate('Professionals')}
          />
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.aptTitleCol}>
                <Text style={styles.aptTitle}>Cita #{item.id}</Text>
                <Text style={styles.aptSub}>Servicio médico #{item.medicalServiceId}</Text>
              </View>
              <StatusBadge status={item.status} />
            </View>

            <View style={styles.cardDetails}>
              <View style={styles.detailRow}>
                <Ionicons name="calendar-outline" size={14} color="#64748b" />
                <Text style={styles.detailText}>{item.date}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="time-outline" size={14} color="#64748b" />
                <Text style={styles.detailText}>{item.time}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="cash-outline" size={14} color="#64748b" />
                <Text style={[styles.detailText, { fontWeight: '700', color: '#0f172a' }]}>
                  S/ {item.price ? item.price.toFixed(2) : '—'}
                </Text>
              </View>
            </View>

            {item.notes ? (
              <View style={styles.notesBox}>
                <Text style={styles.notesText}>"{item.notes}"</Text>
              </View>
            ) : null}

            {item.status === 'COMPLETADA' && (
              <TouchableOpacity
                style={styles.reviewBtn}
                onPress={() => handleOpenReview(item)}
              >
                <Ionicons name="star" size={14} color="#ffffff" style={{ marginRight: 6 }} />
                <Text style={styles.reviewBtnText}>Dejar Reseña</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />

      {/* Review Dialog Modal */}
      <Modal visible={reviewModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Calificar Atención</Text>
              <TouchableOpacity onPress={() => setReviewModalVisible(false)}>
                <Ionicons name="close" size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Califica la atención recibida en la cita #{selectedApt?.id}
            </Text>

            <View style={styles.starPickerRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setReviewRating(star)}
                  style={{ padding: 6 }}
                >
                  <Ionicons
                    name={star <= reviewRating ? 'star' : 'star-outline'}
                    size={32}
                    color="#f59e0b"
                  />
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Comentario (opcional)</Text>
            <TextInput
              style={styles.commentInput}
              placeholder="¿Qué te pareció el servicio del profesional?"
              value={reviewComment}
              onChangeText={setReviewComment}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setReviewModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveReviewBtn, submittingReview && { opacity: 0.6 }]}
                onPress={handleSubmitReview}
                disabled={submittingReview}
              >
                {submittingReview ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.saveReviewText}>Enviar Reseña</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  aptTitleCol: {
    flex: 1,
  },
  aptTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  aptSub: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  cardDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 10,
    marginTop: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#475569',
  },
  notesBox: {
    marginTop: 10,
    padding: 8,
    backgroundColor: '#f0fdfa',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#0d9488',
  },
  notesText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#0f766e',
  },
  reviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f59e0b',
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 12,
  },
  reviewBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  starPickerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    padding: 10,
    height: 80,
    textAlignVertical: 'top',
    fontSize: 13,
    backgroundColor: '#f8fafc',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 16,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  saveReviewBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#0d9488',
  },
  saveReviewText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});

