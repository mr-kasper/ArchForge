// ─────────────────────────────────────────────────────────
// Microservices Templates
// Java (Spring Boot) + .NET (ASP.NET Core)
// ─────────────────────────────────────────────────────────

import { TemplateManifest } from '../types';

// ── Java Microservices ──────────────────────────────────

export const javaMicroservicesManifest: TemplateManifest = {
  stack: 'java',
  architecture: 'microservices',
  files: [
    // ── Root ────────────────────────────────────────────
    {
      path: 'settings.gradle.kts',
      content: `rootProject.name = "<%= projectName %>"
include("api-gateway", "user-service", "order-service", "shared-contracts")
`,
    },
    {
      path: 'build.gradle.kts',
      content: `plugins {
    java
    id("org.springframework.boot") version "3.2.2" apply false
    id("io.spring.dependency-management") version "1.1.4" apply false
}

subprojects {
    apply(plugin = "java")
    apply(plugin = "org.springframework.boot")
    apply(plugin = "io.spring.dependency-management")

    group = "<%= projectName %>"
    version = "1.0.0"
    java { sourceCompatibility = JavaVersion.VERSION_21 }
    repositories { mavenCentral() }

    dependencies {
        "implementation"("org.springframework.boot:spring-boot-starter-web")
        "testImplementation"("org.springframework.boot:spring-boot-starter-test")
    }
}
`,
    },
    {
      path: 'docker-compose.yml',
      content: `version: "3.9"
services:
  api-gateway:
    build: ./api-gateway
    ports: ["8080:8080"]
    depends_on: [user-service, order-service]

  user-service:
    build: ./user-service
    ports: ["8081:8081"]

  order-service:
    build: ./order-service
    ports: ["8082:8082"]
`,
    },
    // ── Shared Contracts ────────────────────────────────
    {
      path: 'shared-contracts/build.gradle.kts',
      content: `// Shared DTOs / events across services
dependencies {}
`,
    },
    {
      path: 'shared-contracts/src/main/java/com/<%= projectName %>/contracts/UserDTO.java',
      content: `package com.<%= projectName %>.contracts;

public record UserDTO(String id, String name, String email) {}
`,
    },
    {
      path: 'shared-contracts/src/main/java/com/<%= projectName %>/contracts/OrderDTO.java',
      content: `package com.<%= projectName %>.contracts;

public record OrderDTO(String id, String userId, String product, int quantity) {}
`,
    },
    {
      path: 'shared-contracts/src/main/java/com/<%= projectName %>/contracts/events/UserCreatedEvent.java',
      content: `package com.<%= projectName %>.contracts.events;

public record UserCreatedEvent(String userId, String name, String email) {}
`,
    },
    // ── API Gateway ─────────────────────────────────────
    {
      path: 'api-gateway/build.gradle.kts',
      content: `dependencies {
    implementation(project(":shared-contracts"))
}
`,
    },
    {
      path: 'api-gateway/src/main/resources/application.yml',
      content: `server:
  port: 8080
services:
  user-url: http://localhost:8081
  order-url: http://localhost:8082
`,
    },
    {
      path: 'api-gateway/src/main/java/com/<%= projectName %>/gateway/GatewayApplication.java',
      content: `package com.<%= projectName %>.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.client.RestTemplate;

@SpringBootApplication
public class GatewayApplication {
    public static void main(String[] args) { SpringApplication.run(GatewayApplication.class, args); }

    @Bean
    public RestTemplate restTemplate() { return new RestTemplate(); }
}
`,
    },
    {
      path: 'api-gateway/src/main/java/com/<%= projectName %>/gateway/controller/GatewayController.java',
      content: `package com.<%= projectName %>.gateway.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api")
public class GatewayController {
    private final RestTemplate rest;

    @Value("\${services.user-url}") private String userUrl;
    @Value("\${services.order-url}") private String orderUrl;

    public GatewayController(RestTemplate rest) { this.rest = rest; }

    @GetMapping("/users")
    public ResponseEntity<String> getUsers() {
        return ResponseEntity.ok(rest.getForObject(userUrl + "/api/users", String.class));
    }

    @GetMapping("/orders")
    public ResponseEntity<String> getOrders() {
        return ResponseEntity.ok(rest.getForObject(orderUrl + "/api/orders", String.class));
    }
}
`,
    },
    {
      path: 'api-gateway/Dockerfile',
      content: `FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
COPY .. .
RUN ./gradlew :api-gateway:bootJar --no-daemon
FROM eclipse-temurin:21-jre-alpine
COPY --from=build /app/api-gateway/build/libs/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
`,
    },
    // ── User Service ────────────────────────────────────
    {
      path: 'user-service/build.gradle.kts',
      content: `dependencies {
    implementation(project(":shared-contracts"))
}
`,
    },
    {
      path: 'user-service/src/main/resources/application.yml',
      content: `server:
  port: 8081
spring:
  application:
    name: user-service
`,
    },
    {
      path: 'user-service/src/main/java/com/<%= projectName %>/user/UserServiceApplication.java',
      content: `package com.<%= projectName %>.user;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class UserServiceApplication {
    public static void main(String[] args) { SpringApplication.run(UserServiceApplication.class, args); }
}
`,
    },
    {
      path: 'user-service/src/main/java/com/<%= projectName %>/user/controller/UserController.java',
      content: `package com.<%= projectName %>.user.controller;

import com.<%= projectName %>.contracts.UserDTO;
import com.<%= projectName %>.user.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService svc;
    public UserController(UserService svc) { this.svc = svc; }

    @GetMapping public List<UserDTO> list() { return svc.findAll(); }
    @PostMapping public ResponseEntity<UserDTO> create(@RequestBody UserDTO dto) {
        return ResponseEntity.ok(svc.create(dto.name(), dto.email()));
    }
}
`,
    },
    {
      path: 'user-service/src/main/java/com/<%= projectName %>/user/service/UserService.java',
      content: `package com.<%= projectName %>.user.service;

import com.<%= projectName %>.contracts.UserDTO;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class UserService {
    private final Map<String, UserDTO> store = new ConcurrentHashMap<>();

    public List<UserDTO> findAll() { return new ArrayList<>(store.values()); }

    public UserDTO create(String name, String email) {
        UserDTO dto = new UserDTO(UUID.randomUUID().toString(), name, email);
        store.put(dto.id(), dto);
        return dto;
    }
}
`,
    },
    {
      path: 'user-service/Dockerfile',
      content: `FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
COPY .. .
RUN ./gradlew :user-service:bootJar --no-daemon
FROM eclipse-temurin:21-jre-alpine
COPY --from=build /app/user-service/build/libs/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
`,
    },
    // ── Order Service ───────────────────────────────────
    {
      path: 'order-service/build.gradle.kts',
      content: `dependencies {
    implementation(project(":shared-contracts"))
}
`,
    },
    {
      path: 'order-service/src/main/resources/application.yml',
      content: `server:
  port: 8082
spring:
  application:
    name: order-service
`,
    },
    {
      path: 'order-service/src/main/java/com/<%= projectName %>/order/OrderServiceApplication.java',
      content: `package com.<%= projectName %>.order;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class OrderServiceApplication {
    public static void main(String[] args) { SpringApplication.run(OrderServiceApplication.class, args); }
}
`,
    },
    {
      path: 'order-service/src/main/java/com/<%= projectName %>/order/controller/OrderController.java',
      content: `package com.<%= projectName %>.order.controller;

import com.<%= projectName %>.contracts.OrderDTO;
import com.<%= projectName %>.order.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final OrderService svc;
    public OrderController(OrderService svc) { this.svc = svc; }

    @GetMapping public List<OrderDTO> list() { return svc.findAll(); }
    @PostMapping public ResponseEntity<OrderDTO> create(@RequestBody OrderDTO dto) {
        return ResponseEntity.ok(svc.create(dto.userId(), dto.product(), dto.quantity()));
    }
}
`,
    },
    {
      path: 'order-service/src/main/java/com/<%= projectName %>/order/service/OrderService.java',
      content: `package com.<%= projectName %>.order.service;

import com.<%= projectName %>.contracts.OrderDTO;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OrderService {
    private final Map<String, OrderDTO> store = new ConcurrentHashMap<>();

    public List<OrderDTO> findAll() { return new ArrayList<>(store.values()); }

    public OrderDTO create(String userId, String product, int quantity) {
        OrderDTO dto = new OrderDTO(UUID.randomUUID().toString(), userId, product, quantity);
        store.put(dto.id(), dto);
        return dto;
    }
}
`,
    },
    {
      path: 'order-service/Dockerfile',
      content: `FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
COPY .. .
RUN ./gradlew :order-service:bootJar --no-daemon
FROM eclipse-temurin:21-jre-alpine
COPY --from=build /app/order-service/build/libs/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
`,
    },
  ],
  postMessages: [
    'Run `docker-compose up --build` or start each service separately',
    'Architecture: Microservices — API Gateway + User Service + Order Service',
    'Each service has independent deployment and data store',
  ],
};

// ── .NET Microservices ──────────────────────────────────

export const dotnetMicroservicesManifest: TemplateManifest = {
  stack: 'dotnet',
  architecture: 'microservices',
  files: [
    {
      path: '<%= projectName %>.sln',
      content: `
Microsoft Visual Studio Solution File, Format Version 12.00
# Generated by ArchForge — Microservices
`,
    },
    {
      path: 'docker-compose.yml',
      content: `version: "3.9"
services:
  api-gateway:
    build: { context: ., dockerfile: src/ApiGateway/Dockerfile }
    ports: ["5000:8080"]
    depends_on: [user-service, order-service]

  user-service:
    build: { context: ., dockerfile: src/UserService/Dockerfile }
    ports: ["5001:8080"]

  order-service:
    build: { context: ., dockerfile: src/OrderService/Dockerfile }
    ports: ["5002:8080"]
`,
    },
    // Shared
    {
      path: 'src/Shared/<%= projectName %>.Shared.csproj',
      content: `<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup><TargetFramework>net8.0</TargetFramework><ImplicitUsings>enable</ImplicitUsings><Nullable>enable</Nullable></PropertyGroup>
</Project>
`,
    },
    {
      path: 'src/Shared/Contracts/UserDto.cs',
      content: `namespace <%= projectName %>.Shared.Contracts;
public record UserDto(string Id, string Name, string Email);
`,
    },
    {
      path: 'src/Shared/Contracts/OrderDto.cs',
      content: `namespace <%= projectName %>.Shared.Contracts;
public record OrderDto(string Id, string UserId, string Product, int Quantity);
`,
    },
    // API Gateway
    {
      path: 'src/ApiGateway/<%= projectName %>.ApiGateway.csproj',
      content: `<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup><TargetFramework>net8.0</TargetFramework><ImplicitUsings>enable</ImplicitUsings><Nullable>enable</Nullable></PropertyGroup>
</Project>
`,
    },
    {
      path: 'src/ApiGateway/Program.cs',
      content: `var builder = WebApplication.CreateBuilder(args);
builder.Services.AddHttpClient("UserService", c => c.BaseAddress = new Uri("http://user-service:8080"));
builder.Services.AddHttpClient("OrderService", c => c.BaseAddress = new Uri("http://order-service:8080"));
builder.Services.AddControllers();

var app = builder.Build();
app.MapControllers();
app.Run();
`,
    },
    {
      path: 'src/ApiGateway/Controllers/GatewayController.cs',
      content: `using Microsoft.AspNetCore.Mvc;

namespace <%= projectName %>.ApiGateway.Controllers;

[ApiController, Route("api")]
public class GatewayController : ControllerBase
{
    private readonly IHttpClientFactory _factory;
    public GatewayController(IHttpClientFactory factory) { _factory = factory; }

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers()
    {
        var client = _factory.CreateClient("UserService");
        var res = await client.GetStringAsync("/api/users");
        return Content(res, "application/json");
    }

    [HttpGet("orders")]
    public async Task<IActionResult> GetOrders()
    {
        var client = _factory.CreateClient("OrderService");
        var res = await client.GetStringAsync("/api/orders");
        return Content(res, "application/json");
    }
}
`,
    },
    // User Service
    {
      path: 'src/UserService/<%= projectName %>.UserService.csproj',
      content: `<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup><TargetFramework>net8.0</TargetFramework><ImplicitUsings>enable</ImplicitUsings><Nullable>enable</Nullable></PropertyGroup>
  <ItemGroup><ProjectReference Include="../Shared/<%= projectName %>.Shared.csproj" /></ItemGroup>
</Project>
`,
    },
    {
      path: 'src/UserService/Program.cs',
      content: `using <%= projectName %>.UserService.Services;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddSingleton<UserSvc>();
builder.Services.AddControllers();

var app = builder.Build();
app.MapControllers();
app.Run();
`,
    },
    {
      path: 'src/UserService/Controllers/UsersController.cs',
      content: `using <%= projectName %>.Shared.Contracts;
using <%= projectName %>.UserService.Services;
using Microsoft.AspNetCore.Mvc;

namespace <%= projectName %>.UserService.Controllers;

[ApiController, Route("api/users")]
public class UsersController : ControllerBase
{
    private readonly UserSvc _svc;
    public UsersController(UserSvc svc) { _svc = svc; }

    [HttpGet] public IActionResult GetAll() => Ok(_svc.GetAll());
    [HttpPost] public IActionResult Create([FromBody] UserDto dto) => Ok(_svc.Create(dto.Name, dto.Email));
}
`,
    },
    {
      path: 'src/UserService/Services/UserSvc.cs',
      content: `using System.Collections.Concurrent;
using <%= projectName %>.Shared.Contracts;

namespace <%= projectName %>.UserService.Services;

public class UserSvc
{
    private readonly ConcurrentDictionary<string, UserDto> _store = new();
    public IEnumerable<UserDto> GetAll() => _store.Values;
    public UserDto Create(string name, string email) { var d = new UserDto(Guid.NewGuid().ToString(), name, email); _store[d.Id] = d; return d; }
}
`,
    },
    // Order Service
    {
      path: 'src/OrderService/<%= projectName %>.OrderService.csproj',
      content: `<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup><TargetFramework>net8.0</TargetFramework><ImplicitUsings>enable</ImplicitUsings><Nullable>enable</Nullable></PropertyGroup>
  <ItemGroup><ProjectReference Include="../Shared/<%= projectName %>.Shared.csproj" /></ItemGroup>
</Project>
`,
    },
    {
      path: 'src/OrderService/Program.cs',
      content: `using <%= projectName %>.OrderService.Services;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddSingleton<OrderSvc>();
builder.Services.AddControllers();

var app = builder.Build();
app.MapControllers();
app.Run();
`,
    },
    {
      path: 'src/OrderService/Controllers/OrdersController.cs',
      content: `using <%= projectName %>.Shared.Contracts;
using <%= projectName %>.OrderService.Services;
using Microsoft.AspNetCore.Mvc;

namespace <%= projectName %>.OrderService.Controllers;

[ApiController, Route("api/orders")]
public class OrdersController : ControllerBase
{
    private readonly OrderSvc _svc;
    public OrdersController(OrderSvc svc) { _svc = svc; }

    [HttpGet] public IActionResult GetAll() => Ok(_svc.GetAll());
    [HttpPost] public IActionResult Create([FromBody] OrderDto dto) => Ok(_svc.Create(dto.UserId, dto.Product, dto.Quantity));
}
`,
    },
    {
      path: 'src/OrderService/Services/OrderSvc.cs',
      content: `using System.Collections.Concurrent;
using <%= projectName %>.Shared.Contracts;

namespace <%= projectName %>.OrderService.Services;

public class OrderSvc
{
    private readonly ConcurrentDictionary<string, OrderDto> _store = new();
    public IEnumerable<OrderDto> GetAll() => _store.Values;
    public OrderDto Create(string userId, string product, int qty) { var d = new OrderDto(Guid.NewGuid().ToString(), userId, product, qty); _store[d.Id] = d; return d; }
}
`,
    },
  ],
  postMessages: [
    'Run `docker-compose up --build` or `dotnet run` each service',
    'Architecture: Microservices — Gateway + User Service + Order Service',
    'Each service is independently deployable with its own data store',
  ],
};
