package com.apirest.backend.Model.asignaciones;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import com.apirest.backend.Model.ENUM.EstadoAsignaciones;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document ("Asignaciones")
@Data
@AllArgsConstructor
@NoArgsConstructor


public class AsignacionesModel {
    @Id
    private ObjectId id;
    private LocalDateTime FechaAsignacion;
    private EstadoAsignaciones Estado;
    private Integer PorcentajeProgreso;
    private boolean EvaluacionHabilitada;
    private List<progresoEmbe> Progreso = new ArrayList<>();
    private ObjectId AsignadoPor;
    private infoUsuarioEmbe infoUsuario;
    private infoModulosEmbe infoModulos;

     @JsonProperty("id")
    public String getIdString() {
        return id != null ? id.toHexString() : null;
    }
 
}
