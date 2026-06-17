import { inicializarEscena, cargarModelo, limpiarRenderer, THREE } from '../escena.js';

const MODOS_PERILLA = [
    { nombre: 'Manual',     angulo: -1.57, imagen: '/Estudiante/threejs/img/manual.png' },
    { nombre: 'Monitor',    angulo: -0.4,  imagen: '/Estudiante/threejs/img/MODOMONITOR.png' },
    { nombre: 'Apagado',    angulo: 0,     imagen: '/Estudiante/threejs/img/negro.jpg' },
    { nombre: 'Marcapasos', angulo: 1,     imagen: '/Estudiante/threejs/img/marcapasos.png' },
    { nombre: 'DEA',        angulo: 2,     imagen: '/Estudiante/threejs/img/DEA.png' },
];

const TOLERANCIA_ANGULO_PERILLA = 0.45;

const CAMARA_POSICION = { x: 0.7, y: 0.5, z: 1.2 };
const CAMARA_TARGET   = { x: 0.8, y: -0.9, z: 0 };

// ─────────────────────────────────────────────────────────────────
// [PEGAR EN CADA SECCIÓN NIHON — BLOQUE A]
// Constantes de color. Cambia los hex si quieres otra paleta.
// ─────────────────────────────────────────────────────────────────
const COLOR_RESALTADO  = 0x59DEFF;  // azul claro — objeto activo
const COLOR_CONFIRMADO = 0x4caf50;  // verde      — destello al acertar

// ─────────────────────────────────────────────────────────────────
// [PEGAR EN CADA SECCIÓN NIHON — BLOQUE B]
// Segundo de la animación GLB donde la perilla queda "encendida".
// Ajusta el número según la sección.
// ─────────────────────────────────────────────────────────────────
const SEGUNDO_ENCENDIDO = 218.5;   // segundo donde la perilla queda encendida (paso 0)
const SEGUNDO_ENERGIA   = 221.7;   // segundo donde la perilla queda en nivel de energía (paso 3)

const PARTES = [

    {
        id: 'perilla',
        nombre: 'Gire la perilla principal hasta MONITOR para encender el equipo.',
        tipo: 'click',
        //camaraOffset: { x: 0, y: -0.1, z: 0.8 },
        imagenesPantalla: [ '/Estudiante/threejs/img/negro.jpg' ],
        pasos: [
            { objeto: 'perilla', imagen: '/Estudiante/threejs/img/nihon/modo_monitor_palas.png', instruccion: 'Gira la perilla hasta modo monitor, pero para esta simulación solo debes dar click' },
        ],
    },

    {
        id: 'electrodos',
        nombre: 'Conecte el cable de EKG al paciente con los electrodos bien adheridos',
        tipo: 'minijuego',
        
        instruccion: 'Arrastra cada electrodo a su posición correcta en el paciente',
        imagenesPantalla: [ '/Estudiante/threejs/img/nihon/modo_monitor_palas.png' ],
    },
    
    {
        id: 'Deriv1',
        nombre: 'Si la pantalla dice "PALAS" pero tiene electrodos conectados, presione el botón de derivada hasta ver la derivada deseada.',
        tipo: 'click',
       // camaraOffset: { x: 0, y: -0.1, z: 0.8 },
        imagenesPantalla: [ '/Estudiante/threejs/img/nihon/modo_monitor_palas.png' ],
        pasos: [
            { objeto: 'Deriv', imagen: '/Estudiante/threejs/img/nihon/modo_monitor_deriv1.png', instruccion: 'Haz click sobre el botón  para pasar de pala a derivada' },
            { objeto: 'Deriv', imagen: '/Estudiante/threejs/img/nihon/cardioversion_desactivada_electrodos_puestos.png', instruccion: 'Haz click sobre el botón  para pasar a derivada 2' },
        ],
        video:"https://youtu.be/B4AxqSH-1rU"
    },

    
    {
        id: 'energia',
        nombre: 'Gire la perilla para seleccionar la energía.',
        tipo: 'click',
        //camaraOffset: { x: 0, y: -0.1, z: 0.8 },
        imagenesPantalla: [ '/Estudiante/threejs/img/cardioversion_desactivada_electrodos_puestos.png' ],
        objeto:"perilla"
        
    },

    {
        id: 'Deriv',
        nombre: 'Presione el botón SINCRÓNICO (SYNC) para activar el modo. Aplique gel conductor sobre las palas y colóquelas sobre el pecho del paciente.',
        tipo: 'click',
        //camaraOffset: { x: 0, y: 0.8, z: 0.9 },
        imagenesPantalla: [ '/Estudiante/threejs/img/nihon/derivada2ModoMonitor.png' ],
        pasos: [
            { objeto: 'sinc', imagen: '/Estudiante/threejs/img/nihon/cardioversion_activada.png', instruccion: 'Haz click sobre el botón SINC para activar el modo' },
        ],
        video:"https://youtu.be/zTVuLagN19c"
    },
    {
        id: '2',
        nombre: 'Presione el botón de carga. Puede cargarlo desde las palas o desde el panel frontal.',
        tipo: 'click',
        imagenesPantalla: [ '/Estudiante/threejs/img/nihon/cardioversion_activada.png' ],
        pasos: [
            { objeto: 'carga', imagen: '/Estudiante/threejs/img/nihon/cardioversion_activada_energia_cargada.png', instruccion: 'Oprime  el botón de carga, para esta simulación hazlo desde el panel frontal' },
        ],
    },
    {
        id: '3',
        nombre: 'Presione y MANTENGA PRESIONADOS los botones de descarga en ambas palas por algunos segundos.',
        tipo: 'click',
         camaraOffset: { x: 0, y: 0.3, z: -0.8 },
        imagenesPantalla: [ '/Estudiante/threejs/img/nihon/cardioversion_activada_energia_cargada.png' ],
        pasos: [
            { objeto: 'botonDer', imagen: '/Estudiante/threejs/img/nihon/modo_monitor_palas.png', instruccion: 'Presiona por algunos segundos los botones de descarga de las palas, en esta simulación solo necesitas oprimir uno' },
        ],
    },
    {
        id: '4',
        nombre: 'Verifique que la descarga se realizó. Si se requiere otra cardioversión, verifique que el modo SINCRÓNICO aún se encuentre activo.',
        tipo: 'click',
        //camaraOffset: { x: 0, y: 0, z: 1.2 },
        imagenesPantalla: [ '/Estudiante/threejs/img/nihon/sincronizacionRealizada.png' ],
        pasos: [
            { objeto: 'sinc', imagen: '/Estudiante/threejs/img/nihon/cardioversion_activada_2.png', instruccion: 'Verifica que SYNC sigue activo para otra descarga' },
        ],
        video:"https://youtu.be/vlzB4tTCZsE"
    },
];




/* =====================================================
   CONFIGURACIÓN DEL MINIJUEGO DE ELECTRODOS
   ===================================================== */
const ELECTRODOS_CONFIG = [
    { id: 'R', label: 'R/RA',   desc: 'R', color: '#e24b4a', targetPctX: 38.5, targetPctY: 26.2, radius: 27 },
    { id: 'L', label: 'L / LA', desc: 'L', color: '#ba7517', targetPctX: 61.6, targetPctY: 26.2, radius: 27 },
    { id: 'F', label: 'F / LL', desc: 'F', color: '#1d9e75', targetPctX: 61.5, targetPctY: 68.1, radius: 27 },
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

const _cachTexturas = {};
let _modoActual = null;
let indiceImagenActual = 0;

// ── Estado del hold de descarga (paso 6) ─────────────────────────
let _holdMesh        = null;   // mesh que se está sosteniendo
let _holdStart       = 0;      // timestamp inicio del hold
let _holdBarraAnim   = null;   // requestAnimationFrame de la barra
const HOLD_DURACION  = 3000;   // ms que hay que sostener

// ─────────────────────────────────────────────────────────────────
// [PEGAR EN CADA SECCIÓN NIHON — BLOQUE C]
// Variables del sistema de resaltado y del reloj de animación.
// Pega estas 3 líneas en el bloque de estado interno.
// ─────────────────────────────────────────────────────────────────
const _snapshot = {};
let   _nombreResaltadoActual = null;
let   relojAnim = null;   // ← BUG CORREGIDO: faltaba esta declaración en seccion4

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
    escena    = base.escena;
    camara    = base.camara;
    renderer  = base.renderer;
    controls  = base.controls;
    reloj     = base.reloj;

    mostrarLoader(contenedorId);

    cargarModelo(
        '/Estudiante/threejs/modelados/Nihon3.glb',
        escena, camara, controls,
        (modelo, anim, mix) => {
            modeloCargado = modelo;
            animaciones   = anim;
            mixer         = mix;

            camara.position.set(CAMARA_POSICION.x, CAMARA_POSICION.y, CAMARA_POSICION.z);
            controls.target.set(CAMARA_TARGET.x,   CAMARA_TARGET.y,   CAMARA_TARGET.z);
            controls.update();

            // Límites de zoom — DENTRO del callback para que no los sobreescriba escena.js
            controls.enablePan   = true;
            controls.minDistance = 1.3;
            controls.maxDistance = 4.5;
            controls.zoomSpeed   = 1.4;
            controls.rotateSpeed = 0.5;

            camaraOriginalPos    = camara.position.clone();
            camaraOriginalTarget = controls.target.clone();

            // ─────────────────────────────────────────────────────
            // [PEGAR EN CADA SECCIÓN NIHON — BLOQUE D]
            // Captura colores originales ANTES de tocar materiales.
            // ─────────────────────────────────────────────────────
            capturaMaterialesOriginales();

            // ─────────────────────────────────────────────────────
            // [PEGAR EN CADA SECCIÓN NIHON — BLOQUE E]
            // Inicializar relojAnim. NO tocar el mixer aquí:
            // la animación corre libre hasta que el usuario
            // interactúa con la perilla en el paso 0.
            // ─────────────────────────────────────────────────────
            relojAnim = new THREE.Clock();

            _modoActual = null;
            let pantalla = null;
            modeloCargado.traverse(o => { if (o.name === 'pantalla001') pantalla = o; });
            if (pantalla?.material) {
                const mats = Array.isArray(pantalla.material)
                    ? pantalla.material : [pantalla.material];
                mats.forEach(mat => {
                    mat.map = null;
                    mat.color.set(0x000000);
                    mat.needsUpdate = true;
                });
            }

            ocultarLoader();
            mostrarUI();

            if (yaCompletada) {
                marcarTodoCompletado();
            } else {
                activarParte(0);
            }
        }
    );

    function animar() {
        animFrameId = requestAnimationFrame(animar);
        if (!escena || !camara || !renderer) return;
        // ─────────────────────────────────────────────────────
        // [PEGAR EN CADA SECCIÓN NIHON — BLOQUE F]
        // Usar relojAnim para el mixer. Con timeScale=0 el mixer
        // no avanza aunque se llame update().
        // ─────────────────────────────────────────────────────
        if (mixer && relojAnim) mixer.update(relojAnim.getDelta());
        controls.update();
        actualizarSenales();
        renderer.render(escena, camara);
    }
    animar();

    const canvas = renderer.domElement;
    canvas.addEventListener('mousedown',  onMouseDown);
    canvas.addEventListener('mousemove',  onMouseMove);
    canvas.addEventListener('mouseup',    onMouseUp);
    canvas.addEventListener('mouseleave', onMouseUp);   // cancelar hold si sale del canvas
    canvas.addEventListener('click',      onClickCanvas);
}

export function destruirSeccion6() {
    indiceImagenActual = 0;
    pararMedia();

    cancelAnimationFrame(animFrameId);
    animFrameId = null;

    if (renderer) {
        renderer.domElement.removeEventListener('mousedown',  onMouseDown);
        renderer.domElement.removeEventListener('mousemove',  onMouseMove);
        renderer.domElement.removeEventListener('mouseup',    onMouseUp);
        renderer.domElement.removeEventListener('mouseleave', onMouseUp);
        renderer.domElement.removeEventListener('click',      onClickCanvas);
    }

    document.getElementById('areaThreeJs')?.replaceChildren();
    document.getElementById('uiSeccionNihon6')?.remove();
    document.getElementById('loaderSeccionNihon6')?.remove();
    document.getElementById('checklistSNihon6')?.remove();
    document.getElementById('videoPopupSNihon6')?.remove();
    document.getElementById('minijuegoElectrodosSNihon6')?.remove();

    // ─────────────────────────────────────────────────────────────
    // [PEGAR EN CADA SECCIÓN NIHON — BLOQUE G]
    // Restaurar colores y resetear animación al destruir.
    // Cambia solo los IDs de los elementos HTML (SNihon4 → SNihon5…).
    // ─────────────────────────────────────────────────────────────
    restaurarTodosLosColores();

    if (mixer && animaciones.length > 0) {
        animaciones.forEach(a => {
            const ac = mixer.clipAction(a);
            ac.reset();
            ac.time = 0;
        });
        mixer.timeScale = 1;
        mixer.update(0);
    }

    Object.keys(_cachTexturas).forEach(k => delete _cachTexturas[k]);
    Object.keys(_snapshot).forEach(k => delete _snapshot[k]);   // ← BUG CORREGIDO: faltaba en seccion4
    _nombreResaltadoActual = null;
    _modoActual = null;
    relojAnim   = null;

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
   NIHON: CONTROL DE ANIMACIÓN DE PERILLA
   =====================================================
   [PEGAR EN CADA SECCIÓN NIHON — BLOQUE H]
   Copia pausarAnimacionEn() y resetearAnimacion() sin cambios.
   Solo ajusta SEGUNDO_ENCENDIDO arriba del archivo.
   ===================================================== */

function pausarAnimacionEn(segundos) {
    if (!mixer || !animaciones.length) return;
    mixer.timeScale = 0;
    animaciones.forEach(a => {
        const ac = mixer.clipAction(a);
        ac.reset();
        ac.play();
        ac.paused = true;
        ac.time   = segundos;
    });
    mixer.update(0);
}

function resetearAnimacion() {
    pausarAnimacionEn(0);
}


/* =====================================================
   LOADER
   ===================================================== */

function mostrarLoader(contenedorId) {
    const contenedor = document.getElementById(contenedorId);
    contenedor.style.position = 'relative';
    document.getElementById('loaderSeccionNihon6')?.remove();

    const loader = document.createElement('div');
    loader.id = 'loaderSeccionNihon6';
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
    const loader = document.getElementById('loaderSeccionNihon6');
    if (!loader) return;
    loader.style.transition = 'opacity 0.4s';
    loader.style.opacity = '0';
    setTimeout(() => loader.remove(), 400);
}


/* =====================================================
   INTERFAZ PRINCIPAL
   ===================================================== */

function mostrarUI() {
    document.getElementById('uiSeccionNihon6')?.remove();
    const contenedor = document.getElementById('areaThreeJs');

    const ui = document.createElement('div');
    ui.id = 'uiSeccionNihon6';
    ui.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:hidden;';

    ui.innerHTML = `
        <div id="checklistSNihon6" style="
            position:absolute;top:16px;right:16px;width:350px;
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
                    onclick="window.irAParteSNihon6(${i})">
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

        <div id="instruccionSNihon6" style="
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

        <div id="panelLateralSNihon6" style="
            position:absolute;top:0;left:-320px;bottom:0;width:300px;
            background:white;box-shadow:4px 0 20px rgba(0,0,0,0.12);
            padding:20px;pointer-events:all;overflow-y:auto;
            transition:left 0.35s cubic-bezier(0.16,1,0.3,1);
            font-family:'DM Sans',sans-serif;font-size:0.88rem;
            line-height:1.6;color:#1a2e1f;z-index:5;">
            <div style="display:flex;align-items:center;
                justify-content:space-between;margin-bottom:16px;">
                <h4 style="font-size:1rem;color:#1e5c3a;margin:0;">Cardioversión Sincrónica</h4>
                <button onclick="window.togglePanelSNihon6()" style="
                    background:none;border:none;cursor:pointer;
                    color:#5a7a62;font-size:1.2rem;padding:4px;">✕</button>
            </div>
            <p style="margin:0 0 12px;">
                La Cardioversión Sincronizada libera una descarga en el momento preciso del ciclo
                cardíaco (QRS), para tratar arritmias como taquicardia supraventricular o flutter
                auricular. Sostenga los botones 1–2 s — el equipo descarga cuando detecta el QRS.
                Verifique que el semáforo de contacto esté en VERDE. Si las marcas QRS no aparecen
                en pantalla tras activar SYNC, cambie la derivada o verifique los electrodos.
            </p>
        </div>

        <div id="overlayPanelSNihon6" onclick="window.togglePanelSNihon6()" style="
            position:absolute;inset:0;background:rgba(0,0,0,0.2);
            pointer-events:none;opacity:0;transition:opacity 0.35s;z-index:4;">
        </div>

        <button onclick="window.togglePanelSNihon6()" style="
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

    // ─────────────────────────────────────────────────────────────
    // [PEGAR EN CADA SECCIÓN NIHON — BLOQUE I]
    // Quitar resaltado anterior + lógica de animación según paso.
    // ─────────────────────────────────────────────────────────────
    quitarResaltadoActual();

    indiceActivo       = indice;
    indiceImagenActual = 0;
    const parte = PARTES[indice];

    const instruccionTexto = parte.pasos?.[0]?.instruccion
        ?? parte.instrucciones?.[0]
        ?? parte.instruccion;
    const instruccionEl = document.getElementById('instruccionSNihon6');
    if (instruccionEl) instruccionEl.textContent = instruccionTexto;

    // Minijuego: flujo especial
    if (parte.tipo === 'minijuego') {
        actualizarChecklist();
        const cs = document.getElementById('contenedorSenales');
        if (cs) cs.innerHTML = '';
        window._senalObjeto = null;
        if (controls) controls.enableRotate = true;
        const instrEl = document.getElementById('instruccionSNihon6');
        if (instrEl) {
            instrEl.style.whiteSpace    = 'normal';
            instrEl.style.pointerEvents = 'all';
            instrEl.innerHTML = `
                <span style="color:#5a7a62;margin-right:10px;">
                    Para conectar los electrodos al paciente dale al botón de iniciar
                </span>
                <button onclick="window._lanzarMinijuegoSNihon6()"
                    style="background:#1e5c3a;color:white;border:none;
                        padding:5px 14px;border-radius:16px;font-size:0.78rem;
                        font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;">
                    Iniciar
                </button>`;
        }
        window._lanzarMinijuegoSNihon6 = () => {
            mostrarMinijuegoElectrodos(parte, () => avanzarDespuesDeVideo(parte));
        };
        return;
    }

    const primerObjeto = parte.pasos?.[0]?.objeto ?? parte.objeto;

    // ─────────────────────────────────────────────────────────────
    // ANIMACIÓN SEGÚN EL PASO:
    // indice 0 (perilla) → libre, el usuario la gira.
    // indice 1 (minijuego) → libre, la perilla ya quedó en SEGUNDO_ENCENDIDO.
    // indice 2-3 → congelada en SEGUNDO_ENCENDIDO.
    // indice 4+ (después de seleccionar energía) → congelada en SEGUNDO_ENERGIA.
    // ─────────────────────────────────────────────────────────────
    if (indice >= 4) {
        pausarAnimacionEn(SEGUNDO_ENERGIA);
    } else if (indice > 0) {
        pausarAnimacionEn(SEGUNDO_ENCENDIDO);
    }
    // indice 0: animación libre (perilla sin tocar)

    if (parte.camaraOffset) {
        enfocarObjeto(primerObjeto);
    } else {
        animarCamara(
            new THREE.Vector3(CAMARA_POSICION.x, CAMARA_POSICION.y, CAMARA_POSICION.z),
            new THREE.Vector3(CAMARA_TARGET.x,   CAMARA_TARGET.y,   CAMARA_TARGET.z),
            600
        );
    }

    crearSenal(primerObjeto);
    actualizarChecklist();

    // Imagen base del paso (las de pasos[].imagen se aplican al hacer clic)
    if (parte.imagenesPantalla?.length) {
        cambiarImagenPantalla(parte.imagenesPantalla[0]);
    }

    // ─────────────────────────────────────────────────────────────
    // [PEGAR EN CADA SECCIÓN NIHON — BLOQUE K]
    // Resaltar el objeto activo en COLOR_RESALTADO.
    // ─────────────────────────────────────────────────────────────
    if (parte.tipo === 'rotar') {
        controls.enableRotate = false;
        controls.enablePan    = false;
        resaltarObjetoActivo(parte.objeto);
    } else {
        controls.enableRotate = true;
        controls.enablePan    = true;
        resaltarObjetoActivo(primerObjeto);
    }
}

function actualizarChecklist() {
    PARTES.forEach((parte, i) => {
        const check = document.getElementById(`check-${parte.id}`);
        const icon  = document.getElementById(`icon-${parte.id}`);
        const span  = check?.querySelector('span');
        if (!check || !icon || icon.innerHTML === '✓') return;
        const esActiva = i === indiceActivo;
        check.style.background  = esActiva ? '#e8f5ee' : 'transparent';
        check.style.borderColor = esActiva ? '#1e5c3a' : '#e0e6e0';
        icon.style.background   = esActiva ? '#1e5c3a' : '#e0e6e0';
        icon.innerHTML          = esActiva ? '→' : String(i + 1);
        if (span) {
            span.style.color      = esActiva ? '#1e5c3a' : '#9ab0a0';
            span.style.fontWeight = esActiva ? '600' : '400';
        }
    });
}

function marcarCompletada(idParte) {
    const check = document.getElementById(`check-${idParte}`);
    const icon  = document.getElementById(`icon-${idParte}`);
    if (!check || !icon) return;
    check.style.background  = '#e8f5ee';
    check.style.borderColor = '#1e5c3a';
    icon.style.background   = '#1e5c3a';
    icon.innerHTML          = '✓';
    const span = check.querySelector('span');
    if (span) { span.style.color = '#1e5c3a'; span.style.fontWeight = '600'; }
}

function marcarTodoCompletado() {
    PARTES.forEach(p => marcarCompletada(p.id));
    const cs = document.getElementById('contenedorSenales');
    if (cs) cs.innerHTML = '';
    quitarResaltadoActual();
    if (controls) controls.enableRotate = true;
    const instruccion = document.getElementById('instruccionSNihon6');
    if (instruccion) instruccion.textContent = 'Cardioversión completada, selecciona de nuevo un paso de la lista y recuerda';
}

function todasCompletadas() {
    const cs = document.getElementById('contenedorSenales');
    if (cs) cs.innerHTML = '';
    window._senalObjeto = null;
    quitarResaltadoActual();
    const instruccion = document.getElementById('instruccionSNihon6');
    if (instruccion) instruccion.textContent = '¡Cardioversión completada!';
    const btnCompletar = document.getElementById('btnCompletar');
    if (btnCompletar && !btnCompletar.textContent.includes('completada')) {
        btnCompletar.disabled      = false;
        btnCompletar.style.opacity = '1';
        btnCompletar.style.cursor  = 'pointer';
    }
    if (camaraOriginalPos && camaraOriginalTarget) {
        animarCamara(camaraOriginalPos, camaraOriginalTarget, 1000);
    }
    if (controls) controls.enableRotate = true;
}

function avanzarDespuesDeVideo(parte) {
    marcarCompletada(parte.id);
    const sig = indiceActivo + 1;
    sig < PARTES.length ? activarParte(sig) : todasCompletadas();
}

window.irAParteSNihon6 = function (indice) {
    const icon = document.getElementById(`icon-${PARTES[indice].id}`);
    if (indice > indiceActivo && icon?.innerHTML !== '✓') return;
    activarParte(indice);
};


/* =====================================================
   SISTEMA DE RESALTADO
   =====================================================
   [PEGAR EN CADA SECCIÓN NIHON — BLOQUE L]
   Copia estas 6 funciones sin cambios. No tienen IDs de UI.
   ===================================================== */

function capturaMaterialesOriginales() {
    if (!modeloCargado) return;
    modeloCargado.traverse(obj => {
        if (!obj.isMesh) return;
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats.forEach((mat, idx) => {
            if (!mat?.color) return;
            const clave = `${obj.name}_${idx}`;
            if (!_snapshot[clave]) _snapshot[clave] = mat.color.clone();
        });
    });
}

function resaltarObjetoActivo(nombreObjeto) {
    if (!modeloCargado || !nombreObjeto) return;
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
            if (_snapshot[clave]) { mat.color.copy(_snapshot[clave]); mat.needsUpdate = true; }
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
            if (_snapshot[clave]) { mat.color.copy(_snapshot[clave]); mat.needsUpdate = true; }
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
            if (_snapshot[clave]) { mat.color.copy(_snapshot[clave]); mat.needsUpdate = true; }
        });
    }, 300);
}



/* =====================================================
   MINIJUEGO DE ELECTRODOS
   ===================================================== */

function mostrarMinijuegoElectrodos(parte, onCompletado) {
    panelAbierto = true;
    document.getElementById('minijuegoElectrodosSNihon6')?.remove();

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
    overlay.id = 'minijuegoElectrodosSNihon6';
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
        if (!bandeja) return;
        bandeja.innerHTML = '';
        ELECTRODOS_CONFIG.forEach(e => {
            if (mjState.colocados[e.id]) return;
            const el = document.createElement('div');
            el.dataset.eid = e.id;
            el.style.cssText = `width:46px;height:46px;border-radius:50%;background:${e.color};color:white;font-weight:700;font-size:14px;display:flex;align-items:center;justify-content:center;cursor:grab;user-select:none;border:2.5px solid rgba(255,255,255,0.5);box-shadow:0 2px 6px rgba(0,0,0,0.18);`;
            el.title = e.desc; el.textContent = e.label;
            bandeja.appendChild(el);
        });
    }
    function renderZonas() {
        const zonas = document.getElementById('zonasDrop');
        const img   = document.getElementById('torsoImg');
        if (!zonas || !img) return;
        zonas.innerHTML = '';
        const w = img.offsetWidth, h = img.offsetHeight;
        ELECTRODOS_CONFIG.forEach(e => {
            if (mjState.colocados[e.id]) return;
            const zona = document.createElement('div');
            zona.id = `zona-drop-${e.id}`;
            const cx = (e.targetPctX/100)*w, cy = (e.targetPctY/100)*h, r = e.radius;
            zona.style.cssText = `position:absolute;width:${r*2}px;height:${r*2}px;left:${cx-r}px;top:${cy-r}px;border-radius:50%;border:2px dashed #434343;background:rgba(150,160,150,0.12);pointer-events:none;animation:pulsarZona 1.6s ease-in-out infinite;`;
            zonas.appendChild(zona);
        });
    }
    function colocarElectrodo(edata) {
        const colocados = document.getElementById('electrodosColocados');
        const img = document.getElementById('torsoImg');
        if (!colocados || !img) return;
        const cx = (edata.targetPctX/100)*img.offsetWidth, cy = (edata.targetPctY/100)*img.offsetHeight, r = 23;
        const el = document.createElement('div');
        el.style.cssText = `position:absolute;width:${r*2}px;height:${r*2}px;left:${cx-r}px;top:${cy-r}px;border-radius:50%;background:${edata.color};display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:14px;border:2.5px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);animation:aparecerElectrodo 0.25s ease-out;`;
        el.textContent = edata.label;
        colocados.appendChild(el);
    }

    renderBandeja();
    const imgEl = document.getElementById('torsoImg');
    if (imgEl.complete && imgEl.naturalWidth > 0) { renderZonas(); }
    else { imgEl.addEventListener('load', renderZonas, { once: true }); }
    const ro = new ResizeObserver(renderZonas);
    ro.observe(imgEl);

    document.getElementById('btnContinuarElectrodos').addEventListener('click', () => {
        ro.disconnect(); cerrarMinijuego();
        if (parte.video) { mostrarVideoPopup(parte, () => onCompletado()); }
        else { onCompletado(); }
    });

    let ghost = null, eidArrastrando = null;
    function iniciarArrastre(eid, cx, cy) {
        if (mjState.colocados[eid]) return;
        eidArrastrando = eid;
        const edata = ELECTRODOS_CONFIG.find(e => e.id === eid);
        ghost = document.createElement('div');
        ghost.style.cssText = `position:fixed;width:46px;height:46px;border-radius:50%;background:${edata.color};color:white;font-weight:700;font-size:14px;display:flex;align-items:center;justify-content:center;pointer-events:none;z-index:9999;opacity:0.92;border:2.5px solid rgba(255,255,255,0.7);transform:translate(-50%,-50%);box-shadow:0 4px 12px rgba(0,0,0,0.25);`;
        ghost.textContent = edata.label;
        document.body.appendChild(ghost);
        moverGhost(cx, cy);
    }
    function moverGhost(cx, cy) { if (ghost) { ghost.style.left=cx+'px'; ghost.style.top=cy+'px'; } }
    function terminarArrastre(cx, cy) {
        if (!eidArrastrando || !ghost) return;
        ghost.remove(); ghost = null;
        const eid = eidArrastrando; eidArrastrando = null;
        const edata = ELECTRODOS_CONFIG.find(e => e.id === eid);
        const img = document.getElementById('torsoImg');
        const rect = img.getBoundingClientRect();
        const pctX = ((cx-rect.left)/rect.width)*100, pctY = ((cy-rect.top)/rect.height)*100;
        const rPctX = (edata.radius/rect.width)*100, rPctY = (edata.radius/rect.height)*100;
        const dx = (pctX-edata.targetPctX)/rPctX, dy = (pctY-edata.targetPctY)/rPctY;
        const dist = Math.sqrt(dx*dx+dy*dy);
        const feedback = document.getElementById('feedbackElectrodos');
        if (dist <= 1) {
            mjState.colocados[eid] = true;
            reproducirSonidoCorrecto();
            colocarElectrodo(edata);
            feedback.style.color = '#1e5c3a';
            feedback.textContent = `${edata.desc} — posición correcta`;
            const total = ELECTRODOS_CONFIG.length, hechos = Object.keys(mjState.colocados).length;
            document.getElementById('contadorElectrodos').textContent = `${hechos} / ${total}`;
            document.getElementById(`zona-drop-${eid}`)?.remove();
            renderBandeja();
            if (hechos === total) {
                setTimeout(() => {
                    feedback.textContent = '¡Todos los electrodos están colocados correctamente!';
                    document.getElementById('wrapContinuarElectrodos').style.display = 'flex';
                }, 350);
            }
        } else {
            feedback.style.color = '#e24b4a';
            feedback.textContent = `Posición incorrecta para ${edata.label}, inténtalo de nuevo`;
            setTimeout(() => { feedback.textContent = ''; }, 2200);
        }
    }
    function onMove(e) { moverGhost(e.clientX, e.clientY); }
    function onMoveTouch(e) { e.preventDefault(); moverGhost(e.touches[0].clientX, e.touches[0].clientY); }
    function onUp(e) { terminarArrastre(e.clientX, e.clientY); document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); }
    function onUpTouch(e) { const t=e.changedTouches[0]; terminarArrastre(t.clientX, t.clientY); document.removeEventListener('touchmove', onMoveTouch); document.removeEventListener('touchend', onUpTouch); }

    overlay.addEventListener('mousedown', e => {
        const eid = e.target.closest('[data-eid]')?.dataset?.eid;
        if (!eid) return; e.preventDefault();
        iniciarArrastre(eid, e.clientX, e.clientY);
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
    });
    overlay.addEventListener('touchstart', e => {
        const eid = e.target.closest('[data-eid]')?.dataset?.eid;
        if (!eid) return; e.preventDefault();
        iniciarArrastre(eid, e.touches[0].clientX, e.touches[0].clientY);
        document.addEventListener('touchmove', onMoveTouch, { passive: false });
        document.addEventListener('touchend', onUpTouch);
    }, { passive: false });
}

function cerrarMinijuego() {
    document.getElementById('minijuegoElectrodosSNihon6')?.remove();
    panelAbierto = false;
}


/* =====================================================
   HOLD DE DESCARGA — paso 6 (id='3')
   =====================================================
   El usuario debe mantener el botón presionado ~3 segundos.
   Se muestra una barra de progreso mientras sostiene.
   Si suelta antes, puede volver a intentarlo.
   ===================================================== */

function _iniciarHoldDescarga(mesh) {
    if (_holdMesh) return;   // ya hay un hold en curso
    _holdMesh  = mesh;
    _holdStart = performance.now();

    quitarResaltadoActual();
    resaltarObjetoActivo(mesh.name);

    // Crear barra de progreso
    _crearBarraHold();

    // Animar la barra
    function animar() {
        const elapsed = performance.now() - _holdStart;
        const pct     = Math.min(elapsed / HOLD_DURACION * 100, 100);
        const fill    = document.getElementById('holdBarraFill6');
        if (fill) fill.style.width = pct + '%';
        if (pct < 100) {
            _holdBarraAnim = requestAnimationFrame(animar);
        } else {
            _completarHoldDescarga();
        }
    }
    _holdBarraAnim = requestAnimationFrame(animar);
}

function _cancelarHoldDescarga() {
    if (!_holdMesh) return;
    cancelAnimationFrame(_holdBarraAnim);
    _holdBarraAnim = null;
    _restaurarMesh(_holdMesh.name);
    _holdMesh  = null;
    _holdStart = 0;
    _eliminarBarraHold();
    // Volver a resaltar el objeto esperando
    const parte = PARTES[indiceActivo];
    const obj   = parte.pasos?.[indiceImagenActual]?.objeto ?? parte.objeto;
    if (obj) resaltarObjetoActivo(obj);
}

function _completarHoldDescarga() {
    cancelAnimationFrame(_holdBarraAnim);
    _holdBarraAnim = null;
    const mesh = _holdMesh;
    _holdMesh  = null;
    _holdStart = 0;
    _eliminarBarraHold();

    quitarResaltadoActual();
    reproducirSonidoCorrecto();
    efectoClick(mesh);
    resaltarConfirmacion(mesh);

    const parte     = PARTES[indiceActivo];
    const pasoActual = parte.pasos?.[indiceImagenActual];
    if (pasoActual?.imagen) cambiarImagenPantalla(pasoActual.imagen);

    const siguientePaso = indiceImagenActual + 1;
    if (siguientePaso < (parte.pasos?.length ?? 0)) {
        indiceImagenActual = siguientePaso;
        const proxPaso     = parte.pasos[siguientePaso];
        const instrEl = document.getElementById('instruccionSNihon6');
        if (instrEl) instrEl.textContent = proxPaso.instruccion ?? parte.instruccion;
        resaltarObjetoActivo(proxPaso.objeto);
        crearSenal(proxPaso.objeto);
        window._senalObjeto = proxPaso.objeto;
    } else {
        setTimeout(() => {
            if (parte.video) { mostrarVideoPopup(parte, () => avanzarDespuesDeVideo(parte)); }
            else { avanzarDespuesDeVideo(parte); }
        }, 1000);
    }
}

function _crearBarraHold() {
    _eliminarBarraHold();
    const cc = document.getElementById('areaThreeJs');
    if (!cc) return;

    const wrap = document.createElement('div');
    wrap.id = 'holdWrap6';
    wrap.style.cssText = `
        position:absolute;bottom:70px;left:50%;transform:translateX(-50%);
        z-index:25;display:flex;flex-direction:column;align-items:center;gap:6px;
        pointer-events:none;`;

    wrap.innerHTML = `
        <div style="
            background:rgba(30,92,58,0.92);color:white;
            padding:6px 18px;border-radius:20px;
            font-family:'DM Sans',sans-serif;font-size:0.82rem;font-weight:600;
            white-space:nowrap;">
            Mantén presionado...
        </div>
        <div style="
            width:220px;height:8px;background:#e0e6e0;border-radius:4px;overflow:hidden;">
            <div id="holdBarraFill6" style="
                height:100%;width:0%;background:#1e5c3a;
                border-radius:4px;transition:none;">
            </div>
        </div>`;
    cc.appendChild(wrap);
}

function _eliminarBarraHold() {
    document.getElementById('holdWrap6')?.remove();
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
    animarCamara(
        new THREE.Vector3(pos.x + off.x, pos.y + off.y, pos.z + off.z),
        pos.clone(), 800
    );
}

function animarCamara(posDestino, targetDestino, duracionMs) {
    if (!camara || !controls) return;
    const posInicio    = camara.position.clone();
    const targetInicio = controls.target.clone();
    const inicio       = performance.now();
    function step(ahora) {
        const t    = Math.min((ahora - inicio) / duracionMs, 1);
        const ease = t < 0.5 ? 2*t*t : -1+(4-2*t)*t;
        camara.position.lerpVectors(posInicio, posDestino, ease);
        controls.target.lerpVectors(targetInicio, targetDestino, ease);
        controls.update();
        if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}


/* =====================================================
   SEÑAL PULSANTE
   ===================================================== */

function crearSenal(nombreObjeto) {
    const contenedor = document.getElementById('contenedorSenales');
    if (!contenedor) return;
    contenedor.innerHTML = '';
    window._senalObjeto = nombreObjeto;
    const senal = document.createElement('div');
    senal.id = 'senalActiva';
    senal.style.cssText = 'position:absolute;width:36px;height:36px;top:0;left:0;pointer-events:none;';
    senal.innerHTML = `
        <div style="position:absolute;width:36px;height:36px;top:50%;left:50%;
            border-radius:50%;background:rgba(30,92,58,0.25);
            animation:pulsarSenal 1.4s ease-in-out infinite;"></div>
        <div style="position:absolute;width:20px;height:20px;top:50%;left:50%;
            border-radius:50%;background:#1e5c3a;
            display:flex;align-items:center;justify-content:center;
            animation:pulsarInner 1.4s ease-in-out infinite;">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
                <polygon points="5,3 19,12 5,21"/>
            </svg>
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
    obj.getWorldPosition(pos);
    pos.project(camara);
    const canvas = renderer.domElement;
    const x = (pos.x * 0.5 + 0.5) * canvas.clientWidth;
    const y = (-pos.y * 0.5 + 0.5) * canvas.clientHeight;
    senal.style.display = pos.z > 1 ? 'none' : 'block';
    senal.style.left    = x + 'px';
    senal.style.top     = y + 'px';
}

window.togglePanelSNihon6 = function () {
    const panel   = document.getElementById('panelLateralSNihon6');
    const overlay = document.getElementById('overlayPanelSNihon6');
    if (!panel) return;
    panelLateralAbierto = !panelLateralAbierto;
    panel.style.left            = panelLateralAbierto ? '0' : '-320px';
    overlay.style.opacity       = panelLateralAbierto ? '1' : '0';
    overlay.style.pointerEvents = panelLateralAbierto ? 'all' : 'none';
};


/* =====================================================
   EVENTOS DE MOUSE
   ===================================================== */

function getMeshesYHits(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width)  *  2 - 1;
    mouse.y = -((event.clientY - rect.top)  / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camara);
    const meshes = [];
    modeloCargado.traverse(o => { if (o.isMesh) meshes.push(o); });
    return raycaster.intersectObjects(meshes, true);
}

function onMouseDown(event) {
    if (!modeloCargado) return;
    const hits  = getMeshesYHits(event);
    if (!hits.length) return;
    const parte = PARTES[indiceActivo];

    // ── Hold: paso 6 (descarga) ───────────────────────────────────
    if (indiceActivo === 6) {
        const pasoActual = parte.pasos?.[indiceImagenActual];
        if (pasoActual && hits[0].object.name === pasoActual.objeto) {
            _iniciarHoldDescarga(hits[0].object);
        }
        return;
    }

    if (parte.tipo === 'rotar' && hits[0].object.name === parte.objeto) {
        rotandoObjeto  = true;
        objetoRotando  = hits[0].object;
        mouseXAnterior = event.clientX;
        mouseYAnterior = event.clientY;
        renderer.domElement.style.cursor = 'grabbing';
    }
}

function onMouseMove(event) {
    if (!modeloCargado) return;
    if (rotandoObjeto && objetoRotando) {
        const deltaX   = event.clientX - mouseXAnterior;
        mouseXAnterior = event.clientX;
        mouseYAnterior = event.clientY;
        objetoRotando.rotation.x = THREE.MathUtils.clamp(
            objetoRotando.rotation.x + deltaX * 0.01,
            -Math.PI / 2, Math.PI / 2
        );
        actualizarPantalla(objetoRotando.rotation.x);
        return;
    }
    const hits  = getMeshesYHits(event);
    const parte = PARTES[indiceActivo];
    let objetosEsperados;
    if (parte.pasos?.length) {
        objetosEsperados = [parte.pasos[indiceImagenActual]?.objeto].filter(Boolean);
    } else {
        objetosEsperados = parte.objetosGrupo ?? [parte.objeto];
    }
    renderer.domElement.style.cursor = (
        hits.length > 0 && objetosEsperados.includes(hits[0].object.name)
    ) ? 'pointer' : 'default';
}

function onMouseUp() {
    // Cancel hold if user releases early
    _cancelarHoldDescarga();

    if (!rotandoObjeto) return;
    rotandoObjeto = false;
    objetoRotando = null;
    renderer.domElement.style.cursor = 'default';
}

function onClickCanvas(event) {
    if (!modeloCargado || rotandoObjeto || panelAbierto) return;
    const hits = getMeshesYHits(event);
    if (!hits.length) return;
    const parte     = PARTES[indiceActivo];
    if (parte.tipo === 'minijuego') return;
    const nombreHit = hits[0].object.name;

    // ── HOLD mechanic: paso 6 (descarga, id='3') ─────────────────
    // El usuario debe mantener presionado ~3 segundos.
    // Se maneja con mousedown/mouseup separado (ver onMouseDown/onMouseUp).
    // Aquí solo ignoramos el click normal para ese paso.
    if (indiceActivo === 6) return;

    if (parte.pasos?.length) {
        const pasoActual = parte.pasos[indiceImagenActual];
        if (nombreHit !== pasoActual.objeto) return;

        // ─────────────────────────────────────────────────────
        // [PEGAR EN CADA SECCIÓN NIHON — BLOQUE M]
        // Quitar naranja, feedback, imagen, resaltar siguiente.
        // ─────────────────────────────────────────────────────
        quitarResaltadoActual();
        reproducirSonidoCorrecto();
        efectoClick(hits[0].object);
        resaltarConfirmacion(hits[0].object);

        if (pasoActual.imagen) cambiarImagenPantalla(pasoActual.imagen);

        const siguientePaso = indiceImagenActual + 1;
        if (siguientePaso < parte.pasos.length) {
            indiceImagenActual = siguientePaso;
            const proxPaso     = parte.pasos[siguientePaso];
            // ── IMPORTANTE: usa el ID correcto de esta sección ──
            const instruccionEl = document.getElementById('instruccionSNihon6');  // ← BUG CORREGIDO: era SNihon3
            if (instruccionEl) instruccionEl.textContent = proxPaso.instruccion ?? parte.instruccion;
            resaltarObjetoActivo(proxPaso.objeto);
            crearSenal(proxPaso.objeto);
            window._senalObjeto = proxPaso.objeto;
        } else {
            // ── Pausar animación solo al completar el paso 0 (perilla) ──
            // En los demás pasos NO se vuelve a llamar, ya está pausada
            // desde activarParte(indice > 0).
            // Pausar solo al completar la perilla (índice 1 en esta sección)
            // Al completar la perilla (índice 0), pausar en SEGUNDO_ENCENDIDO
            if (indiceActivo === 0) pausarAnimacionEn(SEGUNDO_ENCENDIDO);
            setTimeout(() => {
                if (parte.video) { mostrarVideoPopup(parte, () => avanzarDespuesDeVideo(parte)); }
                else { avanzarDespuesDeVideo(parte); }
            }, 1800);
        }
        return;
    }

    const validos = parte.objetosGrupo ?? [parte.objeto];
    if (!validos.includes(nombreHit)) return;

    quitarResaltadoActual();
    reproducirSonidoCorrecto();
    efectoClick(hits[0].object);
    resaltarConfirmacion(hits[0].object);

    // ── Paso 3 (energia): pausar en SEGUNDO_ENERGIA al hacer clic ──
    // A partir de aquí todos los pasos siguientes quedarán en ese segundo.
    if (indiceActivo === 3) pausarAnimacionEn(SEGUNDO_ENERGIA);

    if (parte.imagenesPantalla?.length) {
        const siguienteImg = indiceImagenActual + 1;
        if (siguienteImg < parte.imagenesPantalla.length) {
            indiceImagenActual = siguienteImg;
            cambiarImagenPantalla(parte.imagenesPantalla[siguienteImg]);
            const instruccionEl = document.getElementById('instruccionSNihon6');
            if (instruccionEl && parte.instrucciones?.[siguienteImg]) {
                instruccionEl.textContent = parte.instrucciones[siguienteImg];
            }
            const esUltima = siguienteImg === parte.imagenesPantalla.length - 1;
            if (!esUltima) return;
        }
    }

    if (parte.video) { mostrarVideoPopup(parte, () => avanzarDespuesDeVideo(parte)); }
    else { avanzarDespuesDeVideo(parte); }
}


/* =====================================================
   SONIDO
   ===================================================== */

function reproducirSonidoCorrecto() {
    try {
        const ctx  = new (window.AudioContext || window.webkitAudioContext)();
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
        osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.18);
    } catch { }
}


/* =====================================================
   INTERACCIONES 3D
   ===================================================== */

function efectoClick(objeto) {
    const escOrig = objeto.scale.clone();
    objeto.scale.multiplyScalar(0.9);
    if (objeto.material?.color) {
        const colorOrig = objeto.material.color.clone();
        objeto.material.color.multiplyScalar(0.65);
        setTimeout(() => { objeto.scale.copy(escOrig); objeto.material.color.copy(colorOrig); }, 160);
    } else { setTimeout(() => objeto.scale.copy(escOrig), 160); }
}

function actualizarPantalla(angulo) {
    if (!modeloCargado) return;
    const modo = MODOS_PERILLA.reduce((prev, curr) =>
        Math.abs(curr.angulo - angulo) < Math.abs(prev.angulo - angulo) ? curr : prev
    );
    if (_modoActual === modo.nombre) return;
    _modoActual = modo.nombre;
    let pantalla = null;
    modeloCargado.traverse(o => { if (o.name === 'pantalla001') pantalla = o; });
    if (!pantalla) return;
    if (!modo.imagen) {
        if (pantalla.material) { pantalla.material.map = null; pantalla.material.color.set(0x000000); pantalla.material.needsUpdate = true; }
        return;
    }
    if (_cachTexturas[modo.imagen]) { aplicarTexturaPantalla(pantalla, _cachTexturas[modo.imagen]); }
    else { new THREE.TextureLoader().load(modo.imagen, t => { _cachTexturas[modo.imagen] = t; aplicarTexturaPantalla(pantalla, t); }); }
}

function aplicarTexturaPantalla(pantalla, textura) {
    if (!pantalla.material) return;
    textura.wrapS = textura.wrapT = THREE.ClampToEdgeWrapping;
    textura.repeat.set(1,1); textura.offset.set(0,0);
    textura.flipY = false; textura.needsUpdate = true;
    const mats = Array.isArray(pantalla.material) ? pantalla.material : [pantalla.material];
    mats.forEach(mat => { mat.map = textura; mat.color.set(0xffffff); mat.needsUpdate = true; });
}

function cambiarImagenPantalla(rutaImagen) {
    if (!modeloCargado || !rutaImagen) return;
    let pantalla = null;
    modeloCargado.traverse(o => { if (o.name === 'pantalla001') pantalla = o; });
    if (!pantalla) return;
    if (_cachTexturas[rutaImagen]) { aplicarTexturaPantalla(pantalla, _cachTexturas[rutaImagen]); return; }
    new THREE.TextureLoader().load(rutaImagen, t => { _cachTexturas[rutaImagen] = t; aplicarTexturaPantalla(pantalla, t); });
}


/* =====================================================
   VIDEO POPUP
   ===================================================== */

function mostrarVideoPopup(parte, onTerminado) {
    panelAbierto = true;
    document.getElementById('videoPopupSNihon6')?.remove();
    const contenedor = document.getElementById('areaThreeJs');
    const popup = document.createElement('div');
    popup.id = 'videoPopupSNihon6';
    popup.style.cssText = `position:absolute;inset:0;background:rgba(0,0,0,0.88);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:20;font-family:'DM Sans',sans-serif;`;
    popup.innerHTML = `
        <div style="width:82%;max-width:720px;">
            <p style="color:white;font-size:0.85rem;font-weight:600;text-align:center;margin:0 0 12px;opacity:0.85;">Video complementario — debes verlo completo para continuar</p>
            <div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;background:#000;">
                <iframe id="ytFramePopupSNihon6" src="${construirUrlVideo(parte)}"
                    style="position:absolute;top:0;left:0;width:100%;height:100%;border:none;" allowfullscreen></iframe>
            </div>
            <p id="avisoPopupSNihon6" style="color:#e05c3a;font-size:0.78rem;text-align:center;margin:10px 0 0;">El video debe terminar para continuar</p>
        </div>`;
    contenedor.appendChild(popup);
    setTimeout(() => iniciarYTPopupSNihon6(onTerminado), 600);
}

function cerrarVideoPopup() { document.getElementById('videoPopupSNihon6')?.remove(); panelAbierto = false; }

function iniciarYTPopupSNihon6(onTerminado) {
    if (!document.getElementById('ytApiScript')) {
        const tag = document.createElement('script');
        tag.id = 'ytApiScript'; tag.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(tag);
    }
    const activar = () => {
        const frame = document.getElementById('ytFramePopupSNihon6');
        if (!frame || !window.YT?.Player) return;
        if (ytPlayer) { try { ytPlayer.destroy(); } catch { } ytPlayer = null; }
        ytPlayer = new YT.Player('ytFramePopupSNihon6', {
            events: { onStateChange: e => {
                if (e.data === YT.PlayerState.ENDED) {
                    document.getElementById('avisoPopupSNihon6')?.remove();
                    setTimeout(() => {
                        cerrarVideoPopup();
                        if (ytPlayer) { try { ytPlayer.destroy(); } catch { } ytPlayer = null; }
                        onTerminado?.();
                    }, 600);
                }
            }}
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
    document.getElementById('videoPopupSNihon6')?.remove();
    document.getElementById('minijuegoElectrodosSNihon6')?.remove();
    panelAbierto = false;
}