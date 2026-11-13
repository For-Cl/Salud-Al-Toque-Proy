package com.example.sss001.user.application;

import com.example.sss001.exceptions.ResourceNotFoundException;
import com.example.sss001.user.domain.User;
import com.example.sss001.user.domain.UserService;
import com.example.sss001.user.dto.ChangePasswordRequest;
import com.example.sss001.user.dto.UserDTO;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService service;
    private final PasswordEncoder passwordEncoder;

    public UserController(
            UserService service,
            PasswordEncoder passwordEncoder) {

        this.service = service;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserDTO> findAll() {

        return service.findAll()
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public UserDTO findById(
            @PathVariable Long id) {

        User user =
                service.findById(id);

        if (user == null) {
            throw new ResourceNotFoundException(
                    "Usuario no encontrado"
            );
        }

        return convertToDTO(user);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public UserDTO save(
            @RequestBody User user) {

        if (user.getPassword() != null && !user.getPassword().startsWith("$2a$")) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }

        User saved =
                service.save(user);

        return convertToDTO(saved);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(
            @PathVariable Long id) {

        User user =
                service.findById(id);

        if (user == null) {
            throw new ResourceNotFoundException(
                    "Usuario no encontrado"
            );
        }

        service.delete(id);
    }

    @GetMapping("/me")
    public UserDTO getOwnProfile(
            org.springframework.security.core.Authentication authentication) {

        String email = authentication.getName();
        User user = service.findAll()
                .stream()
                .filter(u -> email.equalsIgnoreCase(u.getEmail()))
                .findFirst()
                .orElse(null);

        if (user == null) {
            throw new ResourceNotFoundException(
                    "Usuario no encontrado"
            );
        }

        return convertToDTO(user);
    }

    @PutMapping("/me")
    public UserDTO updateOwnProfile(
            @RequestBody User updatedData,
            org.springframework.security.core.Authentication authentication) {

        String email = authentication.getName();
        User user = service.findAll()
                .stream()
                .filter(u -> email.equalsIgnoreCase(u.getEmail()))
                .findFirst()
                .orElse(null);

        if (user == null) {
            throw new ResourceNotFoundException(
                    "Usuario no encontrado"
            );
        }

        if (updatedData.getName() != null && !updatedData.getName().isBlank()) {
            user.setName(updatedData.getName().trim());
        }

        if (updatedData.getPhone() != null) {
            user.setPhone(updatedData.getPhone().trim());
        }

        User saved = service.save(user);
        return convertToDTO(saved);
    }

    @PutMapping("/me/password")
    public ResponseEntity<?> changeOwnPassword(
            @RequestBody ChangePasswordRequest request,
            org.springframework.security.core.Authentication authentication) {

        if (request.getNewPassword() == null || request.getNewPassword().length() < 6) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "La nueva contraseña debe tener al menos 6 caracteres"));
        }

        String email = authentication.getName();
        User user = service.findAll()
                .stream()
                .filter(u -> email.equalsIgnoreCase(u.getEmail()))
                .findFirst()
                .orElse(null);

        if (user == null) {
            throw new ResourceNotFoundException("Usuario no encontrado");
        }

        if (request.getCurrentPassword() == null || !passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "La contraseña actual es incorrecta"));
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        service.save(user);

        return ResponseEntity.ok(
                Map.of("message", "Contraseña actualizada exitosamente")
        );
    }

    private UserDTO convertToDTO(
            User user) {

        UserDTO dto =
                new UserDTO();

        dto.setId(
                user.getId()
        );

        dto.setName(
                user.getName()
        );

        dto.setEmail(
                user.getEmail()
        );

        dto.setPhone(
                user.getPhone()
        );

        dto.setRole(
                user.getRole()
        );

        return dto;
    }
}