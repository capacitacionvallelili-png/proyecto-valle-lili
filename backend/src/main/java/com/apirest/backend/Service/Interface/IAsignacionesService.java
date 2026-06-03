package com.apirest.backend.Service.Interface;

import java.util.List;

import com.apirest.backend.DTO.AsignacionesDTO;
import com.apirest.backend.DTO.CompletarSeccionDTO;
import com.apirest.backend.Model.asignaciones.AsignacionesModel;

public interface IAsignacionesService {

    public AsignacionesModel crearAsignaciones(AsignacionesDTO asignacionesDTO);
    public void validarCampo(String campo, String nombreCampo);
    public AsignacionesModel completarSeccion (CompletarSeccionDTO dto);
    public List<AsignacionesModel> ListarAsignaciones();
    public List<AsignacionesModel> buscarAsignacionesPorUsuario(String nombreUsuario);
    public AsignacionesModel obtenerProgreso(String usuario, String moduloId);
   

    
}
