package com.apirest.backend.security.ServiceSecurity;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.apirest.backend.DTO.loginDTO;
import com.apirest.backend.Exception.RecursoNoEncontradoException;
import com.apirest.backend.Model.UsuariosModel;
import com.apirest.backend.Repository.IUsuarioRepository;
import com.apirest.backend.security.JwtUtil;




@Service
public class AuthServiceImp implements IAuthService {
    // Para buscar el usuario en MongoDB
    @Autowired
    private IUsuarioRepository usuarioRepository;

    // Para generar el token JWT
    @Autowired
    private JwtUtil jwtUtil;

    // Para comparar contraseñas encriptadas con BCrypt
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public String login(loginDTO dto) {

        // 1. Buscar el usuario en MongoDB por su username
        // findByUsuario es una consulta que debes agregar al Repository
        UsuariosModel usuario = usuarioRepository
            .findByUsuario(dto.getUsuario())
            .orElseThrow(() -> new RecursoNoEncontradoException(
                "Usuario no encontrado"));

        // 2. Verificar que el usuario esté activo
        // Si fue desactivado por el admin no puede ingresar
        if (!usuario.isActivo()) {
            throw new RuntimeException(
                "Usuario desactivado, contacta al administrador");
        }

        // 3. Verificar la contraseña
        // BCrypt compara la contraseña que llegó con el hash guardado en MongoDB
        // Nunca desencripta — compara directamente con el hash
        if (!passwordEncoder.matches(dto.getContrasena(), usuario.getContrasena())) {
            throw new RuntimeException("Contraseña incorrecta");
        }

        // 4. Generar y devolver el token JWT
        // El token lleva el username y el rol adentro
        return jwtUtil.generarToken(
            usuario.getUsuario(),
            usuario.getRol().toString()
        );
    }


    
}
