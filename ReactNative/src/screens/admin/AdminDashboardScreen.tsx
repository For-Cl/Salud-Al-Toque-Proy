import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { EmptyStateView } from '../../components/EmptyStateView';
import { LoadingView } from '../../components/LoadingView';
import { useAuth } from '../../contexts/AuthContext';
import { useFetch } from '../../hooks/useFetch';
import { appointmentService } from '../../services/appointmentService';
import { professionalService } from '../../services/professionalService';
import { reviewService } from '../../services/reviewService';
import { specialtyService } from '../../services/specialtyService';
import { userService } from '../../services/userService';
import type { SpecialtyDTO, UserDTO } from '../../types';

export const AdminDashboardScreen = ({ navigation }: any) => {
  const { user, logout } = useAuth();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'PATIENT' | 'PROFESSIONAL' | 'ADMIN'>('ALL');

  // Inspect User Modal
  const [selectedUser, setSelectedUser] = useState<UserDTO | null>(null);

  // Create Professional Modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [profName, setProfName] = useState('');
  const [profEmail, setProfEmail] = useState('');
  const [profPhone, setProfPhone] = useState('');
  const [profPassword, setProfPassword] = useState('123456');
  const [profLocation, setProfLocation] = useState('Lima');
  const [profSpecialtyId, setProfSpecialtyId] = useState<number | null>(null);
  const [creatingProf, setCreatingProf] = useState(false);

  // Fetch metrics and data
  const {
    data: users,
    loading: loadingUsers,
    refetch: refetchUsers,
  } = useFetch(() => userService.getAll());

  const {
    data: professionals,
    refetch: refetchProfs,
  } = useFetch(() => professionalService.getAll());

  const {
    data: appointments,
    refetch: refetchApts,
  } = useFetch(() => appointmentService.getAll());

  const {
    data: reviews,
    refetch: refetchReviews,
  } = useFetch(() => reviewService.getAll());

  const { data: specialties } = useFetch(() => specialtyService.getAll());

  const onRefresh = async () => {
    await Promise.all([
      refetchUsers(),
      refetchProfs(),
      refetchApts(),
      refetchReviews(),
    ]);
  };

  const totalUsers = users?.length ?? 0;
  const totalProfessionals = professionals?.length ?? 0;
  const totalAppointments = appointments?.length ?? 0;
  const totalReviews = reviews?.length ?? 0;

  // Filtered users
  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter((u) => {
      const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        (u.phone && u.phone.includes(term)) ||
        String(u.id).includes(term);
      return matchesRole && matchesSearch;
    });
  }, [users, roleFilter, searchTerm]);

  // Handle Delete User with Confirmation
  const handleDeleteUser = (u: UserDTO) => {
    if (u.role === 'ADMIN') {
      Alert.alert(
        'Acción denegada',
        'No se puede eliminar una cuenta de Administrador del sistema.'
      );
      return;
    }

    Alert.alert(
      'Eliminar Usuario',
      `¿Estás seguro de eliminar a "${u.name}" (${u.email})?\n\nSe eliminarán en cascada todos sus datos asociados (citas, reseñas, favoritos y perfiles).`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await userService.delete(u.id);
              Alert.alert('Éxito', `Usuario "${u.name}" eliminado correctamente.`);
              refetchUsers();
              refetchProfs();
              refetchApts();
            } catch (err: any) {
              Alert.alert(
                'Error',
                err?.response?.data?.message || err?.friendlyMessage || 'No se pudo eliminar al usuario.'
              );
            }
          },
        },
      ]
    );
  };

  // Handle Create Professional
  const handleCreateProfessional = async () => {
    if (!profName.trim() || !profEmail.trim() || !profPassword.trim()) {
      Alert.alert('Campos requeridos', 'Por favor ingresa nombre, correo y contraseña.');
      return;
    }
    if (!profSpecialtyId) {
      Alert.alert('Especialidad requerida', 'Por favor selecciona una especialidad médica.');
      return;
    }

    setCreatingProf(true);
    try {
      // 1. Create User with role PROFESSIONAL
      const createdUser = await userService.create({
        name: profName.trim(),
        email: profEmail.trim(),
        password: profPassword.trim(),
        phone: profPhone.trim(),
        role: 'PROFESSIONAL',
      });

      // 2. Link to Professional entity
      await professionalService.createByAdmin({
        user: { id: createdUser.id },
        specialty: { id: profSpecialtyId },
        location: profLocation.trim() || 'Lima',
        rating: 5.0,
      });

      Alert.alert('¡Éxito!', `Profesional ${profName} registrado exitosamente.`);
      setCreateModalOpen(false);
      setProfName('');
      setProfEmail('');
      setProfPhone('');
      setProfPassword('123456');
      setProfLocation('Lima');
      setProfSpecialtyId(null);
      refetchUsers();
      refetchProfs();
    } catch (err: any) {
      Alert.alert(
        'Error',
        err?.response?.data?.message || err?.friendlyMessage || 'Error al registrar al profesional.'
      );
    } finally {
      setCreatingProf(false);
    }
  };

  if (loadingUsers) return <LoadingView message="Cargando panel de administración..." />;

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return { bg: '#f1f5f9', text: '#334155', border: '#cbd5e1' };
      case 'PROFESSIONAL':
        return { bg: '#f0fdfa', text: '#0f766e', border: '#99f6e4' };
      default:
        return { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' };
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={false} onRefresh={onRefresh} colors={['#0d9488']} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Admin {user?.name || 'Administrador'} 🛡️</Text>
          <Text style={styles.subgreeting}>Supervisión General del Sistema</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Ionicons name="log-out-outline" size={20} color="#64748b" />
        </TouchableOpacity>
      </View>

      {/* Metrics Grid */}
      <View style={styles.metricsGrid}>
        <View style={[styles.metricCard, { backgroundColor: '#f0fdfa', borderColor: '#ccfbf1' }]}>
          <Ionicons name="people" size={22} color="#0d9488" />
          <Text style={[styles.metricNumber, { color: '#0f766e' }]}>{totalUsers}</Text>
          <Text style={styles.metricLabel}>Usuarios Totales</Text>
        </View>
        <View style={[styles.metricCard, { backgroundColor: '#fef3c7', borderColor: '#fde68a' }]}>
          <Ionicons name="medkit" size={22} color="#d97706" />
          <Text style={[styles.metricNumber, { color: '#b45309' }]}>{totalProfessionals}</Text>
          <Text style={styles.metricLabel}>Profesionales</Text>
        </View>
        <View style={[styles.metricCard, { backgroundColor: '#dbeafe', borderColor: '#bfdbfe' }]}>
          <Ionicons name="calendar" size={22} color="#2563eb" />
          <Text style={[styles.metricNumber, { color: '#1d4ed8' }]}>{totalAppointments}</Text>
          <Text style={styles.metricLabel}>Citas Agendadas</Text>
        </View>
        <View style={[styles.metricCard, { backgroundColor: '#fce7f3', borderColor: '#fbcfe8' }]}>
          <Ionicons name="star" size={22} color="#db2777" />
          <Text style={[styles.metricNumber, { color: '#be185d' }]}>{totalReviews}</Text>
          <Text style={styles.metricLabel}>Reseñas Emitidas</Text>
        </View>
      </View>

      {/* Action Shortcut to Create Professional */}
      <TouchableOpacity
        style={styles.actionBanner}
        onPress={() => setCreateModalOpen(true)}
        activeOpacity={0.85}
      >
        <View style={styles.actionIcon}>
          <Ionicons name="person-add" size={22} color="#ffffff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.actionTitle}>Registrar Profesional Médico</Text>
          <Text style={styles.actionSubtitle}>
            Crear cuenta oficial y vincular especialidad
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#0d9488" />
      </TouchableOpacity>

      {/* Users Management Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Gestión de Usuarios ({filteredUsers.length})</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchWrapper}>
        <Ionicons name="search-outline" size={18} color="#94a3b8" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre, correo o teléfono..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholderTextColor="#94a3b8"
        />
        {searchTerm ? (
          <TouchableOpacity onPress={() => setSearchTerm('')}>
            <Ionicons name="close-circle" size={18} color="#94a3b8" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Role Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {(['ALL', 'PATIENT', 'PROFESSIONAL', 'ADMIN'] as const).map((r) => {
          const label =
            r === 'ALL'
              ? 'Todos'
              : r === 'PATIENT'
              ? 'Pacientes'
              : r === 'PROFESSIONAL'
              ? 'Médicos'
              : 'Admins';
          const isSelected = roleFilter === r;
          return (
            <TouchableOpacity
              key={r}
              style={[styles.filterChip, isSelected && styles.filterChipActive]}
              onPress={() => setRoleFilter(r)}
            >
              <Text
                style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Users List */}
      <View style={styles.listContainer}>
        {filteredUsers.length > 0 ? (
          filteredUsers.map((u) => {
            const badgeStyle = getRoleBadgeStyle(u.role);
            return (
              <View key={u.id} style={styles.userCard}>
                <View style={styles.userCardHeader}>
                  <View style={styles.avatarCircle}>
                    <Text style={styles.avatarText}>
                      {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                    </Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.userName} numberOfLines={1}>
                      {u.name}
                    </Text>
                    <Text style={styles.userEmail} numberOfLines={1}>
                      {u.email}
                    </Text>
                    {u.phone ? (
                      <Text style={styles.userPhone}>📞 {u.phone}</Text>
                    ) : null}
                  </View>
                  <View
                    style={[
                      styles.roleBadge,
                      { backgroundColor: badgeStyle.bg, borderColor: badgeStyle.border },
                    ]}
                  >
                    <Text style={[styles.roleBadgeText, { color: badgeStyle.text }]}>
                      {u.role}
                    </Text>
                  </View>
                </View>

                {/* Card Actions */}
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.inspectBtn}
                    onPress={() => setSelectedUser(u)}
                  >
                    <Ionicons name="eye-outline" size={16} color="#475569" style={{ marginRight: 4 }} />
                    <Text style={styles.inspectBtnText}>Detalles</Text>
                  </TouchableOpacity>

                  {u.role !== 'ADMIN' && (
                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => handleDeleteUser(u)}
                    >
                      <Ionicons name="trash-outline" size={16} color="#ef4444" style={{ marginRight: 4 }} />
                      <Text style={styles.deleteBtnText}>Eliminar</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })
        ) : (
          <EmptyStateView
            title="No se encontraron usuarios"
            description="Intenta cambiar los términos de búsqueda o filtros seleccionados."
            actionText="Limpiar búsqueda"
            onAction={() => {
              setSearchTerm('');
              setRoleFilter('ALL');
            }}
          />
        )}
      </View>

      {/* Inspect User Modal */}
      <Modal
        visible={!!selectedUser}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedUser(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ficha de Usuario #{selectedUser?.id}</Text>
              <TouchableOpacity onPress={() => setSelectedUser(null)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            {selectedUser && (
              <View style={styles.modalBody}>
                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalLabel}>Nombre:</Text>
                  <Text style={styles.modalValue}>{selectedUser.name}</Text>
                </View>
                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalLabel}>Correo:</Text>
                  <Text style={styles.modalValue}>{selectedUser.email}</Text>
                </View>
                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalLabel}>Teléfono:</Text>
                  <Text style={styles.modalValue}>{selectedUser.phone || 'No registrado'}</Text>
                </View>
                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalLabel}>Rol de Sistema:</Text>
                  <Text style={styles.modalValue}>{selectedUser.role}</Text>
                </View>
              </View>
            )}

            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setSelectedUser(null)}
            >
              <Text style={styles.modalCloseBtnText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Create Professional Modal */}
      <Modal
        visible={createModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setCreateModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '90%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Alta de Profesional Médico</Text>
              <TouchableOpacity onPress={() => setCreateModalOpen(false)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ marginTop: 12 }}>
              <Text style={styles.inputLabel}>Nombre Completo *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Ej: Dr. Roberto Gómez"
                value={profName}
                onChangeText={setProfName}
              />

              <Text style={styles.inputLabel}>Correo Electrónico *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="roberto@clinica.com"
                value={profEmail}
                onChangeText={setProfEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={styles.inputLabel}>Teléfono Celular</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="999888777"
                value={profPhone}
                onChangeText={setProfPhone}
                keyboardType="phone-pad"
              />

              <Text style={styles.inputLabel}>Contraseña Temporal *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="123456"
                value={profPassword}
                onChangeText={setProfPassword}
                secureTextEntry
              />

              <Text style={styles.inputLabel}>Especialidad Médica *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
                {specialties?.map((s: SpecialtyDTO) => {
                  const isSelected = profSpecialtyId === s.id;
                  return (
                    <TouchableOpacity
                      key={s.id}
                      style={[styles.specChip, isSelected && styles.specChipActive]}
                      onPress={() => setProfSpecialtyId(s.id)}
                    >
                      <Text style={[styles.specChipText, isSelected && styles.specChipTextActive]}>
                        {s.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <Text style={styles.inputLabel}>Ubicación / Consultorio</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Ej: San Isidro, Lima"
                value={profLocation}
                onChangeText={setProfLocation}
              />

              <TouchableOpacity
                style={[styles.createSubmitBtn, creatingProf && { opacity: 0.6 }]}
                onPress={handleCreateProfessional}
                disabled={creatingProf}
              >
                {creatingProf ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.createSubmitBtnText}>Registrar Profesional</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },
  subgreeting: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  logoutBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 10,
    marginTop: 6,
  },
  metricCard: {
    width: '48%',
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
  },
  metricNumber: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: 4,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 2,
  },
  actionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdfa',
    marginHorizontal: 20,
    marginTop: 18,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ccfbf1',
    gap: 12,
  },
  actionIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#0d9488',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f766e',
  },
  actionSubtitle: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginTop: 22,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginHorizontal: 20,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0f172a',
  },
  filterRow: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterChipActive: {
    backgroundColor: '#0d9488',
    borderColor: '#0d9488',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  filterChipTextActive: {
    color: '#ffffff',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  userCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  userCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0d9488',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  userEmail: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 1,
  },
  userPhone: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 1,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  inspectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  inspectBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  deleteBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ef4444',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  modalBody: {
    marginVertical: 16,
    gap: 10,
  },
  modalDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  modalValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  modalCloseBtn: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  modalCloseBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
  },
  modalInput: {
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
  specChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    marginRight: 8,
  },
  specChipActive: {
    backgroundColor: '#0d9488',
  },
  specChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  specChipTextActive: {
    color: '#ffffff',
  },
  createSubmitBtn: {
    backgroundColor: '#0d9488',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 10,
  },
  createSubmitBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
