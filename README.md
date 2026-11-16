# 🩺 Salud al Toque

**Plataforma integral (Web + Mobile) para buscar, comparar y reservar citas con profesionales de la salud en Lima.**

**Curso:** CS 2031 — Desarrollo Basado en Plataformas (DBP), UTEC  
**Tecnologías:** React 19 · TypeScript · Tailwind CSS v4 · React Native (Expo SDK 58) · Java 17 · Spring Boot 3 · PostgreSQL

---

## Arquitectura del Sistema

```
                  ┌────────────────────────────────────┐
                  │        Backend Spring Boot          │
                  │  REST API · JWT · JPA · PostgreSQL  │
                  │         http://localhost:8080        │
                  └─────────────────┬──────────────────┘
                                    │
             ┌──────────────────────┴──────────────────────┐
             │                                             │
             ▼                                             ▼
  ┌────────────────────────┐                 ┌────────────────────────┐
  │     Frontend Web       │                 │    Frontend Mobile     │
  │  React 19 · Vite       │                 │  React Native · Expo   │
  │  Tailwind CSS v4       │                 │  GPS · Acelerómetro    │
  │  http://localhost:5173  │                 │  Cámara · SecureStore  │
  └────────────────────────┘                 └────────────────────────┘
```

---

## Funcionalidades por Rol

### Paciente
- Directorio médico con filtros por especialidad, precio, ubicación y calificación.
- Búsqueda geolocalizada por GPS (fórmula de Haversine).
- Reserva de citas en tiempo real con validación de disponibilidad.
- Reseñas verificadas (solo citas completadas) y gestión de favoritos.
- Sensores de emergencia: acelerómetro (shake), cámara para recetas médicas.

### Profesional de la Salud
- Panel de gestión de citas: aceptar, rechazar y completar.
- Visor de contacto del paciente (teléfono, WhatsApp, correo, dirección).
- Configuración de bloques de disponibilidad semanal.
- Catálogo de servicios médicos con precios.

### Administrador
- Métricas globales del sistema.
- Búsqueda avanzada de usuarios con filtros por rol.
- Alta oficial de nuevos profesionales de la salud.

---

## Endpoints Principales

| Módulo | Métodos | Endpoints | Roles |
|---|---|---|---|
| Auth | `POST` | `/auth/signin`, `/auth/signup` | Público |
| Usuarios | `GET`, `PUT` | `/users/me`, `/users/me/password` | Autenticado |
| Usuarios (Admin) | `GET`, `POST`, `DELETE` | `/users`, `/users/{id}` | ADMIN |
| Profesionales | `GET` | `/professionals`, `/professionals/{id}` | Público |
| Disponibilidad | `GET`, `POST`, `DELETE` | `/availabilities/...` | Público / PROFESSIONAL |
| Servicios Médicos | `GET`, `POST`, `DELETE` | `/medical-services/...` | Público / PROFESSIONAL |
| Citas (Paciente) | `GET`, `POST` | `/appointments/...` | PATIENT |
| Citas (Médico) | `GET`, `PATCH` | `/appointments/{id}/accept\|reject\|complete` | PROFESSIONAL |
| Reseñas | `GET`, `POST` | `/reviews/...` | Público / PATIENT |
| Favoritos | `GET`, `POST`, `DELETE` | `/favorites/...` | PATIENT |

---

## Ejecución Local

### 1. Backend
```bash
cd Backend-Salud-Al-Toque-
docker compose up -d                 # PostgreSQL en puerto 5434
./mvnw spring-boot:run               # API en http://localhost:8080
```
> `data.sql` carga automáticamente usuarios, profesionales, servicios, horarios, citas y reseñas de demostración.

### 2. Frontend Web
```bash
cd FrontendWeb
npm install
npm run dev                          # http://localhost:5173
```

### 3. Frontend Mobile
```bash
cd ReactNative
npm install
npx expo start
```
> **Nota:** En `src/api/client.ts` actualizar `DEFAULT_HOST` con la IP de tu dispositivo.

### Cuentas de Demostración
| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | admin@gmail.com | 123456 |
| Profesional | carlos@gmail.com | 123456 |
| Paciente | luis@gmail.com | 123456 |

---

## Integrantes

- Fabricio Alberto Olaguibel Romero
- John Dayron Blas Huete
