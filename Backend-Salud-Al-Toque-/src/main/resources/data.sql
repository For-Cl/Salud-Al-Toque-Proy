INSERT INTO users
(name, email, password, phone, role)
VALUES
    (
        'Administrador',
        'admin@gmail.com',
        '$2a$10$kKDtQY9PGvFsjFwzv.QbxeJRon8s9mdTFuOC1mNfau.RyWqyMToMK',
        '999000000',
        'ADMIN'
    );

INSERT INTO specialties (name)
VALUES ('Cardiologia');

INSERT INTO specialties (name)
VALUES ('Dermatologia');

INSERT INTO specialties (name)
VALUES ('Pediatria');

INSERT INTO specialties (name)
VALUES ('Odontologia');

INSERT INTO users
(name, email, password, phone, role)
VALUES
    ('Carlos Perez', 'carlos@gmail.com', '$2a$10$kKDtQY9PGvFsjFwzv.QbxeJRon8s9mdTFuOC1mNfau.RyWqyMToMK', '999111222', 'PROFESSIONAL');

INSERT INTO users
(name, email, password, phone, role)
VALUES
    ('Maria Lopez', 'maria@gmail.com', '$2a$10$kKDtQY9PGvFsjFwzv.QbxeJRon8s9mdTFuOC1mNfau.RyWqyMToMK', '999222333', 'PROFESSIONAL');

INSERT INTO users
(name, email, password, phone, role)
VALUES
    ('Luis Ramirez', 'luis@gmail.com', '$2a$10$kKDtQY9PGvFsjFwzv.QbxeJRon8s9mdTFuOC1mNfau.RyWqyMToMK', '999444555', 'PATIENT');

INSERT INTO professionals
(location, rating, user_id, specialty_id)
VALUES
    ('Lima',4.5, 2, 1);

INSERT INTO professionals
(location, rating, user_id, specialty_id)
VALUES
    ('San Isidro', 4.1, 3, 2);


INSERT INTO medical_services
(name, description, price, professional_id)
VALUES (
           'Consulta cardiológica',
           'Consulta médica especializada en cardiología',
           80.0,
           1
       );

INSERT INTO medical_services
(name, description, price, professional_id)
VALUES (
           'Control cardiológico',
           'Control y seguimiento del paciente',
           60.0,
           1
       );

INSERT INTO medical_services
(name, description, price, professional_id)
VALUES (
           'Consulta dermatológica',
           'Consulta especializada en dermatología',
           100.0,
           2
       );

INSERT INTO patients
(address, date_of_birth, user_id)
VALUES
    ('Surco', '2001-05-20', 4);

INSERT INTO appointments
(date, time, status, notes, price, patient_id, professional_id, medical_service_id)
VALUES (
           '2026-10-05',
           '10:30',
           'PENDIENTE',
           'Consulta general',
           80.0,
           1,
           1,
           1
       );

INSERT INTO availabilities
(day_of_week, start_time, end_time, professional_id)
VALUES
    ('LUNES', '09:00', '13:00', 1);

INSERT INTO availabilities
(day_of_week, start_time, end_time, professional_id)
VALUES
    ('LUNES', '15:00', '18:00', 1);

INSERT INTO availabilities
(day_of_week, start_time, end_time, professional_id)
VALUES
    ('MARTES', '09:00', '13:00', 1);

INSERT INTO availabilities
(day_of_week, start_time, end_time, professional_id)
VALUES
    ('MIERCOLES', '10:00', '14:00', 2);

-- ============================================================================
-- DATOS ADICIONALES PARA DEMO Y PRESENTACIÓN
-- ============================================================================

-- Nuevos Profesionales (Usuarios ID 5 y 6)
INSERT INTO users (name, email, password, phone, role)
VALUES ('Dr. Jorge Gomez', 'jorge@gmail.com', '$2a$10$kKDtQY9PGvFsjFwzv.QbxeJRon8s9mdTFuOC1mNfau.RyWqyMToMK', '999333444', 'PROFESSIONAL');

INSERT INTO users (name, email, password, phone, role)
VALUES ('Dra. Ana Torres', 'ana@gmail.com', '$2a$10$kKDtQY9PGvFsjFwzv.QbxeJRon8s9mdTFuOC1mNfau.RyWqyMToMK', '999555666', 'PROFESSIONAL');

-- Nuevos Pacientes (Usuarios ID 7, 8 y 9)
INSERT INTO users (name, email, password, phone, role)
VALUES ('Elena Chavez', 'elena@gmail.com', '$2a$10$kKDtQY9PGvFsjFwzv.QbxeJRon8s9mdTFuOC1mNfau.RyWqyMToMK', '999777888', 'PATIENT');

INSERT INTO users (name, email, password, phone, role)
VALUES ('Mateo Morales', 'mateo@gmail.com', '$2a$10$kKDtQY9PGvFsjFwzv.QbxeJRon8s9mdTFuOC1mNfau.RyWqyMToMK', '999888999', 'PATIENT');

INSERT INTO users (name, email, password, phone, role)
VALUES ('Sofia Vargas', 'sofia@gmail.com', '$2a$10$kKDtQY9PGvFsjFwzv.QbxeJRon8s9mdTFuOC1mNfau.RyWqyMToMK', '999000111', 'PATIENT');

-- Perfiles de Profesionales (IDs 3 y 4)
INSERT INTO professionals (location, rating, user_id, specialty_id)
VALUES ('Miraflores', 4.8, 5, 3); -- Pediatria

INSERT INTO professionals (location, rating, user_id, specialty_id)
VALUES ('San Borja', 4.9, 6, 4); -- Odontologia

-- Perfiles de Pacientes (IDs 2, 3 y 4)
INSERT INTO patients (address, date_of_birth, user_id)
VALUES ('Miraflores', '1995-08-14', 7);

INSERT INTO patients (address, date_of_birth, user_id)
VALUES ('San Isidro', '1998-11-03', 8);

INSERT INTO patients (address, date_of_birth, user_id)
VALUES ('Barranco', '2000-02-28', 9);

-- Servicios Médicos Adicionales (IDs 4, 5, 6, 7, 8)
INSERT INTO medical_services (name, description, price, professional_id)
VALUES ('Tratamiento para acné', 'Limpieza profunda y tratamiento tópico dermatológico', 120.0, 2);

INSERT INTO medical_services (name, description, price, professional_id)
VALUES ('Control de niño sano', 'Evaluación integral pediátrica, peso, talla y vacunas', 90.0, 3);

INSERT INTO medical_services (name, description, price, professional_id)
VALUES ('Consulta pediátrica de urgencia', 'Diagnóstico y manejo de cuadros agudos infantiles', 75.0, 3);

INSERT INTO medical_services (name, description, price, professional_id)
VALUES ('Limpieza dental y profilaxis', 'Remoción de placa bacteriana, pulido y aplicación de flúor', 85.0, 4);

INSERT INTO medical_services (name, description, price, professional_id)
VALUES ('Curación con resina', 'Restauración dental estética con resina de alta durabilidad', 110.0, 4);

-- Horarios de Disponibilidad Adicionales
INSERT INTO availabilities (day_of_week, start_time, end_time, professional_id)
VALUES ('JUEVES', '14:00', '18:00', 2);

INSERT INTO availabilities (day_of_week, start_time, end_time, professional_id)
VALUES ('VIERNES', '09:00', '13:00', 2);

INSERT INTO availabilities (day_of_week, start_time, end_time, professional_id)
VALUES ('MARTES', '10:00', '14:00', 3);

INSERT INTO availabilities (day_of_week, start_time, end_time, professional_id)
VALUES ('JUEVES', '10:00', '15:00', 3);

INSERT INTO availabilities (day_of_week, start_time, end_time, professional_id)
VALUES ('SABADO', '09:00', '13:00', 3);

INSERT INTO availabilities (day_of_week, start_time, end_time, professional_id)
VALUES ('LUNES', '14:00', '19:00', 4);

INSERT INTO availabilities (day_of_week, start_time, end_time, professional_id)
VALUES ('MIERCOLES', '15:00', '20:00', 4);

INSERT INTO availabilities (day_of_week, start_time, end_time, professional_id)
VALUES ('VIERNES', '14:00', '19:00', 4);

-- Citas Adicionales (IDs 2 al 10)
INSERT INTO appointments (date, time, status, notes, price, patient_id, professional_id, medical_service_id)
VALUES ('2026-10-12', '11:00', 'COMPLETADA', 'Chequeo por palpitaciones y fatiga', 80.0, 2, 1, 1);

INSERT INTO appointments (date, time, status, notes, price, patient_id, professional_id, medical_service_id)
VALUES ('2026-10-19', '12:00', 'ACEPTADA', 'Control rutinario de presión arterial', 60.0, 3, 1, 2);

INSERT INTO appointments (date, time, status, notes, price, patient_id, professional_id, medical_service_id)
VALUES ('2026-10-07', '11:30', 'COMPLETADA', 'Revisión preventiva de lunares en espalda', 100.0, 1, 2, 3);

INSERT INTO appointments (date, time, status, notes, price, patient_id, professional_id, medical_service_id)
VALUES ('2026-10-14', '12:00', 'PENDIENTE', 'Consulta por dermatitis de contacto en manos', 100.0, 4, 2, 3);

INSERT INTO appointments (date, time, status, notes, price, patient_id, professional_id, medical_service_id)
VALUES ('2026-10-08', '10:30', 'COMPLETADA', 'Control de niño sano 3 años de edad', 90.0, 1, 3, 5);

INSERT INTO appointments (date, time, status, notes, price, patient_id, professional_id, medical_service_id)
VALUES ('2026-10-15', '11:00', 'ACEPTADA', 'Vacunación y evaluación de crecimiento', 75.0, 2, 3, 6);

INSERT INTO appointments (date, time, status, notes, price, patient_id, professional_id, medical_service_id)
VALUES ('2026-10-09', '16:00', 'COMPLETADA', 'Limpieza dental semestral preventiva', 85.0, 1, 4, 7);

INSERT INTO appointments (date, time, status, notes, price, patient_id, professional_id, medical_service_id)
VALUES ('2026-10-16', '17:30', 'PENDIENTE', 'Molestia en molar inferior derecho al masticar', 110.0, 3, 4, 8);

INSERT INTO appointments (date, time, status, notes, price, patient_id, professional_id, medical_service_id)
VALUES ('2026-10-06', '16:00', 'RECHAZADA', 'Consulta solicitada fuera del horario habitual', 80.0, 4, 1, 1);

-- Reseñas de Pacientes (Reviews para profesionales 2, 3 y 4)
INSERT INTO reviews (rating, comment, appointment_id, patient_id, professional_id)
VALUES (5, 'La Dra. María atendió con mucha paciencia y el tratamiento funcionó muy bien.', 4, 1, 2);

INSERT INTO reviews (rating, comment, appointment_id, patient_id, professional_id)
VALUES (5, 'El Dr. Jorge es muy cariñoso con los niños, altamente recomendado para chequeos infantiles.', 6, 1, 3);

INSERT INTO reviews (rating, comment, appointment_id, patient_id, professional_id)
VALUES (5, 'La Dra. Ana es una excelente odontóloga, no sentí ninguna molestia durante la limpieza.', 8, 1, 4);

-- Favoritos (Favorites para pacientes 2, 3 y 4)
INSERT INTO favorites (patient_id, professional_id)
VALUES (2, 1);

INSERT INTO favorites (patient_id, professional_id)
VALUES (2, 3);

INSERT INTO favorites (patient_id, professional_id)
VALUES (3, 2);

INSERT INTO favorites (patient_id, professional_id)
VALUES (4, 4);
