// ============================================================
// Salud al Toque Mobile — Type Definitions
// ============================================================

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

export interface UserDTO {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'ADMIN' | 'PROFESSIONAL' | 'PATIENT';
}

export interface PatientDTO {
  id: number;
  name: string;
  email: string;
  address: string;
  dateOfBirth: string;
  userId: number;
}

export interface ProfessionalDTO {
  id: number;
  name: string;
  specialty: string;
  location: string;
  price: number;
  rating: number;
  userId: number;
  distanceKm?: number;
}

export interface SpecialtyDTO {
  id: number;
  name: string;
}

export interface MedicalServiceDTO {
  id: number;
  name: string;
  description: string;
  price: number;
  professionalId: number;
}

export interface AvailabilityDTO {
  id: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  professionalId: number;
}

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
  patientName?: string;
  professionalName?: string;
  medicalServiceName?: string;
  patientEmail?: string;
  patientPhone?: string;
  patientAddress?: string;
  patientDateOfBirth?: string;
}

export interface CreateAppointmentRequest {
  date: string;
  time: string;
  notes?: string;
  medicalServiceId: number;
}

export interface ReviewDTO {
  id: number;
  rating: number;
  comment: string;
  appointmentId: number;
  patientId: number;
  professionalId: number;
  patientName?: string;
}

export interface CreateReviewRequest {
  appointmentId: number;
  rating: number;
  comment?: string;
}

export interface FavoriteDTO {
  id: number;
  patientId: number;
  professionalId: number;
  professionalName: string;
  specialty: string;
  location: string;
  rating: number;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

