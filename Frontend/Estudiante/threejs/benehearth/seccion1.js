/* =====================================================
   seccion1.js — Sección 1: Introducción Beneheart D6
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
    escena = base.escena;
    camara = base.camara;
    renderer = base.renderer;
    controls = base.controls;
    reloj = base.reloj;

    mostrarLoader(contenedorId);

    // 
    cargarModelo(
        //'/Estudiante/threejs/modelados/texturas2040_4.glb',
        '/Estudiante/threejs/modelados/texturas2040_4.glb',
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
    document.getElementById('loaderSeccion1')?.remove();

    const loader = document.createElement('div');
    loader.id = 'loaderSeccion1';
    loader.style.cssText = `
        position:absolute; inset:0;
        display:flex; flex-direction:column;
        align-items:center; justify-content:center; gap:16px;
        background:rgba(244,246,244,0.95); z-index:10;
        font-family:'DM Sans',sans-serif;
    `;
    loader.innerHTML = `
        <div style="
            width:48px; height:48px;
            border:4px solid #e0e6e0;
            border-top-color:#1e5c3a;
            border-radius:50%;
            animation:girar 0.8s linear infinite;">
        </div>
        <div style="text-align:center;">
            <p style="color:#1e5c3a; font-weight:600; font-size:0.95rem; margin:0;">
                Cargando modelo 3D...
            </p>
            <p style="color:#5a7a62; font-size:0.82rem; margin:4px 0 0;">
                <span id="loaderPct">0</span>%
            </p>
        </div>
        <style>@keyframes girar { to { transform:rotate(360deg); } }</style>
    `;
    contenedor.appendChild(loader);


}

function ocultarLoader() {
    const loader = document.getElementById('loaderSeccion1');
    if (!loader) return;
    loader.style.transition = 'opacity 0.4s';
    loader.style.opacity = '0';
    setTimeout(() => loader.remove(), 400);
}


/* ===== UI PRINCIPAL ===== */
function mostrarUI() {
    document.getElementById('uiSeccion1')?.remove();

    const contenedor = document.getElementById('areaThreeJs');
    const ui = document.createElement('div');
    ui.id = 'uiSeccion1';
    ui.style.cssText = 'position:absolute; inset:0; pointer-events:none; overflow:hidden;';

    // Verifica si la sección ya está completada
    // Si el botón de modulos.js ya dice "Sección completada", no mostramos el indicador
    const btnCompletar = document.getElementById('btnCompletar');
    const seccionYaCompletada = btnCompletar?.disabled &&
        btnCompletar?.textContent.includes('completada');

    ui.innerHTML = `
        <!-- ===== PANEL LATERAL IZQUIERDO ===== -->
        <div id="panelLateral" style="
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
                    Beneheart D6
                </h4>
                <button onclick="togglePanel()" style="
                    background:none; border:none; cursor:pointer;
                    color:#5a7a62; font-size:1.2rem; padding:4px;">✕
                </button>
            </div>

            <!-- descripcion del audio -->
            <p>
                El Mindray BeneHeart D6 es un desfibrilador-monitor multiparamétrico de uso hospitalario, diseñado para la atención de pacientes en situaciones de emergencia cardiovascular. Permite realizar desfibrilación manual, cardioversión sincronizada y monitoreo continuo de signos vitales. Su uso está indicado en unidades de cuidados intensivos, salas de urgencias, salas de cirugía y áreas de hospitalización con personal capacitado.
            </p>
        </div>

        <!-- Overlay detrás del panel -->
        <div id="overlayPanel" onclick="togglePanel()" style="
            position:absolute; inset:0;
            background:rgba(0,0,0,0.2);
            pointer-events:none; opacity:0;
            transition:opacity 0.35s; z-index:4;">
        </div>

        <!-- ===== BOTÓN ABRIR PANEL ===== -->
        <button id="btnPanel" onclick="togglePanel()" style="
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

            <button id="btnVolumen" onclick="toggleVolumen()" style="
                width:44px; height:44px; border-radius:50%;
                background:#1e5c3a; border:none; cursor:pointer;
                display:flex; align-items:center; justify-content:center;
                box-shadow:0 2px 8px rgba(0,0,0,0.2);">
                <svg id="iconoVolumen" width="20" height="20" viewBox="0 0 24 24"
                    fill="none" stroke="white" stroke-width="2">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                </svg>
            </button>

            <input type="range" id="sliderVolumen"
                min="0" max="1" step="0.05" value="0.7"
                oninput="cambiarVolumen(this.value)"
                style="writing-mode:vertical-lr; direction:rtl;
                       height:80px; accent-color:#1e5c3a; cursor:pointer;"/>

            <!-- Botón repetir audio -->
            <button id="btnRepetir" onclick="repetirAudio()"
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
            color:#5a7a62; background:rgb(210, 210, 210);
            padding:6px 16px; border-radius:20px;
            pointer-events:none; z-index:3;">
            Click izquierdo para rotar · Scroll para zoom , y para mover el modelo usa Shift + click izquierdo
        </p>

        <!-- ===== INDICADOR DE AUDIO =====
             Solo se muestra si la sección NO está completada -->
        ${!seccionYaCompletada ? `
        <div id="indicadorAudio" style="
            position:absolute; top:12px; left:50%;
            transform:translateX(-50%);
            background:rgba(30,92,58,0.9); color:white;
            padding:6px 16px; border-radius:20px;
            font-family:'DM Sans',sans-serif; font-size:0.78rem;
            pointer-events:none; z-index:3;
            display:flex; align-items:center; gap:6px;">
            <span id="puntoPulsar" style="
                width:8px; height:8px; border-radius:50%;
                background:#7fffb5;
                animation:pulsar 1.2s ease-in-out infinite;
                display:inline-block;">
            </span>
            <span id="textoAudio">Escucha el audio para continuar</span>
        </div>
        <style>
            @keyframes pulsar {
                0%,100% { opacity:1; transform:scale(1); }
                50% { opacity:0.4; transform:scale(0.7); }
            }
        </style>
        ` : ''}
    `;

    contenedor.appendChild(ui);
    
    //Agrega la imagen directamente al DOM
    const divImagen = document.createElement('div');
    divImagen.style.cssText = `
    position:absolute;top:10px;left:10px;
    pointer-events:none;z-index:4;`;

    const img = document.createElement('img');
    img.src = '/Estudiante/threejs/img/controles.png';
    img.alt = 'Controles';
    img.style.cssText = 'width:180px;border-radius:10px;opacity:0.85;';
    
    divImagen.appendChild(img);
    ui.appendChild(divImagen);

    // Solo bloquea el botón si la sección NO está completada
    if (!seccionYaCompletada) {
        bloquearBotonCompletar(true);
    }

    iniciarAudio(seccionYaCompletada);
}


/* ===== PANEL LATERAL ===== */
window.togglePanel = function () {
    const panel = document.getElementById('panelLateral');
    const overlay = document.getElementById('overlayPanel');
    if (!panel) return;

    panelAbierto = !panelAbierto;
    panel.style.left = panelAbierto ? '0' : '-320px';
    overlay.style.opacity = panelAbierto ? '1' : '0';
    overlay.style.pointerEvents = panelAbierto ? 'all' : 'none';
};


/* ===== AUDIO ===== */
function iniciarAudio(seccionYaCompletada) {

    audio = new Audio('/Estudiante/threejs/audios/benehearth/introduccion.mp3');
    audio.volume = 0.7;
    audioTerminado = false;

    // Cuando termina el audio
    audio.addEventListener('ended', () => {
        audioTerminado = true;

        // Solo desbloquea si la sección no estaba ya completada
        if (!seccionYaCompletada) {
            bloquearBotonCompletar(false);
            actualizarIndicadorAudio(true);
        }
    });

    audio.play().catch(() => {
        console.log('Audio esperando interacción del usuario');
    });
}

window.toggleVolumen = function () {
    if (!audio) return;
    audio.muted = !audio.muted;
    const icono = document.getElementById('iconoVolumen');
    if (!icono) return;
    icono.innerHTML = audio.muted
        ? `<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
           <line x1="23" y1="9" x2="17" y2="15"/>
           <line x1="17" y1="9" x2="23" y2="15"/>`
        : `<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
           <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
           <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>`;
};

window.cambiarVolumen = function (valor) {
    if (!audio) return;
    audio.volume = parseFloat(valor);
    if (audio.muted && valor > 0) audio.muted = false;
};

// Repite el audio — vuelve a bloquear el botón mientras suena
window.repetirAudio = function () {
    if (!audio) return;

    // Verifica si la sección ya está completada
    const btnCompletar = document.getElementById('btnCompletar');
    const seccionYaCompletada = btnCompletar?.disabled &&
        btnCompletar?.textContent.includes('completada');

    audio.currentTime = 0;
    audio.play().catch(() => { });

    // Solo bloquea si la sección no está completada
    if (!seccionYaCompletada) {
        audioTerminado = false;
        bloquearBotonCompletar(true);

        // Restaura el indicador
        const punto = document.getElementById('puntoPulsar');
        const texto = document.getElementById('textoAudio');
        const indicador = document.getElementById('indicadorAudio');
        if (indicador) {
            indicador.style.opacity = '1';
            indicador.style.background = 'rgba(30,92,58,0.9)';
        }
        if (punto) punto.style.animation = 'pulsar 1.2s ease-in-out infinite';
        if (texto) texto.textContent = 'Escucha el audio para continuar';
    }
};


/* ===== BOTÓN COMPLETAR ===== */
function bloquearBotonCompletar(bloqueado) {
    const btn = document.getElementById('btnCompletar');
    if (!btn) return;
    // Solo actúa si el botón NO dice "completada"
    if (btn.textContent.includes('completada')) return;

    btn.disabled = bloqueado;
    btn.style.opacity = bloqueado ? '0.5' : '1';
    btn.style.cursor = bloqueado ? 'not-allowed' : 'pointer';
    btn.title = bloqueado ? 'Escucha el audio completo para continuar' : '';
}

function actualizarIndicadorAudio(terminado) {
    const indicador = document.getElementById('indicadorAudio');
    if (!indicador) return;

    if (terminado) {
        const punto = document.getElementById('puntoPulsar');
        const texto = document.getElementById('textoAudio');
        if (punto) punto.style.animation = 'none';
        if (texto) texto.textContent = '¡Audio completado! Ya puedes continuar';

        setTimeout(() => {
            indicador.style.transition = 'opacity 0.5s';
            indicador.style.opacity = '0';
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

    document.getElementById('uiSeccion1')?.remove();
    document.getElementById('loaderSeccion1')?.remove();

    if (escena) {
        while (escena.children.length > 0) {
            escena.remove(escena.children[0]);
        }
        escena = null;
    }

    limpiarRenderer();

    camara = null;
    controls = null;
    reloj = null;
    mixer = null;
    renderer = null;
    panelAbierto = false;
    audioTerminado = false;
}