# Sistema Escolar – Proyecto (Frontend + Backend)

## 📖 Descripción General
El proyecto *Sistema Escolar* está enfocado a un sistema académico pensado en accesibilidad de contenidos escolares, gestión de eventos y usuarios, mediante el uso de autenticación de usuarios por roles.

El sistema aplica operaciones de CRUD en el backend usando una API en *Django REST, vinculando directamente al localhost y desplegando un hosting profesional. A su vez, la **WebApp* (diseño de frontend) se realizó aplicando conocimientos en *Angular*, permitiendo tener una aplicación web atractiva, 100% responsiva e intuitiva al usuario.

## ✨ Funcionalidades Principales

- *Autenticación y sesión:* Login con correo/contraseña; respuesta con token y rol; manejo de cookies en frontend; logout que invalida el token.
- *Usuarios:* CRUD de administradores, maestros y alumnos con validaciones específicas.
- *Eventos:* Alta, listado, edición y eliminación con fecha/hora, público objetivo, responsable, cupo y descripción.
- *Métricas:* Gráficas con totales por rol.
- *Navegación:* Layouts de autenticación y dashboard; protección de rutas públicas/privadas.

## 📋 Requisitos

- *Node.js:* Versión 18 o mayor (y npm)
- *Angular CLI:* Versión 16.2.11 (vía npx)
- *Python:* 3.12
- *MySQL:* 5.7 / 8.0

## 🛠 Tecnologías

### Frontend
- Angular 16
- Angular Material & CDK
- ngx-cookie-service
- ng2-charts / chart.js / chartjs-plugin-datalabels
- ngx-mask
- ngx-material-timepicker

### Backend
- Django 5
- Django REST Framework (DRF)
- django-cors-headers
- django-filter
- pymysql
- rest_framework.authtoken

## 📂 Estructura del Proyecto

- *Frontend (Angular):* dev-sistema-escolar-webapp_fdrd
- *Backend (Django):* dev_sistema_escolar_api_fdrd

---

## 🚀 Ejecución

> *Nota:* Se deben ejecutar tanto frontend como backend por separado (en terminales distintas). Accede a la carpeta correspondiente para la ejecución de cada localhost.
> * *Backend:* Puerto 8000
> * *Frontend:* Puerto 4200

## 1. Backend (Django)

*Preparación del entorno:*

bash
# Crear el entorno virtual
python -m venv .venv

# Activar el entorno virtual 
.\.venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

#Se crean las Migraciones:
python manage.py makemigrations

#Se aplica migracion los datos:
python manage.py migrate

#Finalmente se corre el servidor:
python manage.py runserver
URL: http://127.0.0.1:8000/

###Configuracion base de datos.
bash 
#Crear base de datos desde MYSQL: 
CREATE DATABASE dev_sistema_escolar_db CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

#Archivo de cliente en my.cnf :
host=127.0.0.1
port=3306
database=dev_sistema_escolar_db
user=root.
password=
default-character-set=utf8mb4

###EndPoints Principales
dev_sistema_escolar_api/dev_sistema_escolar_api/urls.py:13-48
Administración Django: GET /admin-django/
Versión API: GET /version/

####Admins:
  * Crear: POST /admin/
  * Borrar: DELETE /admin/<id>/
  * Listar: GET /lista-admins/
  * Total usuarios: GET /total-usuarios/

####Alumnos:
  * Crear: POST /alumnos/
  * Borrar: DELETE /alumnos/<id>/
  * Listar: GET /lista-alumnos/
  
####Maestros:
  * Crear: POST /maestros/
  * Borrar: DELETE /maestros/<id>/
  * Listar: GET /lista-maestros/
  
####Auth:
  * Login: POST /login/
  * Logout: POST /logout/
  
####Eventos:
  * Crear: POST /eventos/
  * Borrar: DELETE /eventos/<id>/
  * Listar: GET /lista-eventos/

##2.Frontend (Angular)

###*Gestión de versiones y Dependencias*

bash
# Seleccionar versión de Node con NVM
nvm ls
nvm use 22.14.0

# Instalar dependencias del proyecto
npm install

###*Ejecucion*
bash
#Ejecutar el servidor de desarrollo
ng serve
URL de la WebApp: http://localhost:4200/

##🛣 Rutas de Frontend
Definidas en: src/app/app-routing.module.ts

####Público:
-login
-registro-usuarios
-registro-usuarios/:rol/:id

####Dashboard:
-home
-administrador
-alumnos
-maestros
-graficas
-eventos
-registro-eventos
-registro-eventos/:id

##⚠ Notas Importantes
-Asegura que el backend corre en http://127.0.0.1:8000 para que la WebApp funcione correctamente con ng serve.
-Usa Authorization: Bearer <token> en las peticiones protegidas.
-Para producción, ajusta environment.prod.ts y ALLOWED_HOSTS / CORS en la API.
