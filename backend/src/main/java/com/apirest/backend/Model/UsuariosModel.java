package com.apirest.backend.Model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import com.apirest.backend.Model.ENUM.RolUsuario;
import com.fasterxml.jackson.annotation.JsonProperty;


import java.time.LocalDateTime;

import org.bson.types.ObjectId;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// EL MODEL ME INDICA LA ESTRUCUTURA DE LO QUE TIENE MI BASE DE DATOS DE MONGO DB

@Document("Usuarios") // me indica que es mi coleccion
@Data // es para todos los get and set
@AllArgsConstructor // Genera un constructor con todos los campos como parámetros:
@NoArgsConstructor

public class UsuariosModel {
    @Id
    private ObjectId id;

  
    private String Usuario;
    
    @Field("Contrasena") 
    private String Contrasena;
    private RolUsuario Rol;
    private String Nombre;
    private LocalDateTime fecha_creacion;
    private boolean Activo;
    private ObjectId creadoPor; 

    @JsonProperty("id")
    public String getIdString() {
        return id != null ? id.toHexString() : null;
    }

}
