package com.apirest.backend.Exception;

public class EmptyStringException extends RuntimeException {
    public  EmptyStringException(String mensaje){
        super(mensaje);
    }
    
}
