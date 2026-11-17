import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { AdminDashboardScreen } from '../screens/admin/AdminDashboardScreen';
import { EmergencySensorScreen } from '../screens/patient/EmergencySensorScreen';
import { ProfessionalsScreen } from '../screens/patient/ProfessionalsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export const AdminTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        headerStyle: { backgroundColor: '#ffffff', elevation: 0, shadowOpacity: 0 },
        headerTitleStyle: { fontWeight: '700', fontSize: 17, color: '#0f172a' },
        tabBarActiveTintColor: '#0d9488',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e2e8f0',
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarIcon: ({ color, size, focused }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'shield-checkmark';
          if (route.name === 'AdminDashboard') {
            iconName = focused ? 'shield-checkmark' : 'shield-checkmark-outline';
          } else if (route.name === 'Professionals') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'EmergencySensor') {
            iconName = focused ? 'hardware-chip' : 'hardware-chip-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="AdminDashboard"
        component={AdminDashboardScreen}
        options={{ title: 'Gestión', headerTitle: 'Panel de Administración' }}
      />
      <Tab.Screen
        name="Professionals"
        component={ProfessionalsScreen}
        options={{ title: 'Médicos', headerTitle: 'Directorio Médico' }}
      />
      <Tab.Screen
        name="EmergencySensor"
        component={EmergencySensorScreen}
        options={{ title: 'Sensores', headerTitle: 'Sensores de Salud' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Mi Perfil', headerTitle: 'Mi Perfil' }}
      />
    </Tab.Navigator>
  );
};
