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

### Rutas
| Ruta | Vista | Rol |
|---|---|---|
| `/` | Directorio de profesionales | Público |
| `/login`, `/register` | Autenticación | Público |
| `/dashboard` | Panel adaptativo por rol | Autenticado |
| `/professionals/:id` | Detalle, servicios, horarios y reserva | Público |
| `/my-appointments` | Citas del paciente | Paciente |
| `/my-favorites` | Profesionales favoritos | Paciente |
| `/professional/appointments` | Gestión de citas | Profesional |
| `/professional/schedule` | Disponibilidad horaria | Profesional |
| `/professional/services` | Catálogo de servicios | Profesional |
| `/profile` | Perfil editable | Autenticado |

### Componentes Reutilizables
`Navbar` · `Layout` · `LoadingSpinner` · `ErrorMessage` · `EmptyState` · `StarRating` · `SearchBar` · `ConfirmModal` · `Pagination` · `ProtectedRoute` · `StatusBadge` · `PatientContactModal`

### Custom Hooks
`useAuth` · `useFetch` · `useForm` · `usePagination` · `useDebounce`

---

## Instalación

**Prerrequisitos:** Node.js v18+, backend corriendo en `http://localhost:8080`.

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # Compilación de producción
```
