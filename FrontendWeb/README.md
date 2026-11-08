# 🩺 Salud al Toque — Frontend Web

Aplicación web desarrollada en **React 19**, **TypeScript** y **Tailwind CSS v4** con empaquetador **Vite**, diseñada para cumplir con los requerimientos de la Rúbrica de Proyecto 2 del curso **CS 2031 Desarrollo Basado en Plataformas (DBP)**.

---

## 📋 Cumplimiento de la Rúbrica (Evaluación Web)

### 3. Web (5 Puntos)

#### 3.1 Integración con Backend y Consumo de API (2.0 pts)
* **Consumo Exclusivo del Backend:** Todas las operaciones consumen la API REST Spring Boot desplegada en `http://localhost:8080`.
* **Capa de Cliente Centralizada (`src/api/client.ts`):** Instancia configurada de `axios` con `baseURL`, timeout y `headers` por defecto (`application/json`).
* **Métodos HTTP Completos:** Implementación estricta de `GET`, `POST`, `PUT`, `DELETE` y `PATCH` (para transiciones de estado de citas `/accept`, `/reject`, `/complete`).
* **Seguridad JWT y Manejo de Sesiones:** El token JWT se inyecta automáticamente en el header `Authorization: Bearer <token>` mediante un interceptor de peticiones.
* **Interceptores de Respuesta Globales:** Captura y procesamiento unificado de respuestas 401 (expiración de sesión), 403 (permisos denegados), 409 (conflictos de horario o datos duplicados) y 500 (errores de servidor).
* **Prevención de Fugas de Memoria:** Implementación de `AbortController` en el hook `useFetch` para cancelación de solicitudes al desmontar componentes o cambiar dependencias.

#### 3.2 Componentes y Arquitectura React (1.0 pt)
* **Más de 10 Componentes Reutilizables:**
  1. `Navbar`: Barra de navegación responsive con control de roles y sesión.
  2. `Layout`: Envoltura principal con contenedor de notificaciones toast.
  3. `LoadingSpinner`: Indicador visual con spinner de carga accesible.
  4. `ErrorMessage`: Visualización amigable de errores con botón de reintento.
  5. `EmptyState`: Estados vacíos con mensaje, icono y botón de acción (call-to-action).
  6. `StarRating`: Componente de estrellas interactivo y de solo lectura.
  7. `SearchBar`: Barra de búsqueda con icono de borrado rápido.
  8. `ConfirmModal`: Modal de confirmación para acciones críticas (aceptar/rechazar/completar citas).
  9. `Pagination`: Controles completos de paginación (anterior, siguiente, números y tamaño de página).
  10. `ProtectedRoute`: Guardia de rutas dinámico basado en autenticación y roles (`PATIENT`, `PROFESSIONAL`).
  11. `StatusBadge`: Etiquetas de colores según el ciclo de vida de la cita (`PENDIENTE`, `ACEPTADA`, `COMPLETADA`, `RECHAZADA`).
* **Custom Hooks Modulares:**
  - `useAuth`: Gestión global de autenticación, rol y decodificación de JWT.
  - `useFetch`: Peticiones asíncronas con estado `loading`, `error`, abort controller y función `refetch`.
  - `useForm`: Manejo y validación de formularios con control de submit.
  - `usePagination`: Paginación client-side y preparación para respuestas de backend.
  - `useDebounce`: Retardo configurable para búsquedas optimizadas sin saturar el servidor.
* **Tipado Estricto con TypeScript:** 100% tipado en `src/types/index.ts` sin uso de `any` en contratos de dominio.

#### 3.3 Routing y Navegación (1.0 pt)
* **React Router v7:** Enrutamiento centralizado en `src/App.tsx`.
* **Rutas Dinámicas:** `/professionals/:id` para el detalle del profesional y reserva de servicios.
* **Lazy Loading & Suspense:** Todos los componentes de página se cargan de forma diferida mediante `React.lazy()` y `Suspense`, minimizando el tamaño del bundle inicial.
* **Rutas Protegidas:** Protección granular por rol para pacientes (`/appointments`, `/favorites`) y para profesionales (`/professional/appointments`).
* **Manejo de Error 404:** Página dedicada `NotFoundPage` para URLs inválidas.

#### 3.4 Manejo de Errores, Carga y Validaciones (1.0 pt)
* **Feedback Visual Amigable:** Notificaciones toast mediante `react-hot-toast` para operaciones exitosas y fallos.
* **Validación en Tiempo Real:** Validación de contraseñas (mínimo 8 caracteres con letras y números), correos válidos y campos obligatorios.
* **Prevención de Doble Envío:** Deshabilitación visual y lógica de botones durante el envío de peticiones HTTP.
* **Retry Logic:** Botón de reintento en vistas afectadas por caídas de red.

---

### 4. Web — UI/UX (2 Puntos)

#### 4.1 Diseño Visual y Estilización (0.5 pt)
* **Tailwind CSS v4:** Paleta moderna en tonos Teal (`#0d9488`), Slate y Gray.
* **Totalmente Responsive:** Adaptación para móviles, tablets y monitores de escritorio.
* **Iconografía Consistente:** Paquete `react-icons/fi` (Feather Icons).

#### 4.2 Experiencia de Usuario (0.5 pt)
* Búsqueda con debounce para fluidez inmediata.
* Filtros interactivos por Especialidad, Ubicación, Rango de Precio y Rating mínimo.
* Modales de confirmación antes de rechazar o aceptar citas médicas.

#### 4.3 Vistas y Funcionalidades (0.5 pt)
* **Más de 7 Vistas Diferenciadas:**
  1. `Login`: Inicio de sesión seguro con JWT.
  2. `Register`: Registro de nuevos pacientes con validaciones.
  3. `Dashboard`: Panel principal con métricas para pacientes y profesionales.
  4. `ProfessionalList`: Directorio de médicos con filtros, búsqueda y paginación.
  5. `ProfessionalDetail`: Perfil médico, servicios, horarios, reseñas y reserva.
  6. `MyAppointments`: Panel de citas del paciente con filtro de estado y calificación.
  7. `ProfessionalAppointments`: Panel de gestión de citas del profesional.
  8. `MyFavorites`: Especialistas guardados por el paciente.
  9. `NotFound`: Pantalla 404 amigable.

#### 4.4 Paginación (0.5 pt)
* Implementada en los módulos de **Directorio de Profesionales**, **Mis Citas Médicas** y **Favoritos**, con controles de tamaño de página (10, 25, 50 items) e indicadores `Mostrando X–Y de Z`.

---

## 🚀 Instalación y Ejecución Local

### Prerrequisitos
* Node.js v18+ y npm
* Backend de Salud al Toque corriendo en `http://localhost:8080`

### Pasos
```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo
npm run dev

# 3. Compilar para producción (validación TypeScript + bundle Vite)
npm run build
```

La aplicación estará disponible en `http://localhost:5173`.
