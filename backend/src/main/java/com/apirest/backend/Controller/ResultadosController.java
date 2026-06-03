package com.apirest.backend.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

import com.apirest.backend.DTO.ResultadosEvaluDTO;
import com.apirest.backend.Exception.RecursoNoEncontradoException;
import com.apirest.backend.Model.Evaluacion.ResultadosEvaluacionModel;
import com.apirest.backend.Service.Interface.IResultadosService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@Controller
@RequestMapping("/Vallelili/resultados")

public class ResultadosController {
    @Autowired
    IResultadosService resultadosService;

    @PostMapping("/guardar")
    public ResponseEntity<Object> guardarResultado(@RequestBody ResultadosEvaluDTO dto) {
        try {
            return new ResponseEntity<Object>(
                    resultadosService.guardarResultado(dto),
                    HttpStatus.CREATED);

        } catch (RecursoNoEncontradoException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al guardar el resultado");
        }
    }

    @GetMapping("/listarTodos")
    public ResponseEntity<List<ResultadosEvaluacionModel>> ListarTodosResultados() {
        return new ResponseEntity<>(resultadosService.ListarTodosResultados(), HttpStatus.OK);
    }

    @GetMapping("/listarPorUsuario/{usuario}")
    public ResponseEntity<Object> listarResultadosPorUsuario(
            @PathVariable String usuario) {
        try {
            return ResponseEntity.ok(
                    resultadosService.ListarResultadosPorUsuario(usuario));

        } catch (RecursoNoEncontradoException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al listar los resultados");
        }
    }

    // este es para que el usuario pueda ver los resutlados anteriores de su examen
    @GetMapping("/misResultados/{asignacionId}")
    public ResponseEntity<Object> obtenerResultadosPorAsignacion(
            @PathVariable String asignacionId) {
        try {
            return ResponseEntity.ok(
                    resultadosService.obtenerResultadosPorAsignacion(asignacionId));

        } catch (RecursoNoEncontradoException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al obtener los resultados");
        }
    }

}
