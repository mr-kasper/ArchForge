// ─────────────────────────────────────────────────────────
// CQRS (Command Query Responsibility Segregation) Templates
// Java (Spring Boot) + .NET (ASP.NET Core)
// ─────────────────────────────────────────────────────────

import { TemplateManifest } from '../types';

// ── Java CQRS ───────────────────────────────────────────

export const javaCQRSManifest: TemplateManifest = {
  stack: 'java',
  architecture: 'cqrs',
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
    // ── Shared / Domain ─────────────────────────────────
    {
      path: 'src/main/java/com/<%= projectName %>/domain/model/User.java',
      content: `package com.<%= projectName %>.domain.model;

import java.time.LocalDateTime;

public class User {
    private String id;
    private String name;
    private String email;
    private LocalDateTime createdAt;

    public User(String id, String name, String email) {
        this.id = id; this.name = name; this.email = email; this.createdAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setName(String name) { this.name = name; }
    public void setEmail(String email) { this.email = email; }
}
`,
    },
    // ── Commands (Write side) ───────────────────────────
    {
      path: 'src/main/java/com/<%= projectName %>/command/CreateUserCommand.java',
      content: `package com.<%= projectName %>.command;

/**
 * Command: intent to create a user.
 * Commands are immutable data carriers — no business logic.
 */
public record CreateUserCommand(String name, String email) {}
`,
    },
    {
      path: 'src/main/java/com/<%= projectName %>/command/UpdateUserCommand.java',
      content: `package com.<%= projectName %>.command;

public record UpdateUserCommand(String id, String name, String email) {}
`,
    },
    {
      path: 'src/main/java/com/<%= projectName %>/command/DeleteUserCommand.java',
      content: `package com.<%= projectName %>.command;

public record DeleteUserCommand(String id) {}
`,
    },
    {
      path: 'src/main/java/com/<%= projectName %>/command/handler/CreateUserHandler.java',
      content: `package com.<%= projectName %>.command.handler;

import com.<%= projectName %>.command.CreateUserCommand;
import com.<%= projectName %>.domain.model.User;
import com.<%= projectName %>.writemodel.UserWriteRepository;
import org.springframework.stereotype.Component;
import java.util.UUID;

@Component
public class CreateUserHandler {
    private final UserWriteRepository repo;
    public CreateUserHandler(UserWriteRepository repo) { this.repo = repo; }

    public String handle(CreateUserCommand cmd) {
        User user = new User(UUID.randomUUID().toString(), cmd.name(), cmd.email());
        repo.save(user);
        return user.getId();
    }
}
`,
    },
    {
      path: 'src/main/java/com/<%= projectName %>/command/handler/UpdateUserHandler.java',
      content: `package com.<%= projectName %>.command.handler;

import com.<%= projectName %>.command.UpdateUserCommand;
import com.<%= projectName %>.writemodel.UserWriteRepository;
import org.springframework.stereotype.Component;

@Component
public class UpdateUserHandler {
    private final UserWriteRepository repo;
    public UpdateUserHandler(UserWriteRepository repo) { this.repo = repo; }

    public void handle(UpdateUserCommand cmd) {
        var user = repo.findById(cmd.id()).orElseThrow(() -> new RuntimeException("User not found"));
        user.setName(cmd.name());
        user.setEmail(cmd.email());
        repo.save(user);
    }
}
`,
    },
    {
      path: 'src/main/java/com/<%= projectName %>/command/handler/DeleteUserHandler.java',
      content: `package com.<%= projectName %>.command.handler;

import com.<%= projectName %>.command.DeleteUserCommand;
import com.<%= projectName %>.writemodel.UserWriteRepository;
import org.springframework.stereotype.Component;

@Component
public class DeleteUserHandler {
    private final UserWriteRepository repo;
    public DeleteUserHandler(UserWriteRepository repo) { this.repo = repo; }

    public void handle(DeleteUserCommand cmd) { repo.delete(cmd.id()); }
}
`,
    },
    // ── Write Model (persistence) ───────────────────────
    {
      path: 'src/main/java/com/<%= projectName %>/writemodel/UserWriteRepository.java',
      content: `package com.<%= projectName %>.writemodel;

import com.<%= projectName %>.domain.model.User;
import java.util.Optional;

public interface UserWriteRepository {
    Optional<User> findById(String id);
    User save(User user);
    void delete(String id);
}
`,
    },
    {
      path: 'src/main/java/com/<%= projectName %>/writemodel/InMemoryUserWriteRepository.java',
      content: `package com.<%= projectName %>.writemodel;

import com.<%= projectName %>.domain.model.User;
import org.springframework.stereotype.Repository;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Repository
public class InMemoryUserWriteRepository implements UserWriteRepository {
    private final Map<String, User> store = new ConcurrentHashMap<>();

    @Override public Optional<User> findById(String id) { return Optional.ofNullable(store.get(id)); }
    @Override public User save(User user) { store.put(user.getId(), user); return user; }
    @Override public void delete(String id) { store.remove(id); }

    /** Exposed for the read-model sync (in a real system this would be event-driven). */
    public Collection<User> findAll() { return store.values(); }
}
`,
    },
    // ── Queries (Read side) ─────────────────────────────
    {
      path: 'src/main/java/com/<%= projectName %>/query/GetAllUsersQuery.java',
      content: `package com.<%= projectName %>.query;

/** Marker class for queries. In a full impl, queries carry filter/sort params. */
public record GetAllUsersQuery() {}
`,
    },
    {
      path: 'src/main/java/com/<%= projectName %>/query/GetUserByIdQuery.java',
      content: `package com.<%= projectName %>.query;

public record GetUserByIdQuery(String id) {}
`,
    },
    {
      path: 'src/main/java/com/<%= projectName %>/query/handler/GetAllUsersHandler.java',
      content: `package com.<%= projectName %>.query.handler;

import com.<%= projectName %>.readmodel.UserReadModel;
import com.<%= projectName %>.readmodel.UserReadRepository;
import org.springframework.stereotype.Component;
import java.util.List;

@Component
public class GetAllUsersHandler {
    private final UserReadRepository repo;
    public GetAllUsersHandler(UserReadRepository repo) { this.repo = repo; }

    public List<UserReadModel> handle() { return repo.findAll(); }
}
`,
    },
    // ── Read Model (optimised for queries) ──────────────
    {
      path: 'src/main/java/com/<%= projectName %>/readmodel/UserReadModel.java',
      content: `package com.<%= projectName %>.readmodel;

/** Flat read-optimised projection — may differ from the write model. */
public record UserReadModel(String id, String name, String email) {}
`,
    },
    {
      path: 'src/main/java/com/<%= projectName %>/readmodel/UserReadRepository.java',
      content: `package com.<%= projectName %>.readmodel;

import com.<%= projectName %>.writemodel.InMemoryUserWriteRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * In a real system the read-model is separate storage populated by events.
 * Here we project from the write store for simplicity.
 */
@Repository
public class UserReadRepository {
    private final InMemoryUserWriteRepository writeRepo;
    public UserReadRepository(InMemoryUserWriteRepository writeRepo) { this.writeRepo = writeRepo; }

    public List<UserReadModel> findAll() {
        return writeRepo.findAll().stream()
            .map(u -> new UserReadModel(u.getId(), u.getName(), u.getEmail()))
            .toList();
    }
}
`,
    },
    // ── API ─────────────────────────────────────────────
    {
      path: 'src/main/java/com/<%= projectName %>/api/UserCommandController.java',
      content: `package com.<%= projectName %>.api;

import com.<%= projectName %>.command.*;
import com.<%= projectName %>.command.handler.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserCommandController {
    private final CreateUserHandler createHandler;
    private final UpdateUserHandler updateHandler;
    private final DeleteUserHandler deleteHandler;

    public UserCommandController(CreateUserHandler c, UpdateUserHandler u, DeleteUserHandler d) {
        this.createHandler = c; this.updateHandler = u; this.deleteHandler = d;
    }

    @PostMapping
    public ResponseEntity<String> create(@RequestBody CreateUserCommand cmd) {
        return ResponseEntity.ok(createHandler.handle(cmd));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> update(@PathVariable String id, @RequestBody UpdateUserCommand cmd) {
        updateHandler.handle(new UpdateUserCommand(id, cmd.name(), cmd.email()));
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        deleteHandler.handle(new DeleteUserCommand(id));
        return ResponseEntity.noContent().build();
    }
}
`,
    },
    {
      path: 'src/main/java/com/<%= projectName %>/api/UserQueryController.java',
      content: `package com.<%= projectName %>.api;

import com.<%= projectName %>.query.handler.GetAllUsersHandler;
import com.<%= projectName %>.readmodel.UserReadModel;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserQueryController {
    private final GetAllUsersHandler queryHandler;
    public UserQueryController(GetAllUsersHandler qh) { this.queryHandler = qh; }

    @GetMapping
    public ResponseEntity<List<UserReadModel>> getAll() {
        return ResponseEntity.ok(queryHandler.handle());
    }
}
`,
    },
  ],
  postMessages: [
    'Run `gradle wrapper` then `./gradlew bootRun`',
    'Architecture: CQRS — separate Command (write) and Query (read) paths',
    'Commands mutate state, Queries are read-only projections',
  ],
};

// ── .NET CQRS ───────────────────────────────────────────

export const dotnetCQRSManifest: TemplateManifest = {
  stack: 'dotnet',
  architecture: 'cqrs',
  files: [
    {
      path: '<%= projectName %>.sln',
      content: `
Microsoft Visual Studio Solution File, Format Version 12.00
# Generated by ArchForge — CQRS
`,
    },
    {
      path: 'src/Domain/<%= projectName %>.Domain.csproj',
      content: `<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup><TargetFramework>net8.0</TargetFramework><ImplicitUsings>enable</ImplicitUsings><Nullable>enable</Nullable></PropertyGroup>
</Project>
`,
    },
    {
      path: 'src/Domain/User.cs',
      content: `namespace <%= projectName %>.Domain;

public class User
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
`,
    },
    // Commands
    {
      path: 'src/Application/<%= projectName %>.Application.csproj',
      content: `<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup><TargetFramework>net8.0</TargetFramework><ImplicitUsings>enable</ImplicitUsings><Nullable>enable</Nullable></PropertyGroup>
  <ItemGroup><ProjectReference Include="../Domain/<%= projectName %>.Domain.csproj" /></ItemGroup>
</Project>
`,
    },
    {
      path: 'src/Application/Commands/CreateUserCommand.cs',
      content: `namespace <%= projectName %>.Application.Commands;

public record CreateUserCommand(string Name, string Email);
`,
    },
    {
      path: 'src/Application/Commands/Handlers/CreateUserHandler.cs',
      content: `using <%= projectName %>.Domain;

namespace <%= projectName %>.Application.Commands.Handlers;

public class CreateUserHandler
{
    private readonly IUserWriteRepository _repo;
    public CreateUserHandler(IUserWriteRepository repo) { _repo = repo; }

    public async Task<string> HandleAsync(CreateUserCommand cmd)
    {
        var user = new User { Name = cmd.Name, Email = cmd.Email };
        await _repo.SaveAsync(user);
        return user.Id;
    }
}
`,
    },
    {
      path: 'src/Application/Commands/IUserWriteRepository.cs',
      content: `using <%= projectName %>.Domain;

namespace <%= projectName %>.Application.Commands;

public interface IUserWriteRepository
{
    Task SaveAsync(User user);
    Task DeleteAsync(string id);
}
`,
    },
    // Queries
    {
      path: 'src/Application/Queries/GetAllUsersQuery.cs',
      content: `namespace <%= projectName %>.Application.Queries;

public record UserReadModel(string Id, string Name, string Email);
`,
    },
    {
      path: 'src/Application/Queries/Handlers/GetAllUsersHandler.cs',
      content: `namespace <%= projectName %>.Application.Queries.Handlers;

public class GetAllUsersHandler
{
    private readonly IUserReadRepository _repo;
    public GetAllUsersHandler(IUserReadRepository repo) { _repo = repo; }

    public async Task<IEnumerable<UserReadModel>> HandleAsync()
        => await _repo.GetAllAsync();
}
`,
    },
    {
      path: 'src/Application/Queries/IUserReadRepository.cs',
      content: `namespace <%= projectName %>.Application.Queries;

public interface IUserReadRepository
{
    Task<IEnumerable<UserReadModel>> GetAllAsync();
}
`,
    },
    // Infrastructure
    {
      path: 'src/Infrastructure/<%= projectName %>.Infrastructure.csproj',
      content: `<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup><TargetFramework>net8.0</TargetFramework><ImplicitUsings>enable</ImplicitUsings><Nullable>enable</Nullable></PropertyGroup>
  <ItemGroup><ProjectReference Include="../Application/<%= projectName %>.Application.csproj" /></ItemGroup>
</Project>
`,
    },
    {
      path: 'src/Infrastructure/Persistence/InMemoryUserRepository.cs',
      content: `using System.Collections.Concurrent;
using <%= projectName %>.Application.Commands;
using <%= projectName %>.Application.Queries;
using <%= projectName %>.Domain;

namespace <%= projectName %>.Infrastructure.Persistence;

public class InMemoryUserRepository : IUserWriteRepository, IUserReadRepository
{
    private readonly ConcurrentDictionary<string, User> _store = new();

    public Task SaveAsync(User user) { _store[user.Id] = user; return Task.CompletedTask; }
    public Task DeleteAsync(string id) { _store.TryRemove(id, out _); return Task.CompletedTask; }
    public Task<IEnumerable<UserReadModel>> GetAllAsync() =>
        Task.FromResult(_store.Values.Select(u => new UserReadModel(u.Id, u.Name, u.Email)));
}
`,
    },
    // WebApi
    {
      path: 'src/WebApi/<%= projectName %>.WebApi.csproj',
      content: `<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup><TargetFramework>net8.0</TargetFramework><ImplicitUsings>enable</ImplicitUsings><Nullable>enable</Nullable></PropertyGroup>
  <ItemGroup><ProjectReference Include="../Infrastructure/<%= projectName %>.Infrastructure.csproj" /></ItemGroup>
</Project>
`,
    },
    {
      path: 'src/WebApi/Program.cs',
      content: `using <%= projectName %>.Application.Commands;
using <%= projectName %>.Application.Commands.Handlers;
using <%= projectName %>.Application.Queries;
using <%= projectName %>.Application.Queries.Handlers;
using <%= projectName %>.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddSingleton<InMemoryUserRepository>();
builder.Services.AddSingleton<IUserWriteRepository>(sp => sp.GetRequiredService<InMemoryUserRepository>());
builder.Services.AddSingleton<IUserReadRepository>(sp => sp.GetRequiredService<InMemoryUserRepository>());
builder.Services.AddTransient<CreateUserHandler>();
builder.Services.AddTransient<GetAllUsersHandler>();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();
if (app.Environment.IsDevelopment()) { app.UseSwagger(); app.UseSwaggerUI(); }
app.UseAuthorization();
app.MapControllers();
app.Run();
`,
    },
    {
      path: 'src/WebApi/Controllers/UsersCommandController.cs',
      content: `using <%= projectName %>.Application.Commands;
using <%= projectName %>.Application.Commands.Handlers;
using Microsoft.AspNetCore.Mvc;

namespace <%= projectName %>.WebApi.Controllers;

[ApiController, Route("api/users")]
public class UsersCommandController : ControllerBase
{
    private readonly CreateUserHandler _handler;
    public UsersCommandController(CreateUserHandler handler) { _handler = handler; }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateUserCommand cmd)
        => Ok(await _handler.HandleAsync(cmd));
}
`,
    },
    {
      path: 'src/WebApi/Controllers/UsersQueryController.cs',
      content: `using <%= projectName %>.Application.Queries.Handlers;
using Microsoft.AspNetCore.Mvc;

namespace <%= projectName %>.WebApi.Controllers;

[ApiController, Route("api/users")]
public class UsersQueryController : ControllerBase
{
    private readonly GetAllUsersHandler _handler;
    public UsersQueryController(GetAllUsersHandler handler) { _handler = handler; }

    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await _handler.HandleAsync());
}
`,
    },
  ],
  postMessages: [
    'Run `dotnet restore && dotnet run --project src/WebApi`',
    'Architecture: CQRS — separate Command (write) and Query (read) stacks',
  ],
};
