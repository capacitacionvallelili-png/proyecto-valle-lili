package com.apirest.backend.security.ServiceSecurity;

import com.apirest.backend.DTO.loginDTO;



public interface IAuthService {

     // Recibe las credenciales y devuelve el token JWT
    public String login(loginDTO dto);
} 

