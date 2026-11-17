# 📱 Salud al Toque — Frontend Mobile

Aplicación móvil desarrollada con **React Native**, **Expo SDK 58** y **TypeScript**.

Desplegado con eas.
Build para android:
https://expo.dev/accounts/sea1s-team/projects/sea1/builds/5f9bcca7-fa9d-43a0-b3ac-0101c99eddd6

---

## Tecnologías

- **React Native** con navegación tabulada y stack adaptativo por rol (`@react-navigation`).
- **Expo SDK 58** — GPS, acelerómetro, cámara, SecureStore.
- **TypeScript** estricto — tipado completo de DTOs y modelos.
- **Axios** — cliente HTTP con interceptores JWT y mensajes amigables (`friendlyMessage`).

---

## Arquitectura

```
src/
├── api/            # Cliente Axios con interceptores + API externa (Nominatim)
├── contexts/       # AuthContext — estado global de autenticación
├── hooks/          # Custom hooks: useFetch, useLocation, useShake
├── components/     # 7 componentes presentacionales reutilizables
├── screens/        # 14 pantallas organizadas por actor (auth, patient, professional, admin)
├── services/       # 10 servicios desacoplados por entidad
├── navigation/     # RootNavigator + navegadores tabulados por rol
├── utils/          # Haversine (distancias) y almacenamiento seguro
└── types/          # Definiciones TypeScript de DTOs y modelos
```

### Context

| Context | Descripción |
|---|---|
| `AuthContext` | Estado global de autenticación: `token`, `user`, `role`, `isAuthenticated`. Provee `login()`, `logout()`, `updateUser()`. Almacena JWT cifrado en `expo-secure-store`. |

### Custom Hooks

| Hook | Descripción |
|---|---|
| `useFetch` | Peticiones asíncronas con estado `loading`, `error` y función `refetch`. |
| `useLocation` | Obtiene coordenadas GPS del dispositivo, geocodificación inversa (Nominatim) y manejo de permisos. Devuelve `coords`, `address`, `loading`, `permissionGranted`. |
| `useShake` | Detecta gesto de sacudida del dispositivo vía acelerómetro (`expo-sensors`). Configurable con `threshold` y `enabled`. Debounce de 1.5s entre activaciones. |

### Componentes Reutilizables

| Componente | Descripción |
|---|---|
| `LoadingView` | Indicador visual de carga con `ActivityIndicator`. |
| `ErrorView` | Mensaje de error con botón de reintento. |
| `EmptyStateView` | Estado vacío con icono y mensaje. |
| `StarRating` | Componente de estrellas interactivo y de solo lectura. |
| `StatusBadge` | Etiqueta de color según estado de la cita. |
| `ProfessionalCard` | Tarjeta de médico con nombre, especialidad, rating y distancia. |
| `PatientContactModal` | Modal con datos de contacto del paciente: llamada, WhatsApp, correo. |

### Servicios

| Servicio | Endpoints consumidos |
|---|---|
| `authService` | `POST /auth/signin`, `POST /auth/signup` |
| `userService` | `GET /users`, `POST /users`, `DELETE /users/{id}`, `GET/PUT /users/me`, `PUT /users/me/password` |
| `patientService` | `GET/PUT /patients/me` |
| `professionalService` | `GET /professionals`, `GET /professionals/{id}`, `POST /professionals` |
| `appointmentService` | `GET /appointments`, `GET /appointments/my-*`, `POST /appointments`, `PATCH /{id}/accept\|reject\|complete` |
| `reviewService` | `GET /reviews`, `GET /reviews/professional/{id}`, `POST /reviews` |
| `favoriteService` | `GET /favorites/my-favorites`, `POST/DELETE /favorites/...` |
| `availabilityService` | `GET /availabilities/professional/{id}` |
| `medicalServiceService` | `GET /medical-services/professional/{id}` |
| `specialtyService` | `GET /specialties` |

### Navegación

| Navegador | Pantallas |
|---|---|
| `RootNavigator` | Login, Register → redirige al tab navigator adaptativo según rol + stack común (`ProfessionalDetail`, `EmergencySensor`) |
| `PatientTabNavigator` | Inicio, Médicos, Mis Citas, Favoritos, Sensores, Mi Perfil |
| `ProfessionalTabNavigator` | Panel, Citas, Horarios, Servicios, Sensores, Mi Perfil |
| `AdminTabNavigator` | Gestión, Médicos, Sensores, Mi Perfil |

### Sensores y APIs Externas

| Sensor / API | Uso |
|---|---|
| **GPS** (`expo-location`) | Geolocalización del paciente y distancia Haversine a consultorios. |
| **Acelerómetro** (`expo-sensors`) | Detección de sacudida para alerta de emergencia médica. |
| **Cámara / Galería** (`expo-image-picker`) | Captura de fotos de recetas y exámenes. |
| **OpenStreetMap Nominatim** | Geocodificación inversa (coordenadas → distrito de Lima). |

### Pantallas

#### Autenticación
| Pantalla | Descripción |
|---|---|
| `LoginScreen` | Inicio de sesión con botones demo rápidos (Paciente, Profesional, Admin). |
| `RegisterScreen` | Registro de nuevos pacientes con validaciones de campos. |

#### Paciente
| Pantalla | Descripción |
|---|---|
| `HomeScreen` | Panel con tarjeta GPS, estadísticas de citas, médicos cercanos por distancia Haversine. |
| `ProfessionalsScreen` | Búsqueda en tiempo real con filtro por especialidad y ordenamiento (cercanía / calificación). |
| `ProfessionalDetailScreen` | Perfil médico, servicios con precio, horarios, reseñas y formulario de reserva. |
| `MyAppointmentsScreen` | Citas con filtro por estado y modal para calificar citas completadas. |
| `FavoritesScreen` | Profesionales guardados con opción de remover o ver perfil. |
| `EmergencySensorScreen` | Sensores en vivo (GPS, acelerómetro, cámara) y números de emergencia (SAMU 106, Bomberos 116). |

#### Profesional
| Pantalla | Descripción |
|---|---|
| `ProfessionalDashboardScreen` | Métricas: citas totales, pendientes, aceptadas, completadas. |
| `ProfessionalAppointmentsScreen` | Gestión de citas — aceptar, rechazar o completar con modal de contacto. |
| `ProfessionalScheduleScreen` | Configuración de bloques de disponibilidad semanal. |
| `ProfessionalServicesScreen` | Catálogo de servicios médicos con precios en soles (S/.). |

#### Administrador
| Pantalla | Descripción |
|---|---|
| `AdminDashboardScreen` | Métricas globales, buscador y filtros de usuarios, eliminación en cascada y alta oficial de profesionales. |

#### Compartida
| Pantalla | Descripción |
|---|---|
| `ProfileScreen` | Perfil editable con cambio de contraseña (todos los roles) y ajuste del sensor de sacudida. |

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

> **Nota:** En `src/api/client.ts` actualizar `DEFAULT_HOST` con la IP de tu dispositivo para desarrollo local, o apuntar al backend en producción:
> ```
> https://saludaltoquebackend.duckdns.org
> ```

### Cuentas de Demostración
| Rol | Correo | Contraseña |
|---|---|---|
| Paciente | luis@gmail.com | 123456 |
| Profesional | carlos@gmail.com | 123456 |
| Administrador | admin@gmail.com | 123456 |
