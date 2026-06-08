import { inicializarEscena, cargarModelo, limpiarRenderer, THREE } from '../escena.js';

const MODOS_PERILLA = [
    { nombre: 'Manual', angulo: -1.57, imagen: '/Estudiante/threejs/img/manual.png' },
    { nombre: 'Monitor', angulo: -1, imagen: '/Estudiante/threejs/img/MODOMONITOR.png' },
    { nombre: 'Apagado', angulo: 0, imagen: '/Estudiante/threejs/img/negro.jpg' },
    { nombre: 'Marcapasos', angulo: 1, imagen: '/Estudiante/threejs/img/marcapasos.png' },
    { nombre: 'DEA', angulo: 2, imagen: '/Estudiante/threejs/img/DEA.png' },
];

// correcion 1
const TOLERANCIA_ANGULO_PERILLA = 0.45;

//correcion 2
const CAMARA_POSICION = { x: -0.1, y: -0.1, z: 0.5 };
const CAMARA_TARGET = { x: -0.1, y: -0.1, z: 0 };

// [CAMBIO 1] CONSTANTES DE COLOR DE RESALTADO
const COLOR_RESALTADO = 0xff6600;  // naranja
const COLOR_CONFIRMADO = 0x4caf50;  // verde claro

// ═════════════════════════════════════════════════════════

const PARTES = [
    {
        id: 'perilla',
        nombre: 'Encienda el equipo girando la perilla hasta la posición Desfi. Manual',
        objeto: 'perilla001',
        // Correcion 3
        anguloObjetivo: 'Manual',
        tipo: 'rotar',
        camaraOffset: { x: 0, y: -0.1, z: 0.8 },
        instruccion: 'Haz click y gira la perilla hasta desfribilación manual para encender el equipo',
         imagenesPantalla: [ '/Estudiante/threejs/img/negro.jpg' ],
    },
    {
        id: 'SelecEnergia',
        nombre: 'Seleccione cuánta energía quiere usar: use los botones del panel frontal o los botones en las propias palas para subir o bajar los joules.',
        tipo: 'click',

        instruccion: 'Haz click sobre la flecha para iniciar las pruebas',
        pasos: [
            { objeto: 'SelecEnergia', imagen: '/Estudiante/threejs/img/energiaseleccionada.png', instruccion: 'Con el botón de selección de energía puedes seleccionar el valor para la descarga' },
            { objeto: 'SelecEnergia', imagen: '/Estudiante/threejs/img/360.png', instruccion: 'Este equipo llega máximo a 360 J' },
        ],
        video: 'https://youtu.be/JPdsZGjlQgY',
    },

    // ─── PASO CON MINIJUEGO DE PALAS ────────────────────────────────────────
    {
        id: 'PalaDer',
        nombre: 'Tome las palas del equipo. Aplique gel conductor en la superficie metálica de cada pala y ubíquelas sobre el paciente en la posición indicada.',
        tipo: 'minijuego',
        //camaraOffset: { x: 0.5, y: -0.1, z: 0.7 },
        instruccion: 'Arrastra cada pala a su posición correcta sobre el paciente',
        video: 'https://youtu.be/OFfY8y9xM_I',
    },
    // ────────────────────────────────────────────────────────────────────────

    {
        id: 'Carga',
        nombre: 'Mire el semáforo de contacto: Cuando el indicador esté en verde, presione el botón de carga. Puedes hacerlo desde el panel frontal o desde la pala.',
        tipo: 'click',
        //camaraOffset: { x: 0, y: 0, z: 0.7 },
         imagenesPantalla: [ '/Estudiante/threejs/img/energiaseleccionada.png' ],
        pasos: [
            { objeto: 'Carga', imagen: '/Estudiante/threejs/img/cargaenergia.png', instruccion: 'Realiza la carga y observarás en la pantalla el proceso de carga' },
            { objeto: 'Carga', imagen: '/Estudiante/threejs/img/descarga.png', instruccion: 'Después de realizar la carga, debes hacer la descarga' },
        ],
    },
    {
        id: 'Boton3D',
        nombre: 'Realiza la descarga, esta se puede hacer desde el panel frontal, sin embargo si están conectadas las palas solo se podrá operar de estas.',
        tipo: 'click',
        camaraOffset: { x: -0.1, y: 0.1, z: 0.1 },
        video: 'https://youtu.be/LVlrwihpkkc',
        imagenesPantalla: [ '/Estudiante/threejs/img/descarga.png' ],
        pasos: [
            { objeto: 'Boton3D', imagen: '/Estudiante/threejs/img/descargaadmin.png', instruccion: 'Oprime los botones de descarga de las palas de manera simultánea, pero para esta simulación solo hazlo en uno de ellos' },
        ],
    },
   
];


/* =====================================================
   CONFIGURACIÓN DEL MINIJUEGO DE PALAS

   ===================================================== */
const PALAS_CONFIG = [
    {
        id: '1',
        label: 'Esternón',
        desc: '',
        color: '#c0392b',
        targetPctX: 62,
        targetPctY: 60,
        radius: 30,
    },
    {
        id: '2',
        label: 'Ápex',
        desc: '',
        color: '#2471a3',
        targetPctX: 38,
        targetPctY: 35,
        radius: 30,
    },
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

export function iniciarSeccion5(contenedorId) {
    destruirSeccion5();

    const btnCompletar = document.getElementById('btnCompletar');
    const yaCompletada = btnCompletar?.disabled &&
        btnCompletar?.textContent.includes('completada');

    const base = inicializarEscena(contenedorId);
    escena = base.escena;
    camara = base.camara;
    renderer = base.renderer;
    controls = base.controls;
    reloj = base.reloj;

    // correcion 4
    // ═══════════════════════════════════════════════════════════════

    // ═══════════════════════════════════════════════════════════════
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


            //correcion 5
            // ═══════════════════════════════════════════════════════
            // [E] POSICIÓN INICIAL DE LA CÁMARA
            // Siempre dentro del callback, después de recibir el modelo,
            // para sobreescribir lo que escena.js haya calculado.
            // Copia estas 3 líneas en cada sección.
            // ═══════════════════════════════════════════════════════
            camara.position.set(CAMARA_POSICION.x, CAMARA_POSICION.y, CAMARA_POSICION.z);
            controls.target.set(CAMARA_TARGET.x, CAMARA_TARGET.y, CAMARA_TARGET.z);
            controls.update();

            camaraOriginalPos = camara.position.clone();
            camaraOriginalTarget = controls.target.clone();

            // [CAMBIO 3] CAPTURA DE COLORES ORIGINALES
            capturaMaterialesOriginales();


            // ═══════════════════════════════════════════════════════
            // [F] RESET DE ROTACIÓN DE LA PERILLA AL CARGAR
            // Cuando el usuario viene de otra sección, la perilla puede
            // quedar girada al ángulo que dejó. Esto la resetea a 0
            // para que cada sección empiece limpia.
            // Copia este bloque en cada sección tal cual.
            // ═══════════════════════════════════════════════════════
            modeloCargado.traverse(obj => {
                if (obj.name === 'perilla001') {
                    obj.rotation.x = 0;
                    obj.rotation.y = 0;
                    obj.rotation.z = 0;
                }
            });

            // ═══════════════════════════════════════════════════════

            _modoActual = null;
            let pantalla = null;
            modeloCargado.traverse(o => { if (o.name === 'pantalla') pantalla = o; });
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

export function destruirSeccion5() {
    indiceImagenActual = 0;
    pararMedia();

    cancelAnimationFrame(animFrameId);
    animFrameId = null;

    if (renderer) {
        renderer.domElement.removeEventListener('mousedown', onMouseDown);
        renderer.domElement.removeEventListener('mousemove', onMouseMove);
        renderer.domElement.removeEventListener('mouseup', onMouseUp);
        renderer.domElement.removeEventListener('click', onClickCanvas);
    }

    document.getElementById('areaThreeJs')?.replaceChildren();
    document.getElementById('uiSeccion5')?.remove();
    document.getElementById('loaderSeccion5')?.remove();
    document.getElementById('checklistS5')?.remove();
    document.getElementById('videoPopupS5')?.remove();
    document.getElementById('minijuegoPalasS5')?.remove();

    //Correcion 6
    document.getElementById('feedbackPerillaS5')?.remove(); // [G] limpiar feedback perilla


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
    document.getElementById('loaderSeccion5')?.remove();

    const loader = document.createElement('div');
    loader.id = 'loaderSeccion5';
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
    const loader = document.getElementById('loaderSeccion5');
    if (!loader) return;
    loader.style.transition = 'opacity 0.4s';
    loader.style.opacity = '0';
    setTimeout(() => loader.remove(), 400);
}


/* =====================================================
   INTERFAZ PRINCIPAL
   ===================================================== */

function mostrarUI() {
    document.getElementById('uiSeccion5')?.remove();
    const contenedor = document.getElementById('areaThreeJs');

    const ui = document.createElement('div');
    ui.id = 'uiSeccion5';
    ui.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:hidden;';

    ui.innerHTML = `
        <div id="checklistS5" style="
            position:absolute;top:16px;right:16px;width:380px;
            background:white;border-radius:12px;padding:14px;pointer-events:all;
            box-shadow:0 4px 20px rgba(0,0,0,0.12);font-family:'DM Sans',sans-serif;z-index:3;">
            <p style="font-size:0.78rem;font-weight:600;color:#1e5c3a;
                margin:0 0 10px;text-transform:uppercase;letter-spacing:0.05em;">
                Pasos para la desfibrilación manual
            </p>
            ${PARTES.map((parte, i) => `
                <div id="check-${parte.id}" style="
                    display:flex;align-items:center;gap:10px;
                    padding:4px;border-radius:8px;margin-bottom:4px;
                    background:${i === 0 ? '#e8f5ee' : 'transparent'};
                    border:1.5px solid ${i === 0 ? '#1e5c3a' : '#e0e6e0'};
                    transition:all 0.2s;cursor:pointer;pointer-events:all;"
                    onclick="window.irAParteS5(${i})">
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

        <div id="instruccionS5" style="
            position:absolute;bottom:28px;left:50%;transform:translateX(-50%);
            white-space:nowrap;font-family:'DM Sans',sans-serif;font-size:0.78rem;
            color:#5a7a62;background:rgba(255,255,255,0.9);
            padding:6px 16px;border-radius:20px;pointer-events:none;z-index:3;
            box-shadow:0 2px 8px rgba(0,0,0,0.08);">
            ${PARTES[0].instruccion}
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

        <div id="panelLateralS5" style="
            position:absolute;top:0;left:-320px;bottom:0;width:300px;
            background:white;box-shadow:4px 0 20px rgba(0,0,0,0.12);
            padding:20px;pointer-events:all;overflow-y:auto;
            transition:left 0.35s cubic-bezier(0.16,1,0.3,1);
            font-family:'DM Sans',sans-serif;font-size:0.88rem;
            line-height:1.6;color:#1a2e1f;z-index:5;">
            <div style="display:flex;align-items:center;
                justify-content:space-between;margin-bottom:16px;">
                <h4 style="font-size:1rem;color:#1e5c3a;margin:0;">Desfibrilación Manual</h4>
                <button onclick="window.togglePanelS5()" style="
                    background:none;border:none;cursor:pointer;
                    color:#5a7a62;font-size:1.2rem;padding:4px;">✕</button>
            </div>
            <p style="margin:0 0 12px;">
               El Modo Desfibrilación Manual permite al operador seleccionar la energía, cargar el equipo y administrar la descarga de forma
                controlada. Se usa en fibrilación ventricular o taquicardia ventricular sin pulso cuando el operador ha confirmado el ritmo
                y decide el nivel de energía. Recuerde que el equipo avisa 'No toque al paciente'. Asegúrese de que nadie esté
                tocando al paciente ni a la camilla. Además, si necesita dar otra descarga: el equipo ya recuerda el nivel de energía
                anterior. Repita desde el paso 5. Finalmente, deje que el equipo imprima el registro automáticamente.
                No lo apague hasta que termine de imprimir.
            </p>
        </div>

        <div id="overlayPanelS5" onclick="window.togglePanelS5()" style="
            position:absolute;inset:0;background:rgba(0,0,0,0.2);
            pointer-events:none;opacity:0;transition:opacity 0.35s;z-index:4;">
        </div>

        <button onclick="window.togglePanelS5()" style="
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
    const parte = PARTES[indice];

    const instruccionTexto = parte.pasos?.[0]?.instruccion
        ?? parte.instrucciones?.[0]
        ?? parte.instruccion;
    const instruccionEl = document.getElementById('instruccionS5');
    if (instruccionEl) instruccionEl.textContent = instruccionTexto;

    // Si es minijuego: mostrar botón de inicio, NO lanzar overlay directo
    if (parte.tipo === 'minijuego') {
        actualizarChecklist();
        const cs = document.getElementById('contenedorSenales');
        if (cs) cs.innerHTML = '';
        window._senalObjeto = null;
        if (controls) controls.enableRotate = true;

        const instrEl = document.getElementById('instruccionS5');
        if (instrEl) {
            instrEl.style.whiteSpace = 'normal';
            instrEl.style.pointerEvents = 'all';
            instrEl.innerHTML = `
                <span style="color:#5a7a62;margin-right:10px;">
                    Ubica las palas sobre el paciente en la posición correcta
                </span>
                <button
                    onclick="window._lanzarMinijuegoPalasS5()"
                    style="background:#1e5c3a;color:white;border:none;
                        padding:5px 14px;border-radius:16px;font-size:0.78rem;
                        font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;">
                    Iniciar
                </button>`;
        }

        window._lanzarMinijuegoPalasS5 = () => {
            mostrarMinijuegoPalas(parte, () => avanzarDespuesDeVideo(parte));
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


    // Correcion 7
    if (parte.camaraOffset) {
        enfocarObjeto(primerObjeto);
    } else {
        animarCamara(
            new THREE.Vector3(CAMARA_POSICION.x, CAMARA_POSICION.y, CAMARA_POSICION.z),
            new THREE.Vector3(CAMARA_TARGET.x, CAMARA_TARGET.y, CAMARA_TARGET.z),
            600
        );
    }
    // ------------

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
    // ══════════════════════════════════════════════════════════════
    // [CAMBIO 9] QUITAR NARANJA AL COMPLETAR TODO
    // Siempre llama quitarResaltadoActual() en marcarTodoCompletado.
    // ══════════════════════════════════════════════════════════════
    quitarResaltadoActual();
    if (controls) controls.enableRotate = true;
    const instruccion = document.getElementById('instruccionS5');
    if (instruccion) instruccion.textContent = 'Desfibrilación Manual completada';

    // creo
    document.getElementById('feedbackPerillaS5')?.remove();
}

function todasCompletadas() {
    const cs = document.getElementById('contenedorSenales');
    if (cs) cs.innerHTML = '';
    window._senalObjeto = null;

    const instruccion = document.getElementById('instruccionS5');
    if (instruccion) instruccion.textContent = '¡Desfibrilación Manual completada!';

    const btnCompletar = document.getElementById('btnCompletar');
    if (btnCompletar && !btnCompletar.textContent.includes('completada')) {
        btnCompletar.disabled = false;
        btnCompletar.style.opacity = '1';
        btnCompletar.style.cursor = 'pointer';
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

window.irAParteS5 = function (indice) {
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
   MINIJUEGO DE PALAS
   ===================================================== */

function mostrarMinijuegoPalas(parte, onCompletado) {
    panelAbierto = true;
    document.getElementById('minijuegoPalasS5')?.remove();

    // Keyframes — solo una vez en el documento
    if (!document.getElementById('mjPalasKeyframes')) {
        const style = document.createElement('style');
        style.id = 'mjPalasKeyframes';
        style.textContent = `
            @keyframes pulsarZonaPala {
                0%,100%{opacity:0.55;transform:scale(1);}
                50%{opacity:1;transform:scale(1.07);}
            }
            @keyframes aparecerPala {
                from{transform:scale(0.4);opacity:0;}
                to{transform:scale(1);opacity:1;}
            }`;
        document.head.appendChild(style);
    }

    const contenedor = document.getElementById('areaThreeJs');
    const overlay = document.createElement('div');
    overlay.id = 'minijuegoPalasS5';
    overlay.style.cssText = `
        position:absolute;inset:0;
        background:rgba(0,0,0,0.82);
        display:flex;flex-direction:column;
        align-items:center;justify-content:center;
        z-index:20;font-family:'DM Sans',sans-serif;
        padding:16px;box-sizing:border-box;`;

    overlay.innerHTML = `
        <div style="
            width:100%;max-width:900px;
            background:white;border-radius:16px;
            padding:20px;box-sizing:border-box;
            display:flex;flex-direction:column;gap:14px;">

            <!-- Encabezado -->
            <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                <div>
                    <p style="margin:0;font-size:0.9rem;font-weight:600;color:#1e5c3a;">
                        Ubica las palas sobre el paciente
                    </p>
                    <p style="margin:4px 0 0;font-size:0.78rem;color:#5a7a62;">
                        Arrastra cada pala a su posición correcta en el cuerpo del paciente
                    </p>
                </div>
                <span id="contadorPalas" style="
                    font-size:0.75rem;color:#9ab0a0;
                    background:#f0f5f0;padding:4px 10px;
                    border-radius:20px;">0 / ${PALAS_CONFIG.length}</span>
            </div>

            <!-- Área principal: bandeja + torso -->
            <div style="display:flex;gap:24px;align-items:flex-start;flex-wrap:wrap;">

                <!-- Bandeja de palas -->
                <div style="display:flex;flex-direction:column;gap:6px;min-width:110px;">
                    <p style="margin:0 0 4px;font-size:0.72rem;color:#9ab0a0;
                        text-transform:uppercase;letter-spacing:0.05em;">Palas</p>
                    <div id="bandejaPalas" style="
                        display:flex;flex-direction:column;gap:12px;
                        padding:12px;
                        background:#f5f8f5;
                        border:1.5px dashed #c8d8c8;
                        border-radius:10px;
                        min-height:60px;
                        align-items:center;">
                    </div>
                </div>

                <!-- Torso con zonas drop -->
                <div style="position:relative;flex:1;min-width:220px;">
                    <img
                        id="torsoImgPalas"
                        src="/Estudiante/threejs/img/torso.png"
                        draggable="false"
                        style="width:100%;max-width:550px;display:block;
                            border-radius:10px;user-select:none;pointer-events:none;">
                    <div id="zonasDropPalas" style="position:absolute;inset:0;"></div>
                    <div id="palasColocadas" style="position:absolute;inset:0;pointer-events:none;"></div>
                </div>
            </div>

            <!-- Feedback -->
            <div id="feedbackPalas" style="
                min-height:22px;font-size:0.8rem;
                text-align:center;color:#5a7a62;
                transition:color 0.2s;"></div>

            <!-- Botón continuar (oculto hasta completar) -->
            <div id="wrapContinuarPalas" style="display:none;justify-content:center;">
                <button id="btnContinuarPalas" style="
                    background:#1e5c3a;color:white;border:none;
                    padding:10px 28px;border-radius:8px;
                    font-size:0.88rem;font-weight:600;
                    cursor:pointer;font-family:'DM Sans',sans-serif;">
                    Continuar 
                </button>
            </div>
        </div>`;

    contenedor.appendChild(overlay);

    const mjState = { colocados: {} };

    // ── Helper: bandeja de palas ──
    function renderBandeja() {
        const bandeja = document.getElementById('bandejaPalas');
        if (!bandeja) return;
        bandeja.innerHTML = '';
        PALAS_CONFIG.forEach(p => {
            if (mjState.colocados[p.id]) return;
            const el = document.createElement('div');
            el.dataset.eid = p.id;
            // Forma de pala: rectángulo redondeado con etiqueta
            el.style.cssText = `
                width:64px;height:44px;border-radius:10px;
                background:${p.color};
                color:white;font-weight:700;font-size:12px;
                display:flex;align-items:center;justify-content:center;
                cursor:grab;user-select:none;
                border:2.5px solid rgba(255,255,255,0.5);
                box-shadow:0 2px 6px rgba(0,0,0,0.22);
                text-align:center;padding:0 4px;`;
            el.title = p.desc;
            el.textContent = p.label;
            bandeja.appendChild(el);
        });
    }

    // ── Helper: zonas drop usando porcentajes ──
    function renderZonas() {
        const zonas = document.getElementById('zonasDropPalas');
        const img = document.getElementById('torsoImgPalas');
        if (!zonas || !img) return;
        zonas.innerHTML = '';

        const w = img.offsetWidth;
        const h = img.offsetHeight;

        PALAS_CONFIG.forEach(p => {
            if (mjState.colocados[p.id]) return;
            const zona = document.createElement('div');
            zona.id = `zona-drop-pala-${p.id}`;

            const cx = (p.targetPctX / 100) * w;
            const cy = (p.targetPctY / 100) * h;
            const r = p.radius;

            zona.style.cssText = `
                position:absolute;
                width:${r * 2}px;height:${r * 2}px;
                left:${cx - r}px;top:${cy - r}px;
                border-radius:50%;
                border:2px dashed #434343;
                background:rgba(150,160,150,0.12);
                display:flex;align-items:center;justify-content:center;
                font-size:10px;color:${p.color};font-weight:700;
                pointer-events:none;
                animation:pulsarZonaPala 1.6s ease-in-out infinite;
                text-align:center;padding:4px;`;
            //zona.textContent = p.label;
            zonas.appendChild(zona);
        });
    }

    // ── Helper: dibujar pala colocada ──
    function colocarPala(pdata) {
        const colocadas = document.getElementById('palasColocadas');
        const img = document.getElementById('torsoImgPalas');
        if (!colocadas || !img) return;

        const cx = (pdata.targetPctX / 100) * img.offsetWidth;
        const cy = (pdata.targetPctY / 100) * img.offsetHeight;
        const w = 64;
        const h = 44;

        const el = document.createElement('div');
        el.style.cssText = `
            position:absolute;
            width:${w}px;height:${h}px;
            left:${cx - w / 2}px;top:${cy - h / 2}px;
            border-radius:10px;
            background:${pdata.color};
            display:flex;align-items:center;justify-content:center;
            color:white;font-weight:700;font-size:12px;
            border:2.5px solid white;
            box-shadow:0 3px 10px rgba(0,0,0,0.35);
            animation:aparecerPala 0.25s ease-out;
            text-align:center;padding:0 4px;`;
        el.textContent = pdata.label;
        colocadas.appendChild(el);
    }

    // Inicializar
    renderBandeja();
    const imgEl = document.getElementById('torsoImgPalas');
    if (imgEl.complete && imgEl.naturalWidth > 0) {
        renderZonas();
    } else {
        imgEl.addEventListener('load', renderZonas, { once: true });
    }
    const ro = new ResizeObserver(renderZonas);
    ro.observe(imgEl);

    // Botón continuar
    document.getElementById('btnContinuarPalas').addEventListener('click', () => {
        ro.disconnect();
        cerrarMinijuegoPalas();
        if (parte.video) {
            mostrarVideoPopup(parte, () => onCompletado());
        } else {
            onCompletado();
        }
    });

    // ── Lógica de arrastre ──
    let ghost = null;
    let eidArrastrando = null;

    function iniciarArrastre(eid, clientX, clientY) {
        if (mjState.colocados[eid]) return;
        eidArrastrando = eid;
        const pdata = PALAS_CONFIG.find(p => p.id === eid);

        ghost = document.createElement('div');
        ghost.style.cssText = `
            position:fixed;
            width:64px;height:44px;border-radius:10px;
            background:${pdata.color};
            color:white;font-weight:700;font-size:12px;
            display:flex;align-items:center;justify-content:center;
            pointer-events:none;z-index:9999;opacity:0.92;
            border:2.5px solid rgba(255,255,255,0.7);
            transform:translate(-50%,-50%);
            box-shadow:0 4px 12px rgba(0,0,0,0.3);
            text-align:center;padding:0 4px;`;
        ghost.textContent = pdata.label;
        document.body.appendChild(ghost);
        moverGhost(clientX, clientY);
    }

    function moverGhost(cx, cy) {
        if (!ghost) return;
        ghost.style.left = cx + 'px';
        ghost.style.top = cy + 'px';
    }

    function terminarArrastre(cx, cy) {
        if (!eidArrastrando || !ghost) return;
        ghost.remove();
        ghost = null;

        const eid = eidArrastrando;
        eidArrastrando = null;
        const pdata = PALAS_CONFIG.find(p => p.id === eid);

        const img = document.getElementById('torsoImgPalas');
        const rect = img.getBoundingClientRect();
        const pctX = ((cx - rect.left) / rect.width) * 100;
        const pctY = ((cy - rect.top) / rect.height) * 100;

        const rPctX = (pdata.radius / rect.width) * 100;
        const rPctY = (pdata.radius / rect.height) * 100;

        const dx = (pctX - pdata.targetPctX) / rPctX;
        const dy = (pctY - pdata.targetPctY) / rPctY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const feedback = document.getElementById('feedbackPalas');

        if (dist <= 1) {
            mjState.colocados[eid] = true;
            reproducirSonidoCorrecto();
            colocarPala(pdata);
            feedback.style.color = '#1e5c3a';
            feedback.textContent = `✓ ${pdata.desc} — posición correcta`;

            const total = PALAS_CONFIG.length;
            const hechos = Object.keys(mjState.colocados).length;
            document.getElementById('contadorPalas').textContent = `${hechos} / ${total}`;
            document.getElementById(`zona-drop-pala-${eid}`)?.remove();
            renderBandeja();

            if (hechos === total) {
                setTimeout(() => {
                    feedback.textContent = '¡Palas colocadas correctamente!';
                    document.getElementById('wrapContinuarPalas').style.display = 'flex';
                }, 350);
            }
        } else {
            feedback.style.color = '#e24b4a';
            feedback.textContent = `Posición incorrecta para "${pdata.label}" — inténtalo de nuevo`;
            setTimeout(() => { feedback.textContent = ''; }, 2200);
        }
    }

    function onMove(e) { moverGhost(e.clientX, e.clientY); }
    function onMoveTouch(e) { e.preventDefault(); moverGhost(e.touches[0].clientX, e.touches[0].clientY); }
    function onUp(e) {
        terminarArrastre(e.clientX, e.clientY);
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
    }
    function onUpTouch(e) {
        const t = e.changedTouches[0];
        terminarArrastre(t.clientX, t.clientY);
        document.removeEventListener('touchmove', onMoveTouch);
        document.removeEventListener('touchend', onUpTouch);
    }

    overlay.addEventListener('mousedown', e => {
        const eid = e.target.closest('[data-eid]')?.dataset?.eid;
        if (!eid) return;
        e.preventDefault();
        iniciarArrastre(eid, e.clientX, e.clientY);
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
    });
    overlay.addEventListener('touchstart', e => {
        const eid = e.target.closest('[data-eid]')?.dataset?.eid;
        if (!eid) return;
        e.preventDefault();
        iniciarArrastre(eid, e.touches[0].clientX, e.touches[0].clientY);
        document.addEventListener('touchmove', onMoveTouch, { passive: false });
        document.addEventListener('touchend', onUpTouch);
    }, { passive: false });
}

function cerrarMinijuegoPalas() {
    document.getElementById('minijuegoPalasS5')?.remove();
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
    animarCamara(
        new THREE.Vector3(pos.x + off.x, pos.y + off.y, pos.z + off.z),
        pos.clone(),
        800
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


// correcion 9
// ═══════════════════════════════════════════════════════════════════
// [J] mostrarFeedbackPerilla — muestra un indicador "modo actual → objetivo"
// Solo aparece si la parte tiene anguloObjetivo definido.
// ═══════════════════════════════════════════════════════════════════
function mostrarFeedbackPerilla(parte) {
    document.getElementById('feedbackPerillaS5')?.remove();
    if (!parte.anguloObjetivo) return;

    const contenedor = document.getElementById('areaThreeJs');
    const div = document.createElement('div');
    div.id = 'feedbackPerillaS5';
    contenedor.appendChild(div);
}

// ═══════════════════════════════════════════════════════════════════
// [K] actualizarFeedbackPerilla — actualiza el modo mostrado mientras se gira.
// Se llama desde onMouseMove. Cambia el ID del elemento en cada sección.
// ═══════════════════════════════════════════════════════════════════
function actualizarFeedbackPerilla(modoActualNombre) {
    const el = document.getElementById('feedbackModoActualS5');
    if (el) el.textContent = modoActualNombre;
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
    senal.style.left = x + 'px';
    senal.style.top = y + 'px';
}

window.togglePanelS5 = function () {
    const panel = document.getElementById('panelLateralS5');
    const overlay = document.getElementById('overlayPanelS5');
    if (!panel) return;
    panelLateralAbierto = !panelLateralAbierto;
    panel.style.left = panelLateralAbierto ? '0' : '-320px';
    overlay.style.opacity = panelLateralAbierto ? '1' : '0';
    overlay.style.pointerEvents = panelLateralAbierto ? 'all' : 'none';
};


/* =====================================================
   EVENTOS DE MOUSE (Three.js canvas)
   ===================================================== */

function getMeshesYHits(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camara);
    const meshes = [];
    modeloCargado.traverse(o => { if (o.isMesh) meshes.push(o); });
    return raycaster.intersectObjects(meshes, true);
}

function onMouseDown(event) {
    if (!modeloCargado) return;
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

    if (rotandoObjeto && objetoRotando) {
        const deltaX = event.clientX - mouseXAnterior;
        mouseXAnterior = event.clientX;
        mouseYAnterior = event.clientY;

        if (objetoRotando.name === 'selector') {
            objetoRotando.rotation.x += deltaX * 0.01;
        } else {
            objetoRotando.rotation.x = THREE.MathUtils.clamp(
                objetoRotando.rotation.x + deltaX * 0.01,
                -Math.PI / 2,
                Math.PI / 2
            );
            actualizarPantalla(objetoRotando.rotation.x);

            //correcion 10
            // ═══════════════════════════════════════════════════════
            // [L] Actualizar el indicador de modo mientras se gira.
            // Copia este bloque dentro del if(rotandoObjeto) de onMouseMove
            // en cada sección. Solo tiene efecto si mostrarFeedbackPerilla
            // fue llamado (es decir, si la parte tiene anguloObjetivo).
            // ═══════════════════════════════════════════════════════
            const modoDetectado = MODOS_PERILLA.reduce((prev, curr) =>
                Math.abs(curr.angulo - objetoRotando.rotation.x) <
                    Math.abs(prev.angulo - objetoRotando.rotation.x) ? curr : prev
            );
            actualizarFeedbackPerilla(modoDetectado.nombre);
        }
        return;
    }

    const hits = getMeshesYHits(event);
    const parte = PARTES[indiceActivo];

    let objetosEsperados;
    if (parte.pasos?.length) {
        objetosEsperados = [parte.pasos[indiceImagenActual]?.objeto].filter(Boolean);
    } else {
        objetosEsperados = parte.objetosGrupo ?? [parte.objeto];
    }

    renderer.domElement.style.cursor = (
        hits.length > 0 && objetosEsperados.includes(hits[0].object.name)
    ) ? (parte.tipo === 'rotar' ? 'grab' : 'pointer') : 'default';
}

function onMouseUp() {
    if (!rotandoObjeto) return;
    rotandoObjeto = false;
    const objRotado = objetoRotando;
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
    // ═══════════════════════════════════════════════════════════════
}

// ═══════════════════════════════════════════════════════════════════
// correcion 12
// Copia esta función en cada sección. No necesita cambios.
// ═══════════════════════════════════════════════════════════════════
function mostrarToastPerilla(mensaje, exito) {
    document.getElementById('toastPerillaS4')?.remove();
    const contenedor = document.getElementById('areaThreeJs');
    const toast = document.createElement('div');
    toast.id = 'toastPerillaS4';
    toast.style.cssText = `
        position:absolute;top:50%;left:50%;
        transform:translate(-50%,-50%);
        background:${exito ? '#1e5c3a' : '#c0392b'};
        color:white;padding:10px 24px;border-radius:20px;
        font-family:'DM Sans',sans-serif;font-size:0.88rem;font-weight:600;
        pointer-events:none;z-index:30;
        animation:fadeInOut 1.8s ease forwards;`;
    toast.textContent = mensaje;
    const style = document.createElement('style');
    style.textContent = `@keyframes fadeInOut{
        0%  {opacity:0;transform:translate(-50%,-60%);}
        15% {opacity:1;transform:translate(-50%,-50%);}
        70% {opacity:1;}
        100%{opacity:0;transform:translate(-50%,-40%);}
    }`;
    toast.appendChild(style);
    contenedor.appendChild(toast);
    setTimeout(() => toast.remove(), 1900);
}

function onClickCanvas(event) {
    if (!modeloCargado || rotandoObjeto || panelAbierto) return;

    const hits = getMeshesYHits(event);
    if (!hits.length) return;

    const parte = PARTES[indiceActivo];

    // Los pasos tipo minijuego se activan desde el botón, no desde el canvas
    if (parte.tipo === 'minijuego') return;

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


        // [CAMBIO 12] QUITAR NARANJA Y PONER EN SIGUIENTE

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
            }, 900);
        }
        return;
    }

    const validos = parte.objetosGrupo ?? [parte.objeto];
    if (!validos.includes(nombreHit)) return;

    reproducirSonidoCorrecto();
    efectoClick(hits[0].object);

    if (parte.imagenesPantalla?.length) {
        const siguienteImg = indiceImagenActual + 1;
        if (siguienteImg < parte.imagenesPantalla.length) {
            indiceImagenActual = siguienteImg;
            cambiarImagenPantalla(parte.imagenesPantalla[siguienteImg]);

            const instruccionEl = document.getElementById('instruccionS5');
            if (instruccionEl && parte.instrucciones?.[siguienteImg]) {
                instruccionEl.textContent = parte.instrucciones[siguienteImg];
            }

            const esUltima = siguienteImg === parte.imagenesPantalla.length - 1;
            if (!esUltima) return;
        }
    }

    if (parte.video) {
        mostrarVideoPopup(parte, () => avanzarDespuesDeVideo(parte));
    } else {
        avanzarDespuesDeVideo(parte);
    }
}


/* =====================================================
   SONIDO DE ACIERTO
   ===================================================== */

function reproducirSonidoCorrecto() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.18);
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
        setTimeout(() => {
            objeto.scale.copy(escOrig);
            objeto.material.color.copy(colorOrig);
        }, 160);
    } else {
        setTimeout(() => objeto.scale.copy(escOrig), 160);
    }
}

function actualizarPantalla(angulo) {
    if (!modeloCargado) return;

    const modo = MODOS_PERILLA.reduce((prev, curr) =>
        Math.abs(curr.angulo - angulo) < Math.abs(prev.angulo - angulo) ? curr : prev
    );

    if (_modoActual === modo.nombre) return;
    _modoActual = modo.nombre;

    let pantalla = null;
    modeloCargado.traverse(o => { if (o.name === 'pantalla') pantalla = o; });
    if (!pantalla) return;

    if (!modo.imagen) {
        if (pantalla.material) {
            pantalla.material.map = null;
            pantalla.material.color.set(0x000000);
            pantalla.material.needsUpdate = true;
        }
        return;
    }

    if (_cachTexturas[modo.imagen]) {
        aplicarTexturaPantalla(pantalla, _cachTexturas[modo.imagen]);
    } else {
        new THREE.TextureLoader().load(modo.imagen, textura => {
            _cachTexturas[modo.imagen] = textura;
            aplicarTexturaPantalla(pantalla, textura);
        });
    }
}

function aplicarTexturaPantalla(pantalla, textura) {
    if (!pantalla.material) return;
    textura.wrapS = textura.wrapT = THREE.ClampToEdgeWrapping;
    textura.repeat.set(1, 1);
    textura.offset.set(0, 0);
    textura.flipY = false;
    textura.needsUpdate = true;

    const mats = Array.isArray(pantalla.material)
        ? pantalla.material : [pantalla.material];
    mats.forEach(mat => {
        mat.map = textura;
        mat.color.set(0xffffff);
        mat.needsUpdate = true;
    });
}

function cambiarImagenPantalla(rutaImagen) {
    if (!modeloCargado || !rutaImagen) return;
    let pantalla = null;
    modeloCargado.traverse(o => { if (o.name === 'pantalla') pantalla = o; });
    if (!pantalla) return;

    if (_cachTexturas[rutaImagen]) {
        aplicarTexturaPantalla(pantalla, _cachTexturas[rutaImagen]);
        return;
    }
    new THREE.TextureLoader().load(rutaImagen, textura => {
        _cachTexturas[rutaImagen] = textura;
        aplicarTexturaPantalla(pantalla, textura);
    });
}


/* =====================================================
   VIDEO POPUP
   ===================================================== */

function mostrarVideoPopup(parte, onTerminado) {
    panelAbierto = true;
    document.getElementById('videoPopupS5')?.remove();

    const contenedor = document.getElementById('areaThreeJs');
    const popup = document.createElement('div');
    popup.id = 'videoPopupS5';
    popup.style.cssText = `
        position:absolute;inset:0;
        background:rgba(0,0,0,0.88);
        display:flex;flex-direction:column;
        align-items:center;justify-content:center;
        z-index:20;font-family:'DM Sans',sans-serif;`;

    popup.innerHTML = `
        <div style="width:82%;max-width:720px;">
            <p style="color:white;font-size:0.85rem;font-weight:600;
                text-align:center;margin:0 0 12px;opacity:0.85;">
                Video complementario — debes verlo completo para continuar
            </p>
            <div style="position:relative;padding-bottom:56.25%;height:0;
                overflow:hidden;border-radius:12px;background:#000;">
                <iframe id="ytFramePopupS5"
                    src="${construirUrlVideo(parte)}"
                    style="position:absolute;top:0;left:0;
                           width:100%;height:100%;border:none;"
                    allowfullscreen>
                </iframe>
            </div>
            <p id="avisoPopupS5" style="
                color:#e05c3a;font-size:0.78rem;
                text-align:center;margin:10px 0 0;">
                El video debe terminar para continuar
            </p>
        </div>`;

    contenedor.appendChild(popup);
    setTimeout(() => iniciarYTPopupS5(onTerminado), 600);
}

function cerrarVideoPopup() {
    document.getElementById('videoPopupS5')?.remove();
    panelAbierto = false;
}

function iniciarYTPopupS5(onTerminado) {
    if (!document.getElementById('ytApiScript')) {
        const tag = document.createElement('script');
        tag.id = 'ytApiScript';
        tag.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(tag);
    }

    const activar = () => {
        const frame = document.getElementById('ytFramePopupS5');
        if (!frame || !window.YT?.Player) return;
        if (ytPlayer) { try { ytPlayer.destroy(); } catch { } ytPlayer = null; }

        ytPlayer = new YT.Player('ytFramePopupS5', {
            events: {
                onStateChange: e => {
                    if (e.data === YT.PlayerState.ENDED) {
                        document.getElementById('avisoPopupS5')?.remove();
                        setTimeout(() => {
                            cerrarVideoPopup();
                            if (ytPlayer) {
                                try { ytPlayer.destroy(); } catch { }
                                ytPlayer = null;
                            }
                            onTerminado?.();
                        }, 600);
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
    if (ytPlayer) {
        try { ytPlayer.stopVideo(); ytPlayer.destroy(); } catch { }
        ytPlayer = null;
    }
    document.getElementById('videoPopupS5')?.remove();
    document.getElementById('minijuegoPalasS5')?.remove();
    panelAbierto = false;
}