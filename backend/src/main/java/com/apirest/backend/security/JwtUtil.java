package com.apirest.backend.security;

import java.util.HashMap;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

import java.security.Key;
import java.util.Date;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class JwtUtil {
    // Es la clase que sabe todo sobre los tokens JWT — crearlos, leerlos y
    // verificarlos. Es como la caja de herramientas del JWT.
    // Lee el valor desde application.properties
    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.expiration}")
    private long expirationTime;

    // Genera la clave de firma a partir del string secreto
    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(secretKey.getBytes());
    }

    // ===== GENERAR TOKEN =====
    // Crea un token JWT con el usuario y el rol adentro
    public String generarToken(String usuario, String rol) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("rol", rol); // Guarda el rol dentro del token

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(usuario) // El usuario va como "subject"
                .setIssuedAt(new Date()) // Fecha de creación
                .setExpiration(new Date(System.currentTimeMillis() + expirationTime)) // Vence en 24h
                .signWith(getSigningKey(), SignatureAlgorithm.HS256) // Firma con clave secreta
                .compact();
    }

    // ===== EXTRAER USUARIO =====
    // Saca el nombre de usuario del token
    public String extraerUsuario(String token) {
        return extraerClaims(token).getSubject();
    }

    // ===== EXTRAER ROL =====
    // Saca el rol del token
    public String extraerRol(String token) {
        return (String) extraerClaims(token).get("rol");
    }

    // ===== VALIDAR TOKEN =====
    // Verifica que el token sea válido y no haya expirado
    public boolean validarToken(String token, String usuario) {
        final String usuarioToken = extraerUsuario(token);
        return usuarioToken.equals(usuario) && !tokenExpirado(token);
    }

    // ===== TOKEN EXPIRADO =====
    // Verifica si el token ya venció
    private boolean tokenExpirado(String token) {
        return extraerClaims(token).getExpiration().before(new Date());
    }

    // ===== EXTRAER CLAIMS =====
    // Lee toda la información guardada dentro del token
    private Claims extraerClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
