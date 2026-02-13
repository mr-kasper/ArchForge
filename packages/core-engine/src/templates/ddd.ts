// ─────────────────────────────────────────────────────────
// Domain-Driven Design (Tactical) Templates
// Java (Spring Boot) + .NET (ASP.NET Core)
// ─────────────────────────────────────────────────────────

import { TemplateManifest } from '../types';

// ── Java DDD ────────────────────────────────────────────

export const javaDDDManifest: TemplateManifest = {
  stack: 'java',
  architecture: 'ddd',
  files: [
    {
      path: 'build.gradle.kts',
      content: `plugins {
    java
    id("org.springframework.boot") version "3.2.2"
    id("io.spring.dependency-management") version "1.1.4"
}

group = "<%= projectName %>"
version = "1.0.0"
java { sourceCompatibility = JavaVersion.VERSION_21 }
repositories { mavenCentral() }

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-web")
<% if (database === 'postgresql') { %>    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    runtimeOnly("org.postgresql:postgresql")
<% } else if (database === 'mysql') { %>    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    runtimeOnly("com.mysql:mysql-connector-j")
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
    // ── Domain layer ────────────────────────────────────
    // Aggregate Root
    {
      path: 'src/main/java/com/<%= projectName %>/domain/model/aggregate/UserAggregate.java',
      content: `package com.<%= projectName %>.domain.model.aggregate;

import com.<%= projectName %>.domain.model.entity.User;
import com.<%= projectName %>.domain.model.valueobject.Email;
import com.<%= projectName %>.domain.model.valueobject.UserId;
import com.<%= projectName %>.domain.event.UserCreatedEvent;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Aggregate Root: User
 * Encapsulates business rules and raises domain events.
 */
public class UserAggregate {
    private final UserId id;
    private final User user;
    private final List<Object> domainEvents = new ArrayList<>();

    private UserAggregate(UserId id, User user) {
        this.id = id;
        this.user = user;
    }

    public static UserAggregate create(String name, String email) {
        UserId id = UserId.generate();
        Email validEmail = Email.of(email);
        User user = new User(id, name, validEmail, LocalDateTime.now());
        UserAggregate aggregate = new UserAggregate(id, user);
        aggregate.domainEvents.add(new UserCreatedEvent(id, name, email));
        return aggregate;
    }

    public UserId getId() { return id; }
    public User getUser() { return user; }
    public List<Object> getDomainEvents() { return Collections.unmodifiableList(domainEvents); }
    public void clearEvents() { domainEvents.clear(); }
}
`,
    },
    // Entity
    {
      path: 'src/main/java/com/<%= projectName %>/domain/model/entity/User.java',
      content: `package com.<%= projectName %>.domain.model.entity;

import com.<%= projectName %>.domain.model.valueobject.Email;
import com.<%= projectName %>.domain.model.valueobject.UserId;

import java.time.LocalDateTime;

/**
 * Domain Entity: User
 * Identified by UserId, contains business data.
 */
public class User {
    private final UserId id;
    private String name;
    private Email email;
    private final LocalDateTime createdAt;

    public User(UserId id, String name, Email email, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.createdAt = createdAt;
    }

    public UserId getId() { return id; }
    public String getName() { return name; }
    public Email getEmail() { return email; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public void changeName(String newName) {
        if (newName == null || newName.isBlank()) throw new IllegalArgumentException("Name cannot be blank");
        this.name = newName;
    }
}
`,
    },
    // Value Objects
    {
      path: 'src/main/java/com/<%= projectName %>/domain/model/valueobject/UserId.java',
      content: `package com.<%= projectName %>.domain.model.valueobject;

import java.util.Objects;
import java.util.UUID;

/**
 * Value Object: UserId
 * Immutable, equality by value.
 */
public record UserId(UUID value) {
    public UserId {
        Objects.requireNonNull(value, "UserId cannot be null");
    }

    public static UserId generate() {
        return new UserId(UUID.randomUUID());
    }

    public static UserId from(String id) {
        return new UserId(UUID.fromString(id));
    }

    @Override
    public String toString() { return value.toString(); }
}
`,
    },
    {
      path: 'src/main/java/com/<%= projectName %>/domain/model/valueobject/Email.java',
      content: `package com.<%= projectName %>.domain.model.valueobject;

import java.util.Objects;

/**
 * Value Object: Email
 * Self-validating, immutable.
 */
public record Email(String value) {
    public Email {
        Objects.requireNonNull(value, "Email cannot be null");
        if (!value.matches("^[\\\\w.+-]+@[\\\\w-]+\\\\.[\\\\w.]+$")) {
            throw new IllegalArgumentException("Invalid email: " + value);
        }
    }

    public static Email of(String value) {
        return new Email(value);
    }

    @Override
    public String toString() { return value; }
}
`,
    },
    // Domain Event
    {
      path: 'src/main/java/com/<%= projectName %>/domain/event/UserCreatedEvent.java',
      content: `package com.<%= projectName %>.domain.event;

import com.<%= projectName %>.domain.model.valueobject.UserId;
import java.time.Instant;

/**
 * Domain Event: User was created.
 */
public record UserCreatedEvent(UserId userId, String name, String email, Instant occurredAt) {
    public UserCreatedEvent(UserId userId, String name, String email) {
        this(userId, name, email, Instant.now());
    }
}
`,
    },
    // Domain Repository interface
    {
      path: 'src/main/java/com/<%= projectName %>/domain/repository/UserRepository.java',
      content: `package com.<%= projectName %>.domain.repository;

import com.<%= projectName %>.domain.model.aggregate.UserAggregate;
import com.<%= projectName %>.domain.model.valueobject.UserId;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface — defined in domain, implemented in infrastructure.
 */
public interface UserRepository {
    Optional<UserAggregate> findById(UserId id);
    List<UserAggregate> findAll();
    UserAggregate save(UserAggregate aggregate);
    void delete(UserId id);
}
`,
    },
    // Domain Service
    {
      path: 'src/main/java/com/<%= projectName %>/domain/service/UserDomainService.java',
      content: `package com.<%= projectName %>.domain.service;

import com.<%= projectName %>.domain.model.aggregate.UserAggregate;
import com.<%= projectName %>.domain.repository.UserRepository;

/**
 * Domain Service: business logic that doesn't naturally fit in an entity.
 */
public class UserDomainService {
    private final UserRepository userRepository;

    public UserDomainService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public boolean isEmailUnique(String email) {
        return userRepository.findAll().stream()
            .noneMatch(a -> a.getUser().getEmail().value().equalsIgnoreCase(email));
    }
}
`,
    },
    // ── Application layer ───────────────────────────────
    {
      path: 'src/main/java/com/<%= projectName %>/application/service/UserApplicationService.java',
      content: `package com.<%= projectName %>.application.service;

import com.<%= projectName %>.application.dto.UserResponse;
import com.<%= projectName %>.domain.model.aggregate.UserAggregate;
import com.<%= projectName %>.domain.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserApplicationService {
    private final UserRepository userRepository;

    public UserApplicationService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
            .map(a -> UserResponse.from(a.getUser()))
            .collect(Collectors.toList());
    }

    public UserResponse createUser(String name, String email) {
        UserAggregate aggregate = UserAggregate.create(name, email);
        userRepository.save(aggregate);
        return UserResponse.from(aggregate.getUser());
    }
}
`,
    },
    {
      path: 'src/main/java/com/<%= projectName %>/application/dto/UserResponse.java',
      content: `package com.<%= projectName %>.application.dto;

import com.<%= projectName %>.domain.model.entity.User;

public record UserResponse(String id, String name, String email) {
    public static UserResponse from(User user) {
        return new UserResponse(user.getId().toString(), user.getName(), user.getEmail().toString());
    }
}
`,
    },
    // ── Infrastructure layer ────────────────────────────
    {
      path: 'src/main/java/com/<%= projectName %>/infrastructure/persistence/InMemoryUserRepository.java',
      content: `package com.<%= projectName %>.infrastructure.persistence;

import com.<%= projectName %>.domain.model.aggregate.UserAggregate;
import com.<%= projectName %>.domain.model.valueobject.UserId;
import com.<%= projectName %>.domain.repository.UserRepository;
import org.springframework.stereotype.Repository;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Repository
public class InMemoryUserRepository implements UserRepository {
    private final Map<String, UserAggregate> store = new ConcurrentHashMap<>();

    @Override
    public Optional<UserAggregate> findById(UserId id) {
        return Optional.ofNullable(store.get(id.toString()));
    }

    @Override
    public List<UserAggregate> findAll() {
        return new ArrayList<>(store.values());
    }

    @Override
    public UserAggregate save(UserAggregate aggregate) {
        store.put(aggregate.getId().toString(), aggregate);
        return aggregate;
    }

    @Override
    public void delete(UserId id) { store.remove(id.toString()); }
}
`,
    },
    // ── Presentation layer ──────────────────────────────
    {
      path: 'src/main/java/com/<%= projectName %>/presentation/controller/UserController.java',
      content: `package com.<%= projectName %>.presentation.controller;

import com.<%= projectName %>.application.dto.UserResponse;
import com.<%= projectName %>.application.service.UserApplicationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserApplicationService userService;

    public UserController(UserApplicationService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<UserResponse>> getAll() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PostMapping
    public ResponseEntity<UserResponse> create(@RequestBody CreateUserRequest req) {
        return ResponseEntity.ok(userService.createUser(req.name(), req.email()));
    }

    record CreateUserRequest(String name, String email) {}
}
`,
    },
  ],
  postMessages: [
    'Run `gradle wrapper` then `./gradlew bootRun`',
    'Architecture: DDD Tactical — Aggregates, Entities, Value Objects, Domain Events',
    'Domain layer is PURE — no framework dependencies',
  ],
};

// ── .NET DDD ────────────────────────────────────────────

export const dotnetDDDManifest: TemplateManifest = {
  stack: 'dotnet',
  architecture: 'ddd',
  files: [
    {
      path: '<%= projectName %>.sln',
      content: `
Microsoft Visual Studio Solution File, Format Version 12.00
# Generated by ArchForge — DDD Tactical
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
      path: 'src/Domain/Model/Aggregates/UserAggregate.cs',
      content: `using <%= projectName %>.Domain.Model.Entities;
using <%= projectName %>.Domain.Model.ValueObjects;
using <%= projectName %>.Domain.Events;

namespace <%= projectName %>.Domain.Model.Aggregates;

public class UserAggregate
{
    public UserId Id { get; }
    public User User { get; }
    private readonly List<object> _domainEvents = new();
    public IReadOnlyList<object> DomainEvents => _domainEvents.AsReadOnly();

    private UserAggregate(UserId id, User user) { Id = id; User = user; }

    public static UserAggregate Create(string name, string email)
    {
        var id = UserId.Generate();
        var user = new User(id, name, new Email(email), DateTime.UtcNow);
        var aggregate = new UserAggregate(id, user);
        aggregate._domainEvents.Add(new UserCreatedEvent(id, name, email));
        return aggregate;
    }

    public void ClearEvents() => _domainEvents.Clear();
}
`,
    },
    {
      path: 'src/Domain/Model/Entities/User.cs',
      content: `using <%= projectName %>.Domain.Model.ValueObjects;

namespace <%= projectName %>.Domain.Model.Entities;

public class User
{
    public UserId Id { get; }
    public string Name { get; private set; }
    public Email Email { get; }
    public DateTime CreatedAt { get; }

    public User(UserId id, string name, Email email, DateTime createdAt)
    {
        Id = id; Name = name; Email = email; CreatedAt = createdAt;
    }

    public void ChangeName(string newName)
    {
        if (string.IsNullOrWhiteSpace(newName)) throw new ArgumentException("Name cannot be blank");
        Name = newName;
    }
}
`,
    },
    {
      path: 'src/Domain/Model/ValueObjects/UserId.cs',
      content: `namespace <%= projectName %>.Domain.Model.ValueObjects;

public record UserId(Guid Value)
{
    public static UserId Generate() => new(Guid.NewGuid());
    public static UserId From(string id) => new(Guid.Parse(id));
    public override string ToString() => Value.ToString();
}
`,
    },
    {
      path: 'src/Domain/Model/ValueObjects/Email.cs',
      content: `using System.Text.RegularExpressions;

namespace <%= projectName %>.Domain.Model.ValueObjects;

public partial record Email
{
    public string Value { get; }

    public Email(string value)
    {
        if (!EmailRegex().IsMatch(value)) throw new ArgumentException("Invalid email: " + value);
        Value = value;
    }

    public override string ToString() => Value;

    [GeneratedRegex(@"^[\\w.+-]+@[\\w-]+\\.[\\w.]+$")]
    private static partial Regex EmailRegex();
}
`,
    },
    {
      path: 'src/Domain/Events/UserCreatedEvent.cs',
      content: `using <%= projectName %>.Domain.Model.ValueObjects;

namespace <%= projectName %>.Domain.Events;

public record UserCreatedEvent(UserId UserId, string Name, string Email, DateTime OccurredAt)
{
    public UserCreatedEvent(UserId userId, string name, string email)
        : this(userId, name, email, DateTime.UtcNow) { }
}
`,
    },
    {
      path: 'src/Domain/Repository/IUserRepository.cs',
      content: `using <%= projectName %>.Domain.Model.Aggregates;
using <%= projectName %>.Domain.Model.ValueObjects;

namespace <%= projectName %>.Domain.Repository;

public interface IUserRepository
{
    Task<UserAggregate?> FindByIdAsync(UserId id);
    Task<IEnumerable<UserAggregate>> FindAllAsync();
    Task<UserAggregate> SaveAsync(UserAggregate aggregate);
    Task DeleteAsync(UserId id);
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
      path: 'src/Application/Services/UserApplicationService.cs',
      content: `using <%= projectName %>.Domain.Model.Aggregates;
using <%= projectName %>.Domain.Repository;

namespace <%= projectName %>.Application.Services;

public class UserApplicationService
{
    private readonly IUserRepository _repo;
    public UserApplicationService(IUserRepository repo) { _repo = repo; }

    public async Task<IEnumerable<UserAggregate>> GetAllAsync() => await _repo.FindAllAsync();

    public async Task<UserAggregate> CreateAsync(string name, string email)
    {
        var aggregate = UserAggregate.Create(name, email);
        return await _repo.SaveAsync(aggregate);
    }
}
`,
    },
    // Infrastructure
    {
      path: 'src/Infrastructure/<%= projectName %>.Infrastructure.csproj',
      content: `<Project Sdk="Microsoft.NET.Sdk">
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
      path: 'src/Infrastructure/Persistence/InMemoryUserRepository.cs',
      content: `using System.Collections.Concurrent;
using <%= projectName %>.Domain.Model.Aggregates;
using <%= projectName %>.Domain.Model.ValueObjects;
using <%= projectName %>.Domain.Repository;

namespace <%= projectName %>.Infrastructure.Persistence;

public class InMemoryUserRepository : IUserRepository
{
    private readonly ConcurrentDictionary<string, UserAggregate> _store = new();

    public Task<UserAggregate?> FindByIdAsync(UserId id) =>
        Task.FromResult(_store.TryGetValue(id.ToString(), out var a) ? a : null);

    public Task<IEnumerable<UserAggregate>> FindAllAsync() =>
        Task.FromResult<IEnumerable<UserAggregate>>(_store.Values);

    public Task<UserAggregate> SaveAsync(UserAggregate aggregate)
    {
        _store[aggregate.Id.ToString()] = aggregate;
        return Task.FromResult(aggregate);
    }

    public Task DeleteAsync(UserId id) { _store.TryRemove(id.ToString(), out _); return Task.CompletedTask; }
}
`,
    },
    // Presentation
    {
      path: 'src/WebApi/<%= projectName %>.WebApi.csproj',
      content: `<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
  </PropertyGroup>
  <ItemGroup>
    <ProjectReference Include="../Infrastructure/<%= projectName %>.Infrastructure.csproj" />
  </ItemGroup>
</Project>
`,
    },
    {
      path: 'src/WebApi/Program.cs',
      content: `using <%= projectName %>.Application.Services;
using <%= projectName %>.Domain.Repository;
using <%= projectName %>.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddSingleton<IUserRepository, InMemoryUserRepository>();
builder.Services.AddTransient<UserApplicationService>();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();
if (app.Environment.IsDevelopment()) { app.UseSwagger(); app.UseSwaggerUI(); }
app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();
app.Run();
`,
    },
    {
      path: 'src/WebApi/Controllers/UsersController.cs',
      content: `using <%= projectName %>.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace <%= projectName %>.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly UserApplicationService _service;
    public UsersController(UserApplicationService service) { _service = service; }

    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await _service.GetAllAsync());

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateUserRequest req)
        => Ok(await _service.CreateAsync(req.Name, req.Email));
}

public record CreateUserRequest(string Name, string Email);
`,
    },
  ],
  postMessages: [
    'Run `dotnet restore && dotnet run --project src/WebApi`',
    'Architecture: DDD Tactical — Aggregates, Entities, Value Objects, Domain Events',
    'Domain layer is PURE — no framework dependencies',
  ],
};
