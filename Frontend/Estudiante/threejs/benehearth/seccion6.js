import { inicializarEscena, cargarModelo, limpiarRenderer, THREE } from '../escena.js';

const MODOS_PERILLA = [
    { nombre: 'Desfribilación Manual', angulo: -1.57, imagen: '/Estudiante/threejs/img/manual.png' },
    { nombre: 'Monitor', angulo: -1, imagen: '/Estudiante/threejs/img/MODOMONITOR.png' },
    { nombre: 'Apagado', angulo: 0, imagen: '/Estudiante/threejs/img/negro.jpg' },
    { nombre: 'Marcapasos', angulo: 1, imagen: '/Estudiante/threejs/img/marcapasos.png' },
    { nombre: 'DEA', angulo: 2, imagen: '/Estudiante/threejs/img/DEA.png' },
];

const TOLERANCIA_ANGULO_PERILLA = 0.45;

const CAMARA_POSICION = { x: -0.1, y: -0.1, z: 0.5 };
const CAMARA_TARGET = { x: -0.1, y: -0.1, z: 0 };


// [CAMBIO 1] CONSTANTES DE COLOR DE RESALTADO
const COLOR_RESALTADO = 0xff6600;  // naranja
const COLOR_CONFIRMADO = 0x4caf50;  // verde claro

// ═══════════════════════════════════════════════════════════════════
// MECÁNICA DE BOTÓN SOSTENIDO
// Cuántos milisegundos debe mantener presionado el botón.
// Cámbialo aquí para ajustar la dificultad.
// ═══════════════════════════════════════════════════════════════════
const DURACION_HOLD_MS = 3000;

const PARTES = [
    {
        id: 'perilla',
        nombre: 'Para la cardioversión sincronizada enciende el equipo girando la perilla hasta la posición Desfi. Manual',
        objeto: 'perilla001',
        anguloObjetivo: 'Desfribilación Manual',
        tipo: 'rotar',
        camaraOffset: { x: 0, y: -0.1, z: 0.8 },
        pasos: [
            { objeto: 'perilla001', imagen: '/Estudiante/threejs/img/negro.jpg', instruccion: 'Haz click sobre la perilla y gírala hasta llegar a Desfib. Manual' },
        ],
    },
    {
        id: 'electrodos',
        nombre: 'Conecte los electrodos al paciente en la posición correcta',
        objeto: 'ECG',
        tipo: 'minijuego',
        instruccion: 'Arrastra cada electrodo a su posición correcta en el paciente',
         
        video: 'https://youtu.be/BREWn8OSgGQ',
    },
    {
        id: 'Flecha2',
        nombre: 'Presione el botón de la flecha para Activar sincrónico en el panel. La pantalla muestra que el modo sincrónico está activo.',
        objeto: 'Flecha2',
        tipo: 'click',
        imagenesPantalla: [ '/Estudiante/threejs/img/cardioversion/sincronico.png' ],
        pasos: [
            { objeto: 'Flecha2', imagen: '/Estudiante/threejs/img/cardioversion/acceder.png', instruccion: 'Haz click sobre el botón para acceder al modo sincrónico' },
            { objeto: 'Flecha1', imagen: '/Estudiante/threejs/img/cardioversion/cardioversion.png', instruccion: 'Haz click sobre el botón para confirmar el modo sincrónico' },
            
        ],
        video: 'https://youtu.be/QIhrk0FPM_w',
    },
    {
        id: 'Carga',
        nombre: 'Posiciona las palas sobre el paciente y Presione el botón de CARGA ya sea en las palas o en el panel frontal y espere a que cargue.',
        tipo: 'click',
        imagenesPantalla: [ '/Estudiante/threejs/img/cardioversion/cardioversion.png' ],
        pasos: [
            { objeto: 'Carga', imagen: '/Estudiante/threejs/img/cardioversion/cargaSincronizada.png', instruccion: 'Realiza la carga y observarás en la pantalla el proceso de carga' },
        ],
    },
    {
        id: 'Boton3D',
        nombre: 'Realiza la descarga: a diferencia de desfibrilación manual, debes dejar sostenido los botones de descarga por unos segundos',
        tipo: 'hold',   // ← tipo especial: botón que debe mantenerse presionado
        objeto: 'Boton3D',
        camaraOffset: { x: -0.1, y: 0.1, z: 0.1 },
         imagenesPantalla: [ '/Estudiante/threejs/img/cardioversion/descargaSincronizada.png' ],
        pasos: [
            { objeto: 'Boton3D', imagen: '/Estudiante/threejs/img/cardioversion/descargaadminSincroni.png', instruccion: 'Mantén presionado el botón de descarga durante 3 segundos, en este caso solo oprimes uno pero en un contexto real deben ser los dos' },
          //  { objeto: 'Boton3D', imagen: '/Estudiante/threejs/img/cardioversion/descargaadminSincroni.png', instruccion: 'Mantén presionado el botón de descarga durante 3 segundos' },
        ],
        video: 'https://youtu.be/ZjbFj_OBWIM',
    },
    {
        id: 'felcha3',
        nombre: 'Si al usar el desfibrilador la energía quedó cargada, el equipo tiene 2 modos seguros para salir. 1) Esperar un minuto  2) Oprimir el botón desactivar',
        tipo: 'click',
        imagenesPantalla: [ '/Estudiante/threejs/img/cardioversion/descargaSincronizada.png' ],
        pasos: [
            { objeto: 'Flecha1', imagen: '/Estudiante/threejs/img/cardioversion/CargaDesconectada.png', instruccion: 'Para descargar de forma segura oprime el botón desactivar' },
           // { objeto: 'Flecha1', imagen: '/Estudiante/threejs/img/cardioversion/CargaDesconectada.png', instruccion: 'Al desactivar se observará en la pantalla el mensaje de Carga Desconectada' },
        ],
        video: 'https://youtu.be/bk2AAcc0GKg',
    },
];


/* =====================================================
   CONFIGURACIÓN DEL MINIJUEGO DE ELECTRODOS
   ===================================================== */
const ELECTRODOS_CONFIG = [
    { id: 'R', label: 'R/RA', desc: 'R', color: '#e24b4a', targetPctX: 38.5, targetPctY: 26.2, radius: 27 },
    { id: 'L', label: 'L / LA', desc: 'L', color: '#ba7517', targetPctX: 61.6, targetPctY: 26.2, radius: 27 },
    { id: 'F', label: 'F / FA', desc: 'F', color: '#1d9e75', targetPctX: 61.5, targetPctY: 68.1, radius: 27 },
];


/* =====================================================
   ESTADO INTERNO
   ===================================================== */

let escena, camara, renderer, controls, reloj;
let mixer = null;
let animFrameId = null;
let modeloCargado = null;
let animaciones = [];
let indiceActivo = 0;
let panelAbierto = false;
let camaraOriginalPos = null;
let camaraOriginalTarget = null;

let ytPlayer = null;
let panelLateralAbierto = false;

let rotandoObjeto = false;
let objetoRotando = null;
let mouseXAnterior = 0;
let mouseYAnterior = 0;

// ═══════════════════════════════════════════════════════════════════
// Estado del botón sostenido (hold)
// holdTimer    : referencia al setTimeout que completa el paso
// holdInterval : referencia al setInterval que actualiza la barra de progreso
// holdObjeto   : el mesh que se está presionando
// ═══════════════════════════════════════════════════════════════════
let holdTimer = null;
let holdInterval = null;
let holdObjeto = null;
let holdInicio = 0;

const _cachTexturas = {};
let _modoActual = null;
let indiceImagenActual = 0;

// ══════════════════════════════════════════════════════════════════
// [CAMBIO 2] VARIABLES DEL SISTEMA DE RESALTADO

// ══════════════════════════════════════════════════════════════════
const _snapshot = {};
let _nombreResaltadoActual = null;


const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();


/* =====================================================
   CICLO DE VIDA
   ===================================================== */

export function iniciarSeccion6(contenedorId) {
    destruirSeccion6();

    const btnCompletar = document.getElementById('btnCompletar');
    const yaCompletada = btnCompletar?.disabled &&
        btnCompletar?.textContent.includes('completada');

    const base = inicializarEscena(contenedorId);
    escena = base.escena;
    camara = base.camara;
    renderer = base.renderer;
    controls = base.controls;
    reloj = base.reloj;

    controls.enablePan = true;
    controls.minDistance = 0.3;
    controls.maxDistance = 3.5;
    controls.zoomSpeed = 0.4;
    controls.rotateSpeed = 0.5;

    mostrarLoader(contenedorId);

    cargarModelo(
        '/Estudiante/threejs/modelados/Final.glb',
        escena, camara, controls,
        (modelo, anim, mix) => {
            modeloCargado = modelo;
            animaciones = anim;
            mixer = mix;

            camara.position.set(CAMARA_POSICION.x, CAMARA_POSICION.y, CAMARA_POSICION.z);
            controls.target.set(CAMARA_TARGET.x, CAMARA_TARGET.y, CAMARA_TARGET.z);
            controls.update();

            camaraOriginalPos = camara.position.clone();
            camaraOriginalTarget = controls.target.clone();

            // [CAMBIO 3] CAPTURA DE COLORES ORIGINALES
            capturaMaterialesOriginales();

            // Reset rotación de perilla al cargar
            modeloCargado.traverse(obj => {
                if (obj.name === 'perilla001') {
                    obj.rotation.x = 0;
                    obj.rotation.y = 0;
                    obj.rotation.z = 0;
                }
            });

            _modoActual = null;
            let pantalla = null;
            modeloCargado.traverse(o => { if (o.name === 'pantalla') pantalla = o; });
            if (pantalla?.material) {
                const mats = Array.isArray(pantalla.material) ? pantalla.material : [pantalla.material];
                mats.forEach(mat => { mat.map = null; mat.color.set(0x000000); mat.needsUpdate = true; });
            }

            ocultarLoader();
            mostrarUI();
            yaCompletada ? marcarTodoCompletado() : activarParte(0);
        }
    );

    function animar() {
        animFrameId = requestAnimationFrame(animar);
        if (!escena || !camara || !renderer) return;
        mixer?.update(reloj.getDelta());
        controls.update();
        actualizarSenales();
        renderer.render(escena, camara);
    }
    animar();

    const canvas = renderer.domElement;
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('mouseleave', onMouseUp);   // cancelar hold si sale del canvas
    canvas.addEventListener('click', onClickCanvas);
}

export function destruirSeccion6() {
    indiceImagenActual = 0;
    cancelarHold(); // limpiar timers del hold
    pararMedia();

    cancelAnimationFrame(animFrameId);
    animFrameId = null;

    if (renderer) {
        renderer.domElement.removeEventListener('mousedown', onMouseDown);
        renderer.domElement.removeEventListener('mousemove', onMouseMove);
        renderer.domElement.removeEventListener('mouseup', onMouseUp);
        renderer.domElement.removeEventListener('mouseleave', onMouseUp);
        renderer.domElement.removeEventListener('click', onClickCanvas);
    }

    document.getElementById('areaThreeJs')?.replaceChildren();
    document.getElementById('uiSeccion6')?.remove();
    document.getElementById('loaderSeccion6')?.remove();
    document.getElementById('checklistS6')?.remove();
    document.getElementById('videoPopupS6')?.remove();
    document.getElementById('minijuegoElectrodosS6')?.remove();
    document.getElementById('feedbackPerillaS6')?.remove();   // ID correcto S6
    document.getElementById('holdBarS6')?.remove();

    // ══════════════════════════════════════════════════════════════
    // [CAMBIO 5] RESTAURAR COLORES AL DESTRUIR
    restaurarTodosLosColores();



    Object.keys(_cachTexturas).forEach(k => delete _cachTexturas[k]);
    _modoActual = null;

    if (escena) {
        while (escena.children.length > 0) escena.remove(escena.children[0]);
        escena = null;
    }

    limpiarRenderer();

    camara = controls = reloj = mixer = renderer = null;
    modeloCargado = null;
    animaciones = [];
    camaraOriginalPos = camaraOriginalTarget = null;
    window._senalObjeto = null;
    rotandoObjeto = false;
    objetoRotando = null;
    indiceActivo = 0;
    panelAbierto = false;
    panelLateralAbierto = false;
}


/* =====================================================
   LOADER
   ===================================================== */

function mostrarLoader(contenedorId) {
    const contenedor = document.getElementById(contenedorId);
    contenedor.style.position = 'relative';
    document.getElementById('loaderSeccion6')?.remove();

    const loader = document.createElement('div');
    loader.id = 'loaderSeccion6';
    loader.style.cssText = `
        position:absolute;inset:0;display:flex;flex-direction:column;
        align-items:center;justify-content:center;gap:16px;
        background:rgba(244,246,244,0.95);z-index:10;
        font-family:'DM Sans',sans-serif;`;
    loader.innerHTML = `
        <div style="width:48px;height:48px;border:4px solid #e0e6e0;
            border-top-color:#1e5c3a;border-radius:50%;
            animation:spin 0.8s linear infinite;"></div>
        <p style="color:#1e5c3a;font-weight:600;font-size:0.95rem;margin:0;">
            Cargando modelo 3D...</p>
        <p style="color:#5a7a62;font-size:0.82rem;margin:0;">
            <span id="loaderPct">0</span>%</p>
        <style>@keyframes spin{to{transform:rotate(360deg);}}</style>`;
    contenedor.appendChild(loader);
}

function ocultarLoader() {
    const loader = document.getElementById('loaderSeccion6');
    if (!loader) return;
    loader.style.transition = 'opacity 0.4s';
    loader.style.opacity = '0';
    setTimeout(() => loader.remove(), 400);
}


/* =====================================================
   INTERFAZ PRINCIPAL
   ===================================================== */

function mostrarUI() {
    document.getElementById('uiSeccion6')?.remove();
    const contenedor = document.getElementById('areaThreeJs');

    const ui = document.createElement('div');
    ui.id = 'uiSeccion6';
    ui.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:hidden;';

    ui.innerHTML = `
        <div id="checklistS6" style="
            position:absolute;top:16px;right:16px;width:410px;
            background:white;border-radius:12px;padding:14px;pointer-events:all;
            box-shadow:0 4px 20px rgba(0,0,0,0.12);font-family:'DM Sans',sans-serif;z-index:3;">
            <p style="font-size:0.78rem;font-weight:600;color:#1e5c3a;
                margin:0 0 10px;text-transform:uppercase;letter-spacing:0.05em;">
                Pasos para la cardioversión sincronizada
            </p>
            ${PARTES.map((parte, i) => `
                <div id="check-${parte.id}" style="
                    display:flex;align-items:center;gap:10px;
                    padding:4px;border-radius:8px;margin-bottom:4px;
                    background:${i === 0 ? '#e8f5ee' : 'transparent'};
                    border:1.5px solid ${i === 0 ? '#1e5c3a' : '#e0e6e0'};
                    transition:all 0.2s;cursor:pointer;pointer-events:all;"
                    onclick="window.irAParteS6(${i})">
                    <div id="icon-${parte.id}" style="
                        width:22px;height:22px;border-radius:50%;flex-shrink:0;
                        background:${i === 0 ? '#1e5c3a' : '#e0e6e0'};
                        display:flex;align-items:center;justify-content:center;
                        font-size:0.7rem;color:white;font-weight:700;">
                        ${i === 0 ? '→' : i + 1}
                    </div>
                    <span style="font-size:0.82rem;
                        color:${i === 0 ? '#1e5c3a' : '#9ab0a0'};
                        font-weight:${i === 0 ? '600' : '400'};
                        font-family:'DM Sans',sans-serif;">
                        ${parte.nombre}
                    </span>
                </div>`
    ).join('')}
        </div>

        <div id="instruccionS6" style="
            position:absolute;bottom:28px;left:50%;transform:translateX(-50%);
            white-space:nowrap;font-family:'DM Sans',sans-serif;font-size:0.78rem;
            color:#5a7a62;background:rgba(255,255,255,0.9);
            padding:6px 16px;border-radius:20px;pointer-events:none;z-index:3;
            box-shadow:0 2px 8px rgba(0,0,0,0.08);">
            ${PARTES[0].instruccion ?? PARTES[0].pasos?.[0]?.instruccion ?? ''}
        </div>

        <div id="contenedorSenales" style="
            position:absolute;inset:0;pointer-events:none;z-index:4;">
        </div>

        <style>
            @keyframes pulsarSenal {
                0%,100%{transform:translate(-50%,-50%) scale(1);opacity:0.7;}
                50%{transform:translate(-50%,-50%) scale(1.5);opacity:0.2;}
            }
            @keyframes pulsarInner {
                0%,100%{transform:translate(-50%,-50%) scale(1);}
                50%{transform:translate(-50%,-50%) scale(0.85);}
            }
        </style>

        <div id="panelLateralS6" style="
            position:absolute;top:0;left:-320px;bottom:0;width:300px;
            background:white;box-shadow:4px 0 20px rgba(0,0,0,0.12);
            padding:20px;pointer-events:all;overflow-y:auto;
            transition:left 0.35s cubic-bezier(0.16,1,0.3,1);
            font-family:'DM Sans',sans-serif;font-size:0.88rem;
            line-height:1.6;color:#1a2e1f;z-index:5;">
            <div style="display:flex;align-items:center;
                justify-content:space-between;margin-bottom:16px;">
                <h4 style="font-size:1rem;color:#1e5c3a;margin:0;">Cardioversión Sincronizada</h4>
                <button onclick="window.togglePanelS6()" style="
                    background:none;border:none;cursor:pointer;
                    color:#5a7a62;font-size:1.2rem;padding:4px;">✕</button>
            </div>
            <p style="margin:0 0 12px;">
                El modo Cardioversión Sincronizada es una variante del modo manual en la que el
                equipo sincroniza la descarga con la onda R del complejo QRS del paciente, evitando
                que la energía caiga en el período vulnerable del ciclo cardíaco. Se activa mediante
                un botón dedicado que enciende el indicador SINC en pantalla. Requiere electrodos
                conectados para lectura continua del ECG. Debe reactivarse manualmente entre cada
                intento. Recuerde: si necesita dar otra descarga, DEBE volver a presionar el botón
                'Activar sincrónico' antes de repetir.
            </p>
        </div>

        <div id="overlayPanelS6" onclick="window.togglePanelS6()" style="
            position:absolute;inset:0;background:rgba(0,0,0,0.2);
            pointer-events:none;opacity:0;transition:opacity 0.35s;z-index:4;">
        </div>

        <button onclick="window.togglePanelS6()" style="
            position:absolute;bottom:80px;left:16px;
            pointer-events:all;width:44px;height:44px;border-radius:50%;
            background:#1e5c3a;border:none;cursor:pointer;
            display:flex;align-items:center;justify-content:center;
            box-shadow:0 2px 8px rgba(0,0,0,0.2);z-index:3;">
            <svg width="20" height="20" viewBox="0 0 24 24"
                fill="none" stroke="white" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
        </button>`;

    contenedor.appendChild(ui);
}


/* =====================================================
   LÓGICA DEL CHECKLIST
   ===================================================== */

function activarParte(indice) {
    if (indice >= PARTES.length) return;

    // ══════════════════════════════════════════════════════════════
    // [CAMBIO 6] QUITAR NARANJA DEL OBJETO ANTERIOR
    //
    // Primera línea de activarParte. Siempre quita el resaltado
    // del objeto del paso anterior antes de activar el nuevo.
    // ══════════════════════════════════════════════════════════════
    quitarResaltadoActual();


    indiceActivo = indice;
    indiceImagenActual = 0;
    cancelarHold();
    const parte = PARTES[indice];

    const instruccionTexto = parte.pasos?.[0]?.instruccion
        ?? parte.instrucciones?.[0]
        ?? parte.instruccion;
    const instruccionEl = document.getElementById('instruccionS6');
    if (instruccionEl) {
        instruccionEl.style.whiteSpace = 'nowrap';
        instruccionEl.style.pointerEvents = 'none';
        instruccionEl.textContent = instruccionTexto;
    }

    if (parte.tipo === 'minijuego') {
        actualizarChecklist();
        const cs = document.getElementById('contenedorSenales');
        if (cs) cs.innerHTML = '';
        window._senalObjeto = null;
        controls.enableRotate = true;
        controls.enablePan = true;

        const instrEl = document.getElementById('instruccionS6');
        if (instrEl) {
            instrEl.style.whiteSpace = 'normal';
            instrEl.style.pointerEvents = 'all';
            instrEl.innerHTML = `
                <span style="color:#5a7a62;margin-right:10px;">
                    Para conectar los electrodos al paciente dale al botón de iniciar
                </span>
                <button onclick="window._lanzarMinijuegoS6()"
                    style="background:#1e5c3a;color:white;border:none;
                        padding:5px 14px;border-radius:16px;font-size:0.78rem;
                        font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;">
                    Iniciar
                </button>`;
        }
        window._lanzarMinijuegoS6 = () => {
            mostrarMinijuegoElectrodos(parte, () => avanzarDespuesDeVideo(parte));
        };
        return;
    }

    const primerObjeto = parte.pasos?.[0]?.objeto ?? parte.objeto;


    // ══════════════════════════════════════════════════════════════
    // [CAMBIO 7] FIJAR ÁNGULO DE PERILLA EN PASOS 2 EN ADELA
    // ══════════════════════════════════════════════════════════════
    if (indice > 0 && modeloCargado) {
        const pasoEncendido = PARTES.find(p => p.tipo === 'rotar' && p.anguloObjetivo);
        if (pasoEncendido) {
            const modoEncendido = MODOS_PERILLA.find(m => m.nombre === pasoEncendido.anguloObjetivo);
            if (modoEncendido) {
                modeloCargado.traverse(obj => {
                    if (obj.name === 'perilla001') obj.rotation.x = modoEncendido.angulo;
                });
                actualizarPantalla(modoEncendido.angulo);
            }
        }
    }


    if (parte.camaraOffset) {
        enfocarObjeto(primerObjeto);
    } else {
        animarCamara(
            new THREE.Vector3(CAMARA_POSICION.x, CAMARA_POSICION.y, CAMARA_POSICION.z),
            new THREE.Vector3(CAMARA_TARGET.x, CAMARA_TARGET.y, CAMARA_TARGET.z),
            600
        );
    }

    crearSenal(primerObjeto);
    actualizarChecklist();

    // ── IMAGEN DE PANTALLA AL ACTIVAR EL PASO ────────────────────
    // Solo se muestra la imagen base definida en imagenesPantalla[0].
    // Las imágenes dentro de pasos[].imagen son por clic: se aplican
    // en onClickCanvas al acertar cada sub-paso, nunca aquí.
    // Si un paso no tiene imagenesPantalla, la pantalla queda como
    // estaba (o en negro si es el primer paso).
    if (parte.imagenesPantalla?.length) {
        cambiarImagenPantalla(parte.imagenesPantalla[0]);
    }

    if (parte.tipo === 'rotar') {
        controls.enableRotate = false;
        controls.enablePan = false;
        mostrarFeedbackPerilla(parte);
        // ══════════════════════════════════════════════════════
        // [CAMBIO 8a] RESALTAR EN TIPO ROTAR
        // Pone en naranja el mesh de la perilla.
        // ══════════════════════════════════════════════════════
        resaltarObjetoActivo(parte.objeto);
    } else {
        controls.enableRotate = true;
        controls.enablePan = true;
        // ══════════════════════════════════════════════════════
        // [CAMBIO 8b] RESALTAR EN TIPO CLICK
        // Pone en naranja el primer objeto del paso o sub-paso.
        // ══════════════════════════════════════════════════════
        resaltarObjetoActivo(primerObjeto);
    }
}

function actualizarChecklist() {
    PARTES.forEach((parte, i) => {
        const check = document.getElementById(`check-${parte.id}`);
        const icon = document.getElementById(`icon-${parte.id}`);
        const span = check?.querySelector('span');
        if (!check || !icon || icon.innerHTML === '✓') return;
        const esActiva = i === indiceActivo;
        check.style.background = esActiva ? '#e8f5ee' : 'transparent';
        check.style.borderColor = esActiva ? '#1e5c3a' : '#e0e6e0';
        icon.style.background = esActiva ? '#1e5c3a' : '#e0e6e0';
        icon.innerHTML = esActiva ? '→' : String(i + 1);
        if (span) { span.style.color = esActiva ? '#1e5c3a' : '#9ab0a0'; span.style.fontWeight = esActiva ? '600' : '400'; }
    });
}

function marcarCompletada(idParte) {
    const check = document.getElementById(`check-${idParte}`);
    const icon = document.getElementById(`icon-${idParte}`);
    if (!check || !icon) return;
    check.style.background = '#e8f5ee';
    check.style.borderColor = '#1e5c3a';
    icon.style.background = '#1e5c3a';
    icon.innerHTML = '✓';
    const span = check.querySelector('span');
    if (span) { span.style.color = '#1e5c3a'; span.style.fontWeight = '600'; }
}

function marcarTodoCompletado() {
    PARTES.forEach(p => marcarCompletada(p.id));
    const cs = document.getElementById('contenedorSenales');
    if (cs) cs.innerHTML = '';
    // ══════════════════════════════════════════════════════════════
    // [CAMBIO 9] QUITAR NARANJA AL COMPLETAR TODO
    // Siempre llama quitarResaltadoActual() en marcarTodoCompletado.
    // ══════════════════════════════════════════════════════════════
    quitarResaltadoActual();

    controls.enableRotate = true;
    controls.enablePan = true;
    const instruccion = document.getElementById('instruccionS6');
    if (instruccion) instruccion.textContent = 'Cardioversión completada, selecciona de nuevo un paso de la lista y recuerda';
    document.getElementById('feedbackPerillaS6')?.remove();
}

function todasCompletadas() {
    const cs = document.getElementById('contenedorSenales');
    if (cs) cs.innerHTML = '';
    window._senalObjeto = null;
    document.getElementById('feedbackPerillaS6')?.remove();

    const instruccion = document.getElementById('instruccionS6');
    if (instruccion) instruccion.textContent = '¡Cardioversión completada!';

    const btnCompletar = document.getElementById('btnCompletar');
    if (btnCompletar && !btnCompletar.textContent.includes('completada')) {
        btnCompletar.disabled = false;
        btnCompletar.style.opacity = '1';
        btnCompletar.style.cursor = 'pointer';
    }
    if (camaraOriginalPos && camaraOriginalTarget) {
        animarCamara(camaraOriginalPos, camaraOriginalTarget, 1000);
    }
    controls.enableRotate = true;
    controls.enablePan = true;
}

function avanzarDespuesDeVideo(parte) {
    marcarCompletada(parte.id);
    const sig = indiceActivo + 1;
    sig < PARTES.length ? activarParte(sig) : todasCompletadas();
}

window.irAParteS6 = function (indice) {
    const icon = document.getElementById(`icon-${PARTES[indice].id}`);
    if (indice > indiceActivo && icon?.innerHTML !== '✓') return;
    activarParte(indice);
};

/* =====================================================
   SISTEMA DE RESALTADO — COPIA ÍNTEGRA EN CADA SECCIÓN
   =====================================================
 */
function capturaMaterialesOriginales() {
    if (!modeloCargado) return;
    modeloCargado.traverse(obj => {
        if (!obj.isMesh) return;
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats.forEach((mat, idx) => {
            if (!mat?.color) return;
            const clave = `${obj.name}_${idx}`;
            if (!_snapshot[clave]) {
                _snapshot[clave] = mat.color.clone();
            }
        });
    });
}


function resaltarObjetoActivo(nombreObjeto) {
    if (!modeloCargado || !nombreObjeto) return;
    // Restaurar el anterior si es diferente al nuevo
    if (_nombreResaltadoActual && _nombreResaltadoActual !== nombreObjeto) {
        _restaurarMesh(_nombreResaltadoActual);
    }
    _nombreResaltadoActual = nombreObjeto;
    modeloCargado.traverse(obj => {
        if (obj.name !== nombreObjeto || !obj.isMesh) return;
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats.forEach(mat => {
            if (!mat?.color) return;
            mat.color.setHex(COLOR_RESALTADO);
            mat.needsUpdate = true;
        });
    });
}


function quitarResaltadoActual() {
    if (!_nombreResaltadoActual) return;
    _restaurarMesh(_nombreResaltadoActual);
    _nombreResaltadoActual = null;
}


function restaurarTodosLosColores() {
    if (!modeloCargado) return;
    modeloCargado.traverse(obj => {
        if (!obj.isMesh) return;
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats.forEach((mat, idx) => {
            if (!mat?.color) return;
            const clave = `${obj.name}_${idx}`;
            if (_snapshot[clave]) {
                mat.color.copy(_snapshot[clave]);
                mat.needsUpdate = true;
            }
        });
    });
    _nombreResaltadoActual = null;
}


function _restaurarMesh(nombreObjeto) {
    if (!modeloCargado || !nombreObjeto) return;
    modeloCargado.traverse(obj => {
        if (obj.name !== nombreObjeto || !obj.isMesh) return;
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats.forEach((mat, idx) => {
            if (!mat?.color) return;
            const clave = `${obj.name}_${idx}`;
            if (_snapshot[clave]) {
                mat.color.copy(_snapshot[clave]);
                mat.needsUpdate = true;
            }
        });
    });
}


function resaltarConfirmacion(objeto) {
    if (!objeto?.isMesh) return;
    const mats = Array.isArray(objeto.material) ? objeto.material : [objeto.material];
    mats.forEach(mat => {
        if (!mat?.color) return;
        mat.color.setHex(COLOR_CONFIRMADO);
        mat.needsUpdate = true;
    });
    setTimeout(() => {
        mats.forEach((mat, idx) => {
            if (!mat?.color) return;
            const clave = `${objeto.name}_${idx}`;
            if (_snapshot[clave]) {
                mat.color.copy(_snapshot[clave]);
                mat.needsUpdate = true;
            }
        });
    }, 300);
}


/* =====================================================
   RESTAURAR PERILLA AL RE-INGRESAR CON SECCIÓN COMPLETADA
   ===================================================== */
function restaurarEstadoPerilla() {
    if (!modeloCargado) return;
    const ultimoRotar = [...PARTES].reverse().find(
        p => p.tipo === 'rotar' && p.anguloObjetivo
    );
    if (!ultimoRotar) return;
    const modoDestino = MODOS_PERILLA.find(m => m.nombre === ultimoRotar.anguloObjetivo);
    if (!modoDestino) return;
    modeloCargado.traverse(obj => {
        if (obj.name === 'perilla001') obj.rotation.x = modoDestino.angulo;
    });
    actualizarPantalla(modoDestino.angulo);
}



/* =====================================================
   MECÁNICA DE BOTÓN SOSTENIDO (hold)

   Cómo funciona:
   1. onMouseDown detecta que el objeto clickeado corresponde
      a una parte tipo 'hold' y llama iniciarHold().
   2. iniciarHold() muestra una barra de progreso circular
      y lanza un setTimeout de DURACION_HOLD_MS ms.
   3. Si el usuario suelta antes (onMouseUp / mouseleave),
      cancelarHold() limpia los timers y muestra feedback rojo.
   4. Si el timer completa, completarHold() avanza al siguiente paso.

   Para usar esta mecánica en otras secciones:
   - Pon tipo:'hold' en la parte correspondiente.
   - Copia las funciones iniciarHold, cancelarHold, completarHold,
     mostrarBarraHold, actualizarBarraHold y quitarBarraHold.
   - Cambia el ID 'holdBarS6' → 'holdBarS7', etc.
   ===================================================== */

function iniciarHold(objeto) {
    if (holdTimer) return; // ya está corriendo
    holdObjeto = objeto;
    holdInicio = performance.now();

    mostrarBarraHold();

    // Actualizar barra cada 50ms
    holdInterval = setInterval(() => {
        const elapsed = performance.now() - holdInicio;
        actualizarBarraHold(Math.min(elapsed / DURACION_HOLD_MS, 1));
    }, 50);

    holdTimer = setTimeout(() => {
        completarHold();
    }, DURACION_HOLD_MS);
}

function cancelarHold() {
    if (!holdTimer && !holdInterval) return;
    clearTimeout(holdTimer);
    clearInterval(holdInterval);
    holdTimer = null;
    holdInterval = null;
    holdObjeto = null;
    quitarBarraHold();

    // Solo mostrar feedback negativo si había un hold activo (no al destruir)
    if (holdInicio > 0) {
        mostrarToastPerilla('Mantén presionado más tiempo', false);
        holdInicio = 0;
    }
}

function completarHold() {
    clearTimeout(holdTimer);
    clearInterval(holdInterval);
    holdTimer = null;
    holdInterval = null;
    holdInicio = 0;
    quitarBarraHold();

    const parte = PARTES[indiceActivo];
    reproducirSonidoCorrecto();

    // Avanzar subpasos igual que tipo 'click'
    const siguientePaso = indiceImagenActual + 1;
    if (siguientePaso < (parte.pasos?.length ?? 0)) {
        if (parte.pasos[indiceImagenActual].imagen) {
            cambiarImagenPantalla(parte.pasos[indiceImagenActual].imagen);
        }
        indiceImagenActual = siguientePaso;
        const proxPaso = parte.pasos[siguientePaso];
        const instruccionEl = document.getElementById('instruccionS6');
        if (instruccionEl) instruccionEl.textContent = proxPaso.instruccion ?? parte.instruccion;
        crearSenal(proxPaso.objeto);
        window._senalObjeto = proxPaso.objeto;
    } else {
        if (parte.pasos?.[indiceImagenActual]?.imagen) {
            cambiarImagenPantalla(parte.pasos[indiceImagenActual].imagen);
        }
        setTimeout(() => {
            if (parte.video) { mostrarVideoPopup(parte, () => avanzarDespuesDeVideo(parte)); }
            else { avanzarDespuesDeVideo(parte); }
        }, 400);
    }
}

// ── Barra de progreso circular ──────────────────────────────────────
function mostrarBarraHold() {
    document.getElementById('holdBarS6')?.remove();
    const contenedor = document.getElementById('areaThreeJs');
    const bar = document.createElement('div');
    bar.id = 'holdBarS6';
    bar.style.cssText = `
        position:absolute;top:50%;left:50%;
        transform:translate(-50%,-50%);
        width:80px;height:80px;
        pointer-events:none;z-index:25;`;

    // SVG circular
    bar.innerHTML = `
        <svg viewBox="0 0 80 80" width="80" height="80">
            <circle cx="40" cy="40" r="34"
                fill="rgba(0,0,0,0.55)"
                stroke="rgba(255,255,255,0.15)" stroke-width="6"/>
            <circle id="holdArcS6" cx="40" cy="40" r="34"
                fill="none"
                stroke="#1e5c3a" stroke-width="6"
                stroke-linecap="round"
                stroke-dasharray="213.6"
                stroke-dashoffset="213.6"
                transform="rotate(-90 40 40)"/>
            <text x="40" y="45"
                text-anchor="middle"
                font-family="DM Sans,sans-serif"
                font-size="13" font-weight="700"
                fill="white" id="holdTextS6">0%</text>
        </svg>`;
    contenedor.appendChild(bar);
}

function actualizarBarraHold(progreso) {
    const arc = document.getElementById('holdArcS6');
    const text = document.getElementById('holdTextS6');
    if (!arc || !text) return;
    const circunferencia = 213.6;
    arc.style.strokeDashoffset = circunferencia * (1 - progreso);
    text.textContent = Math.round(progreso * 100) + '%';
}

function quitarBarraHold() {
    document.getElementById('holdBarS6')?.remove();
}


/* =====================================================
   MINIJUEGO DE ELECTRODOS
   ===================================================== */

function mostrarMinijuegoElectrodos(parte, onCompletado) {
    panelAbierto = true;
    document.getElementById('minijuegoElectrodosS6')?.remove();

    if (!document.getElementById('mjKeyframes')) {
        const style = document.createElement('style');
        style.id = 'mjKeyframes';
        style.textContent = `
            @keyframes pulsarZona {
                0%,100%{opacity:0.6;transform:scale(1);}
                50%{opacity:1;transform:scale(1.08);}
            }
            @keyframes aparecerElectrodo {
                from{transform:scale(0.5);opacity:0;}
                to{transform:scale(1);opacity:1;}
            }`;
        document.head.appendChild(style);
    }

    const contenedor = document.getElementById('areaThreeJs');
    const overlay = document.createElement('div');
    overlay.id = 'minijuegoElectrodosS6';
    overlay.style.cssText = `
        position:absolute;inset:0;background:rgba(0,0,0,0.82);
        display:flex;flex-direction:column;align-items:center;justify-content:center;
        z-index:20;font-family:'DM Sans',sans-serif;padding:16px;box-sizing:border-box;`;

    overlay.innerHTML = `
        <div style="width:100%;max-width:900px;background:white;border-radius:16px;
            padding:20px;box-sizing:border-box;display:flex;flex-direction:column;gap:14px;">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                <div>
                    <p style="margin:0;font-size:0.9rem;font-weight:600;color:#1e5c3a;">Coloca los electrodos</p>
                    <p style="margin:4px 0 0;font-size:0.78rem;color:#5a7a62;">Arrastra cada electrodo al punto correcto del cuerpo del paciente</p>
                </div>
                <span id="contadorElectrodos" style="font-size:0.75rem;color:#9ab0a0;background:#f0f5f0;padding:4px 10px;border-radius:20px;">0 / ${ELECTRODOS_CONFIG.length}</span>
            </div>
            <div style="display:flex;gap:24px;align-items:flex-start;flex-wrap:wrap;">
                <div style="display:flex;flex-direction:column;gap:6px;min-width:80px;">
                    <p style="margin:0 0 4px;font-size:0.72rem;color:#9ab0a0;text-transform:uppercase;letter-spacing:0.05em;">Electrodos</p>
                    <div id="bandejaElectrodos" style="display:flex;flex-direction:column;gap:10px;padding:10px;background:#f5f8f5;border:1.5px dashed #c8d8c8;border-radius:10px;min-height:60px;align-items:center;"></div>
                </div>
                <div style="position:relative;flex:1;min-width:220px;">
                    <img id="torsoImg" src="/Estudiante/threejs/img/torso.png" draggable="false"
                        style="width:100%;max-width:550px;display:block;border-radius:10px;user-select:none;pointer-events:none;">
                    <div id="zonasDrop" style="position:absolute;inset:0;"></div>
                    <div id="electrodosColocados" style="position:absolute;inset:0;pointer-events:none;"></div>
                </div>
            </div>
            <div id="feedbackElectrodos" style="min-height:22px;font-size:0.8rem;text-align:center;color:#5a7a62;transition:color 0.2s;"></div>
            <div id="wrapContinuarElectrodos" style="display:none;justify-content:center;">
                <button id="btnContinuarElectrodos" style="background:#1e5c3a;color:white;border:none;padding:10px 28px;border-radius:8px;font-size:0.88rem;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;">Continuar</button>
            </div>
        </div>`;

    contenedor.appendChild(overlay);
    const mjState = { colocados: {} };

    function renderBandeja() {
        const bandeja = document.getElementById('bandejaElectrodos');
        if (!bandeja) return; bandeja.innerHTML = '';
        ELECTRODOS_CONFIG.forEach(e => {
            if (mjState.colocados[e.id]) return;
            const el = document.createElement('div');
            el.dataset.eid = e.id;
            el.style.cssText = `width:46px;height:46px;border-radius:50%;background:${e.color};color:white;font-weight:700;font-size:14px;display:flex;align-items:center;justify-content:center;cursor:grab;user-select:none;border:2.5px solid rgba(255,255,255,0.5);box-shadow:0 2px 6px rgba(0,0,0,0.18);`;
            el.title = e.desc; el.textContent = e.label; bandeja.appendChild(el);
        });
    }
    // ── Helper: zonas drop usando porcentajes ──
    // Centro en px = (targetPctX / 100) * img.offsetWidth
    // No hay viewBox ni conversiones — los porcentajes son directos.
    function renderZonas() {
        const zonas = document.getElementById('zonasDrop');
        const img = document.getElementById('torsoImg');
        if (!zonas || !img) return;
        zonas.innerHTML = '';

        const w = img.offsetWidth;
        const h = img.offsetHeight;

        ELECTRODOS_CONFIG.forEach(e => {
            if (mjState.colocados[e.id]) return;
            const zona = document.createElement('div');
            zona.id = `zona-drop-${e.id}`;

            const cx = (e.targetPctX / 100) * w;   // centro X en px
            const cy = (e.targetPctY / 100) * h;   // centro Y en px
            const r = e.radius;

            zona.style.cssText = `
                position:absolute;
                width:${r * 2}px;height:${r * 2}px;
                left:${cx - r}px;top:${cy - r}px;
                border-radius:50%;
                border:2px dashed #434343;
                background:rgba(150,160,150,0.12);
                pointer-events:none;
                animation:pulsarZona 1.6s ease-in-out infinite;`;
            // zona.textContent = "   ";
            zonas.appendChild(zona);
        });
    }

    // ── Helper: dibujar electrodo colocado sobre la imagen ──
    function colocarElectrodo(edata) {
        const colocados = document.getElementById('electrodosColocados');
        const img = document.getElementById('torsoImg');
        if (!colocados || !img) return;

        const cx = (edata.targetPctX / 100) * img.offsetWidth;
        const cy = (edata.targetPctY / 100) * img.offsetHeight;
        const r = 23;

        const el = document.createElement('div');
        el.style.cssText = `
            position:absolute;
            width:${r * 2}px;height:${r * 2}px;
            left:${cx - r}px;top:${cy - r}px;
            border-radius:50%;
            background:${edata.color};
            display:flex;align-items:center;justify-content:center;
            color:white;font-weight:700;font-size:14px;
            border:2.5px solid white;
            box-shadow:0 2px 8px rgba(0,0,0,0.3);
            animation:aparecerElectrodo 0.25s ease-out;`;
        el.textContent = edata.label;
        colocados.appendChild(el);
    }

    renderBandeja();
    const imgEl = document.getElementById('torsoImg');
    if (imgEl.complete && imgEl.naturalWidth > 0) { renderZonas(); }
    else { imgEl.addEventListener('load', renderZonas, { once: true }); }
    const ro = new ResizeObserver(renderZonas); ro.observe(imgEl);

    document.getElementById('btnContinuarElectrodos').addEventListener('click', () => {
        ro.disconnect(); cerrarMinijuego();
        if (parte.video) { mostrarVideoPopup(parte, () => onCompletado()); }
        else { onCompletado(); }
    });

    let ghost = null, eidArrastrando = null;
    function iniciarArrastre(eid, cx, cy) {
        if (mjState.colocados[eid]) return; eidArrastrando = eid;
        const edata = ELECTRODOS_CONFIG.find(e => e.id === eid);
        ghost = document.createElement('div');
        ghost.style.cssText = `position:fixed;width:46px;height:46px;border-radius:50%;background:${edata.color};color:white;font-weight:700;font-size:14px;display:flex;align-items:center;justify-content:center;pointer-events:none;z-index:9999;opacity:0.92;border:2.5px solid rgba(255,255,255,0.7);transform:translate(-50%,-50%);box-shadow:0 4px 12px rgba(0,0,0,0.25);`;
        ghost.textContent = edata.label; document.body.appendChild(ghost); moverGhost(cx, cy);
    }
    function moverGhost(cx, cy) { if (ghost) { ghost.style.left = cx + 'px'; ghost.style.top = cy + 'px'; } }
    function terminarArrastre(cx, cy) {
        if (!eidArrastrando || !ghost) return; ghost.remove(); ghost = null;
        const eid = eidArrastrando; eidArrastrando = null;
        const edata = ELECTRODOS_CONFIG.find(e => e.id === eid);
        const img = document.getElementById('torsoImg'); const rect = img.getBoundingClientRect();
        const pctX = ((cx - rect.left) / rect.width) * 100, pctY = ((cy - rect.top) / rect.height) * 100;
        const rPctX = (edata.radius / rect.width) * 100, rPctY = (edata.radius / rect.height) * 100;
        const dx = (pctX - edata.targetPctX) / rPctX, dy = (pctY - edata.targetPctY) / rPctY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const feedback = document.getElementById('feedbackElectrodos');
        if (dist <= 1) {
            mjState.colocados[eid] = true; reproducirSonidoCorrecto(); colocarElectrodo(edata);
            feedback.style.color = '#1e5c3a'; feedback.textContent = `${edata.desc} — posición correcta`;
            const total = ELECTRODOS_CONFIG.length, hechos = Object.keys(mjState.colocados).length;
            document.getElementById('contadorElectrodos').textContent = `${hechos} / ${total}`;
            document.getElementById(`zona-drop-${eid}`)?.remove(); renderBandeja();
            if (hechos === total) { setTimeout(() => { feedback.textContent = '¡Todos los electrodos están colocados correctamente!'; document.getElementById('wrapContinuarElectrodos').style.display = 'flex'; }, 350); }
        } else {
            feedback.style.color = '#e24b4a'; feedback.textContent = `Posición incorrecta para ${edata.label}, inténtalo de nuevo`;
            setTimeout(() => { feedback.textContent = ''; }, 2200);
        }
    }
    function onMove(e) { moverGhost(e.clientX, e.clientY); }
    function onMoveTouch(e) { e.preventDefault(); moverGhost(e.touches[0].clientX, e.touches[0].clientY); }
    function onUp(e) { terminarArrastre(e.clientX, e.clientY); document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); }
    function onUpTouch(e) { const t = e.changedTouches[0]; terminarArrastre(t.clientX, t.clientY); document.removeEventListener('touchmove', onMoveTouch); document.removeEventListener('touchend', onUpTouch); }

    overlay.addEventListener('mousedown', e => { const eid = e.target.closest('[data-eid]')?.dataset?.eid; if (!eid) return; e.preventDefault(); iniciarArrastre(eid, e.clientX, e.clientY); document.addEventListener('mousemove', onMove); document.addEventListener('mouseup', onUp); });
    overlay.addEventListener('touchstart', e => { const eid = e.target.closest('[data-eid]')?.dataset?.eid; if (!eid) return; e.preventDefault(); iniciarArrastre(eid, e.touches[0].clientX, e.touches[0].clientY); document.addEventListener('touchmove', onMoveTouch, { passive: false }); document.addEventListener('touchend', onUpTouch); }, { passive: false });
}

function cerrarMinijuego() {
    document.getElementById('minijuegoElectrodosS6')?.remove();
    panelAbierto = false;
}


/* =====================================================
   CÁMARA
   ===================================================== */

function enfocarObjeto(nombreObjeto) {
    if (!modeloCargado) return;
    let obj = null;
    modeloCargado.traverse(o => { if (o.name === nombreObjeto) obj = o; });
    if (!obj) return;
    const pos = new THREE.Vector3();
    obj.getWorldPosition(pos);
    const off = PARTES[indiceActivo].camaraOffset;
    animarCamara(new THREE.Vector3(pos.x + off.x, pos.y + off.y, pos.z + off.z), pos.clone(), 800);
}

function animarCamara(posDestino, targetDestino, duracionMs, onComplete = null) {
    if (!camara || !controls) return;
    const posInicio = camara.position.clone(), targetInicio = controls.target.clone(), inicio = performance.now();
    function step(ahora) {
        const t = Math.min((ahora - inicio) / duracionMs, 1);
        const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        camara.position.lerpVectors(posInicio, posDestino, ease);
        controls.target.lerpVectors(targetInicio, targetDestino, ease);
        controls.update();
        if (t < 1) requestAnimationFrame(step); else onComplete?.();
    }
    requestAnimationFrame(step);
}


/* =====================================================
   FEEDBACK VISUAL DE PERILLA  (IDs corregidos a S6)
   ===================================================== */

function mostrarFeedbackPerilla(parte) {
    document.getElementById('feedbackPerillaS6')?.remove();
    if (!parte.anguloObjetivo) return;
    const contenedor = document.getElementById('areaThreeJs');
    const div = document.createElement('div');
    div.id = 'feedbackPerillaS6';
    contenedor.appendChild(div);
}

function actualizarFeedbackPerilla(modoActualNombre) {
    const el = document.getElementById('feedbackModoActualS6');
    if (el) el.textContent = modoActualNombre;
}


/* =====================================================
   SEÑAL PULSANTE
   ===================================================== */

function crearSenal(nombreObjeto) {
    const contenedor = document.getElementById('contenedorSenales');
    if (!contenedor) return;
    contenedor.innerHTML = ''; window._senalObjeto = nombreObjeto;
    const senal = document.createElement('div');
    senal.id = 'senalActiva';
    senal.style.cssText = 'position:absolute;width:36px;height:36px;top:0;left:0;pointer-events:none;';
    senal.innerHTML = `
        <div style="position:absolute;width:36px;height:36px;top:50%;left:50%;border-radius:50%;background:rgba(30,92,58,0.25);animation:pulsarSenal 1.4s ease-in-out infinite;"></div>
        <div style="position:absolute;width:20px;height:20px;top:50%;left:50%;border-radius:50%;background:#1e5c3a;display:flex;align-items:center;justify-content:center;animation:pulsarInner 1.4s ease-in-out infinite;">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg>
        </div>`;
    contenedor.appendChild(senal);
}

function actualizarSenales() {
    const senal = document.getElementById('senalActiva');
    if (!senal || !modeloCargado || !window._senalObjeto) return;
    let obj = null;
    modeloCargado.traverse(o => { if (o.name === window._senalObjeto) obj = o; });
    if (!obj) return;
    const pos = new THREE.Vector3();
    obj.getWorldPosition(pos); pos.project(camara);
    const canvas = renderer.domElement;
    const x = (pos.x * 0.5 + 0.5) * canvas.clientWidth, y = (-pos.y * 0.5 + 0.5) * canvas.clientHeight;
    senal.style.display = pos.z > 1 ? 'none' : 'block';
    senal.style.left = x + 'px'; senal.style.top = y + 'px';
}

window.togglePanelS6 = function () {
    const panel = document.getElementById('panelLateralS6');
    const overlay = document.getElementById('overlayPanelS6');
    if (!panel) return;
    panelLateralAbierto = !panelLateralAbierto;
    panel.style.left = panelLateralAbierto ? '0' : '-320px';
    overlay.style.opacity = panelLateralAbierto ? '1' : '0';
    overlay.style.pointerEvents = panelLateralAbierto ? 'all' : 'none';
};


/* =====================================================
   EVENTOS DE MOUSE
   ===================================================== */

function getMeshesYHits(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camara);
    const meshes = []; modeloCargado.traverse(o => { if (o.isMesh) meshes.push(o); });
    return raycaster.intersectObjects(meshes, true);
}

function onMouseDown(event) {
    if (!modeloCargado) return;
    const hits = getMeshesYHits(event);
    if (!hits.length) return;
    const parte = PARTES[indiceActivo];
    const nombreHit = hits[0].object.name;

    if (parte.tipo === 'rotar' && nombreHit === parte.objeto) {
        rotandoObjeto = true;
        objetoRotando = hits[0].object;
        mouseXAnterior = event.clientX;
        mouseYAnterior = event.clientY;
        renderer.domElement.style.cursor = 'grabbing';
        controls.enableRotate = false;
        return;
    }

    // ── Iniciar hold si corresponde ──────────────────────────────
    if (parte.tipo === 'hold') {
        const pasoActual = parte.pasos?.[indiceImagenActual];
        if (pasoActual && nombreHit === pasoActual.objeto) {
            event.preventDefault();
            iniciarHold(hits[0].object);
        }
    }
}

function onMouseMove(event) {
    if (!modeloCargado) return;
    if (rotandoObjeto && objetoRotando) {
        const deltaX = event.clientX - mouseXAnterior;
        mouseXAnterior = event.clientX; mouseYAnterior = event.clientY;
        if (objetoRotando.name === 'selector') {
            objetoRotando.rotation.x += deltaX * 0.01;
        } else {
            objetoRotando.rotation.x = THREE.MathUtils.clamp(objetoRotando.rotation.x + deltaX * 0.01, -Math.PI / 2, Math.PI / 2);
            actualizarPantalla(objetoRotando.rotation.x);
            const modoDetectado = MODOS_PERILLA.reduce((prev, curr) =>
                Math.abs(curr.angulo - objetoRotando.rotation.x) < Math.abs(prev.angulo - objetoRotando.rotation.x) ? curr : prev);


            actualizarFeedbackPerilla(modoDetectado.nombre);
        }
        return;
    }
    const hits = getMeshesYHits(event);
    const parte = PARTES[indiceActivo];
    let objetosEsperados;
    if (parte.pasos?.length) { objetosEsperados = [parte.pasos[indiceImagenActual]?.objeto].filter(Boolean); }
    else { objetosEsperados = parte.objetosGrupo ?? [parte.objeto]; }
    const cursorTipo = parte.tipo === 'rotar' ? 'grab' : parte.tipo === 'hold' ? 'pointer' : 'pointer';
    renderer.domElement.style.cursor = (hits.length > 0 && objetosEsperados.includes(hits[0].object.name)) ? cursorTipo : 'default';
}

function onMouseUp() {
    // Cancelar hold si estaba activo
    if (holdTimer || holdInterval) { cancelarHold(); }

    if (!rotandoObjeto) return;
    rotandoObjeto = false;
    const objRotado = objetoRotando;
    objetoRotando = null;
    renderer.domElement.style.cursor = 'default';

    const parte = PARTES[indiceActivo];
    if (parte.tipo !== 'rotar' || panelAbierto) return;

    //correcion 11 CAMBIO 10]
    // ═══════════════════════════════════════════════════════════════
    if (parte.anguloObjetivo && objRotado) {
        const modoObjetivo = MODOS_PERILLA.find(m => m.nombre === parte.anguloObjetivo);
        if (modoObjetivo) {
            const diferencia = Math.abs(objRotado.rotation.x - modoObjetivo.angulo);
            if (diferencia > TOLERANCIA_ANGULO_PERILLA) {
                mostrarToastPerilla(`Gira hacia "${parte.anguloObjetivo}"`, false);
                controls.enableRotate = false;
                return;
            }
        }
    }

    // Ángulo correcto: quitar naranja, feedback y avanzar
    quitarResaltadoActual();
    mostrarToastPerilla(
        parte.anguloObjetivo ? `¡Modo ${parte.anguloObjetivo} alcanzado!` : '¡Listo!',
        true
    );
    document.getElementById('feedbackPerillaS5')?.remove();
    reproducirSonidoCorrecto();

    if (parte.video) { mostrarVideoPopup(parte, () => avanzarDespuesDeVideo(parte)); }
    else { avanzarDespuesDeVideo(parte); }
}

function mostrarToastPerilla(mensaje, exito) {
    document.getElementById('toastPerillaS6')?.remove();
    const contenedor = document.getElementById('areaThreeJs');
    const toast = document.createElement('div');
    toast.id = 'toastPerillaS6';
    toast.style.cssText = `position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:${exito ? '#1e5c3a' : '#c0392b'};color:white;padding:10px 24px;border-radius:20px;font-family:'DM Sans',sans-serif;font-size:0.88rem;font-weight:600;pointer-events:none;z-index:30;animation:fadeInOut 1.8s ease forwards;`;
    toast.textContent = mensaje;
    const style = document.createElement('style');
    style.textContent = `@keyframes fadeInOut{0%{opacity:0;transform:translate(-50%,-60%);}15%{opacity:1;transform:translate(-50%,-50%);}70%{opacity:1;}100%{opacity:0;transform:translate(-50%,-40%);}}`;
    toast.appendChild(style); contenedor.appendChild(toast);
    setTimeout(() => toast.remove(), 1900);
}

function onClickCanvas(event) {
    if (!modeloCargado || rotandoObjeto || panelAbierto) return;
    const hits = getMeshesYHits(event);
    if (!hits.length) return;
    const parte = PARTES[indiceActivo];
    if (parte.tipo === 'minijuego' || parte.tipo === 'hold') return; // hold se maneja con mousedown


    // ══════════════════════════════════════════════════════════════
    // [CAMBIO 11] GUARD: TIPO ROTAR NO AVANZA CON CLIC
    //
    // Los pasos tipo 'rotar' NUNCA se validan aquí.
    // Solo onMouseUp (al soltar el drag) puede avanzarlos.
    // Agrega esta línea al inicio de onClickCanvas en cada sección.
    // ══════════════════════════════════════════════════════════════
    if (parte.tipo === 'rotar') return;

    const nombreHit = hits[0].object.name;

    if (parte.pasos?.length) {
        const pasoActual = parte.pasos[indiceImagenActual];
        if (nombreHit !== pasoActual.objeto) return;

        quitarResaltadoActual();
        reproducirSonidoCorrecto();
        efectoClick(hits[0].object);
        resaltarConfirmacion(hits[0].object);

        // Aplicar la imagen del sub-paso que acaba de completarse
        if (pasoActual.imagen) cambiarImagenPantalla(pasoActual.imagen);



        const siguientePaso = indiceImagenActual + 1;
        if (siguientePaso < parte.pasos.length) {
            indiceImagenActual = siguientePaso;
            const proxPaso = parte.pasos[siguientePaso];
            const instruccionEl = document.getElementById('instruccionS5');
            if (instruccionEl) instruccionEl.textContent = proxPaso.instruccion ?? parte.instruccion;
            resaltarObjetoActivo(proxPaso.objeto);  // naranja en el siguiente
            crearSenal(proxPaso.objeto);
            window._senalObjeto = proxPaso.objeto;
        } else {
            setTimeout(() => {
                if (parte.video) { mostrarVideoPopup(parte, () => avanzarDespuesDeVideo(parte)); }
                else { avanzarDespuesDeVideo(parte); }
            }, 2000);
        }
        return;
    }

    const validos = parte.objetosGrupo ?? [parte.objeto];
    if (!validos.includes(nombreHit)) return;
    reproducirSonidoCorrecto(); efectoClick(hits[0].object);
    if (parte.video) { mostrarVideoPopup(parte, () => avanzarDespuesDeVideo(parte)); }
    else { avanzarDespuesDeVideo(parte); }
}


/* =====================================================
   SONIDO / EFECTOS / PANTALLA
   ===================================================== */

function reproducirSonidoCorrecto() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator(), gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
        osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.18);
    } catch { }
}

function efectoClick(objeto) {
    const escOrig = objeto.scale.clone(); objeto.scale.multiplyScalar(0.9);
    if (objeto.material?.color) {
        const colorOrig = objeto.material.color.clone(); objeto.material.color.multiplyScalar(0.65);
        setTimeout(() => { objeto.scale.copy(escOrig); objeto.material.color.copy(colorOrig); }, 160);
    } else { setTimeout(() => objeto.scale.copy(escOrig), 160); }
}

function actualizarPantalla(angulo) {
    if (!modeloCargado) return;
    const modo = MODOS_PERILLA.reduce((prev, curr) => Math.abs(curr.angulo - angulo) < Math.abs(prev.angulo - angulo) ? curr : prev);
    if (_modoActual === modo.nombre) return; _modoActual = modo.nombre;
    let pantalla = null; modeloCargado.traverse(o => { if (o.name === 'pantalla') pantalla = o; });
    if (!pantalla) return;
    if (!modo.imagen) { if (pantalla.material) { pantalla.material.map = null; pantalla.material.color.set(0x000000); pantalla.material.needsUpdate = true; } return; }
    if (_cachTexturas[modo.imagen]) { aplicarTexturaPantalla(pantalla, _cachTexturas[modo.imagen]); }
    else { new THREE.TextureLoader().load(modo.imagen, t => { _cachTexturas[modo.imagen] = t; aplicarTexturaPantalla(pantalla, t); }); }
}

function aplicarTexturaPantalla(pantalla, textura) {
    if (!pantalla.material) return;
    textura.wrapS = textura.wrapT = THREE.ClampToEdgeWrapping; textura.repeat.set(1, 1); textura.offset.set(0, 0); textura.flipY = false; textura.needsUpdate = true;
    const mats = Array.isArray(pantalla.material) ? pantalla.material : [pantalla.material];
    mats.forEach(mat => { mat.map = textura; mat.color.set(0xffffff); mat.needsUpdate = true; });
}

function cambiarImagenPantalla(rutaImagen) {
    if (!modeloCargado || !rutaImagen) return;
    let pantalla = null; modeloCargado.traverse(o => { if (o.name === 'pantalla') pantalla = o; });
    if (!pantalla) return;
    if (_cachTexturas[rutaImagen]) { aplicarTexturaPantalla(pantalla, _cachTexturas[rutaImagen]); return; }
    new THREE.TextureLoader().load(rutaImagen, t => { _cachTexturas[rutaImagen] = t; aplicarTexturaPantalla(pantalla, t); });
}


/* =====================================================
   VIDEO POPUP
   ===================================================== */

function mostrarVideoPopup(parte, onTerminado) {
    panelAbierto = true; document.getElementById('videoPopupS6')?.remove();
    const contenedor = document.getElementById('areaThreeJs');
    const popup = document.createElement('div'); popup.id = 'videoPopupS6';
    popup.style.cssText = `position:absolute;inset:0;background:rgba(0,0,0,0.88);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:20;font-family:'DM Sans',sans-serif;`;
    popup.innerHTML = `
        <div style="width:82%;max-width:720px;">
            <p style="color:white;font-size:0.85rem;font-weight:600;text-align:center;margin:0 0 12px;opacity:0.85;">Video complementario — debes verlo completo para continuar</p>
            <div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;background:#000;">
                <iframe id="ytFramePopupS6" src="${construirUrlVideo(parte)}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:none;" allowfullscreen></iframe>
            </div>
            <p id="avisoPopupS6" style="color:#e05c3a;font-size:0.78rem;text-align:center;margin:10px 0 0;">El video debe terminar para continuar</p>
        </div>`;
    contenedor.appendChild(popup);
    setTimeout(() => iniciarYTPopupS6(onTerminado), 600);
}

function cerrarVideoPopup() { document.getElementById('videoPopupS6')?.remove(); panelAbierto = false; }

function iniciarYTPopupS6(onTerminado) {
    if (!document.getElementById('ytApiScript')) { const tag = document.createElement('script'); tag.id = 'ytApiScript'; tag.src = 'https://www.youtube.com/iframe_api'; document.head.appendChild(tag); }
    const activar = () => {
        const frame = document.getElementById('ytFramePopupS6');
        if (!frame || !window.YT?.Player) return;
        if (ytPlayer) { try { ytPlayer.destroy(); } catch { } ytPlayer = null; }
        ytPlayer = new YT.Player('ytFramePopupS6', {
            events: {
                onStateChange: e => {
                    if (e.data === YT.PlayerState.ENDED) {
                        document.getElementById('avisoPopupS6')?.remove();
                        setTimeout(() => { cerrarVideoPopup(); if (ytPlayer) { try { ytPlayer.destroy(); } catch { } ytPlayer = null; } onTerminado?.(); }, 600);
                    }
                }
            }
        });
    };
    window.YT?.Player ? activar() : (window.onYouTubeIframeAPIReady = activar);
}

function construirUrlVideo(parte) {
    if (!parte.video) return '';
    const m = parte.video.match(/(?:v=|youtu\.be\/)([^&\n?#]+)/);
    const id = m ? m[1] : parte.video;
    return `https://www.youtube.com/embed/${id}?rel=0&enablejsapi=1&origin=${window.location.origin}`;
}


/* =====================================================
   MEDIA
   ===================================================== */

function pararMedia() {
    if (ytPlayer) { try { ytPlayer.stopVideo(); ytPlayer.destroy(); } catch { } ytPlayer = null; }
    document.getElementById('videoPopupS6')?.remove();
    document.getElementById('minijuegoElectrodosS6')?.remove();
    panelAbierto = false;
}