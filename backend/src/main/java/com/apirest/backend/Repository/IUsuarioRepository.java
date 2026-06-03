package com.apirest.backend.Repository;

import java.util.List;
import java.util.Optional;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import com.apirest.backend.Model.UsuariosModel;

public interface IUsuarioRepository extends MongoRepository<UsuariosModel, ObjectId> {

    // aqui van todas las consutlas nativas
    // EL REPOSITIORIO SE ENCARGA DE TENER EL CONTACTO DIRECTO CON MONGO Y HACER
    // TODAS ESAS CONSULTAS

    // me busca un estudiate por el usuario que tenga, es decir el admisnitrador
    // busca un usario y le paarece una lista de los usarios que
    // empiezan por esas letras y asu
    @Query("{ 'Usuario': { $regex: ?0, $options: 'i' } }")
    List<UsuariosModel> buscarPorUsuario(String texto);

    @Query("{ 'Usuario': ?0 }")
    Optional<UsuariosModel> findByUsuario(String usuario);
}
