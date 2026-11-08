import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { EmptyStateView } from '../../components/EmptyStateView';
import { ErrorView } from '../../components/ErrorView';
import { LoadingView } from '../../components/LoadingView';
import { StarRating } from '../../components/StarRating';
import { useFetch } from '../../hooks/useFetch';
import { favoriteService } from '../../services/favoriteService';

export const FavoritesScreen = ({ navigation }: any) => {
  const {
    data: favorites,
    loading,
    error,
    refetch,
  } = useFetch(() => favoriteService.getMyFavorites());

  const handleRemove = (favId: number, name: string) => {
    Alert.alert('Quitar de favoritos', `¿Deseas remover a ${name} de tus favoritos?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          try {
            await favoriteService.removeFavorite(favId);
            refetch();
          } catch {
            Alert.alert('Error', 'No se pudo eliminar de favoritos');
          }
        },
      },
    ]);
  };

  if (loading) return <LoadingView message="Cargando tus favoritos..." />;
  if (error) return <ErrorView message={error} onRetry={refetch} />;

  return (
    <View style={styles.container}>
      <FlatList
        data={favorites || []}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={refetch} colors={['#0d9488']} />
        }
        ListEmptyComponent={
          <EmptyStateView
            title="Sin favoritos guardados"
            description="Guarda a tus médicos preferidos tocando el corazón en su perfil."
            iconName="heart-outline"
            actionText="Explorar Médicos"
            onAction={() => navigation.navigate('Professionals')}
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('ProfessionalDetail', { id: item.professionalId })}
            activeOpacity={0.85}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.professionalName?.charAt(0) || 'P'}</Text>
            </View>

            <View style={styles.infoCol}>
              <Text style={styles.name}>{item.professionalName}</Text>
              <Text style={styles.specialty}>{item.specialty || 'Medicina General'}</Text>
              <View style={styles.metaRow}>
                <Ionicons name="location-outline" size={12} color="#64748b" />
                <Text style={styles.location}>{item.location || 'Lima'}</Text>
                <StarRating rating={item.rating || 0} size={13} />
              </View>
            </View>

            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => handleRemove(item.id, item.professionalName)}
            >
              <Ionicons name="trash-outline" size={20} color="#ef4444" />
            </TouchableOpacity>
          </TouchableOpacity>
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
  listContent: {
    padding: 16,
    paddingBottom: 28,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  location: {
    fontSize: 11,
    color: '#64748b',
    marginRight: 4,
  },
  deleteBtn: {
    padding: 8,
  },
});

