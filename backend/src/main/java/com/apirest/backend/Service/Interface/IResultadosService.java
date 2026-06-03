package com.apirest.backend.Service.Interface;

import java.util.List;

import com.apirest.backend.DTO.ResultadosEvaluDTO;
import com.apirest.backend.Model.Evaluacion.ResultadosEvaluacionModel;

public interface IResultadosService {
    public ResultadosEvaluacionModel guardarResultado( ResultadosEvaluDTO dto);
    public List<ResultadosEvaluacionModel> ListarTodosResultados ();
    public List<ResultadosEvaluacionModel> ListarResultadosPorUsuario(String usuario);
    public List<ResultadosEvaluacionModel> obtenerResultadosPorAsignacion(String asignacionId);
    
} 