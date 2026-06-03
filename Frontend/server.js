/**
 * server.js — Servidor único para todo el Frontend
 * Sirve: /login, /Estudiante, /Administrador, /img
 * Ejecutar: node server.js
 */

const express = require('express');
const path    = require('path');
const app     = express();
const PORT    = process.env.PORT || 3000;

const ROOT = __dirname; // carpeta Frontend/

// ── Servir TODO el contenido estático de la raíz ────────────────────────────
// Esto cubre cualquier .js, .css, .png, .svg, etc. de cualquier subcarpeta
app.use(express.static(ROOT));

// ── Páginas HTML con rutas limpias ───────────────────────────────────────────
app.get('/', (req, res) => {
  res.sendFile(path.join(ROOT, 'login', 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(ROOT, 'login', 'index.html'));
});

app.get('/estudiante', (req, res) => {
  res.sendFile(path.join(ROOT, 'Estudiante', 'modulos.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(ROOT, 'Administrador', 'admin.html'));
});

// ── Fallback: solo para rutas que NO sean archivos estáticos ─────────────────
app.use((req, res, next) => {
  // Si la URL tiene extensión (es un archivo), devuelve 404 real
  if (path.extname(req.path)) {
    return res.status(404).send('Archivo no encontrado: ' + req.path);
  }
  // Si es una ruta de navegación desconocida, vuelve al login
  res.redirect('/');
});

// ── Arranque ─────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n Servidor corriendo en http://localhost:${PORT}`);
  console.log(`   Login       → http://localhost:${PORT}/`);
  console.log(`   Estudiante  → http://localhost:${PORT}/estudiante`);
  console.log(`   Admin       → http://localhost:${PORT}/admin\n`);
});