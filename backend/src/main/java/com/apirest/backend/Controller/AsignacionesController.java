package com.apirest.backend.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

import com.apirest.backend.DTO.AsignacionesDTO;
import com.apirest.backend.DTO.CompletarSeccionDTO;
import com.apirest.backend.Exception.EmptyStringException;
import com.apirest.backend.Exception.RecursoNoEncontradoException;

import com.apirest.backend.Model.asignaciones.AsignacionesModel;
import com.apirest.backend.Service.Interface.IAsignacionesService;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@Controller

@RequestMapping("/Vallelili/asignaciones")
public class AsignacionesController {

    @Autowired
    IAsignacionesService asignacionesService;

    @PostMapping("/agregar")
    public ResponseEntity<Object> crearAsignaciones(@RequestBody AsignacionesDTO asignacionesDTO) {
        try {
            return new ResponseEntity<Object>(asignacionesService.crearAsignaciones(asignacionesDTO),
                    HttpStatus.CREATED);

        } catch (RecursoNoEncontradoException e) { // este me muestra los errores en string, el otro ne la consola
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());

        } catch (EmptyStringException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("error al asignar  el modulo");
        }

    }

    // completar seccion
    @PatchMapping("/completarSeccion")
    public ResponseEntity<Object> completarSeccion(@RequestBody CompletarSeccionDTO dto) {
        try {
            return ResponseEntity.ok(asignacionesService.completarSeccion(dto));

        } catch (RecursoNoEncontradoException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al completar la sección");
        }

    }

    // listar todas las asignaciones
    @GetMapping("/listarTodos")
    public ResponseEntity<List<AsignacionesModel>> ListarAsignaciones() {
        return new ResponseEntity<>(asignacionesService.ListarAsignaciones(), HttpStatus.OK);
    }

    // listar asignaiones de un solo usuario
    @GetMapping("/listarPorUsuario/{nombreUsuario}")
    public ResponseEntity<Object> buscarAsignacionesPorUsuario(
            @PathVariable String nombreUsuario) {
        try {
            return ResponseEntity.ok(
                    asignacionesService.buscarAsignacionesPorUsuario(nombreUsuario));

        } catch (RecursoNoEncontradoException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al buscar las asignaciones");
        }
    }

    @GetMapping("/obtenerProgreso/{usuario}/{moduloId}")
    public ResponseEntity<Object> obtenerProgreso(
            @PathVariable String usuario,
            @PathVariable String moduloId) {
        try {
            return ResponseEntity.ok(
                    asignacionesService.obtenerProgreso(usuario, moduloId));

        } catch (RecursoNoEncontradoException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());

        } catch (Exception e) {
            // ← Agrega esto para ver el error exacto
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al obtener la asignación activa");
        }
    }

}
