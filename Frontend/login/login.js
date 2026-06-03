function toggleContrasena() {
    const input = document.getElementById('contrasena');
    const icono = document.getElementById('iconoOjo');
    if (input.type === 'password') {
        input.type = 'text';
        icono.innerHTML = `
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
            <line x1="1" y1="1" x2="23" y2="23"/>
        `;
    } else {
        input.type = 'password';
        icono.innerHTML = `
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
        `;
    }
}

/* ===== MOSTRAR MENSAJE DE ERROR ===== */
function mostrarError(mensaje) {
    const err = document.getElementById('mensajeError');
    document.getElementById('textoError').textContent = mensaje;
    err.classList.add('visible');
    setTimeout(() => err.classList.remove('visible'), 4000);
}

/* ===== INICIAR SESIÓN ===== */
async function iniciarSesion() {
    const usuario = document.getElementById('usuario').value.trim();
    const contrasena = document.getElementById('contrasena').value.trim();
    const btn = document.getElementById('btnLogin');

    // Validación campos vacíos
    if (!usuario || !contrasena) {
        mostrarError('Por favor completa todos los campos');
        return;
    }

    btn.classList.add('cargando');

    try {
        // Llama al backend
        const response = await fetch('http://localhost:8080/Vallelili/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ Usuario: usuario, Contrasena: contrasena })
        });

        const data = await response.text();

        if (!response.ok) {
            mostrarError(data);
            btn.classList.remove('cargando');
            return;
        }

        // Guarda el token en localStorage
        localStorage.setItem('token', data);

        // Decodifica el token para leer el rol
        const payload = JSON.parse(atob(data.split('.')[1]));
        localStorage.setItem('rol', payload.rol);
        localStorage.setItem('usuario', payload.sub);

        // Redirige según el rol
        if (payload.rol === 'Administrador') {
            window.location.href = '/Administrador/admin.html';
        } else {
            window.location.href = '/Estudiante/inicio/estudiante.html';
        }

    } catch (error) {
        mostrarError('Error de conexión, intenta de nuevo');
        btn.classList.remove('cargando');
    }
}

/* ===== TECLA ENTER ===== */
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') iniciarSesion();
});