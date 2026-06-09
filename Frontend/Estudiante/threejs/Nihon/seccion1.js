/* =====================================================
   seccion1.js — Sección 1: Introducción Nihon Koden
   ===================================================== */

import { inicializarEscena, cargarModelo, limpiarRenderer, THREE } from '../escena.js';

let escena, camara, renderer, controls, reloj;
let mixer = null;
let animFrameId = null;
let audio = null;
let audioTerminado = false;
let panelAbierto = false;

/* ===== INICIAR SECCIÓN 1 ===== */
export function iniciarSeccion1(contenedorId) {
    destruirSeccion1();

    const base = inicializarEscena(contenedorId);
    escena    = base.escena;
    camara    = base.camara;
    renderer  = base.renderer;
    controls  = base.controls;
    reloj     = base.reloj;

    mostrarLoader(contenedorId);

    cargarModelo(
        '/Estudiante/threejs/modelados/Nihon3.glb',
        escena, camara, controls,
        (modelo, animaciones, mix) => {
            mixer = mix;
            ocultarLoader();
            mostrarUI();
        }
    );

    function animar() {
        animFrameId = requestAnimationFrame(animar);
        if (!escena || !camara || !renderer) return;
        const delta = reloj.getDelta();
        if (mixer) mixer.update(delta);
        controls.update();
        renderer.render(escena, camara);
    }
    animar();
}


/* ===== LOADER ANIMADO ===== */
function mostrarLoader(contenedorId) {
    const contenedor = document.getElementById(contenedorId);
    contenedor.style.position = 'relative';
    document.getElementById('loaderSeccionNihon1')?.remove();

    const loader = document.createElement('div');
    loader.id = 'loaderSeccionNihon1';
    loader.style.cssText = `
        position:absolute; inset:0;
        display:flex; flex-direction:column;
        align-items:center; justify-content:center; gap:16px;
        background:rgba(244,246,244,0.95); z-index:10;
        font-family:'DM Sans',sans-serif;`;
    loader.innerHTML = `
        <div style="
            width:48px; height:48px;
            border:4px solid #e0e6e0;
            border-top-color:#1e5c3a;
            border-radius:50%;
            animation:girarNihon 0.8s linear infinite;">
        </div>
        <div style="text-align:center;">
            <p style="color:#1e5c3a; font-weight:600; font-size:0.95rem; margin:0;">
                Cargando modelo 3D...
            </p>
            <p style="color:#5a7a62; font-size:0.82rem; margin:4px 0 0;">
                <span id="loaderPct">0</span>%
            </p>
        </div>
        <style>@keyframes girarNihon { to { transform:rotate(360deg); } }</style>`;
    contenedor.appendChild(loader);
}

function ocultarLoader() {
    const loader = document.getElementById('loaderSeccionNihon1');
    if (!loader) return;
    loader.style.transition = 'opacity 0.4s';
    loader.style.opacity = '0';
    setTimeout(() => loader.remove(), 400);
}


/* ===== UI PRINCIPAL ===== */
function mostrarUI() {
    document.getElementById('uiSeccionNihon1')?.remove();

    const contenedor = document.getElementById('areaThreeJs');
    const ui = document.createElement('div');
    ui.id = 'uiSeccionNihon1';
    ui.style.cssText = 'position:absolute; inset:0; pointer-events:none; overflow:hidden;';

    const btnCompletar = document.getElementById('btnCompletar');
    const seccionYaCompletada = btnCompletar?.disabled &&
        btnCompletar?.textContent.includes('completada');

    ui.innerHTML = `
        <!-- ===== PANEL LATERAL IZQUIERDO ===== -->
        <div id="panelLateralNihon" style="
            position:absolute; top:0; left:-320px; bottom:0;
            width:300px;
            background:white;
            box-shadow:4px 0 20px rgba(0,0,0,0.12);
            padding:20px;
            pointer-events:all;
            transition:left 0.35s cubic-bezier(0.16,1,0.3,1);
            font-family:'DM Sans',sans-serif;
            font-size:0.88rem; line-height:1.6; color:#1a2e1f;
            overflow-y:auto;
            z-index:5;">

            <div style="display:flex; align-items:center;
                justify-content:space-between; margin-bottom:16px;">
                <h4 style="font-size:1rem; color:#1e5c3a; margin:0;">
                    Nihon Koden
                </h4>
                <button onclick="togglePanelNihon()" style="
                    background:none; border:none; cursor:pointer;
                    color:#5a7a62; font-size:1.2rem; padding:4px;">✕
                </button>
            </div>

            <p>
                El Nihon Kohden Cardiolife TEC-5531 es un desfibrilador-monitor de uso hospitalario diseñado para la atención de emergencias cardiovasculares en entornos clínicos especializados. Permite realizar desfibrilación manual asincrónica, cardioversión sincronizada, monitoreo de ECG y, en salas de cirugía cardíaca, desfibrilación con palas internas directamente sobre el miocardio expuesto. Su diseño combina robustez operativa con controles físicos claros, siendo adecuado para unidades de cuidados intensivos, urgencias, salas de cirugía y áreas de hospitalización crítica.
            </p>
        </div>

        <!-- Overlay detrás del panel -->
        <div id="overlayPanelNihon" onclick="togglePanelNihon()" style="
            position:absolute; inset:0;
            background:rgba(0,0,0,0.2);
            pointer-events:none; opacity:0;
            transition:opacity 0.35s; z-index:4;">
        </div>

        <!-- ===== BOTÓN ABRIR PANEL ===== -->
        <button id="btnPanelNihon" onclick="togglePanelNihon()" style="
            position:absolute; bottom:80px; left:16px;
            pointer-events:all;
            width:44px; height:44px; border-radius:50%;
            background:#1e5c3a; border:none; cursor:pointer;
            display:flex; align-items:center; justify-content:center;
            box-shadow:0 2px 8px rgba(0,0,0,0.2); z-index:3;">
            <svg width="20" height="20" viewBox="0 0 24 24"
                fill="none" stroke="white" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
        </button>

        <!-- ===== CONTROLES DE AUDIO ===== -->
        <div style="
            position:absolute; bottom:80px; right:16px;
            pointer-events:all;
            display:flex; flex-direction:column; align-items:center; gap:8px;
            z-index:3;">

            <button id="btnVolumenNihon" onclick="toggleVolumenNihon()" style="
                width:44px; height:44px; border-radius:50%;
                background:#1e5c3a; border:none; cursor:pointer;
                display:flex; align-items:center; justify-content:center;
                box-shadow:0 2px 8px rgba(0,0,0,0.2);">
                <svg id="iconoVolumenNihon" width="20" height="20" viewBox="0 0 24 24"
                    fill="none" stroke="white" stroke-width="2">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                </svg>
            </button>

            <input type="range" id="sliderVolumenNihon"
                min="0" max="1" step="0.05" value="0.7"
                oninput="cambiarVolumenNihon(this.value)"
                style="writing-mode:vertical-lr; direction:rtl;
                       height:80px; accent-color:#1e5c3a; cursor:pointer;"/>

            <button id="btnRepetirNihon" onclick="repetirAudioNihon()"
                title="Repetir audio" style="
                width:36px; height:36px; border-radius:50%;
                background:#e8f5ee; border:1.5px solid #1e5c3a;
                cursor:pointer;
                display:flex; align-items:center; justify-content:center;
                box-shadow:0 1px 4px rgba(0,0,0,0.1);">
                <svg width="16" height="16" viewBox="0 0 24 24"
                    fill="none" stroke="#1e5c3a" stroke-width="2">
                    <polyline points="1 4 1 10 7 10"/>
                    <path d="M3.51 15a9 9 0 1 0 .49-3.62"/>
                </svg>
            </button>
        </div>

        <!-- Instrucción inferior -->
        <p style="
            position:absolute; bottom:28px; left:50%;
            transform:translateX(-50%); white-space:nowrap;
            font-family:'DM Sans',sans-serif; font-size:0.83rem;
            color:#5a7a62; background:rgb(210,210,210);
            padding:6px 16px; border-radius:20px;
            pointer-events:none; z-index:3;">
            Click izquierdo para rotar · Scroll para zoom · Shift + click para mover
        </p>

        ${!seccionYaCompletada ? `
        <div id="indicadorAudioNihon" style="
            position:absolute; top:12px; left:50%;
            transform:translateX(-50%);
            background:rgba(30,92,58,0.9); color:white;
            padding:6px 16px; border-radius:20px;
            font-family:'DM Sans',sans-serif; font-size:0.78rem;
            pointer-events:none; z-index:3;
            display:flex; align-items:center; gap:6px;">
            <span id="puntoPulsarNihon" style="
                width:8px; height:8px; border-radius:50%;
                background:#7fffb5;
                animation:pulsarNihon 1.2s ease-in-out infinite;
                display:inline-block;">
            </span>
            <span id="textoAudioNihon">Escucha el audio para continuar</span>
        </div>
        <style>
            @keyframes pulsarNihon {
                0%,100% { opacity:1; transform:scale(1); }
                50% { opacity:0.4; transform:scale(0.7); }
            }
        </style>
        ` : ''}
    `;

    contenedor.appendChild(ui);

    // Imagen de controles
    const divImagen = document.createElement('div');
    divImagen.style.cssText = `position:absolute;top:10px;left:10px;pointer-events:none;z-index:4;`;
    const img = document.createElement('img');
    img.src = '/Estudiante/threejs/img/controles.png';
    img.alt = 'Controles';
    img.style.cssText = 'width:180px;border-radius:10px;opacity:0.85;';
    divImagen.appendChild(img);
    ui.appendChild(divImagen);

    if (!seccionYaCompletada) bloquearBotonCompletar(true);
    iniciarAudio(seccionYaCompletada);
}


/* ===== PANEL LATERAL ===== */
window.togglePanelNihon = function () {
    const panel   = document.getElementById('panelLateralNihon');
    const overlay = document.getElementById('overlayPanelNihon');
    if (!panel) return;
    panelAbierto = !panelAbierto;
    panel.style.left            = panelAbierto ? '0' : '-320px';
    overlay.style.opacity       = panelAbierto ? '1' : '0';
    overlay.style.pointerEvents = panelAbierto ? 'all' : 'none';
};


/* ===== AUDIO ===== */
function iniciarAudio(seccionYaCompletada) {
    audio = new Audio('/Estudiante/threejs/audios/nihon/IntroNIhon.MP3');
    audio.volume = 0.7;
    audioTerminado = false;

    audio.addEventListener('ended', () => {
        audioTerminado = true;
        if (!seccionYaCompletada) {
            bloquearBotonCompletar(false);
            actualizarIndicadorAudio(true);
        }
    });

    audio.play().catch(() => console.log('Audio esperando interacción del usuario'));
}

window.toggleVolumenNihon = function () {
    if (!audio) return;
    audio.muted = !audio.muted;
    const icono = document.getElementById('iconoVolumenNihon');
    if (!icono) return;
    icono.innerHTML = audio.muted
        ? `<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
           <line x1="23" y1="9" x2="17" y2="15"/>
           <line x1="17" y1="9" x2="23" y2="15"/>`
        : `<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
           <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
           <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>`;
};

window.cambiarVolumenNihon = function (valor) {
    if (!audio) return;
    audio.volume = parseFloat(valor);
    if (audio.muted && valor > 0) audio.muted = false;
};

window.repetirAudioNihon = function () {
    if (!audio) return;
    const btnCompletar = document.getElementById('btnCompletar');
    const seccionYaCompletada = btnCompletar?.disabled &&
        btnCompletar?.textContent.includes('completada');

    audio.currentTime = 0;
    audio.play().catch(() => {});

    if (!seccionYaCompletada) {
        audioTerminado = false;
        bloquearBotonCompletar(true);

        const indicador = document.getElementById('indicadorAudioNihon');
        const punto     = document.getElementById('puntoPulsarNihon');
        const texto     = document.getElementById('textoAudioNihon');
        if (indicador) { indicador.style.opacity = '1'; indicador.style.background = 'rgba(30,92,58,0.9)'; }
        if (punto)     punto.style.animation = 'pulsarNihon 1.2s ease-in-out infinite';
        if (texto)     texto.textContent = 'Escucha el audio para continuar';
    }
};


/* ===== BOTÓN COMPLETAR ===== */
function bloquearBotonCompletar(bloqueado) {
    const btn = document.getElementById('btnCompletar');
    if (!btn) return;
    if (btn.textContent.includes('completada')) return;
    btn.disabled       = bloqueado;
    btn.style.opacity  = bloqueado ? '0.5' : '1';
    btn.style.cursor   = bloqueado ? 'not-allowed' : 'pointer';
    btn.title          = bloqueado ? 'Escucha el audio completo para continuar' : '';
}

function actualizarIndicadorAudio(terminado) {
    const indicador = document.getElementById('indicadorAudioNihon');
    if (!indicador) return;
    if (terminado) {
        const punto = document.getElementById('puntoPulsarNihon');
        const texto = document.getElementById('textoAudioNihon');
        if (punto) punto.style.animation = 'none';
        if (texto) texto.textContent = '¡Audio completado! Ya puedes continuar';
        setTimeout(() => {
            indicador.style.transition = 'opacity 0.5s';
            indicador.style.opacity    = '0';
            setTimeout(() => indicador.remove(), 500);
        }, 3000);
    }
}


/* ===== DESTRUIR SECCIÓN ===== */
export function destruirSeccion1() {
    if (audio) {
        audio.pause();
        audio.src = '';
        audio = null;
    }

    if (animFrameId) {
        cancelAnimationFrame(animFrameId);
        animFrameId = null;
    }

    document.getElementById('uiSeccionNihon1')?.remove();
    document.getElementById('loaderSeccionNihon1')?.remove();

    if (escena) {
        while (escena.children.length > 0) escena.remove(escena.children[0]);
        escena = null;
    }

    limpiarRenderer();

    camara = controls = reloj = mixer = renderer = null;
    panelAbierto   = false;
    audioTerminado = false;
}