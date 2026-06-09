const express = require('express');
const path    = require('path');
const app     = express();
const PORT    = process.env.PORT || 3000; // ← CRÍTICO para Railway

const ROOT = __dirname;

// ── Estáticos (ANTES de las rutas GET) ──────────────────────────────────────
app.use('/login',         express.static(path.join(ROOT, 'login')));
app.use('/Estudiante',    express.static(path.join(ROOT, 'Estudiante')));
app.use('/estudiante',    express.static(path.join(ROOT, 'Estudiante'))); // alias Linux
app.use('/Administrador', express.static(path.join(ROOT, 'Administrador')));
app.use('/administrador', express.static(path.join(ROOT, 'Administrador'))); // alias Linux
app.use('/img',           express.static(path.join(ROOT, 'img')));

// ── Páginas HTML ─────────────────────────────────────────────────────────────
app.get('/', (req, res) =>
  res.sendFile(path.join(ROOT, 'login', 'index.html')));

app.get('/login', (req, res) =>
  res.sendFile(path.join(ROOT, 'login', 'index.html')));

app.get('/estudiante', (req, res) =>
  res.sendFile(path.join(ROOT, 'Estudiante', 'inicio', 'estudiante.html')));

app.get('/modulos', (req, res) =>
  res.sendFile(path.join(ROOT, 'Estudiante', 'modulos.html')));

app.get('/admin', (req, res) =>
  res.sendFile(path.join(ROOT, 'Administrador', 'admin.html')));

// ── Fallback ──────────────────────────────────────────────────────────────────
app.use((req, res) => res.redirect('/'));

app.listen(PORT, () => {
  console.log(`✅ Servidor en http://localhost:${PORT}`);
});