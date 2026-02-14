// ─────────────────────────────────────────────────────────
// Java Templates — Clean & Layered Architecture
// (Spring Boot + Gradle)
// ─────────────────────────────────────────────────────────

import { TemplateManifest } from '../types';

const buildGradle = {
  path: 'build.gradle.kts',
  content: `plugins {
    java
    id("org.springframework.boot") version "3.2.2"
    id("io.spring.dependency-management") version "1.1.4"
}

group = "<%= projectName %>"
version = "1.1.0"

java {
    sourceCompatibility = JavaVersion.VERSION_21
}

repositories {
    mavenCentral()
}

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-web")
<% if (database === 'postgresql') { %>    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    runtimeOnly("org.postgresql:postgresql")
<% } else if (database === 'mysql') { %>    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    runtimeOnly("com.mysql:mysql-connector-j")
<% } %><% if (auth === 'jwt') { %>    implementation("org.springframework.boot:spring-boot-starter-security")
    implementation("io.jsonwebtoken:jjwt-api:0.12.3")
    runtimeOnly("io.jsonwebtoken:jjwt-impl:0.12.3")
    runtimeOnly("io.jsonwebtoken:jjwt-jackson:0.12.3")
<% } else if (auth === 'oauth') { %>    implementation("org.springframework.boot:spring-boot-starter-oauth2-resource-server")
<% } %>
    testImplementation("org.springframework.boot:spring-boot-starter-test")
}

tasks.withType<Test> {
    useJUnitPlatform()
}
`,
};

const settingsGradle = {
  path: 'settings.gradle.kts',
  content: `rootProject.name = "<%= projectName %>"
`,
};

const applicationProperties = {
  path: 'src/main/resources/application.yml',
  content: `server:
  port: 8080

spring:
  application:
    name: <%= projectName %>
<% if (database === 'postgresql') { %>  datasource:
    url: jdbc:postgresql://localhost:5432/<%= projectName %>
    username: postgres
    password: postgres
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
<% } else if (database === 'mysql') { %>  datasource:
    url: jdbc:mysql://localhost:3306/<%= projectName %>
    username: root
    password: root
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
<% } %>
`,
};

const gradleWrapper = {
  path: 'gradlew',
  content: `#!/bin/sh
# Gradle wrapper placeholder — run \`gradle wrapper\` to generate
echo "Run 'gradle wrapper' to generate the wrapper"
`,
};

const sharedFiles = [buildGradle, settingsGradle, applicationProperties, gradleWrapper];

// ── Clean Architecture ──────────────────────────────────

export const javaCleanManifest: TemplateManifest = {
  stack: 'java',
  architecture: 'clean',
  files: [
    ...sharedFiles,
    // Main Application
    {
      path: 'src/main/java/com/<%= projectName %>/Application.java',
      content: `package com.<%= projectName %>;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
`,
    },
    // Domain layer
    {
      path: 'src/main/java/com/<%= projectName %>/domain/entity/User.java',
      content: `package com.<%= projectName %>.domain.entity;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Domain Entity: User
 * Pure business object — no framework annotations.
 */
public class User {
    private UUID id;
    private String email;
    private String name;
    private LocalDateTime createdAt;

    public User() {}

    public User(UUID id, String email, String name, LocalDateTime createdAt) {
        this.id = id;
        this.email = email;
        this.name = name;
        this.createdAt = createdAt;
    }

    // Getters and setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
`,
    },
    {
      path: 'src/main/java/com/<%= projectName %>/domain/repository/UserRepository.java',
      content: `package com.<%= projectName %>.domain.repository;

import com.<%= projectName %>.domain.entity.User;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository interface — defines the contract.
 * Implementations live in infrastructure layer.
 */
public interface UserRepository {
    Optional<User> findById(UUID id);
    List<User> findAll();
    User save(User user);
    void deleteById(UUID id);
}
`,
    },
    // Application layer
    {
      path: 'src/main/java/com/<%= projectName %>/application/usecase/GetUsersUseCase.java',
      content: `package com.<%= projectName %>.application.usecase;

import com.<%= projectName %>.domain.entity.User;
import com.<%= projectName %>.domain.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.util.List;

/**
 * Use Case: Get all users.
 */
@Service
public class GetUsersUseCase {
    private final UserRepository userRepository;

    public GetUsersUseCase(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<User> execute() {
        return userRepository.findAll();
    }
}
`,
    },
    {
      path: 'src/main/java/com/<%= projectName %>/application/usecase/CreateUserUseCase.java',
      content: `package com.<%= projectName %>.application.usecase;

import com.<%= projectName %>.domain.entity.User;
import com.<%= projectName %>.domain.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Use Case: Create a new user.
 */
@Service
public class CreateUserUseCase {
    private final UserRepository userRepository;

    public CreateUserUseCase(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User execute(String name, String email) {
        User user = new User(UUID.randomUUID(), email, name, LocalDateTime.now());
        return userRepository.save(user);
    }
}
`,
    },
    // Infrastructure layer
    {
      path: 'src/main/java/com/<%= projectName %>/infrastructure/persistence/InMemoryUserRepository.java',
      content: `package com.<%= projectName %>.infrastructure.persistence;

import com.<%= projectName %>.domain.entity.User;
import com.<%= projectName %>.domain.repository.UserRepository;
import org.springframework.stereotype.Repository;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory implementation of UserRepository.
 * Replace with JPA implementation for production.
 */
@Repository
public class InMemoryUserRepository implements UserRepository {
    private final Map<UUID, User> store = new ConcurrentHashMap<>();

    @Override
    public Optional<User> findById(UUID id) {
        return Optional.ofNullable(store.get(id));
    }

    @Override
    public List<User> findAll() {
        return new ArrayList<>(store.values());
    }

    @Override
    public User save(User user) {
        store.put(user.getId(), user);
        return user;
    }

    @Override
    public void deleteById(UUID id) {
        store.remove(id);
    }
}
`,
    },
    // Presentation layer
    {
      path: 'src/main/java/com/<%= projectName %>/presentation/controller/UserController.java',
      content: `package com.<%= projectName %>.presentation.controller;

import com.<%= projectName %>.application.usecase.GetUsersUseCase;
import com.<%= projectName %>.application.usecase.CreateUserUseCase;
import com.<%= projectName %>.domain.entity.User;
import com.<%= projectName %>.presentation.dto.CreateUserRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final GetUsersUseCase getUsersUseCase;
    private final CreateUserUseCase createUserUseCase;

    public UserController(GetUsersUseCase getUsersUseCase, CreateUserUseCase createUserUseCase) {
        this.getUsersUseCase = getUsersUseCase;
        this.createUserUseCase = createUserUseCase;
    }

    @GetMapping
    public ResponseEntity<List<User>> getAll() {
        return ResponseEntity.ok(getUsersUseCase.execute());
    }

    @PostMapping
    public ResponseEntity<User> create(@RequestBody CreateUserRequest request) {
        User created = createUserUseCase.execute(request.name(), request.email());
        return ResponseEntity.ok(created);
    }
}
`,
    },
    {
      path: 'src/main/java/com/<%= projectName %>/presentation/dto/CreateUserRequest.java',
      content: `package com.<%= projectName %>.presentation.dto;

public record CreateUserRequest(String name, String email) {}
`,
    },
    // Tests
    {
      path: 'src/test/java/com/<%= projectName %>/application/usecase/GetUsersUseCaseTest.java',
      content: `package com.<%= projectName %>.application.usecase;

import com.<%= projectName %>.domain.entity.User;
import com.<%= projectName %>.domain.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GetUsersUseCaseTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private GetUsersUseCase getUsersUseCase;

    @Test
    void shouldReturnAllUsers() {
        User user = new User(UUID.randomUUID(), "test@test.com", "Test User", LocalDateTime.now());
        when(userRepository.findAll()).thenReturn(List.of(user));

        List<User> result = getUsersUseCase.execute();

        assertEquals(1, result.size());
        assertEquals("Test User", result.get(0).getName());
        verify(userRepository).findAll();
    }
}
`,
    },
  ],
  postMessages: [
    'Run `gradle wrapper` to generate the Gradle wrapper',
    'Run `./gradlew bootRun` to start the application',
    'Architecture: Clean Architecture (Domain → Application → Infrastructure → Presentation)',
  ],
};

// ── Layered Architecture ────────────────────────────────

export const javaLayeredManifest: TemplateManifest = {
  stack: 'java',
  architecture: 'layered',
  files: [
    ...sharedFiles,
    {
      path: 'src/main/java/com/<%= projectName %>/Application.java',
      content: `package com.<%= projectName %>;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
`,
    },
    {
      path: 'src/main/java/com/<%= projectName %>/model/User.java',
      content: `package com.<%= projectName %>.model;

import java.time.LocalDateTime;
import java.util.UUID;

public class User {
    private UUID id;
    private String email;
    private String name;
    private LocalDateTime createdAt;

    public User() {}
    public User(UUID id, String email, String name, LocalDateTime createdAt) {
        this.id = id; this.email = email; this.name = name; this.createdAt = createdAt;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
`,
    },
    {
      path: 'src/main/java/com/<%= projectName %>/repository/UserRepository.java',
      content: `package com.<%= projectName %>.repository;

import com.<%= projectName %>.model.User;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Repository;

@Repository
public class UserRepository {
    private final Map<UUID, User> store = new ConcurrentHashMap<>();

    public Optional<User> findById(UUID id) { return Optional.ofNullable(store.get(id)); }
    public List<User> findAll() { return new ArrayList<>(store.values()); }
    public User save(User user) { store.put(user.getId(), user); return user; }
    public void deleteById(UUID id) { store.remove(id); }
}
`,
    },
    {
      path: 'src/main/java/com/<%= projectName %>/service/UserService.java',
      content: `package com.<%= projectName %>.service;

import com.<%= projectName %>.model.User;
import com.<%= projectName %>.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User createUser(String name, String email) {
        User user = new User(UUID.randomUUID(), email, name, LocalDateTime.now());
        return userRepository.save(user);
    }
}
`,
    },
    {
      path: 'src/main/java/com/<%= projectName %>/controller/UserController.java',
      content: `package com.<%= projectName %>.controller;

import com.<%= projectName %>.model.User;
import com.<%= projectName %>.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<User>> getAll() {
        return ResponseEntity.ok(userService.getAllUsers());
    }
}
`,
    },
  ],
  postMessages: [
    'Run `gradle wrapper` to generate the Gradle wrapper',
    'Run `./gradlew bootRun` to start the application',
    'Architecture: Layered (Controller → Service → Repository → Model)',
  ],
};
