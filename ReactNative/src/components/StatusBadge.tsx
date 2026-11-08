import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface StatusBadgeProps {
  status: string;
}

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  PENDIENTE: { bg: '#fef3c7', text: '#92400e', label: 'Pendiente' },
  ACEPTADA: { bg: '#dbeafe', text: '#1e40af', label: 'Aceptada' },
  COMPLETADA: { bg: '#dcfce7', text: '#166534', label: 'Completada' },
  RECHAZADA: { bg: '#fee2e2', text: '#991b1b', label: 'Rechazada' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const item = statusColors[status] || { bg: '#f1f5f9', text: '#475569', label: status };

  return (
    <View style={[styles.badge, { backgroundColor: item.bg }]}>
      <Text style={[styles.label, { color: item.text }]}>{item.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
  },
});

