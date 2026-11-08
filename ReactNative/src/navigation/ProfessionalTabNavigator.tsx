import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { ProfessionalAppointmentsScreen } from '../screens/professional/ProfessionalAppointmentsScreen';
import { ProfessionalDashboardScreen } from '../screens/professional/ProfessionalDashboardScreen';

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
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarIcon: ({ color, size, focused }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'medkit';
          if (route.name === 'DoctorDashboardTab') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'DoctorAppointmentsTab') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="DoctorDashboardTab"
        component={ProfessionalDashboardScreen}
        options={{ title: 'Panel', headerTitle: 'Panel Profesional' }}
      />
      <Tab.Screen
        name="DoctorAppointmentsTab"
        component={ProfessionalAppointmentsScreen}
        options={{ title: 'Gestión Citas', headerTitle: 'Citas de Pacientes' }}
      />
    </Tab.Navigator>
  );
};

