import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { EmergencySensorScreen } from '../screens/patient/EmergencySensorScreen';
import { FavoritesScreen } from '../screens/patient/FavoritesScreen';
import { HomeScreen } from '../screens/patient/HomeScreen';
import { MyAppointmentsScreen } from '../screens/patient/MyAppointmentsScreen';
import { ProfessionalsScreen } from '../screens/patient/ProfessionalsScreen';

const Tab = createBottomTabNavigator();

export const PatientTabNavigator = () => {
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
          let iconName: keyof typeof Ionicons.glyphMap = 'home';
          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'ProfessionalsTab') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'MyAppointmentsTab') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'FavoritesTab') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'EmergencyTab') {
            iconName = focused ? 'hardware-chip' : 'hardware-chip-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{ title: 'Inicio', headerTitle: 'Salud al Toque' }}
      />
      <Tab.Screen
        name="ProfessionalsTab"
        component={ProfessionalsScreen}
        options={{ title: 'Médicos', headerTitle: 'Buscar Especialistas' }}
      />
      <Tab.Screen
        name="MyAppointmentsTab"
        component={MyAppointmentsScreen}
        options={{ title: 'Mis Citas', headerTitle: 'Mis Citas Médicas' }}
      />
      <Tab.Screen
        name="FavoritesTab"
        component={FavoritesScreen}
        options={{ title: 'Favoritos', headerTitle: 'Médicos Favoritos' }}
      />
      <Tab.Screen
        name="EmergencyTab"
        component={EmergencySensorScreen}
        options={{ title: 'Sensores', headerTitle: 'Sensores de Salud' }}
      />
    </Tab.Navigator>
  );
};

