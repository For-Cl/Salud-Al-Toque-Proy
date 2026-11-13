package com.example.sss001.exceptions;

public class InvalidFormatException extends BadRequestException {

    public InvalidFormatException(String message) {
        super(message);
    }
}