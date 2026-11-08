import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { externalApi, type ReverseGeocodeResult } from '../api/externalApi';
import type { Coordinates } from '../types';

interface UseLocationResult {
  coords: Coordinates | null;
  address: ReverseGeocodeResult | null;
  loading: boolean;
  permissionGranted: boolean;
  errorMsg: string | null;
  requestLocation: () => Promise<void>;
}

// Default fallback coordinates (Miraflores, Lima, Peru)
const DEFAULT_LIMA_COORDS: Coordinates = {
  latitude: -12.1217,
  longitude: -77.0297,
};

export function useLocation(): UseLocationResult {
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [address, setAddress] = useState<ReverseGeocodeResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const requestLocation = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setPermissionGranted(false);
        setErrorMsg('Permiso de ubicación denegado. Usando ubicación estimada de Lima.');
        setCoords(DEFAULT_LIMA_COORDS);
        const fallbackAddr = await externalApi.getAddressFromCoords(
          DEFAULT_LIMA_COORDS.latitude,
          DEFAULT_LIMA_COORDS.longitude
        );
        setAddress(fallbackAddr);
        return;
      }

      setPermissionGranted(true);
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const userCoords: Coordinates = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };
      setCoords(userCoords);

      // External API integration: Reverse Geocoding
      const resolvedAddress = await externalApi.getAddressFromCoords(
        userCoords.latitude,
        userCoords.longitude
      );
      setAddress(resolvedAddress);
    } catch {
      // Fallback on error or timeout
      setErrorMsg('No se pudo obtener el GPS. Usando ubicación por defecto.');
      setCoords(DEFAULT_LIMA_COORDS);
      setAddress({ displayName: 'Lima, Perú', district: 'Lima', city: 'Lima', country: 'Perú' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    requestLocation();
  }, []);

  return { coords, address, loading, permissionGranted, errorMsg, requestLocation };
}

