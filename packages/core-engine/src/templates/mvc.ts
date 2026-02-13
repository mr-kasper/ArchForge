// ─────────────────────────────────────────────────────────
// MVC (Model-View-Controller) Templates
// Java (Spring Boot) + .NET (ASP.NET Core)
// ─────────────────────────────────────────────────────────

import { TemplateManifest } from '../types';

// ── Java MVC ────────────────────────────────────────────

export const javaMVCManifest: TemplateManifest = {
  stack: 'java',
  architecture: 'mvc',
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
    implementation("org.springframework.boot:spring-boot-starter-thymeleaf")
<% if (database === 'postgresql') { %>    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    runtimeOnly("org.postgresql:postgresql")
<% } else if (database === 'mysql') { %>    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    runtimeOnly("com.mysql:mysql-connector-j")
<% } %>
    compileOnly("org.projectlombok:lombok")
    annotationProcessor("org.projectlombok:lombok")
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
  thymeleaf:
    prefix: classpath:/templates/
    suffix: .html
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
    // ── Model ───────────────────────────────────────────
    {
      path: 'src/main/java/com/<%= projectName %>/model/User.java',
      content: `package com.<%= projectName %>.model;

import java.time.LocalDateTime;

public class User {
    private String id;
    private String name;
    private String email;
    private LocalDateTime createdAt;

    public User() {}
    public User(String id, String name, String email) {
        this.id = id; this.name = name; this.email = email; this.createdAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
`,
    },
    {
      path: 'src/main/java/com/<%= projectName %>/model/dto/CreateUserRequest.java',
      content: `package com.<%= projectName %>.model.dto;

public record CreateUserRequest(String name, String email) {}
`,
    },
    {
      path: 'src/main/java/com/<%= projectName %>/model/dto/UserResponse.java',
      content: `package com.<%= projectName %>.model.dto;

import com.<%= projectName %>.model.User;

public record UserResponse(String id, String name, String email) {
    public static UserResponse from(User user) {
        return new UserResponse(user.getId(), user.getName(), user.getEmail());
    }
}
`,
    },
    // ── Service ─────────────────────────────────────────
    {
      path: 'src/main/java/com/<%= projectName %>/service/UserService.java',
      content: `package com.<%= projectName %>.service;

import com.<%= projectName %>.model.User;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class UserService {
    private final Map<String, User> store = new ConcurrentHashMap<>();

    public List<User> findAll() { return new ArrayList<>(store.values()); }

    public Optional<User> findById(String id) { return Optional.ofNullable(store.get(id)); }

    public User create(String name, String email) {
        User user = new User(UUID.randomUUID().toString(), name, email);
        store.put(user.getId(), user);
        return user;
    }

    public void delete(String id) { store.remove(id); }
}
`,
    },
    // ── Controller (REST) ───────────────────────────────
    {
      path: 'src/main/java/com/<%= projectName %>/controller/api/UserApiController.java',
      content: `package com.<%= projectName %>.controller.api;

import com.<%= projectName %>.model.dto.CreateUserRequest;
import com.<%= projectName %>.model.dto.UserResponse;
import com.<%= projectName %>.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserApiController {
    private final UserService userService;
    public UserApiController(UserService userService) { this.userService = userService; }

    @GetMapping
    public List<UserResponse> list() {
        return userService.findAll().stream().map(UserResponse::from).toList();
    }

    @PostMapping
    public ResponseEntity<UserResponse> create(@RequestBody CreateUserRequest req) {
        return ResponseEntity.ok(UserResponse.from(userService.create(req.name(), req.email())));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
`,
    },
    // ── Controller (View) ───────────────────────────────
    {
      path: 'src/main/java/com/<%= projectName %>/controller/web/UserWebController.java',
      content: `package com.<%= projectName %>.controller.web;

import com.<%= projectName %>.service.UserService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class UserWebController {
    private final UserService userService;
    public UserWebController(UserService userService) { this.userService = userService; }

    @GetMapping("/users")
    public String listUsers(Model model) {
        model.addAttribute("users", userService.findAll());
        return "users/list";
    }
}
`,
    },
    // ── View (Thymeleaf) ────────────────────────────────
    {
      path: 'src/main/resources/templates/users/list.html',
      content: `<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head><title>Users — <%= projectName %></title></head>
<body>
  <h1>Users</h1>
  <table border="1">
    <thead><tr><th>ID</th><th>Name</th><th>Email</th></tr></thead>
    <tbody>
      <tr th:each="user : \${users}">
        <td th:text="\${user.id}"></td>
        <td th:text="\${user.name}"></td>
        <td th:text="\${user.email}"></td>
      </tr>
    </tbody>
  </table>
</body>
</html>
`,
    },
  ],
  postMessages: [
    'Run `gradle wrapper` then `./gradlew bootRun`',
    'Architecture: MVC — Model/View/Controller with both REST API and server-rendered views',
  ],
};

// ── .NET MVC ────────────────────────────────────────────

export const dotnetMVCManifest: TemplateManifest = {
  stack: 'dotnet',
  architecture: 'mvc',
  files: [
    {
      path: '<%= projectName %>.csproj',
      content: `<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
  </PropertyGroup>
</Project>
`,
    },
    {
      path: 'Program.cs',
      content: `var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllersWithViews();
builder.Services.AddSingleton<<%= projectName %>.Services.UserService>();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();
if (app.Environment.IsDevelopment()) { app.UseSwagger(); app.UseSwaggerUI(); }
app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
app.UseAuthorization();
app.MapDefaultControllerRoute();
app.Run();
`,
    },
    // Model
    {
      path: 'Models/User.cs',
      content: `namespace <%= projectName %>.Models;

public class User
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public record CreateUserRequest(string Name, string Email);
`,
    },
    // Service
    {
      path: 'Services/UserService.cs',
      content: `using System.Collections.Concurrent;
using <%= projectName %>.Models;

namespace <%= projectName %>.Services;

public class UserService
{
    private readonly ConcurrentDictionary<string, User> _store = new();

    public IEnumerable<User> GetAll() => _store.Values;
    public User? GetById(string id) => _store.TryGetValue(id, out var u) ? u : null;
    public User Create(string name, string email)
    {
        var user = new User { Name = name, Email = email };
        _store[user.Id] = user;
        return user;
    }
    public void Delete(string id) => _store.TryRemove(id, out _);
}
`,
    },
    // API Controller
    {
      path: 'Controllers/Api/UsersApiController.cs',
      content: `using Microsoft.AspNetCore.Mvc;
using <%= projectName %>.Models;
using <%= projectName %>.Services;

namespace <%= projectName %>.Controllers.Api;

[ApiController]
[Route("api/[controller]")]
public class UsersApiController : ControllerBase
{
    private readonly UserService _svc;
    public UsersApiController(UserService svc) { _svc = svc; }

    [HttpGet] public IActionResult GetAll() => Ok(_svc.GetAll());
    [HttpPost] public IActionResult Create([FromBody] CreateUserRequest req) => Ok(_svc.Create(req.Name, req.Email));
    [HttpDelete("{id}")] public IActionResult Delete(string id) { _svc.Delete(id); return NoContent(); }
}
`,
    },
    // View Controller
    {
      path: 'Controllers/UsersController.cs',
      content: `using Microsoft.AspNetCore.Mvc;
using <%= projectName %>.Services;

namespace <%= projectName %>.Controllers;

public class UsersController : Controller
{
    private readonly UserService _svc;
    public UsersController(UserService svc) { _svc = svc; }

    public IActionResult Index() => View(_svc.GetAll());
}
`,
    },
    // View
    {
      path: 'Views/Users/Index.cshtml',
      content: `@model IEnumerable<<%= projectName %>.Models.User>
<h1>Users</h1>
<table class="table">
  <thead><tr><th>ID</th><th>Name</th><th>Email</th></tr></thead>
  <tbody>
    @foreach (var user in Model)
    {
      <tr><td>@user.Id</td><td>@user.Name</td><td>@user.Email</td></tr>
    }
  </tbody>
</table>
`,
    },
    {
      path: 'Views/Shared/_Layout.cshtml',
      content: `<!DOCTYPE html>
<html><head><title><%= projectName %></title></head>
<body>
  <header><h2><%= projectName %></h2></header>
  <main>@RenderBody()</main>
</body></html>
`,
    },
  ],
  postMessages: [
    'Run `dotnet restore && dotnet run`',
    'Architecture: MVC — Model/View/Controller with REST API + Razor Views',
  ],
};
