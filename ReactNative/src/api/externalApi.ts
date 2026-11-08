import axios from 'axios';

export interface ReverseGeocodeResult {
  displayName: string;
  district?: string;
  city?: string;
  country?: string;
}

export const externalApi = {
  /**
   * Reverse geocodes latitude/longitude coordinates into a district and address
   * using the OpenStreetMap Nominatim public geocoding API.
   */
  async getAddressFromCoords(latitude: number, longitude: number): Promise<ReverseGeocodeResult> {
    try {
      const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
        params: {
          lat: latitude,
          lon: longitude,
          format: 'json',
          addressdetails: 1,
        },
        headers: {
          'User-Agent': 'SaludAlToqueMobile/1.0',
        },
        timeout: 8000,
      });

      const data = response.data;
      const addr = data.address || {};
      const district = addr.suburb || addr.neighbourhood || addr.city_district || addr.town || addr.city;
      const city = addr.city || addr.county || addr.state || 'Lima';

      return {
        displayName: data.display_name || `${district || ''}, ${city}`,
        district: district || 'Lima Centro',
        city,
        country: addr.country || 'Perú',
      };
    } catch {
      // Fallback if external API fails or is offline
      return {
        displayName: 'Lima, Perú',
        district: 'Lima',
        city: 'Lima',
        country: 'Perú',
      };
    }
  },
};

