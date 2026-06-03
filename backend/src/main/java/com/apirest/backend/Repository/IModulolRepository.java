package com.apirest.backend.Repository;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

import com.apirest.backend.Model.ModulosModel;

public  interface IModulolRepository extends MongoRepository <ModulosModel, ObjectId>{
    

    // aqui iria lo que son las consultas nativas pero pues para este caso no se usan en el modulo
}
