import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface StarRatingProps {
  rating: number;
  size?: number;
  showText?: boolean;
}

export const StarRating: React.FC<StarRatingProps> = ({ rating, size = 16, showText = true }) => {
  const rounded = Math.round(rating);

  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Ionicons
          key={star}
          name={star <= rounded ? 'star' : 'star-outline'}
          size={size}
          color="#f59e0b"
          style={{ marginRight: 2 }}
        />
      ))}
      {showText && <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
});

