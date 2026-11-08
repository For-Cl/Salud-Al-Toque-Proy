import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { LoadingView } from '../components/LoadingView';
import { useAuth } from '../contexts/AuthContext';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { EmergencySensorScreen } from '../screens/patient/EmergencySensorScreen';
import { ProfessionalDetailScreen } from '../screens/patient/ProfessionalDetailScreen';
import { PatientTabNavigator } from './PatientTabNavigator';
import { ProfessionalTabNavigator } from './ProfessionalTabNavigator';

const Stack = createNativeStackNavigator();

export const RootNavigator = () => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return <LoadingView message="Iniciando Salud al Toque..." />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#f8fafc' },
        }}
      >
        {!isAuthenticated ? (
          // Unauthenticated Stack
          <Stack.Group>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ headerShown: true, title: 'Crear Cuenta', headerBackTitle: 'Atrás' }}
            />
          </Stack.Group>
        ) : role === 'PROFESSIONAL' ? (
          // Professional App Stack
          <Stack.Group>
            <Stack.Screen name="ProfessionalMain" component={ProfessionalTabNavigator} />
          </Stack.Group>
        ) : (
          // Patient App Stack
          <Stack.Group>
            <Stack.Screen name="PatientMain" component={PatientTabNavigator} />
            <Stack.Screen
              name="ProfessionalDetail"
              component={ProfessionalDetailScreen}
              options={{
                headerShown: true,
                title: 'Detalle del Profesional',
                headerTintColor: '#0d9488',
                headerBackTitle: 'Volver',
              }}
            />
            <Stack.Screen
              name="EmergencySensor"
              component={EmergencySensorScreen}
              options={{
                headerShown: true,
                title: 'Sensores y Emergencias',
                headerTintColor: '#0d9488',
                headerBackTitle: 'Atrás',
              }}
            />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

