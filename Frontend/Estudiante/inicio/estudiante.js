/* ===== VERIFICAR AUTENTICACIÓN =====
   Si no hay token o el rol no es Estudiante, redirige al login */
function verificarAuth() {
    const token = localStorage.getItem('token');
    const rol = localStorage.getItem('rol');

    if (!token || rol !== 'Estudiante') {
        window.location.href = '/login';
    }

    // Muestra el nombre del estudiante en la navbar
    const usuario = localStorage.getItem('usuario') || 'Estudiante';
    document.getElementById('nombreEstudiante').textContent = usuario;
    document.getElementById('avatarLetra').textContent = usuario[0].toUpperCase();
}


/* ===== CERRAR SESIÓN =====
   Borra el token y redirige al login */
function cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    localStorage.removeItem('usuario');
    window.location.href = '/login/index.html';
}


/* ===== INICIALIZACIÓN ===== */
document.addEventListener('DOMContentLoaded', () => {
    verificarAuth();
});