/**
 * server.js — Servidor único para todo el Frontend
 * Sirve: /login, /Estudiante, /Administrador, /img
 * Ejecutar: node server.js
 */

const express = require('express');
const path    = require('path');
const app     = express();
const PORT    = 3000;

const ROOT = __dirname; // carpeta Frontend/

// ── Rutas estáticas ──────────────────────────────────────────────────────────
// Cada subcarpeta queda disponible bajo su propio prefijo de URL
app.use('/Estudiante',    express.static(path.join(ROOT, 'Estudiante')));
app.use('/Administrador', express.static(path.join(ROOT, 'Administrador')));
app.use('/img',           express.static(path.join(ROOT, 'img')));

// ── Páginas HTML ─────────────────────────────────────────────────────────────
// /            → login/index.html  (entrada principal)
// /estudiante  → Estudiante/modulos.html
// /admin       → Administrador/admin.html

app.get('/', (req, res) => {
  res.sendFile(path.join(ROOT, 'login', 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(ROOT, 'login', 'index.html'));
});

// Archivos estáticos del login (login.css, login.js)
app.use('/login', express.static(path.join(ROOT, 'login')));

app.get('/estudiante', (req, res) => {
  res.sendFile(path.join(ROOT, 'Estudiante', 'modulos.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(ROOT, 'Administrador', 'admin.html'));
});

// ── Fallback: cualquier ruta no reconocida vuelve al login ───────────────────
app.use((req, res) => {
  res.redirect('/');
});

// ── Arranque ─────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n Servidor corriendo en http://localhost:${PORT}`);
  console.log(`   Login       → http://localhost:${PORT}/`);
  console.log(`   Estudiante  → http://localhost:${PORT}/estudiante`);
  console.log(`   Admin       → http://localhost:${PORT}/admin\n`);
});