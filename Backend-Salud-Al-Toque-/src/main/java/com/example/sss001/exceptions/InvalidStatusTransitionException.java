package com.example.sss001.exceptions;

public class InvalidStatusTransitionException extends ConflictException {

    public InvalidStatusTransitionException(String message) {
        super(message);
    }
}