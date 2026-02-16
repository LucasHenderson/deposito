package com.leogas.api.service;

import com.leogas.api.dto.LoginRequest;
import com.leogas.api.dto.LoginResponse;
import com.leogas.api.entity.Usuario;
import com.leogas.api.repository.UsuarioRepository;
import com.leogas.api.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public LoginResponse login(LoginRequest request) {
        Usuario usuario = usuarioRepository
                .findByUsuarioAndAtivoTrue(request.getUsuario())
                .orElseThrow(() -> new RuntimeException("Credenciais inválidas"));

        if (!passwordEncoder.matches(request.getSenha(), usuario.getSenha())) {
            throw new RuntimeException("Credenciais inválidas");
        }

        String token = jwtService.generateToken(usuario.getUsuario(), usuario.getRole());
        return new LoginResponse(token, usuario.getUsuario(), usuario.getRole().toLowerCase());
    }
}
