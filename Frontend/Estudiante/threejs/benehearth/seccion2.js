import { inicializarEscena, cargarModelo, limpiarRenderer, THREE } from '../escena.js';

const FPS = 24;

const CAMARA_POSICION = { x: -0.2, y: -0.1, z: 0.5 };
const CAMARA_TARGET = { x: -0.2, y: -0.1, z: 0 };

/* =====================================================
   PARTES DEL CHECKLIST

   Nueva propiedad: resaltarTemporal
   ─────────────────────────────────────────────────────
   Permite iluminar objetos en un color específico
   durante un intervalo concreto del audio.

   Formato:
   resaltarTemporal: [
     {
       objetos: ['NombreMesh1', 'NombreMesh2'],
       color: 0xffaa00,          ← color hex (Three.js)
       intensidad: 0.6,          ← 0–1 (opcional, default 0.5)
       inicio: 5,                ← segundo del audio donde aparece
       fin: 12,                  ← segundo del audio donde desaparece
     },
     { ... }   ← puedes poner varios por parte
   ]

   - El resaltado permanente (resaltar:[]) sigue funcionando igual.
   - resaltarTemporal solo actúa mientras el audio reproduce ese segmento.
   - Si 'inicio' y 'fin' son relativos al segmento (0 = inicio del clip),
     usa tiempoRelativo: true (opcional). Por defecto son absolutos
     (igual que audioInicio/audioFin).
   ─────────────────────────────────────────────────────
   ===================================================== */
const PARTES = [
    {
        id: 'perilla',
        nombre: 'Perilla de selección',
        objeto: 'perilla001',
        tipo: 'rotar',
        camaraOffset: { x: 0, y: -0.1, z: 0.9 },
        audioInicio: 0,
        audioFin: 19,
        instruccion: 'Haz click y arrastra para girar la perilla',
        resaltar: ['perilla001'],
        texturasPantalla: [
            { tiempo: 8, imagen: '/Estudiante/threejs/img/MODOMONITOR.png' },
            { tiempo: 10.21, imagen: '/Estudiante/threejs/img/manual.png' },
            { tiempo: 12.02, imagen: '/Estudiante/threejs/img/marcapasos.png' },
            { tiempo: 13.1, imagen: '/Estudiante/threejs/img/DEA.png' },
            { tiempo: 19.02, imagen: '/Estudiante/threejs/img/negro.jpg' },
        ],
        // Ejemplo: resaltar la perilla en naranja entre los segundos 4 y 10
        // resaltarTemporal: [
        //   { objetos: ['perilla001'], color: 0xff8800, intensidad: 0.7, inicio: 4, fin: 10 }
        // ],
    },
    {
        id: 'selector',
        nombre: 'Perilla de navegación',
        objeto: 'selector',
        tipo: 'rotar',
        audioInicio: 19,
        audioFin: 39,
        instruccion: 'Haz click y arrastra el selector para girarlo',
        resaltar: ['selector'],
        texturasPantalla: [
            { tiempo: 4, imagen: '/Estudiante/threejs/img/MODOMONITOR.png' },
            { tiempo: 19, imagen: '/Estudiante/threejs/img/negro.jpg' },
        ],
    },
    {
        id: 'pantalla',
        nombre: 'Pantalla',
        objeto: 'pantalla',
        tipo: 'click',
        permitirRotacion: false,
        audioInicio: 39,
        audioFin: 62,
        instruccion: 'Haz click sobre la pantalla',
        texturasPantalla: [
            { tiempo: 3, imagen: '/Estudiante/threejs/img/ritmocardiaco.png' },
            { tiempo: 8, imagen: '/Estudiante/threejs/img/parametros.png' },
            { tiempo: 9.11, imagen: '/Estudiante/threejs/img/energiaseleccionada.png' },
            { tiempo: 11.17, imagen: '/Estudiante/threejs/img/estadopalas.png' },
            { tiempo: 15, imagen: '/Estudiante/threejs/img/descargas.png' },
            { tiempo: 17, imagen: '/Estudiante/threejs/img/cronometro.png' },
        ],
    },
    {
        id: 'carga_Descarga',
        nombre: 'Botones Carga/Descarga',
        objeto: 'Carga',
        objetosGrupo: ['Carga', 'Descarga'],
        tipo: 'click',
        permitirRotacion: false,
        camaraOffset: { x: 0.1, y: 0.1, z: 2.2 },
        audioInicio: 62,
        audioFin: 80,
        instruccion: 'Haz click sobre los botones de carga o descarga',
        resaltar: ['Carga'],
        texturasPantalla: [
            { tiempo: 1, imagen: '/Estudiante/threejs/img/cargaenergia.png' },
            { tiempo: 4, imagen: '/Estudiante/threejs/img/descarga.png' },
        ],
        // Ejemplo: resaltar Carga en verde entre s62-s68, y Descarga en rojo entre s70-s80
        resaltarTemporal: [

            { objetos: ['boton2'], color: 0x00ff88, intensidad: 0.6, inicio: 66, fin: 69 },
            { objetos: ['Boton3', 'Boton3D'], color: 0x00ff88, intensidad: 0.6, inicio: 70, fin: 75 },
            { objetos: ['Descarga'], color: 0x00ff88, intensidad: 0.6, inicio: 70, fin: 75 },
            { objetos: ['Flecha2'], color: 0xff3333, intensidad: 0.6, inicio: 75, fin: 80 },
        ],
    },
    {
        id: 'Sel_energia',
        nombre: 'Selector de energía',
        objeto: 'SelecEnergia',
        tipo: 'click',
        audioInicio: 80,
        audioFin: 97,
        instruccion: 'Haz click sobre el selector de energía',
        resaltar: ['SelecEnergia'],
        texturasPantalla: [
            { tiempo: 1, imagen: '/Estudiante/threejs/img/energiaseleccionada.png' },
            { tiempo: 6, imagen: '/Estudiante/threejs/img/360.png' },
        ],
    },
    {
        id: 'botones',
        nombre: 'Botones panel frontal',
        objeto: 'Flecha2',
        objetosGrupo: ['Flecha1', 'Flecha2', 'Flecha3', 'B_SelecDerivada',
            'B_pausa', 'B_Menu', 'B_Resumen', 'B_PNI', 'B_Evento'],
        tipo: 'click',
        audioInicio: 97,
        audioFin: 125,
        instruccion: 'Haz click sobre cualquier botón del panel',
        resaltar: ['Flecha1', 'Flecha2', 'Flecha3'],
        texturasPantalla: [
            { tiempo: 1, imagen: '/Estudiante/threejs/img/MODOMONITOR.png' },
            { tiempo: 6, imagen: '/Estudiante/threejs/img/19.png' },
            { tiempo: 7.5, imagen: '/Estudiante/threejs/img/20.png' },
            { tiempo: 8.5, imagen: '/Estudiante/threejs/img/21.png' },
        ],
        resaltarTemporal: [
            { objetos: ['B_SelecDerivada'], color: 0x00ff88, intensidad: 0.6, inicio: 103, fin: 106 },
            { objetos: ['B_pausa'], color: 0x00ff88, intensidad: 0.6, inicio: 106, fin: 110 },
            { objetos: ['B_Menu'], color: 0x00ff88, intensidad: 0.6, inicio: 110, fin: 113 },
            { objetos: ['B_PNI'], color: 0x00ff88, intensidad: 0.6, inicio: 113, fin: 117 },
            { objetos: ['B_Resumen'], color: 0x00ff88, intensidad: 0.6, inicio: 117, fin: 120 },
            { objetos: ['B_Evento'], color: 0x00ff88, intensidad: 0.6, inicio: 120, fin: 122 },
        ],
    },
    {
        id: 'impresora',
        nombre: 'Impresora',
        objeto: 'IMPRESORA',
        tipo: 'click',
        audioInicio: 125,
        audioFin: 136,
        video: 'https://youtu.be/uehgnpQs6V8',
        instruccion: 'Haz click sobre la impresora',
        resaltar: ['IMPRESORA'],
    },
    {
        id: 'bateria',
        nombre: 'Batería',
        objeto: 'bateria',
        tipo: 'click',
        camaraOffset: { x: 0.1, y: 0.3, z: -1 },
        audioInicio: 136,
        audioFin: 151,
        video: 'https://youtu.be/pRtH8y2uNjI',
        instruccion: 'Rota el modelo y haz click sobre la batería',
        resaltar: ['bateria'],
    },
    {
        id: 'palas',
        nombre: 'Palas adulto/pediátricas',
        objeto: 'PalaDer',
        objetosGrupo: ['Cube056', 'Cube056_1', 'Cube056_2', 'Cube056_3',
            'Cube056_4', 'Cube056_5', 'Cube056_6', 'boton2', 'Boton3D',
            'Cube002', 'Cube002_1', 'Cube002_2', 'Cube002_3',
            'Cube002_4', 'Cube002_5', 'Boton3', 'botonVolumen'],
        tipo: 'click',
        camaraOffset: { x: 0.1, y: 1, z: 2.4 },
        audioInicio: 151,
        audioFin: 176,
        video: 'https://youtu.be/ynEAb1JYveM',
        instruccion: 'Haz click sobre las palas',
         resaltarTemporal: [
            { objetos: ['boton2'], color: 0x00ff88, intensidad: 0.6, inicio: 160, fin: 163 },
            { objetos: ['botonVolumen'], color: 0x00ff88, intensidad: 0.6, inicio: 160, fin: 163},
            { objetos: ['Boton3'], color: 0x00ff88, intensidad: 0.6, inicio: 160, fin: 163},
            { objetos: ['Boton3D'], color: 0x00ff88, intensidad: 0.6, inicio: 160, fin: 163},
            { objetos: ['botonSacarDer'], color: 0x00ff88, intensidad: 0.6, inicio: 165, fin: 170},

        ],
        
    },
    {
        id: 'conector',
        nombre: 'Conector de palas',
        objeto: 'parterosca',
        objetosGrupo: ['Cube009', 'Cube009_1'],
        tipo: 'click',
        camaraOffset: { x: 0.6, y: 0.3, z: 0.6 },
        audioInicio: 176,
        audioFin: 197,
        video: 'https://youtu.be/-UfHNtAADww',
        instruccion: 'Haz click sobre el conector de palas',
        resaltar: ['Cube009', 'Cube009_1'],
    },
    {
        id: 'Puertos_conexiones',
        nombre: 'Puertos de conexiones',
        objeto: 'ekg',
        objetosGrupo: ['ECG', 'ekg', 'IBP2'],
        tipo: 'click',
        camaraOffset: { x: -0.5, y: 0, z: 0 },
        audioInicio: 197,
        audioFin: 216,
        instruccion: 'Haz click sobre los puertos de conexión',
    },
    {
        id: 'identificador_LED',
        nombre: 'Identificadores LED',
        objeto: 'LED2',
        objetosGrupo: ['LEd1', 'LED2', 'LED3'],
        tipo: 'click',
        camaraOffset: { x: 0, y: 0, z: 0.2 },
        audioInicio: 217,
        audioFin: 243,
        instruccion: 'Haz click sobre los indicadores LED',
    },
];

const AUDIO_COMPLETO = '/Estudiante/threejs/audios/benehearth/audiocompleto.mp3';

// Resaltado permanente (el de toda la parte activa)
const COLOR_RESALTE = new THREE.Color(0x00ccff);
const FACTOR_EMISION = 0.45;


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

let audioCompleto = null;
let monitorIntervalo = null;
let reproduciendo = false;

let ytPlayer = null;

let rotandoObjeto = false;
let objetoRotando = null;
let mouseXAnterior = 0;
let mouseYAnterior = 0;

// Resaltado permanente (por paso)
const _materialesOriginales = new Map();

// ─────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────
const _resaltesTemporalesActivos = new Map(); // uuid → { mat, emissive, emissiveIntensity }

const _cachTexturas = {};
let _modoActual = null;

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();


/* =====================================================
   CICLO DE VIDA
   ===================================================== */

export function iniciarSeccion2(contenedorId) {
    destruirSeccion2();

    const btnCompletar = document.getElementById('btnCompletar');
    const yaCompletada = btnCompletar?.disabled &&
        btnCompletar?.textContent.includes('completada');

    const base = inicializarEscena(contenedorId);
    escena = base.escena;
    camara = base.camara;
    renderer = base.renderer;
    controls = base.controls;
    reloj = base.reloj;

    mostrarLoader(contenedorId);

    audioCompleto = new Audio(AUDIO_COMPLETO);
    audioCompleto.preload = 'auto';
    audioCompleto.volume = 0.85;

    cargarModelo(
        '/Estudiante/threejs/modelados/Final.glb',
        escena, camara, controls,
        (modelo, anim, mix) => {
            modeloCargado = modelo;
            animaciones = anim;
            mixer = mix;
            mixer.timeScale = 0;

            camara.position.set(CAMARA_POSICION.x, CAMARA_POSICION.y, CAMARA_POSICION.z);
            controls.target.set(CAMARA_TARGET.x, CAMARA_TARGET.y, CAMARA_TARGET.z);
            controls.update();

            camaraOriginalPos = camara.position.clone();
            camaraOriginalTarget = controls.target.clone();

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
    canvas.addEventListener('click', onClickCanvas);
}

export function destruirSeccion2() {
    quitarResalte();
    quitarResaltesTemporales();
    pararSegmento();

    if (audioCompleto) {
        audioCompleto.pause();
        audioCompleto.src = '';
        audioCompleto = null;
    }

    cerrarVideoPopup();
    if (ytPlayer) {
        try { ytPlayer.stopVideo(); ytPlayer.destroy(); } catch { }
        ytPlayer = null;
    }

    cancelAnimationFrame(animFrameId);
    animFrameId = null;

    if (renderer) {
        renderer.domElement.removeEventListener('mousedown', onMouseDown);
        renderer.domElement.removeEventListener('mousemove', onMouseMove);
        renderer.domElement.removeEventListener('mouseup', onMouseUp);
        renderer.domElement.removeEventListener('click', onClickCanvas);
    }

    document.getElementById('areaThreeJs')?.replaceChildren();
    document.getElementById('uiSeccion2')?.remove();
    document.getElementById('loaderSeccion2')?.remove();
    document.getElementById('checklistS2')?.remove();
    document.getElementById('videoPopupS2')?.remove();

    Object.keys(_cachTexturas).forEach(k => delete _cachTexturas[k]);
    _materialesOriginales.clear();
    _resaltesTemporalesActivos.clear();
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
    reproduciendo = false;
}


/* =====================================================
   LOADER
   ===================================================== */

function mostrarLoader(contenedorId) {
    const contenedor = document.getElementById(contenedorId);
    contenedor.style.position = 'relative';
    document.getElementById('loaderSeccion2')?.remove();

    const loader = document.createElement('div');
    loader.id = 'loaderSeccion2';
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
    const loader = document.getElementById('loaderSeccion2');
    if (!loader) return;
    loader.style.transition = 'opacity 0.4s';
    loader.style.opacity = '0';
    setTimeout(() => loader.remove(), 400);
}


/* =====================================================
   UI
   ===================================================== */

function mostrarUI() {
    document.getElementById('uiSeccion2')?.remove();
    const contenedor = document.getElementById('areaThreeJs');

    const ui = document.createElement('div');
    ui.id = 'uiSeccion2';
    ui.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:hidden;';

    ui.innerHTML = `
        <div id="checklistS2" style="
            position:absolute;top:16px;right:16px;width:250px;
            background:white;border-radius:12px;padding:14px;pointer-events:all;
            box-shadow:0 4px 20px rgba(0,0,0,0.12);font-family:'DM Sans',sans-serif;z-index:3;">
            <p style="font-size:0.78rem;font-weight:600;color:#1e5c3a;
                margin:0 0 10px;text-transform:uppercase;letter-spacing:0.05em;">
                Partes del desfibrilador
            </p>
            ${PARTES.map((parte, i) => `
                <div id="check-${parte.id}" style="
                    display:flex;align-items:center;gap:10px;
                    padding:4px;border-radius:8px;margin-bottom:4px;
                    background:${i === 0 ? '#e8f5ee' : 'transparent'};
                    border:1.5px solid ${i === 0 ? '#1e5c3a' : '#e0e6e0'};
                    transition:all 0.2s;cursor:pointer;pointer-events:all;"
                    onclick="window.irAParte2(${i})">
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

        <div id="instruccionS2" style="
            position:absolute;bottom:28px;left:50%;transform:translateX(-50%);
            white-space:nowrap;font-family:'DM Sans',sans-serif;font-size:0.78rem;
            color:#5a7a62;background:rgb(175,175,175);
            padding:8px 18px;border-radius:20px;pointer-events:none;z-index:3;
            box-shadow:0 2px 8px rgba(0,0,0,0.08);">
            ${PARTES[0].instruccion}
        </div>

        <div id="barraS2" style="
            position:absolute;bottom:0;left:0;right:0;height:4px;
            background:#e0e6e0;pointer-events:none;z-index:5;display:none;">
            <div id="barraFillS2" style="
                height:100%;width:0%;background:#1e5c3a;
                transition:width 0.15s linear;"></div>
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
        </style>`;

    contenedor.appendChild(ui);
}


/* =====================================================
   CHECKLIST
   ===================================================== */

function activarParte(indice) {
    if (indice >= PARTES.length) return;
    indiceActivo = indice;
    const parte = PARTES[indice];

    const instruccion = document.getElementById('instruccionS2');
    if (instruccion) instruccion.textContent = parte.instruccion;

    if (parte.camaraOffset) {
        enfocarObjeto(parte.objeto);
    } else {
        animarCamara(
            new THREE.Vector3(CAMARA_POSICION.x, CAMARA_POSICION.y, CAMARA_POSICION.z),
            new THREE.Vector3(CAMARA_TARGET.x, CAMARA_TARGET.y, CAMARA_TARGET.z),
            600
        );
    }

    crearSenal(parte.objeto);
    actualizarChecklist();

    quitarResalte();
    aplicarResalte(parte.resaltar ?? []);

    if (controls) controls.enableRotate = parte.permitirRotacion ?? false;
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
        if (span) {
            span.style.color = esActiva ? '#1e5c3a' : '#9ab0a0';
            span.style.fontWeight = esActiva ? '600' : '400';
        }
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
    quitarResalte();
    quitarResaltesTemporales();
    if (controls) controls.enableRotate = false;
    const instruccion = document.getElementById('instruccionS2');
    if (instruccion) instruccion.textContent = 'Explora el modelo libremente';
}

function todasCompletadas() {
    const cs = document.getElementById('contenedorSenales');
    if (cs) cs.innerHTML = '';
    window._senalObjeto = null;
    quitarResalte();
    quitarResaltesTemporales();

    const instruccion = document.getElementById('instruccionS2');
    if (instruccion) instruccion.textContent = '¡Conociste todas las partes!';

    const btnCompletar = document.getElementById('btnCompletar');
    if (btnCompletar && !btnCompletar.textContent.includes('completada')) {
        btnCompletar.disabled = false;
        btnCompletar.style.opacity = '1';
        btnCompletar.style.cursor = 'pointer';
    }

    if (camaraOriginalPos && camaraOriginalTarget) {
        animarCamara(camaraOriginalPos, camaraOriginalTarget, 1000);
    }
    if (controls) controls.enableRotate = false;
}

window.irAParte2 = function (indice) {
    if (reproduciendo) return;
    const icon = document.getElementById(`icon-${PARTES[indice].id}`);
    if (indice > indiceActivo && icon?.innerHTML !== '✓') return;
    activarParte(indice);
};


/* =====================================================
   RESALTADO PERMANENTE (por paso)
   ===================================================== */

function aplicarResalte(nombres) {
    if (!modeloCargado || !nombres.length) return;
    modeloCargado.traverse(obj => {
        if (!obj.isMesh || !nombres.includes(obj.name)) return;
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats.forEach(mat => {
            if (!mat || mat.emissive === undefined) return;
            if (!_materialesOriginales.has(mat.uuid)) {
                _materialesOriginales.set(mat.uuid, {
                    mat,
                    emissive: mat.emissive.clone(),
                    emissiveIntensity: mat.emissiveIntensity ?? 0,
                });
            }
            mat.emissive.copy(COLOR_RESALTE);
            mat.emissiveIntensity = FACTOR_EMISION;
            mat.needsUpdate = true;
        });
    });
}

function quitarResalte() {
    _materialesOriginales.forEach(({ mat, emissive, emissiveIntensity }) => {
        if (!mat || mat.emissive === undefined) return;
        mat.emissive.copy(emissive);
        mat.emissiveIntensity = emissiveIntensity;
        mat.needsUpdate = true;
    });
    _materialesOriginales.clear();
}


/* =====================================================
   RESALTADO TEMPORAL (sincronizado con el audio)

  
   ===================================================== */

function actualizarResaltesTemporales(parte, tiempoActual) {
    if (!parte.resaltarTemporal?.length || !modeloCargado) return;

    parte.resaltarTemporal.forEach(rt => {
        // Soporte para tiempoRelativo: true (inicio/fin desde el inicio del clip)
        const inicio = rt.tiempoRelativo ? parte.audioInicio + rt.inicio : rt.inicio;
        const fin = rt.tiempoRelativo ? parte.audioInicio + rt.fin : rt.fin;
        const activo = tiempoActual >= inicio && tiempoActual < fin;

        rt.objetos.forEach(nombre => {
            modeloCargado.traverse(obj => {
                if (!obj.isMesh || obj.name !== nombre) return;
                const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
                mats.forEach(mat => {
                    if (!mat || mat.emissive === undefined) return;

                    if (activo) {
                        // Guardar estado actual ANTES de aplicar (solo si no está ya guardado)
                        if (!_resaltesTemporalesActivos.has(mat.uuid)) {
                            _resaltesTemporalesActivos.set(mat.uuid, {
                                mat,
                                emissive: mat.emissive.clone(),
                                emissiveIntensity: mat.emissiveIntensity ?? 0,
                            });
                        }
                        // Aplicar color temporal
                        mat.emissive.set(rt.color ?? 0xffffff);
                        mat.emissiveIntensity = rt.intensidad ?? 0.5;
                        mat.needsUpdate = true;

                    } else {
                        // Fuera del intervalo: restaurar si estaba activo
                        const guardado = _resaltesTemporalesActivos.get(mat.uuid);
                        if (guardado) {
                            mat.emissive.copy(guardado.emissive);
                            mat.emissiveIntensity = guardado.emissiveIntensity;
                            mat.needsUpdate = true;
                            _resaltesTemporalesActivos.delete(mat.uuid);
                        }
                    }
                });
            });
        });
    });
}

function quitarResaltesTemporales() {
    _resaltesTemporalesActivos.forEach(({ mat, emissive, emissiveIntensity }) => {
        if (!mat || mat.emissive === undefined) return;
        mat.emissive.copy(emissive);
        mat.emissiveIntensity = emissiveIntensity;
        mat.needsUpdate = true;
    });
    _resaltesTemporalesActivos.clear();
}


/* =====================================================
   REPRODUCCIÓN DEL SEGMENTO
   ===================================================== */

function reproducirSegmento(parte) {
    if (reproduciendo || !audioCompleto || !mixer) return;
    reproduciendo = true;

    const instruccion = document.getElementById('instruccionS2');
    if (instruccion) instruccion.textContent = '▶ Reproduciendo...';

    const barra = document.getElementById('barraS2');
    if (barra) barra.style.display = 'block';

    audioCompleto.currentTime = parte.audioInicio;
    mixer.setTime(parte.audioInicio);
    mixer.timeScale = 1;

    animaciones.forEach(a => {
        const ac = mixer.clipAction(a);
        ac.reset();
        ac.setLoop(THREE.LoopOnce);
        ac.clampWhenFinished = true;
        ac.play();
        ac.time = parte.audioInicio;
    });

    audioCompleto.play().catch(e => console.warn('Audio bloqueado:', e));

    const duracion = parte.audioFin - parte.audioInicio;

    monitorIntervalo = setInterval(() => {
        if (!audioCompleto) { clearInterval(monitorIntervalo); return; }

        const tiempoActual = audioCompleto.currentTime;

        // ── Cambio de textura por tiempo ──
        const texturas = parte.texturasPantalla;
        if (texturas?.length) {
            const tiempoRelativo = tiempoActual - parte.audioInicio;
            let texturaActual = null;
            for (const t of texturas) {
                if (tiempoRelativo >= t.tiempo) texturaActual = t;
            }
            if (texturaActual && _modoActual !== texturaActual.imagen) {
                _modoActual = texturaActual.imagen;
                cambiarTexturaPantalla(texturaActual.imagen);
            }
        }

        // ── Resaltados temporales sincronizados con el audio ──
        actualizarResaltesTemporales(parte, tiempoActual);

        // ── Barra de progreso ──
        const pct = Math.min(((tiempoActual - parte.audioInicio) / duracion) * 100, 100);
        const fill = document.getElementById('barraFillS2');
        if (fill) fill.style.width = `${pct}%`;

        if (tiempoActual >= parte.audioFin) {
            clearInterval(monitorIntervalo);
            monitorIntervalo = null;
            audioCompleto.pause();
            mixer.timeScale = 0;
            reproduciendo = false;

            // Limpiar resaltes temporales al terminar el segmento
            quitarResaltesTemporales();

            setTimeout(() => {
                const b = document.getElementById('barraS2');
                if (b) b.style.display = 'none';
                const f = document.getElementById('barraFillS2');
                if (f) f.style.width = '0%';
            }, 400);

            if (parte.video) {
                mostrarVideoPopup(parte, () => completarParte(parte));
            } else {
                completarParte(parte);
            }
        }
    }, 100);
}

function pararSegmento() {
    if (monitorIntervalo) { clearInterval(monitorIntervalo); monitorIntervalo = null; }
    if (audioCompleto) audioCompleto.pause();
    if (mixer) mixer.timeScale = 0;
    reproduciendo = false;
    quitarResaltesTemporales();
}

function completarParte(parte) {
    marcarCompletada(parte.id);
    const siguiente = indiceActivo + 1;
    siguiente < PARTES.length ? activarParte(siguiente) : todasCompletadas();
}

function cambiarTexturaPantalla(rutaImagen) {
    if (!modeloCargado || !rutaImagen) return;
    let pantalla = null;
    modeloCargado.traverse(o => { if (o.name === 'pantalla') pantalla = o; });
    if (!pantalla) return;
    if (_cachTexturas[rutaImagen]) { aplicarTexturaPantalla(pantalla, _cachTexturas[rutaImagen]); return; }
    new THREE.TextureLoader().load(rutaImagen, textura => {
        _cachTexturas[rutaImagen] = textura;
        aplicarTexturaPantalla(pantalla, textura);
    });
}

function aplicarTexturaPantalla(pantalla, textura) {
    if (!pantalla.material) return;
    textura.wrapS = textura.wrapT = THREE.ClampToEdgeWrapping;
    textura.repeat.set(1, 1); textura.offset.set(0, 0);
    textura.flipY = false; textura.needsUpdate = true;
    const mats = Array.isArray(pantalla.material) ? pantalla.material : [pantalla.material];
    mats.forEach(mat => { mat.map = textura; mat.color.set(0xffffff); mat.needsUpdate = true; });
}


/* =====================================================
   VIDEO POPUP
   ===================================================== */

function mostrarVideoPopup(parte, onTerminado) {
    panelAbierto = true;
    document.getElementById('videoPopupS2')?.remove();
    const contenedor = document.getElementById('areaThreeJs');
    const popup = document.createElement('div');
    popup.id = 'videoPopupS2';
    popup.style.cssText = `position:absolute;inset:0;background:rgba(0,0,0,0.88);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:20;font-family:'DM Sans',sans-serif;`;
    popup.innerHTML = `
        <div style="width:82%;max-width:720px;">
            <p style="color:white;font-size:0.85rem;font-weight:600;text-align:center;margin:0 0 12px;opacity:0.85;">Video complementario — debes verlo completo para continuar</p>
            <div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;background:#000;">
                <iframe id="ytFramePopupS2" src="${construirUrlVideo(parte)}"
                    style="position:absolute;top:0;left:0;width:100%;height:100%;border:none;" allowfullscreen></iframe>
            </div>
            <p id="avisoPopupS2" style="color:#e05c3a;font-size:0.78rem;text-align:center;margin:10px 0 0;">El video debe terminar para continuar</p>
        </div>`;
    contenedor.appendChild(popup);
    setTimeout(() => iniciarYTPopup(onTerminado), 600);
}

function cerrarVideoPopup() { document.getElementById('videoPopupS2')?.remove(); panelAbierto = false; }

function iniciarYTPopup(onTerminado) {
    if (!document.getElementById('ytApiScript')) {
        const tag = document.createElement('script'); tag.id = 'ytApiScript';
        tag.src = 'https://www.youtube.com/iframe_api'; document.head.appendChild(tag);
    }
    const activar = () => {
        const frame = document.getElementById('ytFramePopupS2');
        if (!frame || !window.YT?.Player) return;
        if (ytPlayer) { try { ytPlayer.destroy(); } catch { } ytPlayer = null; }
        ytPlayer = new YT.Player('ytFramePopupS2', {
            events: {
                onStateChange: e => {
                    if (e.data === YT.PlayerState.ENDED) {
                        document.getElementById('avisoPopupS2')?.remove();
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
    const posInicio = camara.position.clone();
    const targetInicio = controls.target.clone();
    const inicio = performance.now();
    function step(ahora) {
        const t = Math.min((ahora - inicio) / duracionMs, 1);
        const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
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
    if (!modeloCargado || reproduciendo) return;
    const hits = getMeshesYHits(event);
    if (!hits.length) return;
    const parte = PARTES[indiceActivo];
    if (parte.tipo === 'rotar' && hits[0].object.name === parte.objeto) {
        rotandoObjeto = true;
        objetoRotando = hits[0].object;
        mouseXAnterior = event.clientX;
        mouseYAnterior = event.clientY;
        renderer.domElement.style.cursor = 'grabbing';
    }
}

function onMouseMove(event) {
    if (!modeloCargado) return;
    if (rotandoObjeto && objetoRotando && !reproduciendo) {
        const deltaX = event.clientX - mouseXAnterior;
        mouseXAnterior = event.clientX; mouseYAnterior = event.clientY;
        if (objetoRotando.name === 'selector') {
            objetoRotando.rotation.x += deltaX * 0.01;
        } else {
            objetoRotando.rotation.x = THREE.MathUtils.clamp(
                objetoRotando.rotation.x + deltaX * 0.01, -Math.PI / 2, Math.PI / 2
            );
        }
        return;
    }
    const hits = getMeshesYHits(event);
    const parte = PARTES[indiceActivo];
    const validos = parte.objetosGrupo ?? [parte.objeto];
    renderer.domElement.style.cursor = (
        !reproduciendo && hits.length > 0 && validos.includes(hits[0].object.name)
    ) ? (parte.tipo === 'rotar' ? 'grab' : 'pointer') : 'default';
}

function onMouseUp() {
    if (!rotandoObjeto) return;
    rotandoObjeto = false;
    objetoRotando = null;
    renderer.domElement.style.cursor = 'default';
    const parte = PARTES[indiceActivo];
    if (parte.tipo === 'rotar' && !reproduciendo) { reproducirSegmento(parte); }
}

function onClickCanvas(event) {
    if (!modeloCargado || rotandoObjeto || reproduciendo) return;
    const hits = getMeshesYHits(event);
    if (!hits.length) return;
    const parte = PARTES[indiceActivo];
    const validos = parte.objetosGrupo ?? [parte.objeto];
    if (!validos.includes(hits[0].object.name)) return;
    efectoClick(hits[0].object);
    reproducirSegmento(parte);
}


/* =====================================================
   INTERACCIONES 3D
   ===================================================== */

function efectoClick(objeto) {
    const escOrig = objeto.scale.clone(); objeto.scale.multiplyScalar(0.9);
    if (objeto.material?.color) {
        const colorOrig = objeto.material.color.clone(); objeto.material.color.multiplyScalar(0.65);
        setTimeout(() => { objeto.scale.copy(escOrig); objeto.material.color.copy(colorOrig); }, 160);
    } else { setTimeout(() => objeto.scale.copy(escOrig), 160); }
}