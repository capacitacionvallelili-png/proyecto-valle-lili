package com.apirest.backend.Model;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;



@Document("Modulos")
@Data
@NoArgsConstructor
@AllArgsConstructor


public class ModulosModel {
    @Id
    private ObjectId id;
    private String Nombre;
    private int Totalsecciones;

    @JsonProperty("id")
    public String getIdString() {
        return id != null ? id.toHexString() : null;
    }

}
