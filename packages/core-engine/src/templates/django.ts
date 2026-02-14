// ─────────────────────────────────────────────────────────
// Django Templates — Layered, MVC, Clean
// Python + Django REST Framework
// ─────────────────────────────────────────────────────────

import { TemplateManifest } from '../types';

// ── Shared files ────────────────────────────────────────

const requirements = {
  path: 'requirements.txt',
  content: `Django>=5.1,<6.0
djangorestframework>=3.15,<4.0
django-cors-headers>=4.5,<5.0
python-dotenv>=1.1,<2.0
<% if (database === 'postgresql') { %>psycopg2-binary>=2.9,<3.0
<% } else if (database === 'mysql') { %>mysqlclient>=2.2,<3.0
<% } %><% if (auth === 'jwt') { %>djangorestframework-simplejwt>=5.4,<6.0
<% } %>gunicorn>=23.0,<24.0
`,
};

const managePy = {
  path: 'manage.py',
  content: `#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys

def main():
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', '<%= projectName %>.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django."
        ) from exc
    execute_from_command_line(sys.argv)

if __name__ == '__main__':
    main()
`,
};

const settingsPy = {
  path: '<%= projectName %>/settings.py',
  content: `import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent
SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-change-me')
DEBUG = os.getenv('DEBUG', 'True') == 'True'
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', '*').split(',')

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'core',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
]

ROOT_URLCONF = '<%= projectName %>.urls'
WSGI_APPLICATION = '<%= projectName %>.wsgi.application'
CORS_ALLOW_ALL_ORIGINS = DEBUG

<% if (database === 'postgresql') { %>DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('DB_NAME', '<%= projectName %>'),
        'USER': os.getenv('DB_USER', 'postgres'),
        'PASSWORD': os.getenv('DB_PASSWORD', 'postgres'),
        'HOST': os.getenv('DB_HOST', 'localhost'),
        'PORT': os.getenv('DB_PORT', '5432'),
    }
}
<% } else if (database === 'mysql') { %>DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': os.getenv('DB_NAME', '<%= projectName %>'),
        'USER': os.getenv('DB_USER', 'root'),
        'PASSWORD': os.getenv('DB_PASSWORD', 'root'),
        'HOST': os.getenv('DB_HOST', 'localhost'),
        'PORT': os.getenv('DB_PORT', '3306'),
    }
}
<% } else { %>DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
<% } %>
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
<% if (auth === 'jwt') { %>    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
<% } %>}

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

STATIC_URL = 'static/'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
`,
};

const urlsPy = {
  path: '<%= projectName %>/urls.py',
  content: `from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('core.urls')),
]
`,
};

const wsgiPy = {
  path: '<%= projectName %>/wsgi.py',
  content: `import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', '<%= projectName %>.settings')
application = get_wsgi_application()
`,
};

const initPy = {
  path: '<%= projectName %>/__init__.py',
  content: ``,
};

const envFile = {
  path: '.env',
  content: `SECRET_KEY=your-secret-key-change-in-production
DEBUG=True
ALLOWED_HOSTS=*
<% if (database === 'postgresql') { %>DB_NAME=<%= projectName %>
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
<% } %>`,
};

const gitignore = {
  path: '.gitignore',
  content: `__pycache__/
*.py[cod]
*.so
db.sqlite3
.env
*.log
venv/
.venv/
dist/
*.egg-info/
`,
};

// ── Layered Architecture ────────────────────────────────

export const djangoLayeredManifest: TemplateManifest = {
  stack: 'django',
  architecture: 'layered',
  files: [
    requirements,
    managePy,
    settingsPy,
    urlsPy,
    wsgiPy,
    initPy,
    envFile,
    gitignore,
    {
      path: 'core/__init__.py',
      content: ``,
    },
    {
      path: 'core/models.py',
      content: `from django.db import models


class User(models.Model):
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.email
`,
    },
    {
      path: 'core/serializers.py',
      content: `from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
`,
    },
    {
      path: 'core/services.py',
      content: `from .models import User


class UserService:
    @staticmethod
    def get_all_users():
        return User.objects.all()

    @staticmethod
    def create_user(email: str, name: str) -> User:
        return User.objects.create(email=email, name=name)

    @staticmethod
    def get_user_by_id(user_id: int):
        return User.objects.filter(id=user_id).first()
`,
    },
    {
      path: 'core/views.py',
      content: `from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .services import UserService
from .serializers import UserSerializer


class UserListView(APIView):
    def get(self, request):
        users = UserService.get_all_users()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = UserService.create_user(**serializer.validated_data)
            return Response(
                UserSerializer(user).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class HealthView(APIView):
    def get(self, request):
        return Response({'status': 'ok'})
`,
    },
    {
      path: 'core/urls.py',
      content: `from django.urls import path
from .views import UserListView, HealthView

urlpatterns = [
    path('users/', UserListView.as_view(), name='user-list'),
    path('health/', HealthView.as_view(), name='health'),
]
`,
    },
  ],
  postMessages: [
    'Run `pip install -r requirements.txt`',
    'Run `python manage.py migrate`',
    'Run `python manage.py runserver`',
    'Architecture: Layered (Views → Services → Models)',
  ],
};

// ── MVC Architecture ────────────────────────────────────

export const djangoMVCManifest: TemplateManifest = {
  stack: 'django',
  architecture: 'mvc',
  files: [
    requirements,
    managePy,
    settingsPy,
    urlsPy,
    wsgiPy,
    initPy,
    envFile,
    gitignore,
    {
      path: 'core/__init__.py',
      content: ``,
    },
    {
      path: 'core/models.py',
      content: `from django.db import models


class User(models.Model):
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.email
`,
    },
    {
      path: 'core/serializers.py',
      content: `from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'
`,
    },
    {
      path: 'core/views.py',
      content: `from rest_framework import viewsets
from .models import User
from .serializers import UserSerializer


class UserViewSet(viewsets.ModelViewSet):
    """
    MVC Controller — handles CRUD for User model.
    Django REST Framework ViewSets follow the MVC pattern naturally:
    - Model: core/models.py
    - View (serializer): core/serializers.py
    - Controller (viewset): this file
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
`,
    },
    {
      path: 'core/urls.py',
      content: `from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
`,
    },
  ],
  postMessages: [
    'Run `pip install -r requirements.txt`',
    'Run `python manage.py migrate && python manage.py runserver`',
    'Architecture: MVC (Models → Views/Serializers → ViewSets/Controllers)',
  ],
};

// ── Clean Architecture ──────────────────────────────────

export const djangoCleanManifest: TemplateManifest = {
  stack: 'django',
  architecture: 'clean',
  files: [
    requirements,
    managePy,
    settingsPy,
    urlsPy,
    wsgiPy,
    initPy,
    envFile,
    gitignore,
    {
      path: 'core/__init__.py',
      content: ``,
    },
    {
      path: 'core/domain/__init__.py',
      content: ``,
    },
    {
      path: 'core/domain/entities.py',
      content: `from dataclasses import dataclass
from datetime import datetime


@dataclass
class UserEntity:
    id: int | None
    email: str
    name: str
    created_at: datetime | None = None
`,
    },
    {
      path: 'core/domain/repositories.py',
      content: `from abc import ABC, abstractmethod
from .entities import UserEntity


class UserRepositoryInterface(ABC):
    @abstractmethod
    def find_all(self) -> list[UserEntity]:
        ...

    @abstractmethod
    def create(self, entity: UserEntity) -> UserEntity:
        ...

    @abstractmethod
    def find_by_id(self, user_id: int) -> UserEntity | None:
        ...
`,
    },
    {
      path: 'core/application/__init__.py',
      content: ``,
    },
    {
      path: 'core/application/use_cases.py',
      content: `from core.domain.entities import UserEntity
from core.domain.repositories import UserRepositoryInterface


class GetUsersUseCase:
    def __init__(self, repo: UserRepositoryInterface):
        self.repo = repo

    def execute(self) -> list[UserEntity]:
        return self.repo.find_all()


class CreateUserUseCase:
    def __init__(self, repo: UserRepositoryInterface):
        self.repo = repo

    def execute(self, email: str, name: str) -> UserEntity:
        entity = UserEntity(id=None, email=email, name=name)
        return self.repo.create(entity)
`,
    },
    {
      path: 'core/infrastructure/__init__.py',
      content: ``,
    },
    {
      path: 'core/infrastructure/models.py',
      content: `from django.db import models


class UserModel(models.Model):
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'users'
        app_label = 'core'

    def __str__(self):
        return self.email
`,
    },
    {
      path: 'core/infrastructure/repositories.py',
      content: `from core.domain.entities import UserEntity
from core.domain.repositories import UserRepositoryInterface
from .models import UserModel


class DjangoUserRepository(UserRepositoryInterface):
    def find_all(self) -> list[UserEntity]:
        return [
            UserEntity(id=u.id, email=u.email, name=u.name, created_at=u.created_at)
            for u in UserModel.objects.all()
        ]

    def create(self, entity: UserEntity) -> UserEntity:
        obj = UserModel.objects.create(email=entity.email, name=entity.name)
        entity.id = obj.id
        entity.created_at = obj.created_at
        return entity

    def find_by_id(self, user_id: int) -> UserEntity | None:
        try:
            u = UserModel.objects.get(id=user_id)
            return UserEntity(id=u.id, email=u.email, name=u.name, created_at=u.created_at)
        except UserModel.DoesNotExist:
            return None
`,
    },
    {
      path: 'core/presentation/__init__.py',
      content: ``,
    },
    {
      path: 'core/presentation/views.py',
      content: `from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from core.application.use_cases import GetUsersUseCase, CreateUserUseCase
from core.infrastructure.repositories import DjangoUserRepository


class UserListView(APIView):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        repo = DjangoUserRepository()
        self.get_users = GetUsersUseCase(repo)
        self.create_user = CreateUserUseCase(repo)

    def get(self, request):
        users = self.get_users.execute()
        data = [{'id': u.id, 'email': u.email, 'name': u.name} for u in users]
        return Response(data)

    def post(self, request):
        user = self.create_user.execute(
            email=request.data.get('email'),
            name=request.data.get('name'),
        )
        return Response(
            {'id': user.id, 'email': user.email, 'name': user.name},
            status=status.HTTP_201_CREATED
        )
`,
    },
    {
      path: 'core/urls.py',
      content: `from django.urls import path
from core.presentation.views import UserListView

urlpatterns = [
    path('users/', UserListView.as_view(), name='user-list'),
]
`,
    },
  ],
  postMessages: [
    'Run `pip install -r requirements.txt`',
    'Run `python manage.py migrate && python manage.py runserver`',
    'Architecture: Clean Architecture (Domain → Application → Infrastructure → Presentation)',
  ],
};
