package com.apirest.backend.Model.asignaciones;

import org.bson.types.ObjectId;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor

public class infoModulosEmbe {
    private ObjectId moduloId;
    private String Nombre;

    @JsonProperty("id")
    public String getIdString() {
        return moduloId != null ? moduloId.toHexString() : null;
    }

}
