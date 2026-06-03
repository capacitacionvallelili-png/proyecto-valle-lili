package com.apirest.backend.Model.asignaciones;

import java.time.LocalDateTime;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor

public class progresoEmbe {
    private Integer seccionId;
    private boolean completada;
    private LocalDateTime fechaCompletada;
    

    
}
