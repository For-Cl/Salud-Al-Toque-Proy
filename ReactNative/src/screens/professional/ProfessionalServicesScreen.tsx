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
import { medicalServiceService } from '../../services/medicalServiceService';
import { professionalService } from '../../services/professionalService';
import type { MedicalServiceDTO } from '../../types';

export const ProfessionalServicesScreen = () => {
  const [services, setServices] = useState<MedicalServiceDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      const prof = await professionalService.getMyProfile();
      const list = await medicalServiceService.getByProfessional(prof.id);
      setServices(list);
    } catch (err: any) {
      Alert.alert('Error', err?.friendlyMessage || 'No se pudieron cargar tus servicios.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddService = async () => {
    const numPrice = parseFloat(price);
    if (!name.trim()) {
      Alert.alert('Nombre requerido', 'Ingresa el nombre del servicio médico.');
      return;
    }
    if (isNaN(numPrice) || numPrice <= 0) {
      Alert.alert('Precio inválido', 'El precio debe ser un número mayor a 0.');
      return;
    }

    setSaving(true);
    try {
      await medicalServiceService.create({
        name: name.trim(),
        description: description.trim(),
        price: numPrice,
      });
      Alert.alert('Éxito', 'Servicio médico publicado correctamente.');
      setName('');
      setDescription('');
      setPrice('');
      loadData();
    } catch (err: any) {
      Alert.alert('Error', err?.friendlyMessage || 'No se pudo guardar el servicio.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert('Eliminar Servicio', '¿Deseas eliminar este servicio de tu catálogo?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await medicalServiceService.remove(id);
            setServices((prev) => prev.filter((s) => s.id !== id));
          } catch (err: any) {
            Alert.alert('Error', err?.friendlyMessage || 'No se pudo eliminar.');
          }
        },
      },
    ]);
  };

  if (loading) return <LoadingView message="Cargando catálogo de servicios..." />;

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
        <Text style={styles.title}>Servicios Médicos y Tarifas</Text>
        <Text style={styles.subtitle}>
          Publica las atenciones que realizas para que los pacientes las elijan al solicitar una cita.
        </Text>
      </View>

      {/* Formulario */}
      <View style={styles.card}>
        <Text style={styles.formTitle}>Añadir Nuevo Servicio</Text>

        <Text style={styles.label}>Nombre del Servicio</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Ej: Consulta Cardiológica"
          placeholderTextColor="#94a3b8"
        />

        <Text style={styles.label}>Precio en Soles (S/)</Text>
        <TextInput
          style={styles.input}
          value={price}
          onChangeText={setPrice}
          placeholder="80.00"
          keyboardType="numeric"
          placeholderTextColor="#94a3b8"
        />

        <Text style={styles.label}>Descripción</Text>
        <TextInput
          style={[styles.input, { height: 70, textAlignVertical: 'top' }]}
          value={description}
          onChangeText={setDescription}
          placeholder="Detalla lo que incluye la consulta..."
          placeholderTextColor="#94a3b8"
          multiline
        />

        <TouchableOpacity
          style={[styles.btnSubmit, saving && { opacity: 0.6 }]}
          onPress={handleAddService}
          disabled={saving}
        >
          <Ionicons name="medical" size={18} color="#ffffff" style={{ marginRight: 6 }} />
          <Text style={styles.btnSubmitText}>
            {saving ? 'Publicando...' : 'Publicar Servicio'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lista de servicios */}
      <View style={styles.listSection}>
        <Text style={styles.sectionHeader}>Servicios Publicados ({services.length})</Text>

        {services.length === 0 ? (
          <EmptyStateView
            title="Sin servicios registrados"
            description="Agrega tu primer servicio arriba para que los pacientes puedan agendar."
          />
        ) : (
          services.map((item) => (
            <View key={item.id} style={styles.serviceItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.serviceName}>{item.name}</Text>
                {item.description ? (
                  <Text style={styles.serviceDesc}>{item.description}</Text>
                ) : null}
                <Text style={styles.servicePrice}>S/ {item.price.toFixed(2)}</Text>
              </View>

              <TouchableOpacity
                onPress={() => handleDelete(item.id)}
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
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
    color: '#0f172a',
    backgroundColor: '#f8fafc',
    marginBottom: 12,
  },
  btnSubmit: {
    backgroundColor: '#0d9488',
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
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
  serviceItem: {
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
  serviceName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  serviceDesc: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
    lineHeight: 16,
  },
  servicePrice: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0d9488',
    marginTop: 4,
  },
  deleteBtn: {
    padding: 8,
    marginLeft: 8,
  },
});

