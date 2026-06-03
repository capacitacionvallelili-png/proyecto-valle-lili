package com.apirest.backend.Service.Interface;

import java.util.List;

import com.apirest.backend.Model.ModulosModel;


public interface IModulosService {
    // defino mis fucnioes, en este caso solo seria listrar que es un get para obtener mis modulos porque yo internamente soy
    // que escribo en el mongo los unicos dos modulos que hay

    public List<ModulosModel> ListarModulos();




    
}
