package com.apirest.backend.Repository;

import java.util.List;
import java.util.Optional;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import com.apirest.backend.Model.ENUM.EstadoAsignaciones;
import com.apirest.backend.Model.asignaciones.AsignacionesModel;

public interface IAsignacionesRepository extends MongoRepository<AsignacionesModel, ObjectId> {

  // encontrar si la asignacion esta activa o no

  @Query("{ 'infoUsuario.usuarioId': ?0, 'infoModulos.moduloId': ?1, 'Estado': ?2 }")
  Optional<AsignacionesModel> findAsignacionActiva(
      ObjectId usuarioId,
      ObjectId moduloId,
      EstadoAsignaciones estado);

  // encontrar la asignacion de un usuario
  @Query("{ 'infoUsuario.usuarioId': ?0 }")
  List<AsignacionesModel> findByUsuarioId(ObjectId usuarioId);

  

}
