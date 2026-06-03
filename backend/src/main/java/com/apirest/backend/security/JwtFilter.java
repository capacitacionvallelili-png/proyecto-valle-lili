package com.apirest.backend.security;

import java.util.List;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;




@Component
public class JwtFilter extends OncePerRequestFilter {
      // Necesita JwtUtil para poder leer y validar el token
    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        // ===== PASO 1 — LEER EL HEADER =====
        // El frontend manda el token en el header "Authorization"
        // con el formato: "Bearer eyJhbGci..."
        String authHeader = request.getHeader("Authorization");

        String token = null;
        String usuario = null;

        // ===== PASO 2 — EXTRAER EL TOKEN =====
        // Verifica que el header exista y empiece con "Bearer "
        // Si no hay token o no tiene el formato correcto, simplemente continúa
        // y Spring Security lo rechazará si el endpoint está protegido
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            // Quita el "Bearer " del inicio para quedarse solo con el token
            token = authHeader.substring(7);
            // Extrae el nombre de usuario del token
            usuario = jwtUtil.extraerUsuario(token);
        }

        // ===== PASO 3 — VALIDAR Y AUTENTICAR =====
        // Solo valida si:
        // 1. Se extrajo un usuario del token
        // 2. No hay ya una autenticación activa en el contexto de seguridad
        if (usuario != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            // Valida que el token sea legítimo y no haya vencido
            if (jwtUtil.validarToken(token, usuario)) {

                // Extrae el rol del token para saber sus permisos
                String rol = jwtUtil.extraerRol(token);

                // Crea el objeto de autenticación con el usuario y su rol
                // Spring Security usa esto para saber quién está autenticado
                UsernamePasswordAuthenticationToken authToken =
                    new UsernamePasswordAuthenticationToken(
                        usuario,
                        null, // No necesita contraseña aquí — ya fue validada al hacer login
                        List.of(new SimpleGrantedAuthority("ROLE_" + rol)) // Ej: ROLE_Administrador
                    );

                // Registra la autenticación en el contexto de seguridad
                // A partir de aquí Spring Security sabe que este usuario está autenticado
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        // ===== PASO 4 — CONTINUAR =====
        // Pasa la petición al siguiente filtro o al Controller
        // Si el token era inválido, Spring Security rechazará la petición
        // con 401 antes de que llegue al Controller
        filterChain.doFilter(request, response);
    }
}




