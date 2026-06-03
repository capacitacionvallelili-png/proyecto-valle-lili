package com.apirest.backend.Service.Implements;

import java.time.LocalDateTime;
import java.util.List;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.stereotype.Service;

import com.apirest.backend.DTO.ResultadosEvaluDTO;
import com.apirest.backend.Exception.RecursoNoEncontradoException;
import com.apirest.backend.Model.Evaluacion.ResultadosEvaluacionModel;
import com.apirest.backend.Model.Evaluacion.infoEModuloEmbe;
import com.apirest.backend.Model.Evaluacion.infoEUsuarioEmbe;
import com.apirest.backend.Model.asignaciones.AsignacionesModel;
import com.apirest.backend.Repository.IAsignacionesRepository;
import com.apirest.backend.Repository.IResultadosEvaluacionRepository;
import com.apirest.backend.Service.Interface.IResultadosService;

@Service
public class ResultadosServicelmp implements IResultadosService {

    @Autowired
    IResultadosEvaluacionRepository resultadosRepository;
    @Autowired
    IAsignacionesRepository asignacionesRepository;

    @Override
    public ResultadosEvaluacionModel guardarResultado(ResultadosEvaluDTO dto) {
        // 1. Convertir asignacionId a ObjectId
        ObjectId asignacionId = new ObjectId(dto.getAsignacionId());

        // 2. Buscar la asignación para verificar que existe y que evaluación está
        // habilitada
        AsignacionesModel asignacion = asignacionesRepository
                .findById(asignacionId)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "Asignación no encontrada: " + dto.getAsignacionId()));

        // 3. Verificar que la evaluación esté habilitada
        // Solo puede hacer la evaluación si completó todas las secciones
        if (!asignacion.isEvaluacionHabilitada()) {
            throw new RuntimeException(
                    "La evaluación no está habilitada, debes completar todas las secciones primero");
        }

        // 4. Contar cuántos intentos ya hizo para esta asignación
        // Busca en ResultadosEvaluacion cuántos documentos existen para esta asignación
        Long intentosRealizados = resultadosRepository
                .countByAsignacionId(asignacionId);

        // Si es null significa que no hay resultados → es el primer intento
        if (intentosRealizados == null)
            intentosRealizados = 0L;

        
        // 5. Verificar que no haya superado los 2 intentos
        if (intentosRealizados >= 2) {
            throw new RuntimeException(
                    "Ya realizaste los 2 intentos permitidos para esta evaluación");
        }

        // 6. Calcular el número de intento actual (1 o 2)
        int numIntento = intentosRealizados.intValue() + 1;

        // 7. Calcular el puntaje
        // Cuenta cuántas respuestas son correctas
        long correctas = dto.getRespuestas()
                .stream()
                .filter(r -> r.isEsCorrecta())
                .count();

        // Total de preguntas — no importa cuántas son, las cuenta del array
        int totalPreguntas = dto.getRespuestas().size();

        // Calcula el porcentaje redondeado
        int puntaje = (int) Math.round((correctas * 100.0) / totalPreguntas);

        // 8. Construir infoUsuario embebido
        infoEUsuarioEmbe infoUsuario = new infoEUsuarioEmbe();
        infoUsuario.setUsuarioId(asignacion.getInfoUsuario().getUsuarioId());
        infoUsuario.setNombre(asignacion.getInfoUsuario().getNombre());
        infoUsuario.setUsuario(asignacion.getInfoUsuario().getUsuario());

        // 9. Construir infoModulos embebido
        infoEModuloEmbe infoModulos = new infoEModuloEmbe();
        infoModulos.setModuloId(asignacion.getInfoModulos().getModuloId());
        infoModulos.setNombre(asignacion.getInfoModulos().getNombre());

        // 10. Construir el resultado completo
        ResultadosEvaluacionModel resultado = new ResultadosEvaluacionModel();
        resultado.setAsignacionId(asignacionId);
        resultado.setNumIntento(numIntento);
        resultado.setFechaRealizacion(LocalDateTime.now());
        resultado.setPuntaje(puntaje);
        resultado.setRespuestas(dto.getRespuestas());
        resultado.setInfoUsuario(infoUsuario);
        resultado.setInfoModulos(infoModulos);

        // 11. Guardar y retornar
        return resultadosRepository.save(resultado);
    }

    // LISTAR TODOS LOS RESULTADOS

    @Override
    public List<ResultadosEvaluacionModel> ListarTodosResultados() {
        return resultadosRepository.findAll();
    }

    // listar por usuario
    @Override
    public List<ResultadosEvaluacionModel> ListarResultadosPorUsuario(String usuario) {
        List<ResultadosEvaluacionModel> resultados = resultadosRepository
                .findByUsuario(usuario);

        if (resultados.isEmpty()) {
            throw new RecursoNoEncontradoException(
                    "No se encontraron resultados para el usuario: " + usuario);
        }

        return resultados;
    }

    @Override
    public List<ResultadosEvaluacionModel> obtenerResultadosPorAsignacion(String asignacionId) {
        ObjectId asignacionObjId = new ObjectId(asignacionId);

        List<ResultadosEvaluacionModel> resultados = resultadosRepository
                .findByAsignacionId(asignacionObjId);

        if (resultados.isEmpty()) {
            throw new RecursoNoEncontradoException(
                    "No se encontraron resultados para esta asignación");
        }

        return resultados;
    }

}
