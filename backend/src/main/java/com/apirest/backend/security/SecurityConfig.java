package com.apirest.backend.security;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

/* =====================================================
   SecurityConfig — Configuración central de seguridad
   
   ¿Qué hace?
   Define las reglas de seguridad de toda la aplicación:
   - Qué endpoints son públicos o protegidos
   - Cómo se manejan las sesiones (stateless con JWT)
   - Dónde se ejecuta el JwtFilter
   - Configuración de CORS para el frontend
   - Encriptación de contraseñas con BCrypt
   ===================================================== */
@Configuration // Le dice a Spring que esta clase tiene configuraciones
@EnableWebSecurity // Activa Spring Security en la aplicación
public class SecurityConfig {
    // Inyecta el filtro JWT para agregarlo a la cadena de seguridad
    @Autowired
    private JwtFilter jwtFilter;

    /*
     * ===== CADENA DE FILTROS DE SEGURIDAD =====
     * Define todas las reglas de seguridad HTTP
     * 
     * @Bean → Spring lo registra y lo gestiona automáticamente
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                // ===== CSRF =====
                // Desactiva CSRF porque usamos JWT — no necesitamos protección CSRF
                // CSRF es para aplicaciones con sesiones, no para APIs REST con tokens
                .csrf(csrf -> csrf.disable())

                // ===== CORS =====
                // Permite que el frontend (HTML/JS) pueda hacer peticiones al backend
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // ===== REGLAS DE ACCESO =====
                .authorizeHttpRequests(auth -> auth

                        // Endpoints PÚBLICOS — no necesitan token
                        // El login debe ser público para que cualquiera pueda ingresar
                        .requestMatchers("/Vallelili/auth/login").permitAll()
                        .requestMatchers("/Vallelili/auth/encriptar/**").permitAll()

                        // permite eliminar un usuario
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Endpoints solo para ADMINISTRADORES
                        .requestMatchers("/Vallelili/usuario/**").hasRole("Administrador")
                        .requestMatchers("/Vallelili/asignaciones/**").hasAnyRole("Administrador", "Estudiante")
                        .requestMatchers("/Vallelili/modulos/**").hasAnyRole("Administrador", "Estudiante")
                        .requestMatchers("/Vallelili/resultados/**").hasAnyRole("Administrador", "Estudiante")

                        // Cualquier otra petición requiere estar autenticado
                        .anyRequest().authenticated())

                // ===== SESIONES =====
                // STATELESS → no guarda sesiones en el servidor
                // Cada petición debe traer su propio token JWT
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // ===== JWT FILTER =====
                // Agrega el JwtFilter ANTES del filtro de autenticación de Spring
                // Así el token se valida antes de cualquier verificación de seguridad
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /*
     * ===== CONFIGURACIÓN DE CORS =====
     * CORS permite que el frontend en un dominio diferente
     * pueda hacer peticiones al backend
     * 
     * Ejemplo: frontend en localhost:5500 → backend en localhost:8080
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // Orígenes permitidos — agrega aquí la URL de tu frontend
        config.setAllowedOrigins(List.of(
                "http://localhost:5500", // Live Server de VSC
                "http://127.0.0.1:5500", // Alternativa de Live Server
                "http://localhost:3000" ,// Por si usas otro servidor
                "http://127.0.0.1:5501",
                "https://frontend-production-8412.up.railway.app"
        ));

        // Métodos HTTP permitidos
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));

        // Headers permitidos — Authorization es necesario para enviar el token
        config.setAllowedHeaders(List.of("*"));

        // Permite enviar cookies y headers de autorización
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Aplica esta configuración a todos los endpoints
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    /*
     * ===== ENCRIPTADOR DE CONTRASEÑAS =====
     * BCrypt encripta las contraseñas antes de guardarlas en MongoDB
     * y las compara al hacer login sin necesidad de desencriptarlas
     * 
     * Ejemplo:
     * "1234" → "$2a$10$xn3LI/AjqicFYZFruSwve..." (hash BCrypt)
     * 
     * @Bean → Spring lo inyecta donde lo necesites con @Autowired
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public UserDetailsService userDetailsService() {
        return username -> {
            throw new UsernameNotFoundException("Use JWT");
        };
    }
}
