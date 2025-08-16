# 💕 Proyecto Romántico de Iris - Versión Completa

Una aplicación web romántica completa con galería de fotos, cartas de amor, música y sistema de usuarios. **Todo funciona en un solo servidor** - ¡sin complicaciones!

## 🚀 **Despliegue Simple en RENDER**

### ✅ **Ventajas de esta versión:**
- 🎯 **Un solo servicio**: Frontend + Backend en Render
- 🔒 **Sin problemas de CORS**: Todo en el mismo dominio
- 💰 **Más barato**: Solo pagas por un servicio
- 🚀 **Más simple**: Un solo deploy, una sola URL
- 📱 **Mejor rendimiento**: Sin latencia entre servicios

### 📁 **Archivos que se suben a Render:**
```
proyecto_romantico/
├── server.js              # Servidor completo (Frontend + API)
├── package.json           # Dependencias
├── package-lock.json      # Lock de dependencias
├── database.db            # Base de datos SQLite
├── public/                # Frontend completo
│   ├── *.html            # Páginas web
│   ├── css/              # Estilos
│   ├── img/              # Imágenes
│   ├── js/               # JavaScript
│   └── *.mp3             # Música
├── uploads/               # Archivos subidos
└── render.yaml            # Configuración automática
```

## 🔧 **Despliegue en RENDER**

### 1. **Crear cuenta en Render**
- Ve a [render.com](https://render.com)
- Haz clic en "Sign up" y crea una cuenta

### 2. **Conectar repositorio**
- Haz clic en "New +"
- Selecciona "Web Service"
- Conecta tu cuenta de GitHub
- Selecciona tu repositorio `proyecto-romantico`

### 3. **Configurar servicio**
- **Name**: `proyecto-romantico-completo`
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Plan**: Free

### 4. **Variables de entorno**
- Haz clic en "Environment"
- Añade:
  - `NODE_ENV`: `production`
  - `SESSION_SECRET`: Generado automáticamente por Render

### 5. **Desplegar**
- Haz clic en "Create Web Service"
- Espera a que termine el deploy
- ¡Listo! Tu app estará funcionando en una sola URL

## 🏃‍♂️ **Desarrollo Local**

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# El servidor correrá en http://localhost:3000
# Frontend y API funcionando en la misma URL
```

## 📁 **Estructura del Proyecto**

```
proyecto_romantico/
├── server.js              # Servidor completo (Frontend + API)
├── package.json           # Dependencias
├── database.db            # Base de datos
├── uploads/               # Archivos subidos
├── render.yaml            # Configuración Render
└── public/                # Frontend completo
    ├── *.html            # Páginas web
    ├── css/              # Estilos
    ├── img/              # Imágenes
    ├── js/               # JavaScript
    └── *.mp3             # Música
```

## 🎯 **Funcionalidades**

- ✅ **Sistema de usuarios** (login/registro)
- ✅ **Galería de fotos** personal
- ✅ **Cartas de amor** con base de datos
- ✅ **Música de fondo** integrada
- ✅ **Subida de archivos** persistente
- ✅ **Sesiones seguras** con cookies
- ✅ **Frontend completo** servido desde el backend

## 🔗 **URLs de la aplicación**

### **Después del despliegue:**
- **Página principal**: `https://tu-app.onrender.com/`
- **Login**: `https://tu-app.onrender.com/login`
- **Registro**: `https://tu-app.onrender.com/registro`
- **Galería**: `https://tu-app.onrender.com/galeria`
- **Cartas**: `https://tu-app.onrender.com/cartas`
- **API**: `https://tu-app.onrender.com/api/*`

## ⚠️ **Limitaciones del plan gratuito**

- **750 horas/mes**: Se suspende por inactividad
- **Base de datos**: Se reinicia en cada deploy
- **Archivos**: Se pierden en cada deploy

## 🆘 **Solución de problemas**

### **Error de base de datos**
- Los usuarios se pierden en cada deploy (plan gratuito)
- La estructura de tablas se mantiene automáticamente

### **Error de archivos**
- Los archivos subidos se pierden en cada deploy
- Considera usar un servicio de almacenamiento externo

### **Error de sesiones**
- Verifica que `SESSION_SECRET` esté configurado en Render
- Las cookies deben ser seguras en HTTPS

## 📞 **Soporte**

Si tienes problemas:
1. Revisa los logs en Render
2. Verifica que la base de datos se esté creando
3. Asegúrate de que las variables de entorno estén configuradas
4. Revisa la consola del navegador

## 🎉 **¡Ventajas de esta nueva versión!**

- 🚀 **Despliegue más simple**: Solo un servicio
- 🔒 **Sin CORS**: Todo funciona perfectamente
- 💰 **Más económico**: Un solo servicio
- 📱 **Mejor UX**: Sin latencia entre frontend y backend
- 🛠️ **Mantenimiento más fácil**: Un solo lugar para todo
