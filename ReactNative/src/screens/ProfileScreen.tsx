import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/userService';
import { patientService } from '../services/patientService';
import { professionalService } from '../services/professionalService';
import { LoadingView } from '../components/LoadingView';
import { storage } from '../utils/storage';

export const ProfileScreen = () => {
  const { user, role, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [location, setLocation] = useState('');
  const [specialty, setSpecialty] = useState('');

  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // Hardware preference
  const [shakeEnabled, setShakeEnabled] = useState(true);

  const loadProfile = async () => {
    storage.getShakeEnabled().then(setShakeEnabled);
    try {
      const baseUser = await userService.getMe();
      setName(baseUser.name || '');
      setPhone(baseUser.phone || '');

      if (role === 'PATIENT') {
        try {
          const pat = await patientService.getMyProfile();
          setAddress(pat.address || '');
          setDateOfBirth(pat.dateOfBirth || '');
        } catch {
          // empty profile initial
        }
      } else if (role === 'PROFESSIONAL') {
        try {
          const prof = await professionalService.getMyProfile();
          setLocation(prof.location || '');
          setSpecialty(prof.specialty || '');
        } catch {
          // empty profile initial
        }
      }
    } catch (err: any) {
      Alert.alert('Error', err?.friendlyMessage || 'No se pudo cargar tu perfil.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [role]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Nombre requerido', 'Por favor ingresa tu nombre.');
      return;
    }

    setSaving(true);
    try {
      // 1. Update basic user data
      await userService.updateMe({
        name: name.trim(),
        phone: phone.trim(),
      });

      // 2. Role specific updates
      if (role === 'PATIENT') {
        await patientService.updateMyProfile({
          address: address.trim(),
          dateOfBirth: dateOfBirth.trim() || undefined,
        });
      } else if (role === 'PROFESSIONAL') {
        await professionalService.updateMyProfile({
          location: location.trim(),
        });
      }

      Alert.alert('¡Perfil Guardado!', 'Tus datos fueron actualizados correctamente.');
    } catch (err: any) {
      Alert.alert('Error', err?.friendlyMessage || 'Error al guardar los cambios.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!currentPassword) {
      Alert.alert('Campo requerido', 'Ingresa tu contraseña actual.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Contraseña corta', 'La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('No coinciden', 'Las nuevas contraseñas no coinciden.');
      return;
    }

    setChangingPassword(true);
    try {
      await userService.changePassword({
        currentPassword,
        newPassword,
      });
      Alert.alert('¡Éxito!', 'Tu contraseña ha sido actualizada correctamente.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || err?.friendlyMessage || 'No se pudo actualizar la contraseña.');
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) return <LoadingView message="Cargando tu perfil..." />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Header Profile Card */}
      <View style={styles.profileHeaderCard}>
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarLargeText}>
            {name ? name.charAt(0).toUpperCase() : 'U'}
          </Text>
        </View>
        <Text style={styles.profileName}>{name || 'Mi Perfil'}</Text>
        <Text style={styles.profileEmail}>{user?.email}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{role}</Text>
        </View>
        {role === 'PROFESSIONAL' && specialty ? (
          <Text style={styles.specialtyText}>🩺 Especialista en {specialty}</Text>
        ) : null}
      </View>

      {/* Form Card */}
      <View style={styles.formCard}>
        <Text style={styles.sectionTitle}>INFORMACIÓN DE CUENTA</Text>

        <Text style={styles.label}>Nombre Completo</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Tu nombre completo"
          placeholderTextColor="#94a3b8"
        />

        <Text style={styles.label}>Correo Electrónico (No editable)</Text>
        <TextInput
          style={[styles.input, styles.inputDisabled]}
          value={user?.email || ''}
          editable={false}
        />

        <Text style={styles.label}>Teléfono / Celular</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="Ej: 999123456"
          keyboardType="phone-pad"
          placeholderTextColor="#94a3b8"
        />

        {/* Campos de Paciente */}
        {role === 'PATIENT' ? (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 12 }]}>DATOS DEL PACIENTE</Text>

            <Text style={styles.label}>Dirección / Distrito</Text>
            <TextInput
              style={styles.input}
              value={address}
              onChangeText={setAddress}
              placeholder="Ej: Surco, San Isidro..."
              placeholderTextColor="#94a3b8"
            />

            <Text style={styles.label}>Fecha de Nacimiento (AAAA-MM-DD)</Text>
            <TextInput
              style={styles.input}
              value={dateOfBirth}
              onChangeText={setDateOfBirth}
              placeholder="Ej: 1998-05-20"
              placeholderTextColor="#94a3b8"
            />
          </>
        ) : null}

        {/* Campos de Profesional */}
        {role === 'PROFESSIONAL' ? (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 12 }]}>DATOS DEL CONSULTORIO</Text>

            <Text style={styles.label}>Ubicación del Consultorio / Distrito</Text>
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              placeholder="Ej: San Isidro, Miraflores..."
              placeholderTextColor="#94a3b8"
            />
          </>
        ) : null}

        {/* Botón Guardar */}
        <TouchableOpacity
          style={[styles.saveBtn, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Ionicons name="save" size={18} color="#ffffff" style={{ marginRight: 6 }} />
              <Text style={styles.saveBtnText}>Guardar Cambios</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Seguridad y Cambio de Contraseña */}
      <View style={styles.formCard}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <Ionicons name="lock-closed" size={18} color="#0d9488" style={{ marginRight: 6 }} />
          <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>SEGURIDAD DE LA CUENTA</Text>
        </View>

        <Text style={styles.label}>Contraseña Actual</Text>
        <TextInput
          style={styles.input}
          value={currentPassword}
          onChangeText={setCurrentPassword}
          placeholder="••••••"
          secureTextEntry
          placeholderTextColor="#94a3b8"
        />

        <Text style={styles.label}>Nueva Contraseña (mín. 6 caracteres)</Text>
        <TextInput
          style={styles.input}
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="Nueva clave"
          secureTextEntry
          placeholderTextColor="#94a3b8"
        />

        <Text style={styles.label}>Confirmar Nueva Contraseña</Text>
        <TextInput
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Repite la nueva clave"
          secureTextEntry
          placeholderTextColor="#94a3b8"
        />

        <TouchableOpacity
          style={[styles.passwordBtn, changingPassword && { opacity: 0.6 }]}
          onPress={handlePasswordChange}
          disabled={changingPassword}
        >
          {changingPassword ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Ionicons name="key-outline" size={18} color="#ffffff" style={{ marginRight: 6 }} />
              <Text style={styles.passwordBtnText}>Actualizar Contraseña</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Preferencias de Sensores y Hardware */}
      <View style={styles.formCard}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <Ionicons name="speedometer-outline" size={18} color="#0d9488" style={{ marginRight: 6 }} />
          <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>PREFERENCIAS DE HARDWARE</Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#0f172a' }}>Gesto de Sacudida (Shake)</Text>
            <Text style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
              {shakeEnabled
                ? 'Activado: agitar el celular despliega atajos de emergencia'
                : 'Desactivado: sensor en reposo para mayor autonomía'}
            </Text>
          </View>
          <Switch
            value={shakeEnabled}
            onValueChange={async (val) => {
              setShakeEnabled(val);
              await storage.saveShakeEnabled(val);
            }}
            trackColor={{ false: '#cbd5e1', true: '#0d9488' }}
            thumbColor={shakeEnabled ? '#ffffff' : '#f8fafc'}
          />
        </View>
      </View>

      {/* Botón Cerrar Sesión */}
      <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Ionicons name="log-out-outline" size={18} color="#ef4444" style={{ marginRight: 6 }} />
          <Text style={styles.logoutBtnText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  profileHeaderCard: {
    backgroundColor: '#ffffff',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  avatarLarge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#0d9488',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarLargeText: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '800',
  },
  profileName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  profileEmail: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  badge: {
    backgroundColor: '#ccfbf1',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  badgeText: {
    color: '#0f766e',
    fontSize: 11,
    fontWeight: '700',
  },
  specialtyText: {
    fontSize: 12,
    color: '#0d9488',
    fontWeight: '600',
    marginTop: 6,
  },
  formCard: {
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.8,
    marginBottom: 10,
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
    paddingVertical: 10,
    fontSize: 14,
    color: '#0f172a',
    backgroundColor: '#f8fafc',
    marginBottom: 14,
  },
  inputDisabled: {
    backgroundColor: '#f1f5f9',
    color: '#94a3b8',
  },
  saveBtn: {
    backgroundColor: '#0d9488',
    paddingVertical: 13,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  passwordBtn: {
    backgroundColor: '#0f172a',
    paddingVertical: 13,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  passwordBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  logoutBtn: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fecaca',
    paddingVertical: 13,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutBtnText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '700',
  },
});

