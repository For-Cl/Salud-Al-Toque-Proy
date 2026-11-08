# 📱 Salud al Toque — Frontend Mobile (React Native + Expo)

Aplicación móvil desarrollada en **React Native**, **Expo SDK 58** y **TypeScript**, diseñada para cumplir con los requerimientos de la Rúbrica de Proyecto 2 del curso **CS 2031 Desarrollo Basado en Plataformas (DBP)**.

---

## 📋 Cumplimiento de la Rúbrica (Evaluación Mobile)

### 2. Mobile (5 Puntos)

#### 2.1 Integración con Backend y Consumo de API (1.5 pts)
* **Consumo Exclusivo del Backend:** Todas las operaciones consumen la API REST Spring Boot desplegada en `http://localhost:8080` (en emulador Android configurado a `http://10.0.2.2:8080`).
* **Implementación Completa de Métodos HTTP:**
  - `GET`: Profesionales, servicios, disponibilidades, citas y favoritos.
  - `POST`: Autenticación (`/auth/signin`, `/auth/signup`), reserva de citas (`/appointments`), favoritos (`/favorites/professional/{id}`), reseñas (`/reviews`).
  - `PATCH`: Transiciones de ciclo de vida de citas (`/appointments/{id}/accept`, `/reject`, `/complete`).
  - `DELETE`: Eliminación de favoritos (`/favorites/{id}`).
* **Almacenamiento Seguro de JWT (SecureStore):** Los tokens JWT se almacenan cifrados en el hardware seguro del dispositivo usando el SDK de Expo (`expo-secure-store`) mediante el wrapper `src/utils/storage.ts`, con fallback elegante en caso de entorno web.
* **Interceptores de Autenticación y Errores:**
  - Interceptor de petición inyecta `Authorization: Bearer <token>`.
  - Interceptor de respuesta mapea códigos de estado HTTP (400, 401, 403, 404, 409, 500) a mensajes entendibles y humanos (`friendlyMessage`), eliminando trazas técnicas.
* **Sin Datos Hardcodeados:** Todas las entidades (médicos, horarios, citas, valoraciones) provienen directamente de la base de datos a través de la API.

#### 2.2 Arquitectura y Separación de Responsabilidades (1.0 pt)
* **Arquitectura Modular por Capas:**
  ```
  src/
  ├── api/          # Axios con interceptores y cliente de API externa
  ├── services/     # Servicios desacoplados por entidad (auth, prof, apt, review, fav)
  ├── contexts/     # AuthContext (Context API global para estado de autenticación)
  ├── hooks/        # Custom hooks (useAuth, useFetch, useLocation, useShake)
  ├── components/   # Componentes presentacionales desacoplados
  ├── screens/      # Vistas organizadas por actor (auth, patient, professional)
  ├── navigation/   # RootNavigator, PatientTabNavigator, ProfessionalTabNavigator
  ├── utils/        # Cálculo de distancias (Haversine) y almacenamiento seguro
  └── types/        # Definiciones TypeScript de DTOs y modelos
  ```
* **React Hooks Avanzados:** Uso riguroso de `useState`, `useEffect`, `useContext`, `useCallback`, `useMemo` y `useRef`.
* **Convención en Inglés:** Nombres limpios, semánticos y descriptivos en inglés para toda la base de código.

#### 2.3 Sensores y APIs Externas (1.5 pts)
* **Sensor 1: GPS y Geolocalización (`expo-location`)**:
  - Obtiene las coordenadas precisas del dispositivo en tiempo real con manejo de permisos (`requestForegroundPermissionsAsync`).
  - Calcula la distancia en kilómetros (fórmula de Haversine en `src/utils/distance.ts`) a cada consultorio médico de Lima.
  - Permite ordenar especialistas automáticamente por cercanía al paciente.
* **Sensor 2: Acelerómetro y Gesto de Sacudida (`expo-sensors`)**:
  - Monitorea los 3 ejes de aceleración (`x`, `y`, `z`).
  - Implementa un detector de sacudida (`useShake`) con debounce de 1.5s: agitar el teléfono abre un diálogo de emergencia médica instantánea o refresca las citas programadas.
* **Sensor 3 / Hardware: Cámara y Galería (`expo-image-picker`)**:
  - Permite a los pacientes capturar o seleccionar fotos de recetas médicas para adjuntarlas a su historial antes de su consulta médica.
* **API Externa Relevante (OpenStreetMap Nominatim Geocoding API)**:
  - Convierte las coordenadas GPS del dispositivo en nombres de distritos y direcciones peruanas reales (ej. "Miraflores, Lima") mediante `src/api/externalApi.ts`.
* **Manejo de Permisos y Fallbacks:** Si el usuario no otorga permisos de GPS o cámara, la app ofrece una ubicación estimada por defecto de Lima Centro y permite seleccionar archivos alternativos sin romperse.

#### 2.4 Manejo de Errores y Estados de Carga (1.0 pt)
* **Try/Catch Exhaustivo:** Envoltura en todos los servicios y pantallas.
* **Mensajes Amigables:** Diálogos nativos `Alert.alert` con lenguaje claro (ej. "El horario seleccionado ya está reservado").
* **Indicadores Visuales de Carga:** Uso de `ActivityIndicator` con componentes especializados (`LoadingView`).
* **Pull to Refresh:** Implementado en todas las listas de profesionales, citas y favoritos.
* **Control de Doble Envío:** Deshabilitación de botones táctiles mientras las peticiones HTTP están en curso.

---

## 📱 Pantallas Implementadas

### Módulo de Autenticación
1. `LoginScreen`: Ingreso con correo y contraseña, con botones rápidos de demo ("Paciente" / "Profesional").
2. `RegisterScreen`: Registro de nuevo paciente con validaciones de campos.

### Módulo de Pacientes
3. `HomeScreen`: Panel principal con tarjeta GPS, estadísticas de citas, acceso directo a sensores y médicos cercanos ordenados por distancia.
4. `ProfessionalsScreen`: Búsqueda en tiempo real, filtro por especialidad y ordenamiento por cercanía o calificación.
5. `ProfessionalDetailScreen`: Perfil médico, servicios con precio, horarios de disponibilidad, opiniones y formulario de reserva.
6. `MyAppointmentsScreen`: Lista de citas con filtro por estado (`PENDIENTE`, `ACEPTADA`, etc.) y modal para calificar citas completadas.
7. `FavoritesScreen`: Lista de especialistas favoritos con opción para remover o consultar perfil.
8. `EmergencySensorScreen`: Vista interactiva para probar los sensores (GPS, acelerómetro en vivo, cámara de recetas médicas) y números de emergencia (SAMU 106, Bomberos 116).

### Módulo de Profesionales
9. `ProfessionalDashboardScreen`: Panel con métricas de citas totales, pendientes, aceptadas y completadas.
10. `ProfessionalAppointmentsScreen`: Gestión de citas con acciones para **Aceptar**, **Rechazar** o **Completar** citas de pacientes.

---

## 🚀 Instalación y Ejecución Local

### Prerrequisitos
* Node.js v18+ y npm
* Expo CLI (`npx expo`)
* Expo Go instalado en tu smartphone (Android o iOS) o emulador de Android Studio / simulador de Xcode.

### Pasos
```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar Expo bundler
npx expo start

# 3. Para ejecutar en navegador web:
npx expo start --web

# 4. Para ejecutar en emulador Android:
npx expo start --android

# 5. Para ejecutar en simulador iOS:
npx expo start --ios
```

### Cuentas Demo para Evaluación
* **Paciente:** `luis@gmail.com` | Contraseña: `123456`
* **Profesional:** `carlos@gmail.com` | Contraseña: `123456`
* **Administrador:** `admin@gmail.com` | Contraseña: `123456`

