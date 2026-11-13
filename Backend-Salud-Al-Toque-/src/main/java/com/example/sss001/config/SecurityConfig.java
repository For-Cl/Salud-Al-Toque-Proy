package com.example.sss001.config;

import com.example.sss001.auth.components.JwtAuthorizationFilter;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.config.Customizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.List;
@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthorizationFilter jwtAuthorizationFilter;

    public SecurityConfig(
            JwtAuthorizationFilter jwtAuthorizationFilter) {

        this.jwtAuthorizationFilter =
                jwtAuthorizationFilter;
    }

    // PASSWORD ENCODER
    @Bean
    public PasswordEncoder passwordEncoder() {

        return new BCryptPasswordEncoder();
    }
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of(
                "http://localhost:*",
                "https://salud-al-toque-proy*.vercel.app"
        ));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept", "X-Requested-With", "Origin"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    // AUTHENTICATION MANAGER
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration)
            throws Exception {

        return configuration.getAuthenticationManager();
    }

    // SECURITY FILTER CHAIN
    @Bean
    public SecurityFilterChain filterChain(
            org.springframework.security.config.annotation.web.builders.HttpSecurity http)
            throws Exception {

        http
                // CORS
                .cors(Customizer.withDefaults())

                // CSRF
                .csrf(csrf ->
                        csrf.disable()
                )

                // SESIONES
                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                // AUTORIZACIÓN
                .authorizeHttpRequests(auth -> auth

                        // PÚBLICO
                        .requestMatchers(
                                "/auth/**"
                        ).permitAll()

                        .requestMatchers(
                                "/professionals/**"
                        ).permitAll()

                        .requestMatchers(
                                "/specialties/**"
                        ).permitAll()

                        .requestMatchers(
                                HttpMethod.GET, "/medical-services/**"
                        ).permitAll()

                        .requestMatchers(HttpMethod.GET, "/availabilities/**").permitAll()

                        .requestMatchers(HttpMethod.GET, "/reviews/**").permitAll()

                        // ===============================
                        // TODO LO DEMÁS
                        // ===============================

                        .anyRequest().authenticated()
                )

                // 401 / 403
                .exceptionHandling(exception -> exception

                        .authenticationEntryPoint(
                                (request, response, authException) -> {

                                    response.sendError(
                                            HttpServletResponse.SC_UNAUTHORIZED,
                                            "No autenticado"
                                    );
                                }
                        )

                        .accessDeniedHandler(
                                (request, response, accessDeniedException) -> {

                                    response.sendError(
                                            HttpServletResponse.SC_FORBIDDEN,
                                            "No tienes permisos para realizar esta operación"
                                    );
                                }
                        )
                )

                // JWT FILTER
                .addFilterBefore(
                        jwtAuthorizationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }
}
