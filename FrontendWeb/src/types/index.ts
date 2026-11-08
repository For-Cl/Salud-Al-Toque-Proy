// ============================================================
// Salud al Toque — TypeScript Type Definitions
// ============================================================

// ---- Auth ----
export interface SignUpRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  token: string;
}

// ---- User ----
export interface UserDTO {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'ADMIN' | 'PROFESSIONAL' | 'PATIENT';
}

// ---- Patient ----
export interface PatientDTO {
  id: number;
  name: string;
  email: string;
  address: string;
  dateOfBirth: string;
  userId: number;
}

// ---- Professional ----
export interface ProfessionalDTO {
  id: number;
  name: string;
  specialty: string;
  location: string;
  price: number;
  rating: number;
  userId: number;
}

// ---- Specialty ----
export interface SpecialtyDTO {
  id: number;
  name: string;
}

// ---- Medical Service ----
export interface MedicalServiceDTO {
  id: number;
  name: string;
  description: string;
  price: number;
  professionalId: number;
}

// ---- Availability ----
export interface AvailabilityDTO {
  id: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  professionalId: number;
}

// ---- Appointment ----
export interface AppointmentDTO {
  id: number;
  date: string;
  time: string;
  status: 'PENDIENTE' | 'ACEPTADA' | 'COMPLETADA' | 'RECHAZADA';
  notes: string;
  price: number;
  patientId: number;
  professionalId: number;
  medicalServiceId: number;
}

export interface CreateAppointmentRequest {
  date: string;
  time: string;
  notes?: string;
  medicalServiceId: number;
}

// ---- Review ----
export interface ReviewDTO {
  id: number;
  rating: number;
  comment: string;
  appointmentId: number;
  patientId: number;
  professionalId: number;
}

export interface CreateReviewRequest {
  appointmentId: number;
  rating: number;
  comment?: string;
}

// ---- Favorite ----
export interface FavoriteDTO {
  id: number;
  patientId: number;
  professionalId: number;
  professionalName: string;
  specialty: string;
  location: string;
  rating: number;
}

// ---- API Error ----
export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  fieldErrors: Record<string, string> | null;
}

// ---- Auth Context ----
export interface AuthState {
  token: string | null;
  user: UserDTO | null;
  isAuthenticated: boolean;
  role: string | null;
}

// ---- Pagination ----
export interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

