package com.apirest.backend.Model.Evaluacion;

import java.time.LocalDateTime;
import java.util.List;

import org.bson.types.ObjectId;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document("ResultadosEvaluacion")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResultadosEvaluacionModel {

    @Id
    private ObjectId id;
    private Integer numIntento;
    private LocalDateTime FechaRealizacion;
    private Integer Puntaje;
    private ObjectId asignacionId;
    private List<RespuestasEmbe> Respuestas;
    private infoEUsuarioEmbe infoUsuario;
    private infoEModuloEmbe infoModulos;
   



    @JsonProperty("id")
    public String getIdString() {
        return id != null ? id.toHexString() : null;
    }

}
