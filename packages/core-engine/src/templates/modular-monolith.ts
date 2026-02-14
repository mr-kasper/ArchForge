// ─────────────────────────────────────────────────────────
// Modular Monolith Templates
// Java (Spring Boot) + .NET (ASP.NET Core)
// ─────────────────────────────────────────────────────────

import { TemplateManifest } from '../types';

// ── Java Modular Monolith ───────────────────────────────

export const javaModularMonolithManifest: TemplateManifest = {
  stack: 'java',
  architecture: 'modular-monolith',
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
    // ── Shared Kernel ───────────────────────────────────
    {
      path: 'src/main/java/com/<%= projectName %>/shared/DomainEvent.java',
      content: `package com.<%= projectName %>.shared;

import java.time.Instant;
import java.util.UUID;

public abstract class DomainEvent {
    private final String eventId = UUID.randomUUID().toString();
    private final Instant occurredAt = Instant.now();

    public String getEventId() { return eventId; }
    public Instant getOccurredAt() { return occurredAt; }
}
`,
    },
    {
      path: 'src/main/java/com/<%= projectName %>/shared/EventBus.java',
      content: `package com.<%= projectName %>.shared;

import org.springframework.stereotype.Component;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Consumer;

/**
 * Simple in-process event bus for module communication.
 * Modules publish events; other modules subscribe.
 */
@Component
public class EventBus {
    private final Map<Class<?>, List<Consumer<DomainEvent>>> handlers = new ConcurrentHashMap<>();

    @SuppressWarnings("unchecked")
    public <T extends DomainEvent> void subscribe(Class<T> type, Consumer<T> handler) {
        handlers.computeIfAbsent(type, k -> new ArrayList<>())
            .add(e -> handler.accept((T) e));
    }

    public void publish(DomainEvent event) {
        var list = handlers.getOrDefault(event.getClass(), List.of());
        list.forEach(h -> h.accept(event));
    }
}
`,
    },
    // ── Users Module ────────────────────────────────────
    {
      path: 'src/main/java/com/<%= projectName %>/modules/users/api/UserModuleApi.java',
      content: `package com.<%= projectName %>.modules.users.api;

import com.<%= projectName %>.modules.users.dto.UserDTO;
import java.util.List;
import java.util.Optional;

/**
 * Public API of the Users module.
 * Other modules depend on THIS INTERFACE, not internal classes.
 */
public interface UserModuleApi {
    List<UserDTO> findAll();
    Optional<UserDTO> findById(String id);
    UserDTO create(String name, String email);
}
`,
    },
    {
      path: 'src/main/java/com/<%= projectName %>/modules/users/dto/UserDTO.java',
      content: `package com.<%= projectName %>.modules.users.dto;

public record UserDTO(String id, String name, String email) {}
`,
    },
    {
      path: 'src/main/java/com/<%= projectName %>/modules/users/internal/UserEntity.java',
      content: `package com.<%= projectName %>.modules.users.internal;

import java.time.LocalDateTime;

class UserEntity {
    String id;
    String name;
    String email;
    LocalDateTime createdAt;

    UserEntity(String id, String name, String email) {
        this.id = id; this.name = name; this.email = email; this.createdAt = LocalDateTime.now();
    }
}
`,
    },
    {
      path: 'src/main/java/com/<%= projectName %>/modules/users/internal/UserModuleService.java',
      content: `package com.<%= projectName %>.modules.users.internal;

import com.<%= projectName %>.modules.users.api.UserModuleApi;
import com.<%= projectName %>.modules.users.dto.UserDTO;
import com.<%= projectName %>.modules.users.events.UserCreatedEvent;
import com.<%= projectName %>.shared.EventBus;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
class UserModuleService implements UserModuleApi {
    private final Map<String, UserEntity> store = new ConcurrentHashMap<>();
    private final EventBus eventBus;

    UserModuleService(EventBus eventBus) { this.eventBus = eventBus; }

    @Override
    public List<UserDTO> findAll() {
        return store.values().stream().map(u -> new UserDTO(u.id, u.name, u.email)).toList();
    }

    @Override
    public Optional<UserDTO> findById(String id) {
        return Optional.ofNullable(store.get(id)).map(u -> new UserDTO(u.id, u.name, u.email));
    }

    @Override
    public UserDTO create(String name, String email) {
        UserEntity e = new UserEntity(UUID.randomUUID().toString(), name, email);
        store.put(e.id, e);
        eventBus.publish(new UserCreatedEvent(e.id, e.name, e.email));
        return new UserDTO(e.id, e.name, e.email);
    }
}
`,
    },
    {
      path: 'src/main/java/com/<%= projectName %>/modules/users/events/UserCreatedEvent.java',
      content: `package com.<%= projectName %>.modules.users.events;

import com.<%= projectName %>.shared.DomainEvent;

public class UserCreatedEvent extends DomainEvent {
    private final String userId;
    private final String name;
    private final String email;

    public UserCreatedEvent(String userId, String name, String email) {
        this.userId = userId; this.name = name; this.email = email;
    }

    public String getUserId() { return userId; }
    public String getName() { return name; }
    public String getEmail() { return email; }
}
`,
    },
    {
      path: 'src/main/java/com/<%= projectName %>/modules/users/controller/UserController.java',
      content: `package com.<%= projectName %>.modules.users.controller;

import com.<%= projectName %>.modules.users.api.UserModuleApi;
import com.<%= projectName %>.modules.users.dto.UserDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserModuleApi api;
    public UserController(UserModuleApi api) { this.api = api; }

    @GetMapping public List<UserDTO> list() { return api.findAll(); }
    @PostMapping public ResponseEntity<UserDTO> create(@RequestBody CreateUserReq req) {
        return ResponseEntity.ok(api.create(req.name(), req.email()));
    }

    record CreateUserReq(String name, String email) {}
}
`,
    },
    // ── Billing Module ──────────────────────────────────
    {
      path: 'src/main/java/com/<%= projectName %>/modules/billing/api/BillingModuleApi.java',
      content: `package com.<%= projectName %>.modules.billing.api;

public interface BillingModuleApi {
    String getAccountStatus(String userId);
}
`,
    },
    {
      path: 'src/main/java/com/<%= projectName %>/modules/billing/internal/BillingModuleService.java',
      content: `package com.<%= projectName %>.modules.billing.internal;

import com.<%= projectName %>.modules.billing.api.BillingModuleApi;
import com.<%= projectName %>.modules.users.events.UserCreatedEvent;
import com.<%= projectName %>.shared.EventBus;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
class BillingModuleService implements BillingModuleApi {
    private final Set<String> accounts = ConcurrentHashMap.newKeySet();
    private final EventBus eventBus;

    BillingModuleService(EventBus eventBus) { this.eventBus = eventBus; }

    @PostConstruct
    void init() {
        eventBus.subscribe(UserCreatedEvent.class, e -> {
            accounts.add(e.getUserId());
            System.out.println("[Billing] Account created for user " + e.getUserId());
        });
    }

    @Override
    public String getAccountStatus(String userId) {
        return accounts.contains(userId) ? "ACTIVE" : "NOT_FOUND";
    }
}
`,
    },
    // ── Notifications Module ────────────────────────────
    {
      path: 'src/main/java/com/<%= projectName %>/modules/notifications/internal/NotificationListener.java',
      content: `package com.<%= projectName %>.modules.notifications.internal;

import com.<%= projectName %>.modules.users.events.UserCreatedEvent;
import com.<%= projectName %>.shared.EventBus;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;

@Component
class NotificationListener {
    private final EventBus eventBus;
    NotificationListener(EventBus eventBus) { this.eventBus = eventBus; }

    @PostConstruct
    void init() {
        eventBus.subscribe(UserCreatedEvent.class, e ->
            System.out.println("[Notifications] Welcome email sent to " + e.getEmail())
        );
    }
}
`,
    },
  ],
  postMessages: [
    'Run `gradle wrapper` then `./gradlew bootRun`',
    'Architecture: Modular Monolith — isolated modules with public APIs & event bus',
    'Modules communicate via interfaces and domain events, never internal classes',
  ],
};

// ── .NET Modular Monolith ───────────────────────────────

export const dotnetModularMonolithManifest: TemplateManifest = {
  stack: 'dotnet',
  architecture: 'modular-monolith',
  files: [
    {
      path: '<%= projectName %>.sln',
      content: `
Microsoft Visual Studio Solution File, Format Version 12.00
# Generated by ArchForge — Modular Monolith
`,
    },
    // Shared Kernel
    {
      path: 'src/Shared/<%= projectName %>.Shared.csproj',
      content: `<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup><TargetFramework>net8.0</TargetFramework><ImplicitUsings>enable</ImplicitUsings><Nullable>enable</Nullable></PropertyGroup>
</Project>
`,
    },
    {
      path: 'src/Shared/Events/DomainEvent.cs',
      content: `namespace <%= projectName %>.Shared.Events;

public abstract class DomainEvent
{
    public string EventId { get; } = Guid.NewGuid().ToString();
    public DateTime OccurredAt { get; } = DateTime.UtcNow;
}
`,
    },
    {
      path: 'src/Shared/Events/IEventBus.cs',
      content: `namespace <%= projectName %>.Shared.Events;

public interface IEventBus
{
    void Publish(DomainEvent evt);
    void Subscribe<T>(Action<T> handler) where T : DomainEvent;
}
`,
    },
    {
      path: 'src/Shared/Events/InProcessEventBus.cs',
      content: `namespace <%= projectName %>.Shared.Events;

public class InProcessEventBus : IEventBus
{
    private readonly Dictionary<Type, List<Delegate>> _handlers = new();

    public void Subscribe<T>(Action<T> handler) where T : DomainEvent
    {
        var type = typeof(T);
        if (!_handlers.ContainsKey(type)) _handlers[type] = new();
        _handlers[type].Add(handler);
    }

    public void Publish(DomainEvent evt)
    {
        if (_handlers.TryGetValue(evt.GetType(), out var list))
            foreach (var h in list) h.DynamicInvoke(evt);
    }
}
`,
    },
    // Users Module
    {
      path: 'src/Modules/Users/<%= projectName %>.Users.csproj',
      content: `<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup><TargetFramework>net8.0</TargetFramework><ImplicitUsings>enable</ImplicitUsings><Nullable>enable</Nullable></PropertyGroup>
  <ItemGroup><ProjectReference Include="../../Shared/<%= projectName %>.Shared.csproj" /></ItemGroup>
</Project>
`,
    },
    {
      path: 'src/Modules/Users/Api/IUserModule.cs',
      content: `namespace <%= projectName %>.Users.Api;

public record UserDto(string Id, string Name, string Email);

public interface IUserModule
{
    IEnumerable<UserDto> GetAll();
    UserDto Create(string name, string email);
}
`,
    },
    {
      path: 'src/Modules/Users/Internal/UserModuleService.cs',
      content: `using System.Collections.Concurrent;
using <%= projectName %>.Shared.Events;
using <%= projectName %>.Users.Api;
using <%= projectName %>.Users.Events;

namespace <%= projectName %>.Users.Internal;

internal class UserModuleService : IUserModule
{
    private readonly ConcurrentDictionary<string, UserDto> _store = new();
    private readonly IEventBus _bus;

    public UserModuleService(IEventBus bus) { _bus = bus; }

    public IEnumerable<UserDto> GetAll() => _store.Values;

    public UserDto Create(string name, string email)
    {
        var dto = new UserDto(Guid.NewGuid().ToString(), name, email);
        _store[dto.Id] = dto;
        _bus.Publish(new UserCreatedEvent(dto.Id, name, email));
        return dto;
    }
}
`,
    },
    {
      path: 'src/Modules/Users/Events/UserCreatedEvent.cs',
      content: `using <%= projectName %>.Shared.Events;

namespace <%= projectName %>.Users.Events;

public class UserCreatedEvent : DomainEvent
{
    public string UserId { get; }
    public string Name { get; }
    public string Email { get; }
    public UserCreatedEvent(string userId, string name, string email) { UserId = userId; Name = name; Email = email; }
}
`,
    },
    {
      path: 'src/Modules/Users/Extensions.cs',
      content: `using Microsoft.Extensions.DependencyInjection;
using <%= projectName %>.Users.Api;
using <%= projectName %>.Users.Internal;

namespace <%= projectName %>.Users;

public static class UsersModuleExtensions
{
    public static IServiceCollection AddUsersModule(this IServiceCollection services)
        => services.AddSingleton<IUserModule, UserModuleService>();
}
`,
    },
    // Billing Module
    {
      path: 'src/Modules/Billing/<%= projectName %>.Billing.csproj',
      content: `<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup><TargetFramework>net8.0</TargetFramework><ImplicitUsings>enable</ImplicitUsings><Nullable>enable</Nullable></PropertyGroup>
  <ItemGroup>
    <ProjectReference Include="../../Shared/<%= projectName %>.Shared.csproj" />
    <ProjectReference Include="../Users/<%= projectName %>.Users.csproj" />
  </ItemGroup>
</Project>
`,
    },
    {
      path: 'src/Modules/Billing/Internal/BillingModuleService.cs',
      content: `using <%= projectName %>.Shared.Events;
using <%= projectName %>.Users.Events;

namespace <%= projectName %>.Billing.Internal;

internal class BillingModuleService : IHostedService
{
    private readonly IEventBus _bus;
    public BillingModuleService(IEventBus bus) { _bus = bus; }

    public Task StartAsync(CancellationToken ct)
    {
        _bus.Subscribe<UserCreatedEvent>(e =>
            Console.WriteLine($"[Billing] Account provisioned for {e.UserId}")
        );
        return Task.CompletedTask;
    }

    public Task StopAsync(CancellationToken ct) => Task.CompletedTask;
}
`,
    },
    {
      path: 'src/Modules/Billing/Extensions.cs',
      content: `using Microsoft.Extensions.DependencyInjection;
using <%= projectName %>.Billing.Internal;

namespace <%= projectName %>.Billing;

public static class BillingModuleExtensions
{
    public static IServiceCollection AddBillingModule(this IServiceCollection services)
        => services.AddHostedService<BillingModuleService>();
}
`,
    },
    // Host
    {
      path: 'src/Host/<%= projectName %>.Host.csproj',
      content: `<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup><TargetFramework>net8.0</TargetFramework><ImplicitUsings>enable</ImplicitUsings><Nullable>enable</Nullable></PropertyGroup>
  <ItemGroup>
    <ProjectReference Include="../Shared/<%= projectName %>.Shared.csproj" />
    <ProjectReference Include="../Modules/Users/<%= projectName %>.Users.csproj" />
    <ProjectReference Include="../Modules/Billing/<%= projectName %>.Billing.csproj" />
  </ItemGroup>
</Project>
`,
    },
    {
      path: 'src/Host/Program.cs',
      content: `using <%= projectName %>.Shared.Events;
using <%= projectName %>.Users;
using <%= projectName %>.Billing;

var builder = WebApplication.CreateBuilder(args);

// Shared infrastructure
builder.Services.AddSingleton<IEventBus, InProcessEventBus>();

// Register modules
builder.Services.AddUsersModule();
builder.Services.AddBillingModule();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();
if (app.Environment.IsDevelopment()) { app.UseSwagger(); app.UseSwaggerUI(); }
app.MapControllers();
app.Run();
`,
    },
    {
      path: 'src/Host/Controllers/UsersController.cs',
      content: `using <%= projectName %>.Users.Api;
using Microsoft.AspNetCore.Mvc;

namespace <%= projectName %>.Host.Controllers;

[ApiController, Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserModule _users;
    public UsersController(IUserModule users) { _users = users; }

    [HttpGet] public IActionResult GetAll() => Ok(_users.GetAll());
    [HttpPost] public IActionResult Create([FromBody] CreateReq req) => Ok(_users.Create(req.Name, req.Email));
}

public record CreateReq(string Name, string Email);
`,
    },
  ],
  postMessages: [
    'Run `dotnet restore && dotnet run --project src/Host`',
    'Architecture: Modular Monolith — isolated modules with public APIs & event bus',
    'Modules communicate via interfaces and domain events only',
  ],
};
