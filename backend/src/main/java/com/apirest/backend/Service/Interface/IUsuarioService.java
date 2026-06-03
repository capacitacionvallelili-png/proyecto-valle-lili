package com.apirest.backend.Service.Interface;

import java.util.List;

import com.apirest.backend.DTO.UsuariosDTO;
import com.apirest.backend.Model.UsuariosModel;

// Una interface es como un contrato — define QUÉ se debe hacer pero no CÓMO hacerlo.
public interface IUsuarioService {
    // aqui va todo lo que es la logica de las funciones que tengo planteadas
    // aqui no hay impeletaciones, solo se nombran lsa cosas
    // es decir estoy escribiendo los metodos, u operaciones que mi base de datos hará
    // tengo que hacer, las demas como actualizar, consutlar, eliminar etc

    // cuando creo un usaurio, que se devuleve, pues el usario model
    // Recibe DTO, devuelve Model
    public UsuariosModel guardarUsuario(UsuariosDTO usuariosDTO);
    public List<UsuariosModel> listarUsuarios();
    public String eliminarUsuario (String Id);
    public String desactivarUsuario ( String Id);
    public UsuariosModel usuarioPorId ( String Id);
    public void validarCampo(String campo, String nombreCampo);

}
