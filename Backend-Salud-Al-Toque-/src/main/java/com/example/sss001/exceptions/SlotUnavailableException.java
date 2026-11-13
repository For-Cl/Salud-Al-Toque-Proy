package com.example.sss001.exceptions;

public class SlotUnavailableException extends ConflictException {

    public SlotUnavailableException(String message) {
        super(message);
    }
}