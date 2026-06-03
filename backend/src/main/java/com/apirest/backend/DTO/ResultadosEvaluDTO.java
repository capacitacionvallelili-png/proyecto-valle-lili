package com.apirest.backend.DTO;

import java.util.List;

import com.apirest.backend.Model.Evaluacion.RespuestasEmbe;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor

public class ResultadosEvaluDTO {
    private String asignacionId;
    private List<RespuestasEmbe> Respuestas;    
}
