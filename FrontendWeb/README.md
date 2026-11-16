# 🩺 Salud al Toque — Frontend Web

Aplicación web desarrollada con **React 19**, **TypeScript**, **Tailwind CSS v4** y **Vite**.

---

## Tecnologías

- **React 19** con React Router v7 y carga diferida (`React.lazy` + `Suspense`).
- **TypeScript** estricto — tipado completo sin `any` en contratos de dominio.
- **Tailwind CSS v4** — diseño responsive con paleta Teal/Slate.
- **Axios** — cliente HTTP centralizado con interceptores JWT.
- **react-hot-toast** — notificaciones de feedback al usuario.

---

## Arquitectura

```
src/
├── api/            # Cliente Axios con interceptores (JWT, sesión, errores de red)
├── contexts/       # AuthContext — estado global de autenticación
├── hooks/          # Custom hooks reutilizables
├── components/     # 12 componentes presentacionales
├── pages/          # 12 vistas organizadas por funcionalidad
├── services/       # 10 servicios desacoplados por entidad
└── types/          # Definiciones TypeScript de DTOs y modelos
```

### Context

| Context | Descripción |
|---|---|
| `AuthContext` | Estado global de autenticación: `token`, `user`, `role`, `isAuthenticated`. Provee funciones `login()`, `logout()`, `updateUser()`. Decodifica JWT y persiste en `localStorage`. |

### Custom Hooks

| Hook | Descripción |
|---|---|
| `useAuth` | Acceso al `AuthContext` — devuelve token, usuario, rol y funciones de sesión. |
| `useFetch` | Peticiones asíncronas con estado `loading`, `error`, `AbortController` para prevenir fugas de memoria, y función `refetch`. |
| `useForm` | Manejo de formularios con validación y control de submit. |
| `usePagination` | Paginación client-side con control de página, tamaño e índices. |
| `useDebounce` | Retardo configurable para optimizar búsquedas sin saturar el servidor. |

### Componentes Reutilizables

| Componente | Descripción |
|---|---|
| `Navbar` | Barra de navegación responsive con menú adaptativo según rol y estado de sesión. |
| `Layout` | Envoltura principal con contenedor de notificaciones toast (`Toaster`). |
| `ProtectedRoute` | Guardia de rutas basado en autenticación y roles (`PATIENT`, `PROFESSIONAL`). |
| `LoadingSpinner` | Indicador visual de carga con spinner animado. |
| `ErrorMessage` | Mensaje de error amigable con botón de reintento. |
| `EmptyState` | Estado vacío con mensaje, icono y botón de acción (call-to-action). |
| `StarRating` | Componente de estrellas interactivo (editable) y de solo lectura. |
| `SearchBar` | Barra de búsqueda con icono de borrado rápido. |
| `ConfirmModal` | Modal de confirmación para acciones críticas (aceptar/rechazar/completar citas). |
| `Pagination` | Controles de paginación (anterior, siguiente, números, tamaño de página). |
| `StatusBadge` | Etiqueta de color según el estado de la cita (`PENDIENTE`, `ACEPTADA`, `COMPLETADA`, `RECHAZADA`). |
| `PatientContactModal` | Modal con datos de contacto del paciente: teléfono, WhatsApp, correo, dirección. |

### Servicios

| Servicio | Endpoints consumidos |
|---|---|
| `authService` | `POST /auth/signin`, `POST /auth/signup` |
| `userService` | `GET/PUT /users/me`, `PUT /users/me/password`, `GET/POST/DELETE /users` |
| `patientService` | `GET/PUT /patients/me` |
| `professionalService` | `GET /professionals`, `GET /professionals/{id}`, `POST /professionals` |
| `appointmentService` | `GET /appointments/my-appointments`, `POST /appointments`, `PATCH /{id}/accept\|reject\|complete` |
| `reviewService` | `GET /reviews/professional/{id}`, `POST /reviews` |
| `favoriteService` | `GET /favorites/my-favorites`, `POST/DELETE /favorites/...` |
| `availabilityService` | `GET /availabilities/professional/{id}`, `POST/DELETE /availabilities` |
| `medicalServiceService` | `GET /medical-services/professional/{id}`, `POST/DELETE /medical-services` |
| `specialtyService` | `GET /specialties` |

### Rutas

| Ruta | Vista | Rol |
|---|---|---|
| `/` | `ProfessionalList` — Directorio de profesionales con filtros y paginación | Público |
| `/login` | `Login` — Inicio de sesión con JWT | Público |
| `/register` | `Register` — Registro de nuevos pacientes | Público |
| `/dashboard` | `Dashboard` — Panel adaptativo por rol (Paciente / Profesional / Admin) | Autenticado |
| `/professionals/:id` | `ProfessionalDetail` — Perfil, servicios, horarios, reseñas y reserva | Público |
| `/my-appointments` | `MyAppointments` — Citas del paciente con filtro por estado y reseñas | Paciente |
| `/my-favorites` | `MyFavorites` — Profesionales favoritos guardados | Paciente |
| `/professional/appointments` | `ProfessionalAppointments` — Gestión de citas con modal de contacto | Profesional |
| `/professional/schedule` | `ProfessionalSchedule` — Disponibilidad horaria semanal | Profesional |
| `/professional/services` | `ProfessionalServices` — Catálogo de servicios con precios | Profesional |
| `/profile` | `Profile` — Perfil editable con cambio de contraseña | Autenticado |
| `*` | `NotFound` — Página 404 | — |

---

## Instalación

**Prerrequisitos:** Node.js v18+, backend corriendo en `http://localhost:8080`.

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # Compilación de producción (TypeScript + Vite)
```

Para apuntar al backend en producción, configurar la variable de entorno:
```bash
VITE_API_URL=https://saludaltoquebackend.duckdns.org
```
