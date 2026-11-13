package com.example.sss001.event;

public class UserRegisteredEvent {

    private final Long userId;
    private final String name;
    private final String email;

    public UserRegisteredEvent(Long userId, String name, String email) {
        this.userId = userId;
        this.name = name;
        this.email = email;
    }

    public Long getUserId() {
        return userId;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }
}
