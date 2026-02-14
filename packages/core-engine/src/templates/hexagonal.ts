// ─────────────────────────────────────────────────────────
// Hexagonal Architecture (Ports & Adapters) Templates
// Java (Spring Boot) + .NET (ASP.NET Core)
// ─────────────────────────────────────────────────────────

import { TemplateManifest } from '../types';

// ── Java Hexagonal ──────────────────────────────────────

export const javaHexagonalManifest: TemplateManifest = {
  stack: 'java',
  architecture: 'hexagonal',
  files: [
    {
      path: 'build.gradle.kts',
      content: `plugins {
    java
    id("org.springframework.boot") version "3.2.2"
    id("io.spring.dependency-management") version "1.1.4"
}

group = "<%= projectName %>"
version = "1.1.0"

java { sourceCompatibility = JavaVersion.VERSION_21 }

repositories { mavenCentral() }

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-web")
<% if (database === 'postgresql') { %>    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    runtimeOnly("org.postgresql:postgresql")
<% } else if (database === 'mysql') { %>    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    runtimeOnly("com.mysql:mysql-connector-j")
<% } %><% if (auth === 'jwt') { %>    implementation("org.springframework.boot:spring-boot-starter-security")
    implementation("io.jsonwebtoken:jjwt-api:0.12.3")
    runtimeOnly("io.jsonwebtoken:jjwt-impl:0.12.3")
<% } %>
    testImplementation("org.springframework.boot:spring-boot-starter-test")
}

tasks.withType<Test> { useJUnitPlatform() }
`,
    },
    {
      path: 'settings.gradle.kts',
      content: `rootProject.name = "<%= projectName %>"
`,
    },
    {
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
<% } %>
`,
    },
    // Main
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
    // Domain — pure business logic
    {
      path: 'src/main/java/com/<%= projectName %>/domain/model/User.java',
      content: `package com.<%= projectName %>.domain.model;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Domain Entity: User.
 * Pure POJO — no framework annotations.
 */
public class User {
    private UUID id;
    private String email;
    private String name;
    private LocalDateTime createdAt;

    public User(UUID id, String email, String name, LocalDateTime createdAt) {
        this.id = id;
        this.email = email;
        this.name = name;
        this.createdAt = createdAt;
    }

    public UUID getId() { return id; }
    public String getEmail() { return email; }
    public String getName() { return name; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
`,
    },
    {
      path: 'src/main/java/com/<%= projectName %>/domain/exception/UserNotFoundException.java',
      content: `package com.<%= projectName %>.domain.exception;

public class UserNotFoundException extends RuntimeException {
    public UserNotFoundException(String id) {
        super("User not found: " + id);
    }
}
`,
    },
    // Ports — interfaces defining boundaries
    {
      path: 'src/main/java/com/<%= projectName %>/ports/inbound/GetUsersPort.java',
      content: `package com.<%= projectName %>.ports.inbound;

import com.<%= projectName %>.domain.model.User;
import java.util.List;

/**
 * Inbound port: querying users.
 * Implemented by the application service.
 * Called by inbound adapters (REST, GraphQL, etc.).
 */
public interface GetUsersPort {
    List<User> getAllUsers();
}
`,
    },
    {
      path: 'src/main/java/com/<%= projectName %>/ports/inbound/CreateUserPort.java',
      content: `package com.<%= projectName %>.ports.inbound;

import com.<%= projectName %>.domain.model.User;

/**
 * Inbound port: creating a user.
 */
public interface CreateUserPort {
    User createUser(String name, String email);
}
`,
    },
    {
      path: 'src/main/java/com/<%= projectName %>/ports/outbound/UserPersistencePort.java',
      content: `package com.<%= projectName %>.ports.outbound;

import com.<%= projectName %>.domain.model.User;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Outbound port: user persistence.
 * Implemented by outbound adapters (JPA, in-memory, etc.).
 * Called by the application service.
 */
public interface UserPersistencePort {
    List<User> findAll();
    Optional<User> findById(UUID id);
    User save(User user);
    void deleteById(UUID id);
}
`,
    },
    // Application — orchestration via ports
    {
      path: 'src/main/java/com/<%= projectName %>/application/UserService.java',
      content: `package com.<%= projectName %>.application;

import com.<%= projectName %>.domain.model.User;
import com.<%= projectName %>.ports.inbound.GetUsersPort;
import com.<%= projectName %>.ports.inbound.CreateUserPort;
import com.<%= projectName %>.ports.outbound.UserPersistencePort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Application service — implements inbound ports, depends on outbound ports.
 * This is the hexagon's interior.
 */
@Service
public class UserService implements GetUsersPort, CreateUserPort {

    private final UserPersistencePort persistencePort;

    public UserService(UserPersistencePort persistencePort) {
        this.persistencePort = persistencePort;
    }

    @Override
    public List<User> getAllUsers() {
        return persistencePort.findAll();
    }

    @Override
    public User createUser(String name, String email) {
        User user = new User(UUID.randomUUID(), email, name, LocalDateTime.now());
        return persistencePort.save(user);
    }
}
`,
    },
    // Adapters — inbound (REST)
    {
      path: 'src/main/java/com/<%= projectName %>/adapters/inbound/rest/UserController.java',
      content: `package com.<%= projectName %>.adapters.inbound.rest;

import com.<%= projectName %>.domain.model.User;
import com.<%= projectName %>.ports.inbound.GetUsersPort;
import com.<%= projectName %>.ports.inbound.CreateUserPort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * Inbound adapter: REST API.
 * Delegates to inbound ports.
 */
@RestController
@RequestMapping("/api/users")
public class UserController {
    private final GetUsersPort getUsersPort;
    private final CreateUserPort createUserPort;

    public UserController(GetUsersPort getUsersPort, CreateUserPort createUserPort) {
        this.getUsersPort = getUsersPort;
        this.createUserPort = createUserPort;
    }

    @GetMapping
    public ResponseEntity<List<User>> getAll() {
        return ResponseEntity.ok(getUsersPort.getAllUsers());
    }

    @PostMapping
    public ResponseEntity<User> create(@RequestBody CreateUserRequest req) {
        return ResponseEntity.ok(createUserPort.createUser(req.name(), req.email()));
    }

    record CreateUserRequest(String name, String email) {}
}
`,
    },
    // Adapters — outbound (persistence)
    {
      path: 'src/main/java/com/<%= projectName %>/adapters/outbound/persistence/InMemoryUserAdapter.java',
      content: `package com.<%= projectName %>.adapters.outbound.persistence;

import com.<%= projectName %>.domain.model.User;
import com.<%= projectName %>.ports.outbound.UserPersistencePort;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Outbound adapter: in-memory persistence.
 * Replace with JPA adapter for production.
 */
@Component
public class InMemoryUserAdapter implements UserPersistencePort {
    private final Map<UUID, User> store = new ConcurrentHashMap<>();

    @Override
    public List<User> findAll() { return new ArrayList<>(store.values()); }

    @Override
    public Optional<User> findById(UUID id) { return Optional.ofNullable(store.get(id)); }

    @Override
    public User save(User user) { store.put(user.getId(), user); return user; }

    @Override
    public void deleteById(UUID id) { store.remove(id); }
}
`,
    },
  ],
  postMessages: [
    'Run `gradle wrapper` then `./gradlew bootRun` to start',
    'Architecture: Hexagonal (Ports & Adapters) — domain is fully isolated',
    'Inbound ports define what the app CAN DO, outbound ports define what the app NEEDS',
  ],
};

// ── .NET Hexagonal ──────────────────────────────────────

export const dotnetHexagonalManifest: TemplateManifest = {
  stack: 'dotnet',
  architecture: 'hexagonal',
  files: [
    {
      path: '<%= projectName %>.sln',
      content: `
Microsoft Visual Studio Solution File, Format Version 12.00
# Generated by ArchForge — Hexagonal Architecture
`,
    },
    // Domain
    {
      path: 'src/Domain/<%= projectName %>.Domain.csproj',
      content: `<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
  </PropertyGroup>
</Project>
`,
    },
    {
      path: 'src/Domain/Model/User.cs',
      content: `namespace <%= projectName %>.Domain.Model;

public class User
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
`,
    },
    // Ports
    {
      path: 'src/Domain/Ports/Inbound/IGetUsersPort.cs',
      content: `using <%= projectName %>.Domain.Model;

namespace <%= projectName %>.Domain.Ports.Inbound;

public interface IGetUsersPort
{
    Task<IEnumerable<User>> GetAllUsersAsync();
}
`,
    },
    {
      path: 'src/Domain/Ports/Inbound/ICreateUserPort.cs',
      content: `using <%= projectName %>.Domain.Model;

namespace <%= projectName %>.Domain.Ports.Inbound;

public interface ICreateUserPort
{
    Task<User> CreateUserAsync(string name, string email);
}
`,
    },
    {
      path: 'src/Domain/Ports/Outbound/IUserPersistencePort.cs',
      content: `using <%= projectName %>.Domain.Model;

namespace <%= projectName %>.Domain.Ports.Outbound;

public interface IUserPersistencePort
{
    Task<IEnumerable<User>> FindAllAsync();
    Task<User?> FindByIdAsync(Guid id);
    Task<User> SaveAsync(User user);
    Task DeleteAsync(Guid id);
}
`,
    },
    // Application
    {
      path: 'src/Application/<%= projectName %>.Application.csproj',
      content: `<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
  </PropertyGroup>
  <ItemGroup>
    <ProjectReference Include="../Domain/<%= projectName %>.Domain.csproj" />
  </ItemGroup>
</Project>
`,
    },
    {
      path: 'src/Application/UserService.cs',
      content: `using <%= projectName %>.Domain.Model;
using <%= projectName %>.Domain.Ports.Inbound;
using <%= projectName %>.Domain.Ports.Outbound;

namespace <%= projectName %>.Application;

public class UserService : IGetUsersPort, ICreateUserPort
{
    private readonly IUserPersistencePort _persistence;

    public UserService(IUserPersistencePort persistence)
    {
        _persistence = persistence;
    }

    public async Task<IEnumerable<User>> GetAllUsersAsync()
    {
        return await _persistence.FindAllAsync();
    }

    public async Task<User> CreateUserAsync(string name, string email)
    {
        var user = new User { Id = Guid.NewGuid(), Name = name, Email = email, CreatedAt = DateTime.UtcNow };
        return await _persistence.SaveAsync(user);
    }
}
`,
    },
    // Adapters — Inbound (Web API)
    {
      path: 'src/Adapters.Inbound.WebApi/<%= projectName %>.Adapters.Inbound.WebApi.csproj',
      content: `<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
  </PropertyGroup>
  <ItemGroup>
    <ProjectReference Include="../Application/<%= projectName %>.Application.csproj" />
  </ItemGroup>
</Project>
`,
    },
    {
      path: 'src/Adapters.Inbound.WebApi/Controllers/UsersController.cs',
      content: `using <%= projectName %>.Domain.Ports.Inbound;
using Microsoft.AspNetCore.Mvc;

namespace <%= projectName %>.Adapters.Inbound.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IGetUsersPort _getUsersPort;
    private readonly ICreateUserPort _createUserPort;

    public UsersController(IGetUsersPort getUsersPort, ICreateUserPort createUserPort)
    {
        _getUsersPort = getUsersPort;
        _createUserPort = createUserPort;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await _getUsersPort.GetAllUsersAsync());

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateUserRequest req)
        => Ok(await _createUserPort.CreateUserAsync(req.Name, req.Email));
}

public record CreateUserRequest(string Name, string Email);
`,
    },
    {
      path: 'src/Adapters.Inbound.WebApi/Program.cs',
      content: `using <%= projectName %>.Application;
using <%= projectName %>.Domain.Ports.Inbound;
using <%= projectName %>.Domain.Ports.Outbound;
// using <%= projectName %>.Adapters.Outbound.Persistence; // wire up real adapter

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Register ports and adapters
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<IGetUsersPort>(sp => sp.GetRequiredService<UserService>());
builder.Services.AddScoped<ICreateUserPort>(sp => sp.GetRequiredService<UserService>());
// builder.Services.AddScoped<IUserPersistencePort, InMemoryUserAdapter>();

var app = builder.Build();
if (app.Environment.IsDevelopment()) { app.UseSwagger(); app.UseSwaggerUI(); }
app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();
app.Run();
`,
    },
  ],
  postMessages: [
    'Run `dotnet restore && dotnet run --project src/Adapters.Inbound.WebApi`',
    'Architecture: Hexagonal (Ports & Adapters)',
    'Ports define boundaries; Adapters are replaceable implementations',
  ],
};
