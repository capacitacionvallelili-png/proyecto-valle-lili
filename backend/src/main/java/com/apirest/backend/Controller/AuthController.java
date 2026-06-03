package com.apirest.backend.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.apirest.backend.DTO.loginDTO;
import com.apirest.backend.Exception.RecursoNoEncontradoException;
import com.apirest.backend.security.ServiceSecurity.IAuthService;

/* =====================================================
   AuthController — Endpoint de inicio de sesión
   
   ¿Qué hace?
   Recibe las credenciales del frontend, llama al 
   AuthService y devuelve el token JWT si son correctas.
   ===================================================== */

@RestController
@RequestMapping("/Vallelili/auth")

public class AuthController {
    @Autowired
    private IAuthService authService;

    @Autowired
    PasswordEncoder passwordEncoder;

    // ===== LOGIN =====
    // Endpoint público — no necesita token para acceder
    // Recibe usuario y contraseña, devuelve el token JWT
    @PostMapping("/login")
    public ResponseEntity<Object> login(@RequestBody loginDTO dto) {
        try {
            String token = authService.login(dto);
            return ResponseEntity.ok(token);

        } catch (RecursoNoEncontradoException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(e.getMessage());

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al iniciar sesión");
        }
    }

    // TEMPORAL — eliminar después de encriptar los usuarios existentes
    @GetMapping("/encriptar/{contrasena}")
    public String encriptar(@PathVariable String contrasena) {
        return passwordEncoder.encode(contrasena);
    }
}
