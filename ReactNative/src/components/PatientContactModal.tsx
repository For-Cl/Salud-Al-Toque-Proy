import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBadge } from './StatusBadge';
import type { AppointmentDTO } from '../types';

interface PatientContactModalProps {
  visible: boolean;
  appointment: AppointmentDTO | null;
  onClose: () => void;
}

export default function PatientContactModal({
  visible,
  appointment,
  onClose,
}: PatientContactModalProps) {
  if (!appointment) return null;

  const patientName = appointment.patientName || `Paciente #${appointment.patientId}`;
  const phone = appointment.patientPhone || 'No registrado';
  const email = appointment.patientEmail || 'No registrado';
  const address = appointment.patientAddress || 'No especificada';
  const birthDate = appointment.patientDateOfBirth || 'No registrada';

  const handleCall = () => {
    if (!appointment.patientPhone) {
      Alert.alert('Sin teléfono', 'El paciente no tiene un número registrado.');
      return;
    }
    const clean = appointment.patientPhone.replace(/\D/g, '');
    Linking.openURL(`tel:${clean}`);
  };

  const handleEmail = () => {
    if (!appointment.patientEmail) {
      Alert.alert('Sin correo', 'El paciente no tiene un correo registrado.');
      return;
    }
    Linking.openURL(`mailto:${appointment.patientEmail}?subject=Consulta Médica - Cita %23${appointment.id}`);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{patientName.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{patientName}</Text>
              <Text style={styles.subtitle}>Ficha de Contacto del Paciente</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: 16 }}>
            {/* Cita vinculada */}
            <View style={styles.aptBox}>
              <View style={{ flex: 1 }}>
                <Text style={styles.aptService}>
                  {appointment.medicalServiceName || `Cita #${appointment.id}`}
                </Text>
                <Text style={styles.aptDate}>
                  📅 {appointment.date} a las {appointment.time}
                </Text>
              </View>
              <StatusBadge status={appointment.status} />
            </View>

            {/* Acciones Rápidas de Comunicación */}
            <Text style={styles.sectionTitle}>COMUNICACIÓN DIRECTA</Text>

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: '#0d9488' }]}
                onPress={handleCall}
              >
                <Ionicons name="call" size={16} color="#ffffff" style={{ marginRight: 6 }} />
                <Text style={styles.actionBtnText}>Llamar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: '#2563eb' }]}
                onPress={handleEmail}
              >
                <Ionicons name="mail" size={16} color="#ffffff" style={{ marginRight: 6 }} />
                <Text style={styles.actionBtnText}>Enviar Correo</Text>
              </TouchableOpacity>
            </View>

            {/* Datos detallados */}
            <View style={styles.detailsList}>
              <View style={styles.detailItem}>
                <Ionicons name="call-outline" size={16} color="#0d9488" style={{ marginRight: 8 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.detailLabel}>Teléfono / Celular</Text>
                  <Text style={styles.detailValue}>{phone}</Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <Ionicons name="mail-outline" size={16} color="#2563eb" style={{ marginRight: 8 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.detailLabel}>Correo Electrónico</Text>
                  <Text style={styles.detailValue}>{email}</Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <Ionicons name="location-outline" size={16} color="#e11d48" style={{ marginRight: 8 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.detailLabel}>Dirección / Residencia</Text>
                  <Text style={styles.detailValue}>{address}</Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <Ionicons name="calendar-outline" size={16} color="#6366f1" style={{ marginRight: 8 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.detailLabel}>Fecha de Nacimiento</Text>
                  <Text style={styles.detailValue}>{birthDate}</Text>
                </View>
              </View>
            </View>

            {/* Motivo de consulta */}
            {appointment.notes ? (
              <View style={styles.notesBox}>
                <Text style={styles.notesTitle}>Motivo / Síntomas:</Text>
                <Text style={styles.notesText}>"{appointment.notes}"</Text>
              </View>
            ) : null}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.closeFullBtn} onPress={onClose}>
              <Text style={styles.closeFullBtnText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    width: '100%',
    maxHeight: '85%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    backgroundColor: '#f8fafc',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0d9488',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
  },
  closeBtn: {
    padding: 6,
  },
  body: {
    padding: 16,
  },
  aptBox: {
    backgroundColor: '#f0fdfa',
    borderWidth: 1,
    borderColor: '#ccfbf1',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  aptService: {
    fontSize: 13,
    fontWeight: '700',
    color: '#134e4a',
  },
  aptDate: {
    fontSize: 11,
    color: '#0f766e',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  detailsList: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 12,
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 13,
    color: '#1e293b',
    fontWeight: '700',
    marginTop: 1,
  },
  notesBox: {
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderColor: '#fde68a',
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
  },
  notesTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400e',
    marginBottom: 2,
  },
  notesText: {
    fontSize: 12,
    color: '#78350f',
    fontStyle: 'italic',
  },
  footer: {
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    backgroundColor: '#ffffff',
  },
  closeFullBtn: {
    backgroundColor: '#0f172a',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeFullBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
});
