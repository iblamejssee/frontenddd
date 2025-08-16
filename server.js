const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const multer = require("multer");
const fs = require("fs");

const app = express();

// Configuración de multer para Render
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "public/uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const nombre = Date.now() + "_" + file.originalname;
    cb(null, nombre);
  }
});
const upload = multer({ storage });

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configuración de sesión para producción
app.use(session({ 
  secret: process.env.SESSION_SECRET || "amor-secreto-cambiar-en-produccion", 
  resave: false, 
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'lax'
  }
});

// Base de datos - usar ruta absoluta para Render
const dbPath = process.env.NODE_ENV === 'production' 
  ? path.join(__dirname, 'database.db')
  : './database.db';

const db = new sqlite3.Database(dbPath);

// Crear tablas si no existen
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user TEXT UNIQUE,
    pass TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS cartas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user TEXT,
    contenido TEXT,
    fecha TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS fotos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT,
    user TEXT,
    fecha TEXT
  )`);
});

// Servir archivos estáticos del frontend
app.use(express.static("public"));

// Rutas de la API
app.post("/api/register", async (req, res) => {
  try {
    const { user, pass } = req.body;
    
    if (!user || !pass) {
      return res.status(400).json({ success: false, message: "Usuario y contraseña son requeridos" });
    }

    const hash = await bcrypt.hash(pass, 10);
    
    db.run("INSERT INTO usuarios (user, pass) VALUES (?, ?)", [user, hash], function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ success: false, message: "El usuario ya existe" });
        }
        return res.status(500).json({ success: false, message: "Error del servidor" });
      }
      res.json({ success: true, message: "Usuario registrado exitosamente" });
    });
  } catch (error) {
    console.error("Error en registro:", error);
    res.status(500).json({ success: false, message: "Error del servidor" });
  }
});

app.post("/api/login", (req, res) => {
  const { user, pass } = req.body;
  
  if (!user || !pass) {
    return res.status(400).json({ success: false, message: "Usuario y contraseña son requeridos" });
  }

  db.get("SELECT * FROM usuarios WHERE user = ?", [user], async (err, userRecord) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Error del servidor" });
    }
    
    if (userRecord && await bcrypt.compare(pass, userRecord.pass)) {
      req.session.user = userRecord.user;
      res.json({ success: true, message: "Login exitoso" });
    } else {
      res.status(401).json({ success: false, message: "Usuario o contraseña incorrectos" });
    }
  });
});

app.post("/api/cartas", (req, res) => {
  if (!req.session.user) return res.status(401).json({ success: false, message: "No autorizado" });
  
  const { contenido } = req.body;
  
  if (!contenido || contenido.trim() === '') {
    return res.status(400).json({ success: false, message: "El contenido de la carta es requerido" });
  }
  
  const fecha = new Date().toLocaleString("es-ES");
  
  db.run("INSERT INTO cartas (user, contenido, fecha) VALUES (?, ?, ?)", [req.session.user, contenido.trim(), fecha], function(err) {
    if (err) {
      console.error("Error al guardar carta:", err);
      return res.status(500).json({ success: false, message: "Error al guardar la carta" });
    }
    res.json({ success: true, message: "Carta guardada exitosamente" });
  });
});

app.get("/api/cartas", (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: "No autorizado" });
  
  db.all("SELECT user, contenido, fecha FROM cartas ORDER BY id DESC", (err, rows) => {
    if (err) {
      console.error("Error al obtener cartas:", err);
      return res.status(500).json([]);
    }
    res.json(rows || []);
  });
});

app.get("/api/usuario", (req, res) => {
  if (!req.session.user) return res.json({ user: null });
  res.json({ user: req.session.user });
});

app.post("/api/subir-foto", upload.single("foto"), (req, res) => {
  if (!req.session.user) return res.status(401).json({ success: false, message: "No autorizado" });

  if (!req.file) {
    return res.status(400).json({ success: false, message: "No se subió ningún archivo" });
  }

  const filename = req.file.filename;
  const user = req.session.user;
  const fecha = new Date().toLocaleString("es-ES");

  db.run("INSERT INTO fotos (filename, user, fecha) VALUES (?, ?, ?)", [filename, user, fecha], function(err) {
    if (err) {
      console.error("Error al guardar foto:", err);
      return res.status(500).json({ success: false, message: "Error al guardar la foto" });
    }
    res.json({ success: true, message: "Foto subida exitosamente", filename: filename });
  });
});

app.get("/api/fotos", (req, res) => {
  db.all("SELECT id, filename, user FROM fotos ORDER BY id DESC", [], (err, rows) => {
    if (err) {
      console.error("Error al obtener fotos:", err);
      return res.json([]);
    }
    
    const resultado = rows.map(f => ({
      id: f.id,
      src: `/uploads/${f.filename}`,
      user: f.user,
      puedeBorrar: f.user === req.session.user
    }));
    res.json(resultado);
  });
});

app.post("/api/borrar-foto", (req, res) => {
  if (!req.session.user) return res.status(401).json({ success: false, message: "No autorizado" });
  
  const { id } = req.body;
  
  if (!id) {
    return res.status(400).json({ success: false, message: "ID de foto requerido" });
  }

  db.get("SELECT filename, user FROM fotos WHERE id = ?", [id], (err, row) => {
    if (err) {
      console.error("Error al buscar foto:", err);
      return res.status(500).json({ success: false, message: "Error del servidor" });
    }
    
    if (!row) {
      return res.status(404).json({ success: false, message: "Foto no encontrada" });
    }
    
    if (row.user !== req.session.user) {
      return res.status(403).json({ success: false, message: "No tienes permiso para borrar esta foto" });
    }

    const filePath = path.join(__dirname, "public/uploads", row.filename);
    
    // Borrar archivo del sistema de archivos
    fs.unlink(filePath, (unlinkErr) => {
      if (unlinkErr) {
        console.warn("Archivo no encontrado en el sistema:", unlinkErr.message);
      }
      
      // Borrar registro de la base de datos
      db.run("DELETE FROM fotos WHERE id = ?", [id], function(deleteErr) {
        if (deleteErr) {
          console.error("Error al borrar foto de la BD:", deleteErr);
          return res.status(500).json({ success: false, message: "Error al borrar la foto" });
        }
        res.json({ success: true, message: "Foto borrada exitosamente" });
      });
    });
  });
});

app.post("/api/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Error al cerrar sesión" });
    }
    res.json({ success: true, message: "Sesión cerrada exitosamente" });
  });
});

// Ruta de salud para Render
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Rutas del frontend - servir páginas HTML
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/registro", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "registro.html"));
});

app.get("/galeria", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "galeria.html"));
});

app.get("/cartas", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "cartas.html"));
});

app.get("/detalles", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "detalles.html"));
});

app.get("/pedidadenovio", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "pedidadenovio.html"));
});

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "public", "index.html"));
});

// Manejo de errores generales
app.use((err, req, res, next) => {
  console.error("Error del servidor:", err);
  res.status(500).json({ error: "Error interno del servidor" });
});

// Configuración del puerto para Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
  console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Frontend y API funcionando en: http://localhost:${PORT}`);
});
