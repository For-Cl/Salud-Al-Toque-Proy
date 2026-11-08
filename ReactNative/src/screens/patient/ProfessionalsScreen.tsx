import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  FlatList,
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
import { ProfessionalCard } from '../../components/ProfessionalCard';
import { useFetch } from '../../hooks/useFetch';
import { useLocation } from '../../hooks/useLocation';
import { favoriteService } from '../../services/favoriteService';
import { professionalService } from '../../services/professionalService';
import { specialtyService } from '../../services/specialtyService';
import { calculateDistanceKm, getEstimatedCoords } from '../../utils/distance';

export const ProfessionalsScreen = ({ navigation }: any) => {
  const [search, setSearch] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('');
  const [sortBy, setSortBy] = useState<'distance' | 'rating'>('distance');
  const { coords } = useLocation();

  const {
    data: professionals,
    loading: loadingProfs,
    error,
    refetch: refetchProfs,
  } = useFetch(() => professionalService.getAll());

  const { data: specialties } = useFetch(() => specialtyService.getAll());
  const { data: favorites, refetch: refetchFavs } = useFetch(() => favoriteService.getMyFavorites());

  const isFav = (id: number) => favorites?.some((f) => f.professionalId === id);

  const handleToggleFavorite = async (profId: number) => {
    try {
      const existing = favorites?.find((f) => f.professionalId === profId);
      if (existing) {
        await favoriteService.removeFavorite(existing.id);
      } else {
        await favoriteService.addFavorite(profId);
      }
      refetchFavs();
    } catch {
      // error handled
    }
  };

  const processedList = useMemo(() => {
    if (!professionals) return [];

    let list = professionals.map((p) => {
      if (!coords) return p;
      const target = getEstimatedCoords(p.location);
      const dist = calculateDistanceKm(coords.latitude, coords.longitude, target.lat, target.lon);
      return { ...p, distanceKm: dist };
    });

    if (selectedSpecialty) {
      list = list.filter((p) => p.specialty?.toLowerCase() === selectedSpecialty.toLowerCase());
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.specialty?.toLowerCase().includes(q) ||
          p.location?.toLowerCase().includes(q)
      );
    }

    if (sortBy === 'distance') {
      list.sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));
    } else {
      list.sort((a, b) => b.rating - a.rating);
    }

    return list;
  }, [professionals, selectedSpecialty, search, sortBy, coords]);

  if (loadingProfs) return <LoadingView message="Buscando especialistas..." />;
  if (error) return <ErrorView message={error} onRetry={refetchProfs} />;

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color="#94a3b8" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por doctor, especialidad o distrito..."
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color="#94a3b8" />
          </TouchableOpacity>
        )}
      </View>

      {/* Specialty Filter Pills */}
      <View style={styles.specialtyContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.specialtyScroll}>
          <TouchableOpacity
            style={[styles.pill, !selectedSpecialty && styles.activePill]}
            onPress={() => setSelectedSpecialty('')}
          >
            <Text style={[styles.pillText, !selectedSpecialty && styles.activePillText]}>Todas</Text>
          </TouchableOpacity>
          {specialties?.map((s) => (
            <TouchableOpacity
              key={s.id}
              style={[styles.pill, selectedSpecialty === s.name && styles.activePill]}
              onPress={() => setSelectedSpecialty(selectedSpecialty === s.name ? '' : s.name)}
            >
              <Text style={[styles.pillText, selectedSpecialty === s.name && styles.activePillText]}>
                {s.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Sorting bar */}
      <View style={styles.sortBar}>
        <Text style={styles.resultCount}>
          {processedList.length} especialista{processedList.length !== 1 ? 's' : ''}
        </Text>
        <View style={styles.sortButtons}>
          <TouchableOpacity
            style={[styles.sortBtn, sortBy === 'distance' && styles.activeSortBtn]}
            onPress={() => setSortBy('distance')}
          >
            <Ionicons
              name="location"
              size={12}
              color={sortBy === 'distance' ? '#0d9488' : '#64748b'}
              style={{ marginRight: 4 }}
            />
            <Text style={[styles.sortText, sortBy === 'distance' && styles.activeSortText]}>
              Más cercanos
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortBtn, sortBy === 'rating' && styles.activeSortBtn]}
            onPress={() => setSortBy('rating')}
          >
            <Ionicons
              name="star"
              size={12}
              color={sortBy === 'rating' ? '#0d9488' : '#64748b'}
              style={{ marginRight: 4 }}
            />
            <Text style={[styles.sortText, sortBy === 'rating' && styles.activeSortText]}>
              Mejor valorados
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Professionals List */}
      <FlatList
        data={processedList}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={refetchProfs} colors={['#0d9488']} />
        }
        ListEmptyComponent={
          <EmptyStateView
            title="Sin resultados"
            description="No encontramos especialistas que coincidan con tus filtros."
            actionText="Limpiar filtros"
            onAction={() => {
              setSearch('');
              setSelectedSpecialty('');
            }}
          />
        }
        renderItem={({ item }) => (
          <ProfessionalCard
            professional={item}
            isFavorite={isFav(item.id)}
            onToggleFavorite={() => handleToggleFavorite(item.id)}
            onPress={() => navigation.navigate('ProfessionalDetail', { id: item.id })}
          />
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1e293b',
  },
  specialtyContainer: {
    marginTop: 10,
    marginBottom: 6,
  },
  specialtyScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  activePill: {
    backgroundColor: '#0d9488',
    borderColor: '#0d9488',
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  activePillText: {
    color: '#ffffff',
  },
  sortBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  resultCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
  },
  sortButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  activeSortBtn: {
    backgroundColor: '#ccfbf1',
  },
  sortText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  activeSortText: {
    color: '#0d9488',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
});

