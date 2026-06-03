package com.apirest.backend.Service.Implements;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.apirest.backend.Model.ModulosModel;

import com.apirest.backend.Repository.IModulolRepository;
import com.apirest.backend.Service.Interface.IModulosService;


@Service
public class ModulosServicelmp implements IModulosService {
    @Autowired IModulolRepository ModelRepository;

    @Override
    public List<ModulosModel> ListarModulos() {
        return ModelRepository.findAll();
    }

  

    
}
