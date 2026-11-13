package com.example.sss001;

import org.springframework.transaction.annotation.Transactional;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.testcontainers.containers.PostgreSQLContainer;

@Transactional
public abstract class AbstractContainerBaseTest {

    @ServiceConnection
    protected static final PostgreSQLContainer<?> postgresContainer;

    static {
        postgresContainer = new PostgreSQLContainer<>("postgres:16-alpine")
                .withDatabaseName("sss001_test")
                .withUsername("test")
                .withPassword("test");
        postgresContainer.start();
    }
}