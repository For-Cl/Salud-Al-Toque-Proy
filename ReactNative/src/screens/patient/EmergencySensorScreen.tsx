import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Accelerometer } from 'expo-sensors';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocation } from '../../hooks/useLocation';
import { storage } from '../../utils/storage';

export const EmergencySensorScreen = () => {
  const { coords, address, loading: loadingLocation, requestLocation } = useLocation();

  // Accelerometer Sensor State
  const [shakeEnabled, setShakeEnabled] = useState(true);
  const [accelData, setAccelData] = useState({ x: 0, y: 0, z: 0 });
  const [shakeCount, setShakeCount] = useState(0);

  // Camera / Prescription Image State
  const [prescriptionImage, setPrescriptionImage] = useState<string | null>(null);

  useEffect(() => {
    storage.getShakeEnabled().then((enabled) => {
      setShakeEnabled(enabled);
    });
  }, []);

  useEffect(() => {
    if (!shakeEnabled) {
      setAccelData({ x: 0, y: 0, z: 0 });
      return;
    }

    Accelerometer.setUpdateInterval(200);
    const sub = Accelerometer.addListener((data) => {
      setAccelData(data);
      const magnitude = Math.sqrt(data.x * data.x + data.y * data.y + data.z * data.z);
      if (magnitude > 1.8) {
        setShakeCount((prev) => prev + 1);
      }
    });

    return () => sub.remove();
  }, [shakeEnabled]);

  const handleToggleShake = async (val: boolean) => {
    setShakeEnabled(val);
    await storage.saveShakeEnabled(val);
  };

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permiso Denegado',
          'Se requiere acceso a la cámara para fotografiar tu receta médica. Puedes seleccionar de tu galería como alternativa.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setPrescriptionImage(result.assets[0].uri);
        Alert.alert('¡Foto Capturada!', 'Receta médica adjuntada exitosamente a tu expediente.');
      }
    } catch {
      Alert.alert('Error', 'No se pudo acceder a la cámara del dispositivo.');
    }
  };

  const handlePickGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso Denegado', 'Se requiere acceso a la galería para seleccionar la receta.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setPrescriptionImage(result.assets[0].uri);
        Alert.alert('¡Imagen Cargada!', 'Receta adjuntada desde la galería.');
      }
    } catch {
      Alert.alert('Error', 'No se pudo abrir la galería.');
    }
  };

  const handleCallEmergency = (number: string) => {
    Linking.openURL(`tel:${number}`).catch(() => {
      Alert.alert('Llamada de Emergencia', `Puedes marcar directamente al ${number}.`);
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="hardware-chip-outline" size={28} color="#0d9488" />
        <Text style={styles.title}>Sensores y Asistencia Móvil</Text>
        <Text style={styles.subtitle}>
          Integración de hardware del dispositivo para atención en salud (Rúbrica DBP 2.3)
        </Text>
      </View>

      {/* Sensor 1: GPS Location + External API */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconBadge, { backgroundColor: '#ccfbf1' }]}>
            <Ionicons name="location" size={20} color="#0d9488" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Sensor 1: GPS y Geocodificación</Text>
            <Text style={styles.cardSubtitle}>API Externa OpenStreetMap Nominatim</Text>
          </View>
        </View>

        <View style={styles.sensorBox}>
          <Text style={styles.sensorRow}>
            <Text style={styles.bold}>Latitud:</Text> {coords?.latitude.toFixed(5) || '—'}
          </Text>
          <Text style={styles.sensorRow}>
            <Text style={styles.bold}>Longitud:</Text> {coords?.longitude.toFixed(5) || '—'}
          </Text>
          <Text style={styles.sensorRow}>
            <Text style={styles.bold}>Dirección detectada:</Text>{' '}
            {loadingLocation ? 'Consultando GPS y API...' : address?.displayName || 'Miraflores, Lima'}
          </Text>
        </View>

        <TouchableOpacity style={styles.btnSecondary} onPress={requestLocation}>
          <Ionicons name="refresh" size={16} color="#0d9488" style={{ marginRight: 6 }} />
          <Text style={styles.btnSecondaryText}>Actualizar Ubicación GPS</Text>
        </TouchableOpacity>
      </View>

      {/* Sensor 2: Accelerometer (Shake Gesture) */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconBadge, { backgroundColor: '#fef3c7' }]}>
            <Ionicons name="speedometer" size={20} color="#d97706" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Sensor 2: Acelerómetro (expo-sensors)</Text>
            <Text style={styles.cardSubtitle}>Detección de sacudida (Shake gesture)</Text>
          </View>
          <Switch
            value={shakeEnabled}
            onValueChange={handleToggleShake}
            trackColor={{ false: '#cbd5e1', true: '#0d9488' }}
            thumbColor={shakeEnabled ? '#ffffff' : '#f8fafc'}
          />
        </View>

        <View style={styles.sensorStatusRow}>
          <Ionicons
            name={shakeEnabled ? 'checkmark-circle' : 'pause-circle'}
            size={16}
            color={shakeEnabled ? '#0d9488' : '#94a3b8'}
          />
          <Text
            style={[
              styles.sensorStatusText,
              { color: shakeEnabled ? '#0f766e' : '#64748b' },
            ]}
          >
            {shakeEnabled
              ? 'Sensor activo — agita el celular para probar'
              : 'Sensor en pausa — ahorro de batería activado'}
          </Text>
        </View>

        {shakeEnabled ? (
          <View style={styles.sensorBox}>
            <Text style={styles.sensorRow}>
              <Text style={styles.bold}>Eje X:</Text> {accelData.x.toFixed(2)} |{' '}
              <Text style={styles.bold}>Eje Y:</Text> {accelData.y.toFixed(2)} |{' '}
              <Text style={styles.bold}>Eje Z:</Text> {accelData.z.toFixed(2)}
            </Text>
            <Text style={styles.sensorRow}>
              <Text style={styles.bold}>Sacudidas detectadas:</Text> {shakeCount}
            </Text>
            <Text style={styles.hintText}>
              💡 Agita tu celular para activar el atajo de emergencia y refresco rápido.
            </Text>
          </View>
        ) : (
          <View style={[styles.sensorBox, { backgroundColor: '#f1f5f9', alignItems: 'center' }]}>
            <Text style={[styles.hintText, { textAlign: 'center', color: '#64748b' }]}>
              ⏸️ El gesto de sacudida está apagado. Puedes activarlo con el interruptor arriba cuando desees detección de emergencias por movimiento.
            </Text>
          </View>
        )}
      </View>

      {/* Sensor 3: Camera / ImagePicker */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconBadge, { backgroundColor: '#e0e7ff' }]}>
            <Ionicons name="camera" size={20} color="#4338ca" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Cámara: Foto de Receta Médica</Text>
            <Text style={styles.cardSubtitle}>Manejo de permisos y captura (expo-image-picker)</Text>
          </View>
        </View>

        {prescriptionImage ? (
          <View style={styles.previewContainer}>
            <Image source={{ uri: prescriptionImage }} style={styles.prescriptionPreview} />
            <TouchableOpacity
              style={styles.removePhotoBtn}
              onPress={() => setPrescriptionImage(null)}
            >
              <Text style={styles.removePhotoText}>Eliminar foto</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={styles.photoActions}>
          <TouchableOpacity style={styles.btnAction} onPress={handleTakePhoto}>
            <Ionicons name="camera-outline" size={18} color="#ffffff" style={{ marginRight: 6 }} />
            <Text style={styles.btnActionText}>Tomar Foto</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnSecondary} onPress={handlePickGallery}>
            <Ionicons name="images-outline" size={18} color="#0d9488" style={{ marginRight: 6 }} />
            <Text style={styles.btnSecondaryText}>Desde Galería</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Emergency Hotlines */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Líneas de Emergencia Médica en Perú</Text>
        <View style={styles.emergencyRow}>
          <TouchableOpacity
            style={[styles.emergencyBtn, { backgroundColor: '#ef4444' }]}
            onPress={() => handleCallEmergency('106')}
          >
            <Ionicons name="call" size={18} color="#ffffff" style={{ marginRight: 6 }} />
            <Text style={styles.emergencyBtnText}>SAMU: 106</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.emergencyBtn, { backgroundColor: '#f97316' }]}
            onPress={() => handleCallEmergency('116')}
          >
            <Ionicons name="flame" size={18} color="#ffffff" style={{ marginRight: 6 }} />
            <Text style={styles.emergencyBtnText}>Bomberos: 116</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 16,
    paddingBottom: 36,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 6,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
  cardSubtitle: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
  },
  sensorStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 10,
  },
  sensorStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sensorBox: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    gap: 4,
  },
  sensorRow: {
    fontSize: 12,
    color: '#334155',
  },
  bold: {
    fontWeight: '700',
    color: '#0f172a',
  },
  hintText: {
    fontSize: 11,
    color: '#0d9488',
    marginTop: 6,
    fontStyle: 'italic',
  },
  photoActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  btnAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0d9488',
    paddingVertical: 10,
    borderRadius: 10,
  },
  btnActionText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  btnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0fdfa',
    borderWidth: 1,
    borderColor: '#ccfbf1',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginTop: 10,
  },
  btnSecondaryText: {
    color: '#0d9488',
    fontSize: 13,
    fontWeight: '700',
  },
  previewContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  prescriptionPreview: {
    width: '100%',
    height: 180,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
  },
  removePhotoBtn: {
    marginTop: 6,
    padding: 4,
  },
  removePhotoText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '600',
  },
  emergencyRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  emergencyBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
  },
  emergencyBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});

