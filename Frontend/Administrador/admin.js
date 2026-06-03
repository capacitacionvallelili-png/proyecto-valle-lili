// ===== CONFIGURACIÓN =====
const API = 'http://localhost:8080/Vallelili';
const TOKEN = localStorage.getItem('token');
const HEADERS = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${TOKEN}`
};

// ===== PAGINACIÓN =====
// Cuántos registros mostrar por página en cada tabla
const POR_PAGINA = 8;

// Estado de paginación y datos para cada tabla
const estado = {
    estudiantes: { pagina: 1, datos: [] },
    admins: { pagina: 1, datos: [] },
    resultados: { pagina: 1, datos: [] }
};

// Variable para guardar el ID del usuario a eliminar
let idAEliminar = null;


/* ===== VERIFICAR AUTENTICACIÓN =====
   Redirige al login si no hay token o no es admin */
function verificarAuth() {
    const rol = localStorage.getItem('rol');
    if (!TOKEN || rol !== 'Administrador') {
        window.location.href = '../login/index.html';
    }
    const usuario = localStorage.getItem('usuario') || 'Admin';
    document.getElementById('nombreAdmin').textContent = usuario;
    document.getElementById('avatarLetra').textContent = usuario[0].toUpperCase();
}


/* ===== CERRAR SESIÓN ===== */
function cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    localStorage.removeItem('usuario');
    window.location.href = '../login/index.html';
}


/* ===== TOAST DE NOTIFICACIÓN =====
   Muestra un mensaje temporal en la esquina inferior derecha */
function mostrarToast(mensaje, tipo = 'exito') {
    const toast = document.getElementById('toast');
    toast.textContent = mensaje;
    toast.style.background = tipo === 'error' ? '#e53e3e' : '#163d27';
    toast.classList.add('visible');
    setTimeout(() => toast.classList.remove('visible'), 3000);
}


/* ===== TABS =====
   Cambia entre las secciones Estudiantes, Administradores y Resultados */
function cambiarTab(nombre) {
    // Quita la clase activo de todos los tabs y paneles
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('activo'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('activo'));

    // Activa el tab y panel seleccionado
    document.getElementById(`tab-${nombre}`).classList.add('activo');
    document.getElementById(`panel-${nombre}`).classList.add('activo');

    // Carga los datos del tab correspondiente
    if (nombre === 'estudiantes') cargarEstudiantes();
    if (nombre === 'administradores') cargarAdministradores();
    if (nombre === 'resultados') cargarResultados();
}


/* ===== MODALES =====
   Abre y cierra los modales agregando/quitando la clase 'visible' */
function abrirModal(id) {
    document.getElementById(id).classList.add('visible');
}

function cerrarModal(id) {
    document.getElementById(id).classList.remove('visible');
    // Limpia errores al cerrar
    const error = document.querySelector(`#${id} .modal-error`);
    if (error) error.textContent = '';
}


/* =====================================================
   SECCIÓN: ESTUDIANTES
   ===================================================== */

/* ===== CARGAR ESTUDIANTES =====
   Obtiene todas las asignaciones del backend */
async function cargarEstudiantes() {
    try {
        const response = await fetch(`${API}/asignaciones/listarTodos`, {
            headers: HEADERS
        });

        if (!response.ok) throw new Error('Error al cargar estudiantes');

        const asignaciones = await response.json();

        // Guarda todos los datos y resetea a página 1
        estado.estudiantes.datos = asignaciones;
        estado.estudiantes.pagina = 1;

        renderTablaEstudiantes();

    } catch (error) {
        document.getElementById('tablaEstudiantes').innerHTML =
            `<tr><td colspan="8" class="cargando-texto">Error al cargar los datos</td></tr>`;
    }
}


/* ===== RENDERIZAR TABLA DE ESTUDIANTES =====
   Muestra la página actual con paginación */
async function renderTablaEstudiantes(datosFiltrados = null) {
    const datos = datosFiltrados !== null ? datosFiltrados : estado.estudiantes.datos;
    const pagina = estado.estudiantes.pagina;
    const inicio = (pagina - 1) * POR_PAGINA;
    const fin = inicio + POR_PAGINA;
    const paginaActual = datos.slice(inicio, fin);

    const tbody = document.getElementById('tablaEstudiantes');

    if (datos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="cargando-texto">No hay estudiantes asignados aún</td></tr>`;
        document.getElementById('paginacionEstudiantes').innerHTML = '';
        return;
    }

    // Construye las filas de la página actual
    tbody.innerHTML = '';
    for (const asig of paginaActual) {
        const fila = await construirFila(asig);
        tbody.innerHTML += fila;
    }

    // Renderiza los controles de paginación
    renderPaginacion('paginacionEstudiantes', datos.length, pagina, 'cambiarPaginaEstudiantes');
}


/* ===== CONSTRUIR FILA DE ESTUDIANTE =====
   Igual al que funcionaba — crea el HTML de una fila con progreso y resultados */
async function construirFila(asig) {
    // Busca los resultados de evaluación para esta asignación
    let intento1 = '—';
    let intento2 = '—';

    try {
        const resResp = await fetch(`${API}/resultados/misResultados/${asig.id}`, {
            headers: HEADERS
        });
        // Solo procesa si la respuesta es exitosa
        if (resResp.ok) {
            const resultados = await resResp.json();
            resultados.sort((a, b) => a.numIntento - b.numIntento);
            if (resultados[0]) intento1 = `${resultados[0].Puntaje}%`;
            if (resultados[1]) intento2 = `${resultados[1].Puntaje}%`;
        }
        // Si es 404 simplemente ignora — deja los guiones
    } catch (e) { }

    // Color de la barra de progreso según el porcentaje
    const pct = asig.PorcentajeProgreso || 0;
    const colorBarra = pct === 100 ? 'completo' : pct > 0 ? 'medio' : 'inicio';

    // Badge de estado
    const badgeClase = asig.Estado === 'completado' ? 'badge-completado' :
        asig.Estado === 'activo' ? 'badge-activo' : 'badge-vencido';

   

    return `
        <tr>
            <td>${asig.infoUsuario?.usuario || '—'}</td>
            <td>${asig.infoUsuario?.Nombre || '—'}</td>
            <td>${asig.infoModulos?.Nombre || '—'}</td>
            <td>
                <div class="progreso-contenedor">
                    <div class="progreso-barra">
                        <div class="progreso-fill ${colorBarra}" style="width: ${pct}%"></div>
                    </div>
                    <span class="progreso-texto">${pct}%</span>
                </div>
            </td>
            <td><span class="badge ${badgeClase}">${asig.Estado}</span></td>
            <td>${intento1}</td>
            <td>${intento2}</td>
            <td>
               <div class="acciones">
                    ${asig.Estado !== 'vencido' ? `
                    <button class="btn-accion btn-reasignar"
                         onclick="reasignar('${asig.infoUsuario?.id}', '${asig.infoModulos?.id}')">
                         Reasignar
                    </button>` : ''}
                    <button class="btn-accion btn-eliminar-tabla"
                        onclick="pedirEliminar('${asig.infoUsuario?.id}', '${asig.infoUsuario?.usuario}')">
                        Eliminar usuario
                    </button>
                </div>
            </td>
        </tr>
    `;
}


/* ===== FILTRAR TABLA DE ESTUDIANTES =====
   Filtra localmente los datos ya cargados */
function filtrarTabla(tablaId) {
    const inputId = tablaId === 'tablaEstudiantes' ? 'inputBuscarEstudiante' : 'inputBuscarAdmin';
    const texto = document.getElementById(inputId).value.toLowerCase();

    if (tablaId === 'tablaEstudiantes') {
        const filtrados = estado.estudiantes.datos.filter(asig =>
            (asig.infoUsuario?.usuario || '').toLowerCase().startsWith(texto) 
        );
        estado.estudiantes.pagina = 1;
        renderTablaEstudiantes(filtrados);
    }

    if (tablaId === 'tablaAdmins') {
        const filtrados = estado.admins.datos.filter(u =>
            (u.Usuario || '').toLowerCase().includes(texto) ||
            (u.Nombre || '').toLowerCase().includes(texto)
        );
        estado.admins.pagina = 1;
        renderTablaAdmins(filtrados);
    }
}


/* ===== CARGAR MÓDULOS =====
   Obtiene los módulos del backend y los muestra como checkboxes */
async function cargarModulos() {
    try {
        const response = await fetch(`${API}/modulos/listar`, {
            headers: HEADERS
        });
        const modulos = await response.json();
        const contenedor = document.getElementById('listaModulos');

        contenedor.innerHTML = modulos.map(m => `
            <label>
                <input type="checkbox" value="${m.id}" name="modulo"/>
                ${m.Nombre}
            </label>
        `).join('');

    } catch (error) {
        document.getElementById('listaModulos').innerHTML =
            '<p style="color: var(--rojo); font-size: 0.82rem;">Error al cargar módulos</p>';
    }
}


/* ===== CREAR ESTUDIANTE =====
   Crea el usuario y luego asigna los módulos seleccionados */
async function crearEstudiante() {
    const usuario = document.getElementById('nuevoUsuario').value.trim();
    const contrasena = document.getElementById('nuevaContrasena').value.trim();
    const nombre = document.getElementById('nuevoNombre').value.trim();
    const errorEl = document.getElementById('errorCrearEstudiante');

    // Validación campos vacíos
    if (!usuario || !contrasena || !nombre) {
        errorEl.textContent = 'Por favor completa todos los campos';
        return;
    }

    // Validación mínimo un módulo — declarada UNA sola vez aquí
    const modulosSeleccionados = document.querySelectorAll('input[name="modulo"]:checked');
    if (modulosSeleccionados.length === 0) {
        errorEl.textContent = 'Debes seleccionar al menos un módulo';
        return;
    }

    try {
        // 1. Crear el usuario
        const respUsuario = await fetch(`${API}/usuario/insertar`, {
            method: 'POST',
            headers: HEADERS,
            body: JSON.stringify({
                Usuario: usuario,
                Contrasena: contrasena,
                Rol: 'Estudiante',
                Nombre: nombre
            })
        });

        if (!respUsuario.ok) {
            errorEl.textContent = await respUsuario.text();
            return;
        }

        const nuevoUsuario = await respUsuario.json();

        // 2. Asignar cada módulo seleccionado — usa la misma variable de arriba
        for (const modulo of modulosSeleccionados) {
            await fetch(`${API}/asignaciones/agregar`, {
                method: 'POST',
                headers: HEADERS,
                body: JSON.stringify({
                    usuarioId: nuevoUsuario.id,
                    moduloId: modulo.value
                })
            });
        }

        // 3. Cerrar modal y recargar tabla
        cerrarModal('modalCrearEstudiante');
        mostrarToast('Estudiante creado correctamente');
        cargarEstudiantes(); // ← nombre correcto en el nuevo JS

    } catch (error) {
        errorEl.textContent = 'Error al crear el estudiante';
    }
}


/* ===== ABRIR MODAL ASIGNAR MÓDULO  CUANDO EL USUARIO YA ESTA CREADO=====
   Carga la lista de estudiantes y módulos para asignar */
async function abrirModalAsignarModulo() {
    // Guarda todos los estudiantes para filtrar después
    const respUsuarios = await fetch(`${API}/usuario/listartodos`, { headers: HEADERS });
    const usuarios = await respUsuarios.json();
    window._estudiantesAsignar = usuarios.filter(u => u.Rol === 'Estudiante');

    // Carga módulos
    const respModulos = await fetch(`${API}/modulos/listar`, { headers: HEADERS });
    const modulos = await respModulos.json();
    document.getElementById('selectModuloAsignar').innerHTML =
        modulos.map(m => `<option value="${m.id}">${m.Nombre}</option>`).join('');

    // Limpia el buscador
    document.getElementById('inputBuscarEstudianteAsignar').value = '';
    document.getElementById('listaEstudiantesAsignar').innerHTML = '';
    document.getElementById('estudianteSeleccionadoId').value = '';
    document.getElementById('errorAsignarModulo').textContent = '';

    abrirModal('modalAsignarModulo');
}

/* ===== CONFIRMAR ASIGNAR MÓDULO ===== */
async function confirmarAsignarModulo() {
    const usuarioId = document.getElementById('estudianteSeleccionadoId').value;
    const moduloId = document.getElementById('selectModuloAsignar').value;
    const errorEl = document.getElementById('errorAsignarModulo');

    // Validar que seleccionó estudiante y módulo
    if (!usuarioId) {
        errorEl.textContent = 'Debes seleccionar un estudiante';
        return;
    }
    if (!moduloId) {
        errorEl.textContent = 'Debes seleccionar un módulo';
        return;
    }

    try {
        const response = await fetch(`${API}/asignaciones/agregar`, {
            method: 'POST',
            headers: HEADERS,
            body: JSON.stringify({ usuarioId, moduloId })
        });

        if (!response.ok) {
            errorEl.textContent = await response.text();
            return;
        }

        cerrarModal('modalAsignarModulo');
        mostrarToast('Módulo asignado correctamente');
        cargarEstudiantes();

    } catch (error) {
        errorEl.textContent = 'Error al asignar el módulo';
    }
}









/* ===== FILTRAR ESTUDIANTES EN EL MODAL ===== */
function filtrarEstudiantesAsignar() {
    const texto = document.getElementById('inputBuscarEstudianteAsignar').value.toLowerCase();
    const lista = document.getElementById('listaEstudiantesAsignar');

    if (!texto) {
        lista.innerHTML = '';
        return;
    }

    const filtrados = window._estudiantesAsignar.filter(u =>
        u.Usuario.toLowerCase().includes(texto) ||
        u.Nombre.toLowerCase().includes(texto)
    );

    if (filtrados.length === 0) {
        lista.innerHTML = '<p class="sin-resultados">No se encontraron estudiantes</p>';
        return;
    }

    // Muestra máximo 5 resultados
    lista.innerHTML = filtrados.slice(0, 5).map(u => `
        <div class="estudiante-opcion" onclick="seleccionarEstudianteAsignar('${u.id}', '${u.Nombre} (${u.Usuario})')">
            <strong>${u.Nombre}</strong>
            <span>${u.Usuario}</span>
        </div>
    `).join('');
}

/* ===== SELECCIONAR ESTUDIANTE ===== */
function seleccionarEstudianteAsignar(id, nombre) {
    document.getElementById('inputBuscarEstudianteAsignar').value = nombre;
    document.getElementById('estudianteSeleccionadoId').value = id;
    document.getElementById('listaEstudiantesAsignar').innerHTML = '';
}



/* ===== REASIGNAR MÓDULO =====
   Mismo endpoint /agregar que ya funcionaba */
async function reasignar(usuarioId, moduloId) {
    try {
        const response = await fetch(`${API}/asignaciones/agregar`, {
            method: 'POST',
            headers: HEADERS,
            body: JSON.stringify({ usuarioId, moduloId })
        });

        if (!response.ok) throw new Error();

        mostrarToast('Módulo reasignado correctamente');
        cargarEstudiantes(); // Recarga la tabla

    } catch (error) {
        mostrarToast('Error al reasignar el módulo', 'error');
    }
}


/* ===== ELIMINAR USUARIO ===== */
function pedirEliminar(id, usuario) {
    idAEliminar = id;
    document.getElementById('usuarioAEliminar').textContent = usuario;
    abrirModal('modalEliminar');
}

async function confirmarEliminar() {
    if (!idAEliminar) return;

    try {
        const response = await fetch(`${API}/usuario/eliminar/${idAEliminar}`, {
            method: 'DELETE',
            headers: HEADERS
        });

        if (!response.ok) throw new Error();

        cerrarModal('modalEliminar');
        mostrarToast('Usuario eliminado correctamente');
        cargarEstudiantes(); // Recarga la tabla
        idAEliminar = null;

    } catch (error) {
        mostrarToast('Error al eliminar el usuario', 'error');
    }
}


/* =====================================================
   SECCIÓN: ADMINISTRADORES
   ===================================================== */

/* ===== CARGAR ADMINISTRADORES =====
   Obtiene todos los usuarios y filtra los Administradores */
async function cargarAdministradores() {
    try {
        const response = await fetch(`${API}/usuario/listartodos`, {
            headers: HEADERS
        });

        if (!response.ok) throw new Error();

        const usuarios = await response.json();
        // Filtra solo los administradores
        const admins = usuarios.filter(u => u.Rol === 'Administrador');

        estado.admins.datos = admins;
        estado.admins.pagina = 1;
        renderTablaAdmins();

    } catch (error) {
        document.getElementById('tablaAdmins').innerHTML =
            `<tr><td colspan="5" class="cargando-texto">Error al cargar administradores</td></tr>`;
    }
}


/* ===== RENDERIZAR TABLA DE ADMINISTRADORES ===== */
function renderTablaAdmins(datosFiltrados = null) {
    const datos = datosFiltrados !== null ? datosFiltrados : estado.admins.datos;
    const pagina = estado.admins.pagina;
    const inicio = (pagina - 1) * POR_PAGINA;
    const paginaActual = datos.slice(inicio, inicio + POR_PAGINA);

    const tbody = document.getElementById('tablaAdmins');

    if (datos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="cargando-texto">No hay administradores</td></tr>`;
        document.getElementById('paginacionAdmins').innerHTML = '';
        return;
    }

    tbody.innerHTML = paginaActual.map(u => `
        <tr>
            <td>${u.Usuario || '—'}</td>
            <td>${u.Nombre || '—'}</td>
            <td>${u.fecha_creacion ? new Date(u.fecha_creacion).toLocaleDateString('es-CO') : '—'}</td>
            <td><span class="badge ${u.Activo ? 'badge-activo' : 'badge-vencido'}">
                ${u.Activo ? 'Activo' : 'Inactivo'}
            </span></td>
            <td>
                <div class="acciones">
                    <button class="btn-accion btn-eliminar-tabla"
                        onclick="pedirEliminar('${u.id}', '${u.Usuario}')">
                        Eliminar
                    </button>
                </div>
            </td>
        </tr>
    `).join('');

    renderPaginacion('paginacionAdmins', datos.length, pagina, 'cambiarPaginaAdmins');
}


/* ===== CREAR ADMINISTRADOR ===== */
async function crearAdministrador() {
    const usuario = document.getElementById('nuevoUsuarioAdmin').value.trim();
    const contrasena = document.getElementById('nuevaContrasenaAdmin').value.trim();
    const nombre = document.getElementById('nuevoNombreAdmin').value.trim();
    const errorEl = document.getElementById('errorCrearAdmin');

    if (!usuario || !contrasena || !nombre) {
        errorEl.textContent = 'Por favor completa todos los campos';
        return;
    }

    try {
        const response = await fetch(`${API}/usuario/insertar`, {
            method: 'POST',
            headers: HEADERS,
            body: JSON.stringify({
                Usuario: usuario,
                Contrasena: contrasena,
                Rol: 'Administrador',
                Nombre: nombre
            })
        });

        if (!response.ok) {
            errorEl.textContent = await response.text();
            return;
        }

        cerrarModal('modalCrearAdmin');
        mostrarToast('Administrador creado correctamente');
        cargarAdministradores(); // Recarga la tabla de admins

    } catch (error) {
        errorEl.textContent = 'Error al crear el administrador';
    }
}


/* =====================================================
   SECCIÓN: RESULTADOS
   ===================================================== */

/* ===== CARGAR RESULTADOS ===== */
async function cargarResultados() {
    try {
        const response = await fetch(`${API}/resultados/listarTodos`, {
            headers: HEADERS
        });

        if (!response.ok) throw new Error();

        const resultados = await response.json();
        estado.resultados.datos = resultados;
        estado.resultados.pagina = 1;
        renderTablaResultados();

    } catch (error) {
        document.getElementById('tablaResultados').innerHTML =
            `<tr><td colspan="6" class="cargando-texto">Error al cargar resultados</td></tr>`;
    }
}


/* ===== RENDERIZAR TABLA DE RESULTADOS ===== */
function renderTablaResultados(datosFiltrados = null) {
    const datos = datosFiltrados !== null ? datosFiltrados : estado.resultados.datos;
    const pagina = estado.resultados.pagina;
    const inicio = (pagina - 1) * POR_PAGINA;
    const paginaActual = datos.slice(inicio, inicio + POR_PAGINA);

    const tbody = document.getElementById('tablaResultados');

    if (datos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="cargando-texto">No hay resultados aún</td></tr>`;
        document.getElementById('paginacionResultados').innerHTML = '';
        return;
    }

    tbody.innerHTML = paginaActual.map(r => {
        const aprobado = r.Puntaje >= 80;
        return `
            <tr>
                <td>${r.infoUsuario?.Nombre || '—'}</td>
                <td>${r.infoModulos?.Nombre || '—'}</td>
                <td>Intento ${r.numIntento}</td>
                <td><strong>${r.Puntaje}%</strong></td>
                <td>${r.FechaRealizacion ? new Date(r.FechaRealizacion).toLocaleDateString('es-CO') : '—'}</td>
                <td><span class="badge ${aprobado ? 'badge-aprobado' : 'badge-reprobado'}">
                    ${aprobado ? 'Aprobado' : 'Reprobado'}
                </span></td>
            </tr>
        `;
    }).join('');

    renderPaginacion('paginacionResultados', datos.length, pagina, 'cambiarPaginaResultados');
}


/* ===== FILTRAR RESULTADOS =====
   Filtra por nombre de estudiante Y por módulo simultáneamente */
function filtrarResultados() {
    const texto = document.getElementById('inputBuscarResultado').value.toLowerCase();
    const modulo = document.getElementById('filtroModulo').value;

    const filtrados = estado.resultados.datos.filter(r => {
        const coincideTexto = !texto ||
            (r.infoUsuario?.Nombre || '').toLowerCase().includes(texto) ||
            (r.infoUsuario?.usuario || '').toLowerCase().includes(texto);

        const coincideModulo = !modulo || (r.infoModulos?.Nombre || '') === modulo;

        return coincideTexto && coincideModulo;
    });

    estado.resultados.pagina = 1;
    renderTablaResultados(filtrados);
}


/* =====================================================
   PAGINACIÓN
   ===================================================== */

/* ===== RENDERIZAR CONTROLES DE PAGINACIÓN =====
   Genera los botones de página dinámicamente */
function renderPaginacion(contenedorId, total, paginaActual, nombreFuncion, datosFiltrados) {
    const totalPaginas = Math.ceil(total / POR_PAGINA);
    const contenedor = document.getElementById(contenedorId);

    if (totalPaginas <= 1) {
        contenedor.innerHTML = '';
        return;
    }

    let html = '';

    // Botón anterior
    html += `<button class="btn-pagina" ${paginaActual === 1 ? 'disabled' : ''}
        onclick="${nombreFuncion}(${paginaActual - 1})">‹</button>`;

    // Botones de páginas
    for (let i = 1; i <= totalPaginas; i++) {
        html += `<button class="btn-pagina ${i === paginaActual ? 'activo' : ''}"
            onclick="${nombreFuncion}(${i})">${i}</button>`;
    }

    // Botón siguiente
    html += `<button class="btn-pagina" ${paginaActual === totalPaginas ? 'disabled' : ''}
        onclick="${nombreFuncion}(${paginaActual + 1})">›</button>`;

    const inicio = (paginaActual - 1) * POR_PAGINA + 1;
    const fin = Math.min(paginaActual * POR_PAGINA, total);
    html += `<span class="paginacion-info">${inicio}–${fin} de ${total}</span>`;

    contenedor.innerHTML = html;
}

// Funciones globales de paginación — llamadas desde los botones
function cambiarPaginaEstudiantes(p) {
    estado.estudiantes.pagina = p;
    renderTablaEstudiantes();
}

function cambiarPaginaAdmins(p) {
    estado.admins.pagina = p;
    renderTablaAdmins();
}

function cambiarPaginaResultados(p) {
    estado.resultados.pagina = p;
    renderTablaResultados();
}





/* ===== INICIALIZACIÓN =====
   Se ejecuta cuando carga la página */
document.addEventListener('DOMContentLoaded', () => {
    verificarAuth();
    cargarEstudiantes(); // Carga el tab inicial de estudiantes
});