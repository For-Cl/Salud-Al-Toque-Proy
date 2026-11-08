import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface EmptyStateViewProps {
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  iconName?: keyof typeof Ionicons.glyphMap;
}

export const EmptyStateView: React.FC<EmptyStateViewProps> = ({
  title,
  description,
  actionText,
  onAction,
  iconName = 'folder-open-outline',
}) => {
  return (
    <View style={styles.container}>
      <Ionicons name={iconName} size={56} color="#cbd5e1" />
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {actionText && onAction ? (
        <TouchableOpacity style={styles.actionButton} onPress={onAction}>
          <Text style={styles.actionText}>{actionText}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
    marginTop: 12,
  },
  description: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 260,
  },
  actionButton: {
    marginTop: 16,
    backgroundColor: '#0d9488',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
});

