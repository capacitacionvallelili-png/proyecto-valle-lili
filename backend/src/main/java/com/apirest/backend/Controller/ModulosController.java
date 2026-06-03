package com.apirest.backend.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.apirest.backend.Model.ModulosModel;
import com.apirest.backend.Service.Interface.IModulosService;

import org.springframework.web.bind.annotation.GetMapping;




@RestController
@RequestMapping("/Vallelili/modulos")


public class ModulosController {
    @Autowired
    IModulosService ModulosService;

    @GetMapping("/listar")
    public ResponseEntity <List<ModulosModel>> ListarModulos(){
        return new ResponseEntity<>(ModulosService.ListarModulos(), HttpStatus.OK);

    }




    
}
