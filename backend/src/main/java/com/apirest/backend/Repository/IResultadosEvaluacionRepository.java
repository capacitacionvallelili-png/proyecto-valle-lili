package com.apirest.backend.Repository;

import java.util.List;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import com.apirest.backend.Model.Evaluacion.ResultadosEvaluacionModel;

public interface IResultadosEvaluacionRepository extends MongoRepository<ResultadosEvaluacionModel, ObjectId> {

    //@Query("{\"asignacionId\": ?0}")
    Long countByAsignacionId(ObjectId asignacionId);

    // buscar con el usuario los resultados asociados a este
    @Query("{ 'infoUsuario.usuario': { $regex: ?0, $options: 'i' } }")
    List<ResultadosEvaluacionModel> findByUsuario(String usuario);

    // buscar con la asignacion todos los resultados asociados
    List<ResultadosEvaluacionModel> findByAsignacionId(ObjectId asignacionId);

    @Query("{ 'infoUsuario.usuarioId': ?0 }")
    List<ResultadosEvaluacionModel> findByUsuarioIdExacto(ObjectId usuarioId);
}
