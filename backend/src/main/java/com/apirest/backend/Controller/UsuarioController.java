package com.apirest.backend.Controller;


import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.apirest.backend.DTO.UsuariosDTO;
import com.apirest.backend.Exception.EmptyStringException;
import com.apirest.backend.Exception.RecursoNoEncontradoException;
import com.apirest.backend.Model.UsuariosModel;
import com.apirest.backend.Service.Interface.IUsuarioService;

import org.springframework.dao.DuplicateKeyException;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;


@RestController

@RequestMapping("/Vallelili/usuario")

public class UsuarioController {

    @Autowired
    IUsuarioService UsuarioService;

    // crear usuario
    @PostMapping("/insertar")
    public ResponseEntity<Object> crearUsuario(@RequestBody UsuariosDTO usuariosDTO) {
        try {
            return new ResponseEntity<Object>(
                    UsuarioService.guardarUsuario(usuariosDTO),
                    HttpStatus.CREATED);

        } catch (DuplicateKeyException e) {
            String errorMessage = e.getMessage();
            // Revisa el mensaje para saber qué campo está duplicado

            System.out.println("ERROR DUPLICADO: " + errorMessage);
            if (errorMessage.contains("Usuario_1")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Error: ya existe un usuario con ese nombre");
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Error: dato duplicado");
            }
        } catch (EmptyStringException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());

        }

        catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("error al ingresar el usuario");
        }

    }

    // listar todos los usuarios
    @GetMapping("/listartodos")
    public ResponseEntity<List<UsuariosModel>> listarUsuarios() {
        return new ResponseEntity<>(UsuarioService.listarUsuarios(), HttpStatus.OK);
    }

    // eliminar Usuario
    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<String> eliminarUsuario(@PathVariable String id) {
        try {
            return ResponseEntity.ok(UsuarioService.eliminarUsuario(id));
        } catch (EmptyStringException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());

        } catch (RecursoNoEncontradoException e) { // este me muestra los errores en string, el otro ne la consola
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());

        }

        catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("error al ingresar el usuario");
        }

    }

    // desactivar usuario
    @PatchMapping("/desactivar/{id}")
    public ResponseEntity<String> desactivarUsuario(@PathVariable String id) {
        try {
            return ResponseEntity.ok(UsuarioService.desactivarUsuario(id));
        } catch (RecursoNoEncontradoException e) { // este me muestra los errores en string, el otro ne la consola
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("error al ingresar el usuario");
        }

    }

    // buscar usuario
    @GetMapping("/buscarPorId/{id}")
    public ResponseEntity<Object> usuarioPorId(@PathVariable String id) {
        try{
            return ResponseEntity.ok(UsuarioService.usuarioPorId(id));

        } catch (RecursoNoEncontradoException e) { // este me muestra los errores en string, el otro ne la consola
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        }
        catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("error al ingresar el usuario");
        }
    }
    
    

}
