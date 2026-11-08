# 🩺 Salud al Toque — Documentación Integral del Proyecto DBP

**Curso:** CS 2031 Desarrollo Basado en Plataforma (DBP) — Fase 2  
**Tecnologías:** React 19, TypeScript, Tailwind CSS v4, React Native (Expo SDK 58), Java 17, Spring Boot 3, PostgreSQL.

---

## 📑 Tabla de Contenidos
1. [Resumen Ejecutivo y Pitch del Problema](#1-resumen-ejecutivo-y-pitch-del-problema)
2. [Arquitectura General del Sistema](#2-arquitectura-general-del-sistema)
3. [Integración y Endpoints del Backend](#3-integración-y-endpoints-del-backend)
4. [Módulo de Profesionales Médicos](#4-módulo-de-profesionales-médicos)
5. [Módulo de Perfil de Usuario](#5-módulo-de-perfil-de-usuario)
6. [Módulo de Administración](#6-módulo-de-administración)
7. [Desarrollo Frontend Web (React 19 + TypeScript)](#7-desarrollo-frontend-web-react-19--typescript)
8. [Desarrollo Frontend Mobile (React Native + Expo SDK 58)](#8-desarrollo-frontend-mobile-react-native--expo-sdk-58)
9. [Manual de Despliegue y Ejecución Local](#10-manual-de-despliegue-y-ejecución-local)
---

## 1. Resumen Ejecutivo y Pitch del Problema

### El Problema
En Lima y las principales ciudades del Perú, acceder a atención médica particular de calidad es un proceso fragmentado e ineficiente. Los pacientes deben buscar información dispersa en redes sociales o realizar llamadas telefónicas sin poder comparar tarifas, cercanía, disponibilidad horaria ni opiniones verificadas. Por otro lado, los profesionales independientes carecen de herramientas centralizadas para configurar sus horarios de atención, publicar su tarifario de servicios y contactar oportunamente a sus pacientes.

### La Solución: Salud al Toque
**Salud al Toque** es una plataforma integral (Web y Mobile) que digitaliza de punta a punta la relación médico-paciente:
* **Para Pacientes:** Directorio médico con búsqueda geolocalizada por GPS (fórmula de Haversine), filtros por especialidad, precio y calificación, reserva de citas en tiempo real, gestión de favoritos, calificaciones verificadas y sensores de salud de emergencia.
* **Para Profesionales de la Salud:** Panel de gestión de citas (aceptar, rechazar, completar), visor interactivo de contacto del paciente (teléfono con llamada/WhatsApp directo, correo con mailto, dirección residencial y notas médicas), configuración de bloques de disponibilidad semanal y catálogo de servicios médicos con precios en soles (S/.).
* **Para Administradores:** Panel de control con métricas globales, buscador avanzado y personalizado de usuarios (búsqueda reactiva por nombre, correo y teléfono con filtros por rol), y alta oficial de nuevos profesionales de la salud.

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
   │  React Router • Axios     │                   │ SecureStore • Linking API │
   │    Puerto local: 5173     │                   │    iOS / Android / Web    │
   └───────────────────────────┘                   └───────────────────────────┘
```

---

## 3. Integración y Endpoints del Backend

El backend en Spring Boot implementa una arquitectura en capas (Controladores, Servicios, Repositorios, DTOs y Seguridad con JWT). Los endpoints principales son:

| Módulo | Métodos | Endpoints | Permisos / Roles | Descripción |
|---|---|---|---|---|
| **Auth** | `POST` | `/auth/signin`, `/auth/signup` | Público | Autenticación y registro de pacientes |
| **Usuarios** | `GET`, `PUT` | `/users/me` | Autenticado | Consulta y actualización de datos personales (`name`, `phone`) |
| **Seguridad** | `PUT` | `/users/me/password` | Autenticado | Cambio seguro de contraseña validando la contraseña actual |
| **Usuarios (Admin)**| `GET`, `POST` | `/users` | `ROLE_ADMIN` | Listado general y creación de usuarios con encriptación BCrypt |
| **Pacientes** | `GET`, `PUT` | `/patients/me` | `ROLE_PATIENT` | Consulta y actualización de dirección y fecha de nacimiento |
| **Profesionales** | `GET`, `PUT` | `/professionals/me` | `ROLE_PROFESSIONAL` | Consulta y actualización de ubicación del consultorio |
| **Profesionales** | `GET` | `/professionals`, `/professionals/{id}` | Público | Directorio público con filtros de especialidad, precio y zona |
| **Profesionales (Admin)**| `POST` | `/professionals` | `ROLE_ADMIN` | Alta de médico vinculando usuario y especialidad |
| **Disponibilidad**| `GET` | `/availabilities/professional/{id}` | Público | Horarios semanales de atención de un médico |
| **Disponibilidad**| `POST`, `DELETE` | `/availabilities`, `/availabilities/{id}` | `ROLE_PROFESSIONAL` | Creación y eliminación de bloques de horario |
| **Servicios Médicos**| `GET` | `/medical-services/professional/{id}` | Público | Servicios y tarifas ofrecidos por el médico |
| **Servicios Médicos**| `POST`, `DELETE` | `/medical-services`, `/medical-services/{id}` | `ROLE_PROFESSIONAL` | Creación y eliminación de servicios médicos |
| **Citas (Paciente)** | `GET`, `POST` | `/appointments/my-appointments`, `/appointments` | `ROLE_PATIENT` | Consulta de citas personales y reserva en línea |
| **Citas (Médico)** | `GET`, `PATCH` | `/appointments/my-professional-appointments`, `/{id}/accept`, `/{id}/reject`, `/{id}/complete` | `ROLE_PROFESSIONAL` | Gestión del flujo de vida de la cita médica |
| **Reseñas** | `GET`, `POST` | `/reviews/professional/{id}`, `/reviews` | Público / `ROLE_PATIENT` | Calificaciones (1-5 estrellas) y comentarios |
| **Favoritos** | `GET`, `POST`, `DELETE` | `/favorites/my-favorites`, `/favorites/professional/{id}`, `/favorites/{id}` | `ROLE_PATIENT` | Guardado de doctores preferidos |

> **Nota de Seguridad e Integridad:** Los 176 tests unitarios y de integración del backend (`./mvnw test`) se ejecutan con éxito continuo y 0 fallos mediante Testcontainers y PostgreSQL.

---

## 4. Módulo de Profesionales Médicos

### 4.1 Horarios de Atención (`ProfessionalSchedule`)
Tanto en la aplicación Web (`/professional/schedule`) como en la aplicación móvil (pestaña **Horarios**), los médicos pueden:
* **Visualizar sus bloques semanales:** Listado agrupado por días de la semana (`LUNES` a `DOMINGO`), ordenado cronológicamente.
* **Añadir nuevos horarios:** Formulario con selector de día (`DayOfWeek`), hora de inicio (`LocalTime`) y hora de fin (`LocalTime`).
* **Validación de coherencia:** Comprueba que la hora de inicio sea estrictamente anterior a la hora de fin.
* **Eliminación inmediata:** Confirmación interactiva para remover bloques de disponibilidad que ya no apliquen.

### 4.2 Catálogo de Servicios Médicos (`ProfessionalServices`)
Accesible en Web (`/professional/services`) y Mobile (pestaña **Servicios**):
* **Gestión de tarifas:** Permite registrar consultas generales, procedimientos especiales o seguimientos.
* **Datos requeridos:** Nombre del servicio (ej. "Consulta Cardiológica Integral"), descripción detallada del procedimiento y costo en soles peruanos (`price` en S/.).
* **Eliminación con confirmación:** Permite actualizar la oferta de prestaciones médicas del consultorio.

### 4.3 Visor de Datos de Contacto del Paciente (`PatientContactModal`)
Al hacer clic en cualquier paciente desde el Dashboard o la lista de Citas del médico:
* **Información Personal:** Nombre completo, correo electrónico, teléfono, dirección física y fecha de nacimiento (con cálculo automático de edad en años).
* **Acciones Directas Móviles:**
  * **Llamar al paciente:** Invoca `tel:{phone}` mediante `Linking.openURL`.
  * **Escribir por WhatsApp:** Enlace inteligente a `https://wa.me/51{phone}` con mensaje de saludo prellenado.
  * **Enviar Correo Electrónico:** Apertura del cliente de correo nativo vía `mailto:{email}`.
* **Contexto de la Consulta:** Servicio médico reservado, fecha y hora pactada, estado actual y notas clínicas registradas por el paciente.

---

## 5. Módulo de Perfil de Usuario

Disponible para todos los roles en `/profile` (Web) y la pestaña **Perfil** (Mobile):
* **Datos Comunes:** Nombre completo, teléfono y correo electrónico (con badge indicador del rol de cuenta: Paciente, Profesional o Administrador).
* **Edición Dinámica según el Rol:**
  * **Paciente:** Permite actualizar la dirección de domicilio y la fecha de nacimiento mediante `PUT /patients/me`.
  * **Profesional:** Permite actualizar la ubicación del consultorio/clínica médica mediante `PUT /professionals/me`.
* **Seguridad y Cambio de Contraseña:**
  * Formulario seguro para actualizar la contraseña (`PUT /users/me/password`).
  * Solicita la **Contraseña Actual**, la **Nueva Contraseña** (mínimo 6 caracteres) y la **Confirmación**.
  * El backend verifica criptográficamente que la clave actual coincida mediante `PasswordEncoder.matches()` antes de reencriptar la nueva contraseña con BCrypt.
* **Sincronización Inmediata:** Actualiza el estado global de React y persiste los cambios en el almacenamiento local (`localStorage` o `SecureStore`).

---

## 6. Módulo de Administración

El panel de administrador (`AdminDashboard`) ofrece herramientas para la supervisión y crecimiento del sistema:
* **Búsqueda Avanzada y Personalizada de Usuarios:**
  * Barra de búsqueda reactiva en tiempo real que filtra simultáneamente por **nombre**, **correo electrónico** o **número telefónico**.
  * Filtros rápidos mediante chips interactivos: **TODOS**, **PACIENTES**, **PROFESIONALES**, **ADMINS**.
  * Modal de inspección de usuario con ficha técnica completa (ID de sistema, rol asignado, estado de cuenta).
* **Alta Oficial de Profesionales de la Salud:**
  * Modal de creación guiada en dos fases atómicas:
    1. Creación del usuario con rol `ROLE_PROFESSIONAL`, correo, teléfono y contraseña segura encriptada con BCrypt.
    2. Creación del registro profesional asignándole una especialidad médica seleccionada del catálogo y la ubicación de su centro de atención.
  * Notificación visual de éxito y refresco automático de las estadísticas del sistema.

---

## 7. Desarrollo Frontend Web (React 19 + TypeScript)

* **Enrutamiento Completo (`src/App.tsx`):**
  * `/` -> Directorio médico público.
  * `/login` & `/register` -> Autenticación y registro.
  * `/dashboard` -> Tablero inteligente adaptativo según rol (`PatientDashboard`, `ProfessionalDashboard`, `AdminDashboard`).
  * `/professionals/:id` -> Ficha del especialista, horarios, servicios, mapa y reserva de citas.
  * `/my-appointments` -> Historial de citas del paciente.
  * `/my-favorites` -> Lista de doctores guardados.
  * `/professional/appointments` -> Agenda de citas médicas con apertura de `PatientContactModal`.
  * `/professional/schedule` -> Gestión de disponibilidad horaria semanal.
  * `/professional/services` -> Tarifario de prestaciones médicas.
  * `/profile` -> Perfil de usuario editable.
* **Componentes Reutilizables:** `Navbar`, `Layout`, `LoadingSpinner`, `ErrorMessage`, `EmptyState`, `StarRating`, `SearchBar`, `ConfirmModal`, `Pagination`, `ProtectedRoute`, `StatusBadge`, `PatientContactModal`.
* **Construcción de Producción:** Compilación limpia con Vite y TypeScript (`npm run build` en ~200ms con 0 errores).

---

## 8. Desarrollo Frontend Mobile (React Native + Expo SDK 58)

* **Navegadores Tabulados según Rol:**
  * **Paciente (`PatientTabNavigator`):** Inicio, Médicos, Mis Citas, Favoritos, Sensores y Mi Perfil.
  * **Profesional (`ProfessionalTabNavigator`):** Panel, Citas, Horarios, Servicios y Perfil.
* **Integración de Sensores y Hardware Nativo:**
  1. **GPS (`expo-location`):** Geolocalización del paciente con cálculo de distancia Haversine a cada consultorio.
  2. **Acelerómetro (`expo-sensors`):** Detección de sacudida (Shake gesture) para alertas de emergencia médica. Incluye interruptor (`Switch`) configurable por el usuario para activar/desactivar la detección y ahorrar batería, persistido en almacenamiento seguro (`SecureStore`).
  3. **Cámara y Galería (`expo-image-picker`):** Captura de fotos de recetas y exámenes médicos.
  4. **OpenStreetMap Nominatim:** Geocodificación inversa para mostrar distritos y avenidas de Lima.
* **Almacenamiento Seguro:** Tokens JWT custodiados en `expo-secure-store`.
* **TypeScript Estricto:** Verificación completa sin errores (`npx tsc --noEmit` exitoso).

---

## 9. Manual de Despliegue y Ejecución Local

### Paso 1: Iniciar el Backend
```bash
cd Backend-Salud-Al-Toque-
docker compose up -d                 # Inicia PostgreSQL en puerto 5434
./mvnw spring-boot:run               # API REST en http://localhost:8080
```
> Al iniciar, Spring Boot ejecuta automáticamente `data.sql` poblando los 9 usuarios, 4 doctores, servicios médicos, horarios semanales, citas en todos los estados y reseñas.

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

---
