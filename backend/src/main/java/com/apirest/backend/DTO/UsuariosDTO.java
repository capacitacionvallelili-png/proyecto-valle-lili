package com.apirest.backend.DTO;



import com.apirest.backend.Model.ENUM.RolUsuario;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@AllArgsConstructor
@NoArgsConstructor


public class UsuariosDTO {
    private String Usuario;
    private String Contrasena;
    private RolUsuario Rol;
    private String Nombre;
    
    
}
