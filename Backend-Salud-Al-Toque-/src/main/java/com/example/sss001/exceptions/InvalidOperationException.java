package com.example.sss001.exceptions;

public class InvalidOperationException extends ForbiddenException {

    public InvalidOperationException(String message) {
        super(message);
    }
}