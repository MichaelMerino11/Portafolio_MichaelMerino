# Portafolio Michael

Este es un portafolio web personal creado con React, Vite, Node.js y Nodemailer. El objetivo de este proyecto es mostrar mis habilidades como desarrollador y permitir a los usuarios contactar conmigo mediante un formulario de contacto que envía correos electrónicos a mi dirección.

## Características

- **Frontend**: Hecho con React y Vite para una experiencia rápida y eficiente.
- **Backend**: Implementado en Node.js utilizando Express.
- **Formulario de contacto**: Permite a los usuarios enviarme mensajes que son enviados a mi correo a través de Nodemailer.
- **Diseño**: Diseño moderno y limpio, con enfoque en la usabilidad.

## Tecnologías utilizadas

- **Frontend**: React, Vite
- **Backend**: Node.js, Express
- **Correo electrónico**: Nodemailer (para enviar correos)
- **Estilos**: CSS

## Instalación

### Requisitos previos

Asegúrate de tener Node.js instalado en tu máquina.

### Clonar el repositorio

```bash
git clone https://github.com/MichaelMerino11/portafolio-michael.git
cd portafolio-michael
```

### Instalar dependencias

Para el frontend:

```bash
cd frontend
npm install
```

Para el backend:

```bash
cd backend
npm install
```

### Ejecutar el proyecto

Frontend:

```bash
cd frontend
npm run dev
```

Backend:

```bash
cd backend
npm start
```

El frontend debería estar disponible en http://localhost:3000 y el backend en http://localhost:5000.

## Enviar un mensaje

En la sección de contacto del portafolio, los usuarios pueden enviar un mensaje que se enviará a mi correo electrónico. Este proceso está habilitado por Nodemailer en el backend.

## Contribuciones

Si deseas contribuir, por favor sigue estos pasos:

1. Haz un fork del repositorio.
2. Crea una rama para tu característica (`git checkout -b feature/nueva-caracteristica`).
3. Haz commit de tus cambios (`git commit -m 'Agregada nueva característica'`).
4. Empuja tus cambios a tu repositorio (`git push origin feature/nueva-caracteristica`).
5. Abre un pull request.

## Licencia

Este proyecto es de uso personal, pero puedes usarlo como inspiración para tus propios proyectos.

## Crear el archivo `.gitignore`

El archivo `.gitignore` no se crea automáticamente al subir el proyecto a GitHub. Debes crearlo manualmente y agregar los archivos o directorios que no deseas que sean seguidos por Git.

**Contenido básico para `.gitignore`:**

```gitignore
# Node.js
node_modules/

# Vite
/dist/

# Env files
.env

# Logs
*.log

# OS specific files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
```

Si estás utilizando algún editor como VSCode o WebStorm, también podrías agregar las carpetas que contienen configuraciones de tu editor (como `.vscode/` o `.idea/`).