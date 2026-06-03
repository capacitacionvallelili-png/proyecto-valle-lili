package com.apirest.backend.Model.Evaluacion;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor

public class RespuestasEmbe {
    private Integer numPregunta;
    private boolean esCorrecta;
}
