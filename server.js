const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const db = new sqlite3.Database("./database.db");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads");
  },
  filename: function (req, file, cb) {
    const nombre = Date.now() + "_" + file.originalname;
    cb(null, nombre);
  }
});
const upload = multer({ storage });


// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: "amor", resave: false, saveUninitialized: true }));

// Rutas públicas que no requieren login
const rutasPublicas = ["/login.html", "/registro.html", "/login", "/register", "/css/", "/js/", "/img/"];

// Middleware de protección
app.use((req, res, next) => {
  const ruta = req.originalUrl; // <-- CAMBIAMOS req.path por req.originalUrl
  const esPublica = rutasPublicas.some(p => ruta.startsWith(p));
  if (!esPublica && !req.session.user) {
    return res.redirect("/login.html");
  }
  next();
});

// Servir archivos estáticos
app.use(express.static("public"));

// Crear tabla de usuarios
db.run(`CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user TEXT,
  pass TEXT
)`);

// Crear tabla de cartas
db.run(`CREATE TABLE IF NOT EXISTS cartas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user TEXT,
  contenido TEXT,
  fecha TEXT
)`);


// Tabla para guardar fotos
db.run(`CREATE TABLE IF NOT EXISTS fotos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filename TEXT,
  user TEXT,
  fecha TEXT
)`);



app.use(express.json());

// Rutas
app.post("/register", async (req, res) => {
  const hash = await bcrypt.hash(req.body.pass, 10);
  db.run("INSERT INTO usuarios (user, pass) VALUES (?, ?)", [req.body.user, hash]);
  res.redirect("/login.html");
});

app.post("/login", (req, res) => {
  db.get("SELECT * FROM usuarios WHERE user = ?", [req.body.user], async (err, user) => {
    if (user && await bcrypt.compare(req.body.pass, user.pass)) {
      req.session.user = user.user;
      res.redirect("/index.html");
    } else {
      res.send("Usuario o contraseña incorrectos.");
    }
  });
});

app.post("/cartas", (req, res) => {
  if (!req.session.user) return res.status(401).send("No autorizado");
  const { contenido } = req.body;
  const fecha = new Date().toLocaleString("es-ES");
  db.run("INSERT INTO cartas (user, contenido, fecha) VALUES (?, ?, ?)", [req.session.user, contenido, fecha]);
res.redirect("/cartas.html");
});

// Obtener cartas del usuario
app.get("/cartas", (req, res) => {
  if (!req.session.user) return res.status(401).send("No autorizado");
db.all("SELECT user, contenido, fecha FROM cartas ORDER BY id DESC", (err, rows) => {
  res.json(rows);
});

});
app.get("/usuario", (req, res) => {
  if (!req.session.user) return res.json({ user: null });
  res.json({ user: req.session.user });
});

app.post("/subir-foto", upload.single("foto"), (req, res) => {
  if (!req.session.user) return res.status(401).send("No autorizado");

  const filename = req.file.filename;
  const user = req.session.user;
  const fecha = new Date().toLocaleString("es-ES");

  db.run("INSERT INTO fotos (filename, user, fecha) VALUES (?, ?, ?)", [filename, user, fecha]);
  res.redirect("/galeria.html");
});


const fs = require("fs");

app.get("/fotos", (req, res) => {
  db.all("SELECT id, filename, user FROM fotos ORDER BY id DESC", [], (err, rows) => {
    if (err) return res.json([]);
    const resultado = rows.map(f => ({
      id: f.id,
      src: "/uploads/" + f.filename,
      user: f.user,
      puedeBorrar: f.user === req.session.user
    }));
    res.json(resultado);
  });
});

app.post("/borrar-foto", (req, res) => {
  const id = req.body.id;
  const usuario = req.session.user;

  db.get("SELECT filename, user FROM fotos WHERE id = ?", [id], (err, row) => {
    if (!row || row.user !== usuario) return res.status(403).send("No autorizado");

    const filePath = path.join(__dirname, "public/uploads", row.filename);
    fs.unlink(filePath, () => {
      db.run("DELETE FROM fotos WHERE id = ?", [id]);
      res.sendStatus(200);
    });
  });
});





app.listen(3000, () => {
  console.log("Servidor corriendo en http://localhost:3000");
});
