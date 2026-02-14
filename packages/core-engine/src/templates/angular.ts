// ─────────────────────────────────────────────────────────
// Angular Templates — Feature-Based, Layered
// Angular 19 + TypeScript + Standalone Components
// ─────────────────────────────────────────────────────────

import { TemplateManifest } from '../types';

// ── Shared files ────────────────────────────────────────

const packageJson = {
  path: 'package.json',
  content: `{
  "name": "<%= projectName %>",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "start": "ng serve --port <%= port %>",
    "build": "ng build",
    "test": "ng test",
    "lint": "ng lint"
  },
  "dependencies": {
    "@angular/core": "^19.2.0",
    "@angular/common": "^19.2.0",
    "@angular/compiler": "^19.2.0",
    "@angular/forms": "^19.2.0",
    "@angular/platform-browser": "^19.2.0",
    "@angular/platform-browser-dynamic": "^19.2.0",
    "@angular/router": "^19.2.0",
    "rxjs": "^7.8.1",
    "tslib": "^2.8.1",
    "zone.js": "^0.15.0"<% if (stateManagement === 'ngrx') { %>,
    "@ngrx/store": "^19.0.0",
    "@ngrx/effects": "^19.0.0"<% } %>
  },
  "devDependencies": {
    "@angular/cli": "^19.2.0",
    "@angular/compiler-cli": "^19.2.0",
    "@angular-devkit/build-angular": "^19.2.0",
    "typescript": "~5.7.0",
    "karma": "^6.4.4",
    "karma-chrome-launcher": "^3.2.0",
    "karma-jasmine": "^5.1.0",
    "@types/jasmine": "~5.1.0"
  }
}
`,
};

const tsconfig = {
  path: 'tsconfig.json',
  content: `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "lib": ["ES2022", "dom"],
    "moduleResolution": "bundler",
    "strict": true,
    "sourceMap": true,
    "declaration": false,
    "experimentalDecorators": true,
    "noEmitOnError": true,
    "paths": {
      "@app/*": ["src/app/*"],
      "@env/*": ["src/environments/*"]
    }
  },
  "angularCompilerOptions": {
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
`,
};

const angularJson = {
  path: 'angular.json',
  content: `{
  "$schema": "./node_modules/@angular/cli/lib/config/schema.json",
  "version": 1,
  "newProjectRoot": "projects",
  "projects": {
    "<%= projectName %>": {
      "projectType": "application",
      "root": "",
      "sourceRoot": "src",
      "architect": {
        "build": {
          "builder": "@angular-devkit/build-angular:application",
          "options": {
            "outputPath": "dist/<%= projectName %>",
            "index": "src/index.html",
            "browser": "src/main.ts",
            "tsConfig": "tsconfig.json"<% if (cssFramework === 'tailwind') { %>,
            "styles": ["src/styles.css"]<% } %>
          }
        },
        "serve": {
          "builder": "@angular-devkit/build-angular:dev-server",
          "options": { "port": <%= port %> }
        }
      }
    }
  }
}
`,
};

const indexHtml = {
  path: 'src/index.html',
  content: `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title><%= projectName %></title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body>
  <app-root></app-root>
</body>
</html>
`,
};

const mainTs = {
  path: 'src/main.ts',
  content: `import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err)
);
`,
};

const stylesCss = {
  path: 'src/styles.css',
  content: `<% if (cssFramework === 'tailwind') { %>@import "tailwindcss";
<% } else { %>* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: system-ui, sans-serif; }
<% } %>`,
};

const gitignore = {
  path: '.gitignore',
  content: `node_modules/
dist/
.angular/
.env
`,
};

const envFile = {
  path: 'src/environments/environment.ts',
  content: `export const environment = {
  production: false,
  apiUrl: 'http://localhost:<%= port %>/api',
};
`,
};

// ── Feature-Based Architecture ──────────────────────────

export const angularFeatureBasedManifest: TemplateManifest = {
  stack: 'angular',
  architecture: 'feature-based',
  files: [
    packageJson,
    tsconfig,
    angularJson,
    indexHtml,
    mainTs,
    stylesCss,
    gitignore,
    envFile,
    {
      path: 'src/app/app.component.ts',
      content: `import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: \`
    <h1><%= projectName %></h1>
    <router-outlet />
  \`,
})
export class AppComponent {}
`,
    },
    {
      path: 'src/app/app.config.ts',
      content: `import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideHttpClient()],
};
`,
    },
    {
      path: 'src/app/app.routes.ts',
      content: `import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'users',
    loadComponent: () =>
      import('./features/users/pages/user-list/user-list.component').then(
        (m) => m.UserListComponent
      ),
  },
  { path: '', redirectTo: 'users', pathMatch: 'full' },
];
`,
    },
    {
      path: 'src/app/features/users/models/user.model.ts',
      content: `export interface User {
  id: string;
  name: string;
  email: string;
}
`,
    },
    {
      path: 'src/app/features/users/services/user.service.ts',
      content: `import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(\`\${environment.apiUrl}/users\`);
  }

  createUser(data: Omit<User, 'id'>): Observable<User> {
    return this.http.post<User>(\`\${environment.apiUrl}/users\`, data);
  }
}
`,
    },
    {
      path: 'src/app/features/users/pages/user-list/user-list.component.ts',
      content: `import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <h2>Users</h2>
    <ul>
      @for (user of users; track user.id) {
        <li>{{ user.name }} — {{ user.email }}</li>
      }
    </ul>
  \`,
})
export class UserListComponent implements OnInit {
  private userService = inject(UserService);
  users: User[] = [];

  ngOnInit(): void {
    this.userService.getUsers().subscribe((data) => (this.users = data));
  }
}
`,
    },
    {
      path: 'src/app/shared/components/button/button.component.ts',
      content: `import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: true,
  template: \`<button [attr.data-variant]="variant"><ng-content /></button>\`,
})
export class ButtonComponent {
  @Input() variant: 'primary' | 'secondary' = 'primary';
}
`,
    },
  ],
  postMessages: [
    'Run `npm install`',
    'Run `npm start` to serve on port <%= port %>',
    'Architecture: Feature-Based (features/ contain pages, services, models)',
  ],
};

// ── Layered Architecture ────────────────────────────────

export const angularLayeredManifest: TemplateManifest = {
  stack: 'angular',
  architecture: 'layered',
  files: [
    packageJson,
    tsconfig,
    angularJson,
    indexHtml,
    mainTs,
    stylesCss,
    gitignore,
    envFile,
    {
      path: 'src/app/app.component.ts',
      content: `import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: \`<router-outlet />\`,
})
export class AppComponent {}
`,
    },
    {
      path: 'src/app/app.config.ts',
      content: `import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideHttpClient()],
};
`,
    },
    {
      path: 'src/app/app.routes.ts',
      content: `import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'users',
    loadComponent: () =>
      import('./presentation/pages/user-list/user-list.component').then(
        (m) => m.UserListComponent
      ),
  },
  { path: '', redirectTo: 'users', pathMatch: 'full' },
];
`,
    },
    // ── Domain layer
    {
      path: 'src/app/domain/models/user.model.ts',
      content: `export interface User {
  id: string;
  name: string;
  email: string;
}
`,
    },
    // ── Data layer
    {
      path: 'src/app/data/repositories/user.repository.ts',
      content: `import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../../domain/models/user.model';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class UserRepository {
  private http = inject(HttpClient);

  findAll(): Observable<User[]> {
    return this.http.get<User[]>(\`\${environment.apiUrl}/users\`);
  }

  create(data: Omit<User, 'id'>): Observable<User> {
    return this.http.post<User>(\`\${environment.apiUrl}/users\`, data);
  }
}
`,
    },
    // ── Service layer
    {
      path: 'src/app/services/user.service.ts',
      content: `import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { UserRepository } from '../data/repositories/user.repository';
import { User } from '../domain/models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private repo = inject(UserRepository);

  getUsers(): Observable<User[]> {
    return this.repo.findAll();
  }

  createUser(data: Omit<User, 'id'>): Observable<User> {
    return this.repo.create(data);
  }
}
`,
    },
    // ── Presentation layer
    {
      path: 'src/app/presentation/pages/user-list/user-list.component.ts',
      content: `import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../services/user.service';
import { User } from '../../../domain/models/user.model';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <h2>Users</h2>
    <ul>
      @for (user of users; track user.id) {
        <li>{{ user.name }} — {{ user.email }}</li>
      }
    </ul>
  \`,
})
export class UserListComponent implements OnInit {
  private userService = inject(UserService);
  users: User[] = [];

  ngOnInit(): void {
    this.userService.getUsers().subscribe((data) => (this.users = data));
  }
}
`,
    },
  ],
  postMessages: [
    'Run `npm install`',
    'Run `npm start` to serve on port <%= port %>',
    'Architecture: Layered (Presentation → Services → Data → Domain)',
  ],
};
