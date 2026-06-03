/* =====================================================
   MODULOS.JS — Página de módulos del estudiante
   type="module" en el HTML → funciones del HTML en window
   ===================================================== */

import { iniciarSeccion1, destruirSeccion1 } from './threejs/benehearth/seccion1.js';
import { iniciarSeccion2, destruirSeccion2 } from './threejs/benehearth/seccion2.js';
import { iniciarSeccion3, destruirSeccion3 } from './threejs/benehearth/seccion3.js';
import { iniciarSeccion4, destruirSeccion4 } from './threejs/benehearth/seccion4.js';
import { iniciarSeccion5, destruirSeccion5 } from './threejs/benehearth/seccion5.js';
import { iniciarSeccion6, destruirSeccion6 } from './threejs/benehearth/seccion6.js';
import { iniciarSeccion7, destruirSeccion7 } from './threejs/benehearth/seccion7.js';

import { iniciarSeccion1 as nihonS1, destruirSeccion1 as nihonD1 } from './threejs/nihon/seccion1.js';
import { iniciarSeccion2 as nihonS2, destruirSeccion2 as nihonD2 } from './threejs/nihon/seccion2.js';
import { iniciarSeccion3 as nihonS3, destruirSeccion3 as nihonD3 } from './threejs/nihon/seccion3.js';
import { iniciarSeccion4 as nihonS4, destruirSeccion4 as nihonD4 } from './threejs/nihon/seccion4.js';
import { iniciarSeccion5 as nihonS5, destruirSeccion5 as nihonD5 } from './threejs/nihon/seccion5.js';
import { iniciarSeccion6 as nihonS6, destruirSeccion6 as nihonD6 } from './threejs/nihon/seccion6.js';
import { iniciarSeccion7 as nihonS7, destruirSeccion7 as nihonD7 } from './threejs/nihon/seccion7.js';

import { iniciarEvaluacion, destruirEvaluacion } from './threejs/benehearth/evaluacion.js';
import { iniciarEvaluacion as nihonEval, destruirEvaluacion as nihonDestrEval } from './threejs/nihon/evaluacion.js';

/* ===== CONSTANTES ===== */
const API = 'https://backend-production-2be1d.up.railway.app/Vallelili';
const TOKEN = localStorage.getItem('token');
const USUARIO = localStorage.getItem('usuario');
const HEADERS = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${TOKEN}`
};

/* ===== NOMBRES PERSONALIZADOS DE SECCIONES ===== */
const NOMBRES_SECCIONES = {
    'Beneheart D6': {
        1: 'Introducción',
        2: 'Partes del dispositivo',
        3: 'Prueba de usuario',
        4: 'Modo monitor',
        5: 'Desfibrilación manual',
        6: 'Cardioversión',
        7: "Marcapasos"
    },
    'Nihon Koden': {
        1: 'Introducción',
        2: 'Partes del dispositivo',
        3: 'Chequeo Básico',
        4: 'Modo monitor',
        5: 'Desfribilación Manual',
        6: 'Cardioversión',
        7: "Palas Internas"
    }
};

/* ===== ESTADO GLOBAL ===== */
const estado = {
    modulos: [],
    asignaciones: {},
    moduloActivo: null,
    seccionActiva: null,
    asignacionId: null
};

/* ===== AUTENTICACIÓN ===== */
function verificarAuth() {
    // ✅ Ruta corregida para Railway
    if (!TOKEN || localStorage.getItem('rol') !== 'Estudiante') {
        window.location.href = '/login';
        return;
    }
    const usuario = USUARIO || 'Estudiante';
    document.getElementById('nombreEstudiante').textContent = usuario;
    document.getElementById('avatarLetra').textContent = usuario[0].toUpperCase();
}

window.cerrarSesion = function () {
    localStorage.clear();
    // ✅ Ruta corregida para Railway
    window.location.href = '/login';
};

/* ===== TOAST ===== */
function mostrarToast(mensaje, tipo = 'exito') {
    const toast = document.getElementById('toast');
    toast.textContent = mensaje;
    toast.style.background = tipo === 'error' ? '#e53e3e' : '#163d27';
    toast.classList.add('visible');
    setTimeout(() => toast.classList.remove('visible'), 3000);
}

/* ===== CARGAR MÓDULOS Y ASIGNACIONES ===== */
async function cargarModulos() {
    try {
        const resp = await fetch(`${API}/modulos/listar`, { headers: HEADERS });
        estado.modulos = await resp.json();

        await Promise.allSettled(
            estado.modulos.map(async modulo => {
                const r = await fetch(
                    `${API}/asignaciones/obtenerProgreso/${USUARIO}/${modulo.id}`,
                    { headers: HEADERS }
                );
                console.log(`Módulo ${modulo.Nombre}: status ${r.status}`);
                if (r.ok) {
                    const data = await r.json();
                    console.log(`Datos ${modulo.Nombre}:`, data);
                    estado.asignaciones[modulo.id] = data;
                } else {
                    const error = await r.text();
                    console.error(`Error ${modulo.Nombre}:`, error);
                }
            })
        );

        construirHeader();
    } catch (e) {
        console.error('Error cargarModulos:', e);
        mostrarToast('Error al cargar los módulos', 'error');
    }
}

/* ===== CONSTRUIR HEADER ===== */
function construirHeader() {
    const modulosAsignados = estado.modulos.filter(m => estado.asignaciones[m.id]);

    const tabsHTML = modulosAsignados.map((modulo, index) => {
        const asignacion = estado.asignaciones[modulo.id];
        const habilitada = asignacion?.EvaluacionHabilitada;
        const esActivo = estado.moduloActivo === modulo.id;

        const iconoEval = habilitada
            ? `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
               </svg>`
            : `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
               </svg>`;

        return `
            ${index > 0 ? '<div class="tab-separador"></div>' : ''}
            <div class="tab-grupo">
                <button class="modulo-tab ${esActivo ? 'activo' : ''}"
                    onclick="seleccionarModulo('${modulo.id}')">
                    ${modulo.Nombre}
                </button>
                <button class="eval-tab ${habilitada ? 'habilitada' : 'bloqueada'}"
                    ${habilitada ? `onclick="seleccionarEvaluacion('${modulo.id}')"` : ''}>
                    ${iconoEval} Evaluación
                </button>
            </div>`;
    }).join('');

    document.getElementById('tabsCentrados').innerHTML = `
        <button class="modulo-tab"
            onclick="window.location.href='/inicio'">
            Inicio
        </button>
        ${tabsHTML}`;

    construirFilaSecciones();
}

/* ===== CONSTRUIR FILA DE SECCIONES ===== */
function construirFilaSecciones() {
    const filaSecciones = document.getElementById('filaSecciones');

    if (!estado.moduloActivo || !estado.asignaciones[estado.moduloActivo]) {
        filaSecciones.innerHTML = '';
        return;
    }

    const asignacion = estado.asignaciones[estado.moduloActivo];
    const progreso = asignacion.Progreso || [];
    const moduloActual = estado.modulos.find(m => m.id === estado.moduloActivo);
    const nombresMod = NOMBRES_SECCIONES[moduloActual?.Nombre] || {};

    const iconoCandado = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2.5">
        <rect x="3" y="11" width="18" height="11" rx="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>`;

    const iconoCheck = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="3">
        <polyline points="20 6 9 17 4 12"/>
    </svg>`;

    const html = progreso.map((seccion, index) => {
        const nombre = nombresMod[seccion.seccionId] || `Sección ${seccion.seccionId}`;
        const anteriorCompletada = index === 0 || progreso[index - 1]?.completada;
        const esActiva = estado.seccionActiva === seccion.seccionId;

        let clase, icono;
        if (seccion.completada) {
            clase = 'completada';
            icono = iconoCheck;
        } else if (anteriorCompletada) {
            clase = esActiva ? 'activa' : 'disponible';
            icono = seccion.seccionId;
        } else {
            clase = 'bloqueada';
            icono = iconoCandado;
        }

        const onclick = clase === 'bloqueada'
            ? ''
            : `onclick="seleccionarSeccion('${estado.moduloActivo}', ${seccion.seccionId})"`;

        const linea = index > 0
            ? `<div class="seccion-linea ${progreso[index - 1]?.completada ? 'completada' : ''}"></div>`
            : '';

        return `
            ${linea}
            <button class="seccion-item ${clase}" ${onclick}>
                <div class="seccion-circulo">${icono}</div>
                <span class="seccion-label">${nombre}</span>
            </button>`;
    }).join('');

    filaSecciones.innerHTML = html;
}

/* ===== DESTRUIR SECCIONES ACTIVAS ===== */
function destruirSecciones(limpiarCache = false) {
    destruirSeccion1(); destruirSeccion2(); destruirSeccion3();
    destruirSeccion4(); destruirSeccion5(); destruirSeccion6();
    destruirSeccion7();

    nihonD1(); nihonD2(); nihonD3(); nihonD4(); nihonD5(); nihonD6(); nihonD7();

    destruirEvaluacion(); nihonDestrEval();

    if (limpiarCache && window._cacheModelos) {
        window._cacheModelos = {};
    }
}

/* ===== SELECCIONAR MÓDULO ===== */
window.seleccionarModulo = function (moduloId) {
    destruirSecciones(true);
    estado.moduloActivo = moduloId;
    estado.seccionActiva = null;
    construirHeader();
    mostrarVista('estadoInicial');
};

/* ===== SELECCIONAR SECCIÓN ===== */
window.seleccionarSeccion = function (moduloId, seccionId) {
    const asignacion = estado.asignaciones[moduloId];
    if (!asignacion) return;

    const progreso = asignacion.Progreso || [];
    const indice = seccionId - 1;
    const seccion = progreso[indice];
    const anteriorCompletada = indice === 0 || progreso[indice - 1]?.completada;

    if (!anteriorCompletada) {
        mostrarVista('seccionBloqueada');
        return;
    }

    estado.moduloActivo = moduloId;
    estado.seccionActiva = seccionId;
    estado.asignacionId = asignacion.id;

    construirFilaSecciones();
    mostrarSeccionActiva(moduloId, seccionId, seccion, asignacion);
};

/* ===== SELECCIONAR EVALUACIÓN ===== */
window.seleccionarEvaluacion = function (moduloId) {
    const asignacion = estado.asignaciones[moduloId];
    const moduloObj = estado.modulos.find(m => m.id === moduloId);
    estado.moduloActivo = moduloId;
    estado.asignacionId = asignacion.id;
    construirHeader();
    mostrarEvaluacion(moduloObj, asignacion.EvaluacionHabilitada);
};

/* ===== MOSTRAR VISTA ===== */
function mostrarVista(vistaActiva) {
    const vistas = ['estadoInicial', 'seccionActiva', 'seccionBloqueada', 'seccionEvaluacion'];
    vistas.forEach(v => {
        document.getElementById(v).style.display = v === vistaActiva ? 'flex' : 'none';
    });
}

/* ===== MOSTRAR SECCIÓN ACTIVA ===== */
function mostrarSeccionActiva(moduloId, seccionId, seccion, asignacion) {
    const moduloActual = estado.modulos.find(m => m.id === moduloId);
    const nombresMod = NOMBRES_SECCIONES[moduloActual?.Nombre] || {};
    const nombreSeccion = nombresMod[seccionId] || `Sección ${seccionId}`;

    mostrarVista('seccionActiva');

    document.getElementById('seccionBadge').textContent = nombreSeccion;
    document.getElementById('seccionModuloTxt').textContent = moduloActual?.Nombre || '';

    const pct = asignacion.PorcentajeProgreso || 0;
    document.getElementById('progresoTexto').textContent = `${pct}%`;
    document.getElementById('progresoFill').style.width = `${pct}%`;

    const btn = document.getElementById('btnCompletar');
    if (seccion.completada) {
        btn.textContent = 'Sección completada';
        btn.disabled = true;
        btn.style.opacity = '1';
        btn.style.cursor = 'default';
    } else {
        btn.textContent = 'Completar sección';
        btn.disabled = true;
        btn.style.opacity = '0.5';
        btn.style.cursor = 'not-allowed';
    }

    destruirSecciones();

    if (moduloActual?.Nombre === 'Beneheart D6') {
        if (seccionId === 1) setTimeout(() => iniciarSeccion1('areaThreeJs'), 100);
        if (seccionId === 2) setTimeout(() => iniciarSeccion2('areaThreeJs'), 100);
        if (seccionId === 3) setTimeout(() => iniciarSeccion3('areaThreeJs'), 100);
        if (seccionId === 4) setTimeout(() => iniciarSeccion4('areaThreeJs'), 100);
        if (seccionId === 5) setTimeout(() => iniciarSeccion5('areaThreeJs'), 100);
        if (seccionId === 6) setTimeout(() => iniciarSeccion6('areaThreeJs'), 100);
        if (seccionId === 7) setTimeout(() => iniciarSeccion7('areaThreeJs'), 100);
    }

    if (moduloActual?.Nombre === 'Nihon Koden') {
        if (seccionId === 1) setTimeout(() => nihonS1('areaThreeJs'), 100);
        if (seccionId === 2) setTimeout(() => nihonS2('areaThreeJs'), 100);
        if (seccionId === 3) setTimeout(() => nihonS3('areaThreeJs'), 100);
        if (seccionId === 4) setTimeout(() => nihonS4('areaThreeJs'), 100);
        if (seccionId === 5) setTimeout(() => nihonS5('areaThreeJs'), 100);
        if (seccionId === 6) setTimeout(() => nihonS6('areaThreeJs'), 100);
        if (seccionId === 7) setTimeout(() => nihonS7('areaThreeJs'), 100);
    }
}

/* ===== MOSTRAR EVALUACIÓN ===== */
function mostrarEvaluacion(moduloObj, habilitada) {
    mostrarVista('seccionEvaluacion');

    const evalIcono = document.getElementById('evalIconoGrande');
    document.getElementById('evalTitulo').textContent = `Evaluación — ${moduloObj?.Nombre || ''}`;

    if (habilitada) {
        evalIcono.classList.add('habilitada');
        document.getElementById('btnEvaluacion').style.display = 'block';
    } else {
        evalIcono.classList.remove('habilitada');
        document.getElementById('evalDesc').textContent =
            'Debes completar todas las secciones para desbloquear la evaluación.';
        document.getElementById('btnEvaluacion').style.display = 'none';
    }
}

/* ===== IR A EVALUACIÓN ===== */
window.irEvaluacion = function () {
    const moduloObj = estado.modulos.find(m => m.id === estado.moduloActivo);

    if (moduloObj?.Nombre === 'Beneheart D6') {
        mostrarVista('seccionActiva');
        document.getElementById('seccionBadge').textContent = 'Evaluación';
        document.getElementById('seccionModuloTxt').textContent = moduloObj.Nombre;
        document.getElementById('btnCompletar').style.display = 'none';
        destruirSecciones();
        setTimeout(() => {
            iniciarEvaluacion('areaThreeJs', estado.asignacionId);
        }, 100);
        window.addEventListener('evaluacionTerminada', () => {
            document.getElementById('btnCompletar').style.display = '';
            mostrarVista('estadoInicial');
        }, { once: true });
    }

    if (moduloObj?.Nombre === 'Nihon Koden') {
        mostrarVista('seccionActiva');
        document.getElementById('seccionBadge').textContent = 'Evaluación';
        document.getElementById('seccionModuloTxt').textContent = moduloObj.Nombre;
        document.getElementById('btnCompletar').style.display = 'none';
        destruirSecciones();
        setTimeout(() => {
            nihonEval('areaThreeJs', estado.asignacionId);
        }, 100);
        window.addEventListener('evaluacionTerminada', () => {
            document.getElementById('btnCompletar').style.display = '';
            mostrarVista('estadoInicial');
        }, { once: true });
        return;
    }
};

/* ===== COMPLETAR SECCIÓN ===== */
window.completarSeccion = async function () {
    if (!estado.asignacionId || !estado.seccionActiva) return;

    const btn = document.getElementById('btnCompletar');
    btn.disabled = true;
    btn.textContent = 'Completando...';

    try {
        const response = await fetch(`${API}/asignaciones/completarSeccion`, {
            method: 'PATCH',
            headers: HEADERS,
            body: JSON.stringify({
                asignacionId: estado.asignacionId,
                seccionId: estado.seccionActiva
            })
        });

        if (!response.ok) {
            mostrarToast(await response.text(), 'error');
            btn.disabled = false;
            btn.textContent = 'Completar sección';
            return;
        }

        const actualizada = await response.json();
        estado.asignaciones[estado.moduloActivo] = actualizada;

        mostrarToast('¡Sección completada!');
        construirHeader();

        btn.textContent = 'Sección completada';
        btn.disabled = true;

        const pct = actualizada.PorcentajeProgreso || 0;
        document.getElementById('progresoTexto').textContent = `${pct}%`;
        document.getElementById('progresoFill').style.width = `${pct}%`;

        if (actualizada.EvaluacionHabilitada) {
            setTimeout(() => mostrarToast('¡Módulo completado! Evaluación disponible'), 800);
        }

    } catch {
        mostrarToast('Error al completar la sección', 'error');
        btn.disabled = false;
        btn.textContent = 'Completar sección';
    }
};

/* ===== INICIALIZACIÓN ===== */
document.addEventListener('DOMContentLoaded', () => {
    verificarAuth();
    cargarModulos();
});