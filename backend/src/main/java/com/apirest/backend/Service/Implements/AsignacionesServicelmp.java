package com.apirest.backend.Service.Implements;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.apirest.backend.DTO.AsignacionesDTO;
import com.apirest.backend.DTO.CompletarSeccionDTO;
import com.apirest.backend.Exception.EmptyStringException;
import com.apirest.backend.Exception.RecursoNoEncontradoException;
import com.apirest.backend.Model.ModulosModel;
import com.apirest.backend.Model.UsuariosModel;
import com.apirest.backend.Model.ENUM.EstadoAsignaciones;
import com.apirest.backend.Model.asignaciones.AsignacionesModel;
import com.apirest.backend.Model.asignaciones.infoModulosEmbe;
import com.apirest.backend.Model.asignaciones.infoUsuarioEmbe;
import com.apirest.backend.Model.asignaciones.progresoEmbe;
import com.apirest.backend.Repository.IAsignacionesRepository;
import com.apirest.backend.Repository.IModulolRepository;
import com.apirest.backend.Repository.IUsuarioRepository;
import com.apirest.backend.Service.Interface.IAsignacionesService;

@Service
public class AsignacionesServicelmp implements IAsignacionesService {

    @Autowired
    IAsignacionesRepository asignacionesRepository;
    @Autowired
    IUsuarioRepository UsuarioRepository;
    @Autowired
    IModulolRepository ModuloRepository;

    // CREAR ASIGNACINOES
    @Override
public AsignacionesModel crearAsignaciones(AsignacionesDTO dto) {

    validarCampo(dto.getUsuarioId(), "usuarioId");
    validarCampo(dto.getModuloId(), "moduloId");

    ObjectId estudianteId = new ObjectId(dto.getUsuarioId());
    ObjectId moduloId     = new ObjectId(dto.getModuloId());

    // Vencer activa si existe
    asignacionesRepository
        .findAsignacionActiva(estudianteId, moduloId, EstadoAsignaciones.activo)
        .ifPresent(a -> {
            a.setEstado(EstadoAsignaciones.vencido);
            asignacionesRepository.save(a);
        });

    // Vencer completada si existe
    asignacionesRepository
        .findAsignacionActiva(estudianteId, moduloId, EstadoAsignaciones.completado)
        .ifPresent(a -> {
            a.setEstado(EstadoAsignaciones.vencido);
            asignacionesRepository.save(a);
        });

    // El resto igual que antes
    UsuariosModel estudiante = UsuarioRepository
            .findById(estudianteId)
            .orElseThrow(() -> new RecursoNoEncontradoException(
                    "Estudiante no encontrado: " + dto.getUsuarioId()));

    ModulosModel modulo = ModuloRepository
            .findById(moduloId)
            .orElseThrow(() -> new RecursoNoEncontradoException(
                    "Módulo no encontrado: " + dto.getModuloId()));

    infoUsuarioEmbe infoUsuario = new infoUsuarioEmbe();
    infoUsuario.setUsuarioId(estudianteId);
    infoUsuario.setNombre(estudiante.getNombre());
    infoUsuario.setUsuario(estudiante.getUsuario());

    infoModulosEmbe infoModulos = new infoModulosEmbe();
    infoModulos.setModuloId(moduloId);
    infoModulos.setNombre(modulo.getNombre());

    List<progresoEmbe> progreso = new ArrayList<>();
    for (int i = 1; i <= modulo.getTotalsecciones(); i++) {
        progresoEmbe seccion = new progresoEmbe();
        seccion.setSeccionId(i);
        seccion.setCompletada(false);
        seccion.setFechaCompletada(null);
        progreso.add(seccion);
    }

    AsignacionesModel nuevaAsignacion = new AsignacionesModel();
    nuevaAsignacion.setFechaAsignacion(LocalDateTime.now());
    nuevaAsignacion.setEstado(EstadoAsignaciones.activo);
    nuevaAsignacion.setPorcentajeProgreso(0);
    nuevaAsignacion.setEvaluacionHabilitada(false);
    nuevaAsignacion.setProgreso(progreso);
    nuevaAsignacion.setAsignadoPor(null);
    nuevaAsignacion.setInfoUsuario(infoUsuario);
    nuevaAsignacion.setInfoModulos(infoModulos);

    return asignacionesRepository.save(nuevaAsignacion);
}

    @Override
    public void validarCampo(String campo, String nombreCampo) {
        if (campo == null || campo.trim().isEmpty()) {
            throw new EmptyStringException("EL campo " + nombreCampo + " no puede estar vacio");
        }
    }

    // completar una sección

    @Override
    public AsignacionesModel completarSeccion(CompletarSeccionDTO dto) {

        // 1. Convertir y obtener datos
        ObjectId asignacionId = new ObjectId(dto.getAsignacionId());
        int seccionId = dto.getSeccionId();

        // 2. Buscar asignación
        AsignacionesModel asignacion = asignacionesRepository
                .findById(asignacionId)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "Asignación no encontrada: " + dto.getAsignacionId()));

        // 3. Verificar que la sección anterior esté completada
        if (seccionId > 1) {
            progresoEmbe seccionAnterior = asignacion.getProgreso()
                    .stream()
                    .filter(s -> s.getSeccionId() == seccionId - 1)
                    .findFirst()
                    .orElseThrow(() -> new RecursoNoEncontradoException(
                            "Sección anterior no encontrada"));

            if (!seccionAnterior.isCompletada()) {
                throw new RuntimeException(
                        "Debes completar la sección " + (seccionId - 1) + " primero");
            }
        }

        // 4. Buscar la sección actual
        progresoEmbe seccion = asignacion.getProgreso()
                .stream()
                .filter(s -> s.getSeccionId() == seccionId)
                .findFirst()
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "Sección no encontrada: " + seccionId));

        // para que si ya se coomleto, pues no aparezca que e compelta de neuvo y no se
        // cambie la primera fecha
        if (seccion.isCompletada()) {
            throw new RuntimeException(
                    "La sección " + seccionId + " ya está completada");
        }
        // 5. Marcar la sección como completada
        seccion.setCompletada(true);
        seccion.setFechaCompletada(LocalDateTime.now());

        // 6. Recalcular porcentaje
        long seccionesCompletadas = asignacion.getProgreso()
                .stream()
                .filter(s -> s.isCompletada())
                .count();

        int totalSecciones = asignacion.getProgreso().size();
        int porcentaje = (int) Math.round((seccionesCompletadas * 100.0) / totalSecciones);
        asignacion.setPorcentajeProgreso(porcentaje);

        // 7. Si porcentaje == 100 → habilitar evaluación
        if (porcentaje == 100) {
            asignacion.setEvaluacionHabilitada(true);
            asignacion.setEstado(EstadoAsignaciones.completado);
        }

        // 8. Guardar y retornar
        return asignacionesRepository.save(asignacion);
    }

    // LISTAR TODAS LAS ASIGNACIONES
    @Override
    public List<AsignacionesModel> ListarAsignaciones() {
        return asignacionesRepository.findAll();
    }

    // asiganaciones por un usuario, encuentro todos los modulos asignados a ese
    // usuario
    @Override
    public List<AsignacionesModel> buscarAsignacionesPorUsuario(String nombreUsuario) {
        // 1. Buscar usuario por nombre
        List<UsuariosModel> usuarios = UsuarioRepository
                .buscarPorUsuario(nombreUsuario);

        if (usuarios.isEmpty()) {
            throw new RecursoNoEncontradoException(
                    "Usuario no encontrado: " + nombreUsuario);
        }

        // 2. Tomar el primer resultado
        UsuariosModel usuario = usuarios.get(0);

        // 3. Buscar sus asignaciones
        return asignacionesRepository.findByUsuarioId(usuario.getId());

    }

    // para obtener preogreso del frontend, y asi ponerlo y visualizar que esta
    // activo y no

    @Override
public AsignacionesModel obtenerProgreso(String usuario, String moduloId) {

    UsuariosModel estudiante = UsuarioRepository.findByUsuario(usuario)
        .orElseThrow(() -> new RecursoNoEncontradoException(
            "Usuario no encontrado: " + usuario));

    ObjectId estudianteId = estudiante.getId();
    ObjectId moduloObjId  = new ObjectId(moduloId);

    Optional<AsignacionesModel> asignacion = asignacionesRepository
        .findAsignacionActiva(estudianteId, moduloObjId, EstadoAsignaciones.activo);

    if (!asignacion.isPresent()) {
        asignacion = asignacionesRepository
            .findAsignacionActiva(estudianteId, moduloObjId, EstadoAsignaciones.completado);
    }

    return asignacion.orElseThrow(() -> new RecursoNoEncontradoException(
        "No hay asignación para este estudiante y módulo"));
}
}
