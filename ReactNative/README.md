# 📱 Salud al Toque — Frontend Mobile

Aplicación móvil desarrollada con **React Native**, **Expo SDK 58** y **TypeScript**.

---

## Tecnologías

- **React Native** con navegación tabulada por rol (Patient / Professional).
- **Expo SDK 58** — GPS, acelerómetro, cámara, SecureStore.
- **TypeScript** estricto — tipado completo de DTOs y modelos.
- **Axios** — cliente HTTP con interceptores JWT y mensajes amigables.

---

## Sensores y APIs Externas

| Sensor / API | Uso |
|---|---|
| **GPS** (`expo-location`) | Geolocalización del paciente y distancia Haversine a consultorios. |
| **Acelerómetro** (`expo-sensors`) | Detección de sacudida para alerta de emergencia médica. |
| **Cámara / Galería** (`expo-image-picker`) | Captura de fotos de recetas y exámenes. |
| **OpenStreetMap Nominatim** | Geocodificación inversa (coordenadas → distrito de Lima). |

---

## Pantallas

### Autenticación
- `LoginScreen` — Inicio de sesión con botones demo rápidos.
- `RegisterScreen` — Registro de pacientes.

### Paciente
- `HomeScreen` — Panel con GPS, estadísticas y médicos cercanos.
- `ProfessionalsScreen` — Búsqueda con filtros y ordenamiento.
- `ProfessionalDetailScreen` — Perfil, servicios, horarios, reseñas y reserva.
- `MyAppointmentsScreen` — Citas con filtro por estado y calificación.
- `FavoritesScreen` — Profesionales guardados.
- `EmergencySensorScreen` — Sensores en vivo y números de emergencia.

### Profesional
- `ProfessionalDashboardScreen` — Métricas de citas.
- `ProfessionalAppointmentsScreen` — Aceptar, rechazar o completar citas.

---

## Instalación

**Prerrequisitos:** Node.js v18+, Expo CLI, Expo Go en smartphone o emulador.

```bash
npm install
npx expo start           # Bundler de Expo
npx expo start --android  # Emulador Android
npx expo start --ios      # Simulador iOS
npx expo start --web      # Navegador web
```

> **Nota:** En `src/api/client.ts` actualizar `DEFAULT_HOST` con la IP de tu dispositivo.

### Cuentas de Demostración
| Rol | Correo | Contraseña |
|---|---|---|
| Paciente | luis@gmail.com | 123456 |
| Profesional | carlos@gmail.com | 123456 |
| Administrador | admin@gmail.com | 123456 |
