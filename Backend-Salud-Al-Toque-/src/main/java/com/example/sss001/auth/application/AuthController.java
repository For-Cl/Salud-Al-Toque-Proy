package com.example.sss001.auth.application;

import com.example.sss001.auth.domain.AuthService;
import com.example.sss001.auth.dto.SignInRequest;
import com.example.sss001.auth.dto.SignUpRequest;
import com.example.sss001.auth.dto.TokenResponse;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/signin")
    public TokenResponse signIn(
            @Valid @RequestBody SignInRequest request) {

        return authService.signIn(request);
    }

    @PostMapping("/signup")
    public TokenResponse signUp(
            @Valid @RequestBody SignUpRequest request) {

        return authService.signUp(request);
    }
}