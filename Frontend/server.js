const express = require('express');
const path    = require('path');
const app     = express();
const PORT    = process.env.PORT || 3000; // ← fix Railway

const ROOT = __dirname;

// Estáticos con aliases en minúscula (Linux es case-sensitive)
app.use('/Estudiante',    express.static(path.join(ROOT, 'Estudiante')));
app.use('/estudiante',    express.static(path.join(ROOT, 'Estudiante')));
app.use('/Administrador', express.static(path.join(ROOT, 'Administrador')));
app.use('/administrador', express.static(path.join(ROOT, 'Administrador')));
app.use('/img',           express.static(path.join(ROOT, 'img')));
app.use('/login',         express.static(path.join(ROOT, 'login')));

// Páginas HTML
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

// Fallback
app.use((req, res) => {
  res.redirect('/');
});

app.listen(PORT, () => {
  console.log(`✅ Servidor en http://localhost:${PORT}`);
});