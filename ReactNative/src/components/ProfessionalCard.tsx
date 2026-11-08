import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { ProfessionalDTO } from '../types';
import { StarRating } from './StarRating';

interface ProfessionalCardProps {
  professional: ProfessionalDTO;
  onPress: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export const ProfessionalCard: React.FC<ProfessionalCardProps> = ({
  professional,
  onPress,
  isFavorite,
  onToggleFavorite,
}) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.headerRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{professional.name.charAt(0)}</Text>
        </View>

        <View style={styles.infoCol}>
          <Text style={styles.name} numberOfLines={1}>
            {professional.name}
          </Text>
          <Text style={styles.specialty}>{professional.specialty || 'Medicina General'}</Text>
        </View>

        {onToggleFavorite ? (
          <TouchableOpacity onPress={onToggleFavorite} style={styles.favoriteButton}>
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={22}
              color={isFavorite ? '#ef4444' : '#94a3b8'}
            />
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <Ionicons name="location-outline" size={14} color="#64748b" />
          <Text style={styles.detailText}>{professional.location || 'Lima'}</Text>
        </View>

        {professional.distanceKm !== undefined ? (
          <View style={styles.detailItem}>
            <Ionicons name="navigate-outline" size={14} color="#0d9488" />
            <Text style={[styles.detailText, { color: '#0d9488', fontWeight: '600' }]}>
              {professional.distanceKm} km
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.footerRow}>
        <StarRating rating={professional.rating} />
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Desde</Text>
          <Text style={styles.priceValue}>
            {professional.price ? `S/ ${professional.price.toFixed(2)}` : 'Consultar'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ccfbf1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f766e',
  },
  infoCol: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  specialty: {
    fontSize: 12,
    color: '#0d9488',
    fontWeight: '600',
    marginTop: 2,
  },
  favoriteButton: {
    padding: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 10,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#64748b',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  priceContainer: {
    marginLeft: 'auto',
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: 10,
    color: '#94a3b8',
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
});
