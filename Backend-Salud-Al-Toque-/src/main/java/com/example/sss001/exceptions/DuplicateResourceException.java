package com.example.sss001.exceptions;

public class DuplicateResourceException extends ConflictException {

    public DuplicateResourceException(String message) {
        super(message);
    }
}