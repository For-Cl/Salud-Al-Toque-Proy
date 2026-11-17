import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { EmergencySensorScreen } from '../screens/patient/EmergencySensorScreen';
import { ProfessionalAppointmentsScreen } from '../screens/professional/ProfessionalAppointmentsScreen';
import { ProfessionalDashboardScreen } from '../screens/professional/ProfessionalDashboardScreen';
import { ProfessionalScheduleScreen } from '../screens/professional/ProfessionalScheduleScreen';
import { ProfessionalServicesScreen } from '../screens/professional/ProfessionalServicesScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export const ProfessionalTabNavigator = () => {
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
          fontSize: 10,
          fontWeight: '600',
        },
        tabBarIcon: ({ color, size, focused }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'medkit';
          if (route.name === 'ProfessionalDashboard') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'ProfessionalAppointments') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'ProfessionalSchedule') {
            iconName = focused ? 'time' : 'time-outline';
          } else if (route.name === 'ProfessionalServices') {
            iconName = focused ? 'medkit' : 'medkit-outline';
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
        name="ProfessionalDashboard"
        component={ProfessionalDashboardScreen}
        options={{ title: 'Panel', headerTitle: 'Panel Profesional' }}
      />
      <Tab.Screen
        name="ProfessionalAppointments"
        component={ProfessionalAppointmentsScreen}
        options={{ title: 'Citas', headerTitle: 'Citas de Pacientes' }}
      />
      <Tab.Screen
        name="ProfessionalSchedule"
        component={ProfessionalScheduleScreen}
        options={{ title: 'Horarios', headerTitle: 'Mis Horarios de Atención' }}
      />
      <Tab.Screen
        name="ProfessionalServices"
        component={ProfessionalServicesScreen}
        options={{ title: 'Servicios', headerTitle: 'Mis Servicios Médicos' }}
      />
      <Tab.Screen
        name="EmergencySensor"
        component={EmergencySensorScreen}
        options={{ title: 'Sensores', headerTitle: 'Sensores de Salud' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Perfil', headerTitle: 'Mi Perfil' }}
      />
    </Tab.Navigator>
  );
};
