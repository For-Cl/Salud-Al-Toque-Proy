import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LoadingView } from '../../components/LoadingView';
import { EmptyStateView } from '../../components/EmptyStateView';
import { availabilityService } from '../../services/availabilityService';
import { professionalService } from '../../services/professionalService';
import type { AvailabilityDTO } from '../../types';

const DAYS = [
  'LUNES',
  'MARTES',
  'MIERCOLES',
  'JUEVES',
  'VIERNES',
  'SABADO',
  'DOMINGO',
];

export const ProfessionalScheduleScreen = () => {
  const [schedules, setSchedules] = useState<AvailabilityDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Form states
  const [selectedDay, setSelectedDay] = useState('LUNES');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('13:00');
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      const prof = await professionalService.getMyProfile();
      const list = await availabilityService.getByProfessional(prof.id);
      setSchedules(list);
    } catch (err: any) {
      Alert.alert('Error', err?.friendlyMessage || 'No se pudieron cargar tus horarios.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddSchedule = async () => {
    if (!startTime || !endTime) {
      Alert.alert('Campos incompletos', 'Ingresa la hora de inicio y fin.');
      return;
    }
    if (startTime >= endTime) {
      Alert.alert('Horario inválido', 'La hora de inicio debe ser anterior a la hora de fin.');
      return;
    }

    setSaving(true);
    try {
      await availabilityService.create({
        dayOfWeek: selectedDay,
        startTime: startTime.trim(),
        endTime: endTime.trim(),
      });
      Alert.alert('Éxito', 'Horario de atención registrado.');
      loadData();
    } catch (err: any) {
      Alert.alert('Error', err?.friendlyMessage || 'No se pudo guardar el horario.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert('Eliminar Horario', '¿Estás seguro de que deseas eliminar este turno?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await availabilityService.remove(id);
            setSchedules((prev) => prev.filter((s) => s.id !== id));
          } catch (err: any) {
            Alert.alert('Error', err?.friendlyMessage || 'No se pudo eliminar.');
          }
        },
      },
    ]);
  };

  if (loading) return <LoadingView message="Cargando tus horarios..." />;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            loadData();
          }}
          colors={['#0d9488']}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Horarios de Atención Semanales</Text>
        <Text style={styles.subtitle}>
          Configura tus días y horas disponibles para que los pacientes puedan agendar citas.
        </Text>
      </View>

      {/* Formulario */}
      <View style={styles.card}>
        <Text style={styles.formTitle}>Añadir Bloque de Horario</Text>

        <Text style={styles.label}>Día de la Semana</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daysScroll}>
          {DAYS.map((d) => (
            <TouchableOpacity
              key={d}
              style={[styles.dayChip, selectedDay === d && styles.dayChipActive]}
              onPress={() => setSelectedDay(d)}
            >
              <Text style={[styles.dayChipText, selectedDay === d && styles.dayChipTextActive]}>
                {d}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.label}>Hora Inicio (HH:mm)</Text>
            <TextInput
              style={styles.input}
              value={startTime}
              onChangeText={setStartTime}
              placeholder="09:00"
              placeholderTextColor="#94a3b8"
            />
          </View>

          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={styles.label}>Hora Fin (HH:mm)</Text>
            <TextInput
              style={styles.input}
              value={endTime}
              onChangeText={setEndTime}
              placeholder="13:00"
              placeholderTextColor="#94a3b8"
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.btnSubmit, saving && { opacity: 0.6 }]}
          onPress={handleAddSchedule}
          disabled={saving}
        >
          <Ionicons name="add-circle" size={18} color="#ffffff" style={{ marginRight: 6 }} />
          <Text style={styles.btnSubmitText}>
            {saving ? 'Guardando...' : 'Guardar Horario'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lista de horarios */}
      <View style={styles.listSection}>
        <Text style={styles.sectionHeader}>Horarios Registrados ({schedules.length})</Text>

        {schedules.length === 0 ? (
          <EmptyStateView
            title="Sin horarios registrados"
            description="Agrega tus primeros turnos arriba para comenzar a recibir citas."
          />
        ) : (
          schedules.map((s) => (
            <View key={s.id} style={styles.scheduleItem}>
              <View style={styles.scheduleLeft}>
                <View style={styles.calIcon}>
                  <Ionicons name="calendar" size={18} color="#0d9488" />
                </View>
                <View>
                  <Text style={styles.scheduleDay}>{s.dayOfWeek}</Text>
                  <Text style={styles.scheduleTime}>
                    🕒 {s.startTime} — {s.endTime}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => handleDelete(s.id)}
                style={styles.deleteBtn}
              >
                <Ionicons name="trash-outline" size={18} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ))
        )}
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
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
    lineHeight: 18,
  },
  card: {
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  formTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  daysScroll: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  dayChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    marginRight: 8,
  },
  dayChipActive: {
    backgroundColor: '#0d9488',
  },
  dayChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  dayChipTextActive: {
    color: '#ffffff',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
    color: '#0f172a',
    backgroundColor: '#f8fafc',
  },
  btnSubmit: {
    backgroundColor: '#0d9488',
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnSubmitText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  listSection: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
  },
  scheduleItem: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  scheduleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#ccfbf1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  scheduleDay: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  scheduleTime: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  deleteBtn: {
    padding: 8,
  },
});

