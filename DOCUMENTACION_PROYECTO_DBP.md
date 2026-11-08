# 🩺 Salud al Toque — Documentación Integral del Proyecto DBP

**Curso:** CS 2031 Desarrollo Basado en Plataforma (DBP) — Fase 2  
**Tecnologías:** React 19, TypeScript, Tailwind CSS, React Native (Expo SDK 58), Java 17, Spring Boot, PostgreSQL.

---

## 📑 Tabla de Contenidos
1. [Resumen Ejecutivo y Pitch del Problema](#1-resumen-ejecutivo-y-pitch-del-problema)
2. [Arquitectura General del Sistema](#2-arquitectura-general-del-sistema)
3. [Integración con el Backend](#3-integración-con-el-backend-no-modificado)
4. [Desarrollo Frontend Web (Rúbrica Sección 3 y 4)](#4-desarrollo-frontend-web-rúbrica-sección-3-y-4)
5. [Desarrollo Frontend Mobile (Rúbrica Sección 2)](#5-desarrollo-frontend-mobile-rúbrica-sección-2)
6. [Manual de Despliegue y Ejecución Local](#7-manual-de-despliegue-y-ejecución-local)

---

## 1. Resumen Ejecutivo y Pitch del Problema

### El Problema
En Lima y las principales ciudades del país, acceder a atención médica particular de calidad es un proceso fragmentado e ineficiente. Los pacientes deben buscar información dispersa en redes sociales o llamadas telefónicas, sin poder comparar tarifas, cercanía, disponibilidad horaria ni opiniones verificadas. Por otro lado, los profesionales independientes sufren de cruces de horarios y ausentismo.

### La Solución: Salud al Toque
**Salud al Toque** es una plataforma integral (Web y Mobile) que centraliza el directorio médico de especialistas, permitiendo:
* Filtrar por especialidad, ubicación, precio máximo y calificación real.
* Geolocalizar automáticamente al paciente por GPS para recomendarle consultorios cercanos (cálculo de distancias con la fórmula de Haversine).
* Reservar citas médicas en tiempo real con validación estricta de agenda semanal y prevención de doble reserva.
* Calificar atenciones médicas mediante reseñas verificadas (únicamente tras completar la cita).
* Notificaciones asíncronas por correo electrónico para cada evento del ciclo de vida.

---

## 2. Arquitectura General del Sistema

```
                      ┌──────────────────────────────────────┐
                      │          Backend Spring Boot         │
                      │  REST API • JWT Stateless • JPA/SQL  │
                      │         Puerto local: 8080           │
                      └──────────────────┬───────────────────┘
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 │                                               │
                 ▼                                               ▼
   ┌───────────────────────────┐                   ┌───────────────────────────┐
   │       Frontend Web        │                   │      Frontend Mobile      │
   │  React 19 + TypeScript    │                   │ React Native (Expo SDK 58)│
   │  Vite • Tailwind CSS v4   │                   │ GPS • Acelerómetro • Cam  │
   │  React Router • Axios     │                   │ SecureStore • Nominatim   │
   │    Puerto local: 5173     │                   │    iOS / Android / Web    │
   └───────────────────────────┘                   └───────────────────────────┘
```

---

## 3. Integración con el Backend

El backend de Spring Boot se conservó **100% intacto**, sin alterar ninguna clase, controlador ni entidad. Ambas aplicaciones cliente consumen rigurosamente sus contratos de API:

| Módulo | Métodos | Endpoints Principales | Headers & Seguridad |
|---|---|---|---|
| **Auth** | `POST` | `/auth/signin`, `/auth/signup` | Público |
| **Profesionales** | `GET` | `/professionals?specialty=&location=&maxPrice=`, `/professionals/{id}` | Público |
| **Servicios Médicos** | `GET` | `/medical-services/professional/{id}` | Público |
| **Disponibilidad** | `GET` | `/availabilities/professional/{id}` | Público |
| **Citas (Paciente)** | `GET`, `POST` | `/appointments/my-appointments`, `/appointments` | `Bearer <token>` (PATIENT) |
| **Citas (Médico)** | `GET`, `PATCH` | `/appointments/my-professional-appointments`, `/{id}/accept`, `/{id}/reject`, `/{id}/complete` | `Bearer <token>` (PROFESSIONAL) |
| **Reseñas** | `GET`, `POST` | `/reviews/professional/{id}`, `/reviews` | Público / `Bearer <token>` (PATIENT) |
| **Favoritos** | `GET`, `POST`, `DELETE` | `/favorites/my-favorites`, `/favorites/professional/{id}`, `/favorites/{id}` | `Bearer <token>` (PATIENT) |

---

## 4. Desarrollo Frontend Web (Rúbrica Sección 3 y 4)

### 4.1 Consumo de API y Arquitectura Cliente
* **Cliente Axios Centralizado (`src/api/client.ts`):** `baseURL: http://localhost:8080`, timeout de 15 segundos y headers JSON.
* **Manejo Seguro de JWT:** Interceptor de peticiones inyecta automáticamente el token Bearer.
* **Control de Errores Global:** Interceptor de respuesta con manejo diferenciado de 401, 403, 409 y 500.
* **Prevención de Fugas de Memoria:** Implementación de `AbortController` en el custom hook `useFetch`.

### 4.2 Componentes Reutilizables y Custom Hooks
* **11 Componentes Modulares:** `Navbar`, `Layout`, `LoadingSpinner`, `ErrorMessage`, `EmptyState`, `StarRating`, `SearchBar`, `ConfirmModal`, `Pagination`, `ProtectedRoute`, `StatusBadge`.
* **5 Custom Hooks:** `useAuth`, `useFetch`, `useForm`, `usePagination`, `useDebounce`.
* **TypeScript Estricto:** Tipado completo de DTOs en `src/types/index.ts`.

### 4.3 Routing y Navegación
* Enrutador centralizado con rutas dinámicas (`/professionals/:id`), rutas protegidas por rol con `ProtectedRoute`, lazy loading con `React.lazy()` y `Suspense`, y página 404 personalizada (`NotFoundPage`).

### 4.4 Manejo de Errores, Carga y Validaciones
* Feedback visual interactivo con `react-hot-toast`.
* Deshabilitación de botones para prevenir doble-submit.
* Validaciones client-side en tiempo real para contraseñas seguras y emails.

### 4.5 UI/UX y Estilización
* **Tailwind CSS v4:** Interfaz moderna, paleta médica Teal/Slate, responsive design (desktop, tablet, mobile).
* **Paginación Funcional:** Implementada con selector de tamaño de página y métricas de items mostrados en las secciones de Directorio Médico, Mis Citas y Favoritos.
* **Más de 7 Vistas Diferenciadas:** Login, Register, Dashboard, ProfessionalList, ProfessionalDetail, MyAppointments, ProfessionalAppointments, MyFavorites, NotFound.

---

## 5. Desarrollo Frontend Mobile (Rúbrica Sección 2)

### 5.1 Consumo de API y Almacenamiento Seguro
* **Consumo Exclusivo del Backend:** Todos los datos provienen del servidor Spring Boot.
* **Expo SecureStore (`src/utils/storage.ts`):** El token JWT se almacena de forma encriptada en el enclave seguro del dispositivo mediante `expo-secure-store`.
* **Métodos HTTP Completos:** `GET`, `POST`, `PATCH`, `DELETE` implementados en servicios independientes.

### 5.2 Arquitectura y Separación de Capas
* Separación estricta entre capa API (`src/api`), servicios de dominio (`src/services`), estado global (`src/contexts/AuthContext.tsx`), lógica reutilizable (`src/hooks`), componentes de interfaz (`src/components`) y pantallas (`src/screens`).

### 5.3 Sensores y APIs Externas
1. **Sensor 1 — GPS (`expo-location`):** Captura las coordenadas del usuario, calcula la distancia en km a los centros de salud mediante la fórmula matemática de Haversine y ordena a los doctores por cercanía.
2. **Sensor 2 — Acelerómetro (`expo-sensors`):** Detecta movimientos bruscos y gestos de sacudida (Shake gesture) mediante `src/hooks/useShake.ts` con debounce para activar refresco o atajo de emergencia médica.
3. **Sensor 3 / Hardware — Cámara y Galería (`expo-image-picker`):** Permite fotografiar recetas médicas o seleccionar documentos de salud desde el almacenamiento del teléfono.
4. **API Externa — OpenStreetMap Nominatim:** Geocodificación inversa para traducir latitud/longitud en distritos y calles reales de Lima.

### 5.4 Manejo de Errores y Carga
* Mensajes humanizados en diálogos nativos (`Alert.alert`).
* Indicadores visuales de carga (`LoadingView` con `ActivityIndicator`).
* Pull-to-refresh en todas las listas.

---

## 6. Manual de Despliegue y Ejecución Local

### Paso 1: Iniciar el Backend
```bash
cd Backend-Salud-Al-Toque-
docker compose up -d                 # Inicia PostgreSQL en puerto 5434
./mvnw spring-boot:run               # API REST en http://localhost:8080
```

### Paso 2: Iniciar el Frontend Web
```bash
cd FrontendWeb
npm install
npm run dev                          # Disponible en http://localhost:5173
```

### Paso 3: Iniciar el Frontend Mobile
```bash
cd ReactNative
npm install
npx expo start                       # Abre interfaz de Expo para Android/iOS/Web
```
OJO: en client.ts cambiar por la ip de tu pc
const DEFAULT_HOST = '192.168.18.126'
