package com.apirest.backend.Model.asignaciones;

import org.bson.types.ObjectId;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor

public class infoUsuarioEmbe {
    private ObjectId usuarioId;
    private String Nombre;
    private String usuario;

    @JsonProperty("id")
    public String getIdString() {
        return usuarioId != null ? usuarioId.toHexString() : null;
    }
    
}
