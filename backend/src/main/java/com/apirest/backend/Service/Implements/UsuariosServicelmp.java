package com.apirest.backend.Service.Implements;

import java.time.LocalDateTime;
import java.util.List;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.apirest.backend.DTO.UsuariosDTO;
import com.apirest.backend.Exception.EmptyStringException;
import com.apirest.backend.Exception.RecursoNoEncontradoException;
import com.apirest.backend.Model.UsuariosModel;
import com.apirest.backend.Model.Evaluacion.ResultadosEvaluacionModel;
import com.apirest.backend.Model.asignaciones.AsignacionesModel;
import com.apirest.backend.Repository.IAsignacionesRepository;
import com.apirest.backend.Repository.IResultadosEvaluacionRepository;
import com.apirest.backend.Repository.IUsuarioRepository;
import com.apirest.backend.Service.Interface.IUsuarioService;

// aqui sera la implemetnacion, una clase concreta por eso la clase es implementacino
// aqui se implementa la logica del negocio

// implemetns = //  clase PROMETE implementar todos los métodos de la interface

@Service // me especifica que esa clase es un servicio
public class UsuariosServicelmp implements IUsuarioService {

    // inyeccion de dependencias, es decir que voy a usar la interface
    // El Service necesita hablar con el Repository para guardar o consultar datos
    // en MongoDB. Pero para usarlo necesita tener una instancia de él
    @Autowired
    IUsuarioRepository UsuarioRepository; // es un objeto del tipo reposityoru, ya que el repositor se supone que tiene
                                          // esa info

    @Autowired
    PasswordEncoder passwordEncoder;

    @Autowired
    IAsignacionesRepository asignacionesRepository;

    @Autowired
    IResultadosEvaluacionRepository resultadosRepository;

    @Override
    public UsuariosModel guardarUsuario(UsuariosDTO dto) {
        // el DTO llegó incompleto desde el frontend — solo tiene 4 campos. El Model
        // necesita 7 campos para guardarse en MongoDB. Entonces el Service completa los
        // campos que faltan.

        // Validaciones primero de que no sean cadenas vacias
        validarCampo(dto.getUsuario(), "Usuario");
        validarCampo(dto.getContrasena(), "Contraseña");
        validarCampo(dto.getNombre(), "Nombre");

        UsuariosModel usuario = new UsuariosModel();
        // En este momento usuario está vacío
        // usuario = { }
        usuario.setUsuario(dto.getUsuario());
        // Va llenando la caja campo por, campo usuario = { usuario: "isabella" }
        usuario.setContrasena(passwordEncoder.encode(dto.getContrasena())); // ← aquí
        usuario.setRol(dto.getRol());
        usuario.setNombre(dto.getNombre());

        // ahora para los atributos creados automaticament por lo que es la base de
        // datos
        usuario.setFecha_creacion(LocalDateTime.now());
        ;
        usuario.setActivo(true);
        // creadoPor lo cuando implementes el login
        // _id lo genera MongoDB automáticamente
        return UsuarioRepository.save(usuario);

    }

    // listar todos usuarios usuarios

    @Override
    public List<UsuariosModel> listarUsuarios() {
        return UsuarioRepository.findAll();
    }

    // eliminar usuario

    @Override
    public String eliminarUsuario(String Id) {
        validarCampo(Id, "Id");

        ObjectId objId = new ObjectId(Id);

        // 1. Verificar que existe antes de eliminar
        UsuarioRepository.findById(objId)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "El usuario no se encontró: " + Id));

        // 2. Eliminar resultados de evaluación del usuario
        List<ResultadosEvaluacionModel> resultados = resultadosRepository.findByUsuarioIdExacto(objId);
        if (!resultados.isEmpty()) {
            resultadosRepository.deleteAll(resultados);
        }

        // 3. Eliminar asignaciones del usuario
        List<AsignacionesModel> asignaciones = asignacionesRepository.findByUsuarioId(objId);
        if (!asignaciones.isEmpty()) {
            asignacionesRepository.deleteAll(asignaciones);
        }

        // 4. Eliminar el usuario
        UsuarioRepository.deleteById(objId);

        return "Usuario y todos sus datos eliminados correctamente";
    }

    @Override
    public String desactivarUsuario(String Id) {
        // 1. Buscar el usuario
        UsuariosModel usuario = UsuarioRepository
                .findById(new ObjectId(Id))
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "El usuario no se encontró: " + Id));

        // 2. Modificar solo el campo Activo
        usuario.setActivo(false);

        // 3. Guardar el cambio en MongoDB
        UsuarioRepository.save(usuario);

        // 4. Retornar confirmación
        return "El usuario fue desactivado correctamente";

    }

    @Override
    public void validarCampo(String campo, String nombreCampo) {
        if (campo == null || campo.trim().isEmpty()) {
            throw new EmptyStringException("EL campo " + nombreCampo + " no puede estar vacio");
        }
    }

    @Override
    public UsuariosModel usuarioPorId(String Id) {
        return UsuarioRepository.findById(new ObjectId(Id)).orElseThrow(() -> new RecursoNoEncontradoException(
                "el usuario no se encuentra"));
    }

}
