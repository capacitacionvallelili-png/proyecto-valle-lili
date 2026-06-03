import { inicializarEscena, cargarModelo, limpiarRenderer, THREE } from '../escena.js';

const MODOS_PERILLA = [
    { nombre: 'Manual', angulo: -1.57, imagen: '/Estudiante/threejs/img/manual.png' },
    { nombre: 'Monitor', angulo: -0.4, imagen: '/Estudiante/threejs/img/MODOMONITOR.png' },
    { nombre: 'Apagado', angulo: 0, imagen: '/Estudiante/threejs/img/negro.jpg' },
    { nombre: 'Marcapasos', angulo: 1, imagen: '/Estudiante/threejs/img/marcapasos.png' },
    { nombre: 'DEA', angulo: 2, imagen: '/Estudiante/threejs/img/DEA.png' },
];


// correcion 1
const TOLERANCIA_ANGULO_PERILLA = 0.45;

//correcion 2
const CAMARA_POSICION = { x: 0.6, y: 0.5, z: 1.5 };
const CAMARA_TARGET = { x:0.8, y: -0.5, z: 0 };


const PARTES = [
    {
        id: 'perilla',
        nombre: 'PASO 1: Encienda el equipo girando la  perilla principal hasta la opción CHEQUEO BÁSICO.',
        objeto: 'perilla',
        tipo: 'click',
        //camaraOffset: { x: 0, y: 0, z: 0.7 },
        instruccion: 'Haz click en la  perilla y giralo hasta chequeo básico',
        imagenesPantalla: [
            '/Estudiante/threejs/img/negro.jpg',
        ],
        pasos: [
            { objeto: 'perilla', imagen: '/Estudiante/threejs/img/nihon/chequeo_basico_inicio.png', instruccion: 'Haz click en la tecla OK' },

        ],
    },
    {
        id: 'Deriv',
        nombre: ' Presione el botón OK para iniciar la prueba. El equipo cargará hasta 270 Joules. Espere hasta que le indique Pulse la tecla DESCARGAR.',
        objeto: 'Deriv',
        tipo: 'click',
        //camaraOffset: { x: 0, y: 0.4, z: 0.7 },
        instruccion: 'Haz click en el botón de OK',
        imagenesPantalla: ["'/Estudiante/threejs/img/nihon/chequeo_basico_inicio.png'"],
        pasos: [

            { objeto: 'Deriv', imagen: '/Estudiante/threejs/img/nihon/chequeo_basico_carga_energia.png', instruccion: 'Haz click en la tecla OK' },

        ],
        //video: 'https://youtu.be/ApCi4gyqZ00'
    },
    {
        id: 'botonDer',
        nombre: 'Presione los botones de  DESCARGA cuando el equipo lo indique. El equipo continúa la prueba automáticamente. Por favor, espere.',
        objeto: 'botonDer',
        objetosGrupo: ["botonDer", "botonIzq"],
        tipo: 'click',
        camaraOffset: { x: 0, y: 0.3, z: -0.8 },
        instruccion: 'Haz click en el botón de OK',
        imagenesPantalla: [
            '/Estudiante/threejs/img/nihon/chequeo_basico_carga_energia.png',
        ],
        pasos: [
            { objeto: 'botonDer', imagen: '/Estudiante/threejs/img/nihon/chequeo_basico_comprobacion_registro.png', instruccion: 'Haz click en la tecla descargar' },

        ],
        //video: 'https://youtu.be/7NQLX7VeFvg',
    },
    {
        id: 'Deriv2',
        nombre: ' Cuando pregunte ¿Imprimió el registrador?, presione SÍ para imprimir el reporte.',
        objeto: 'Deriv',
        tipo: 'click',
        camaraOffset: { x: 0, y: 0.4, z: 0.7 },
        instruccion: "Haz click en el botón de OK",
        imagenesPantalla: [
            '/Estudiante/threejs/img/nihon/chequeo_basico_comprobacion_registro.png',
        ],
        pasos: [
            { objeto: 'Deriv', imagen: '/Estudiante/threejs/img/nihon/chequeo_basico_comprobacion_alarma.png', instruccion: 'Haz click en el boton de OK' },
        ],
        //video: 'https://youtu.be/H3menRYiJm8'
    },

    {
        id: 'prueba',
        nombre: 'Después le preguntará ¿Sonó la alarma?, presione SÍ o NO según corresponda, y este mismo paso con la comprobación de voz',
        objeto: 'Deriv',
        tipo: 'click',
        camaraOffset: { x: 0, y: 0.4, z: 0.7 },
        instruccion: "Haz click en el botón de OK",
        imagenesPantalla: [
            '/Estudiante/threejs/img/nihon/chequeo_basico_comprobacion_alarma.png',
        ],

        pasos: [
            { objeto: 'Deriv', imagen: '/Estudiante/threejs/img/nihon/chequeo_basico_comprobacion_voz.png', instruccion: 'Haz click en el boton de OK' },
            { objeto: 'Deriv', imagen: '/Estudiante/threejs/img/nihon/chequeo_basico_pacing_check.png', instruccion: 'Haz click en el boton de OK' },
            // { objeto: 'Deriv', imagen: '/Estudiante/threejs/img/nihon/chequeo_basico_comprobacion_completado.png', instruccion: 'Haz click en el boton de OK' },
        ],

    },

    {
        id: 'roscaa',
        nombre: 'Espere a que finalice la prueba por completo. Se imprimirá el reporte automáticamente. Luego, revise el papel impreso y pegue el papel en el cuaderno de control del equipo.',
        objeto: 'Deriv',
        tipo: 'click',
        camaraOffset: { x: 0, y: 0.4, z: 0.7 },
        pasos: [

            { objeto: 'Deriv', imagen: '/Estudiante/threejs/img/nihon/chequeo_basico_completado.png', instruccion: 'Haz click en el boton de OK' },
        ],
        //video: 'https://youtu.be/LZhibWQD-NY',

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

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();


/* =====================================================
   CICLO DE VIDA
   ===================================================== */

export function iniciarSeccion3(contenedorId) {
    destruirSeccion3();

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
    // [D] CONFIGURACIÓN DE CONTROLES
    // Pan habilitado, zoom limitado, velocidades reducidas.
    // Copia este bloque en cada sección tal cual.
    // ═══════════════════════════════════════════════════════════════
    controls.enablePan = true;
    controls.minDistance = 0.3;
    controls.maxDistance = 3.5;
    controls.zoomSpeed = 0.4;
    controls.rotateSpeed = 0.5;

    mostrarLoader(contenedorId);

    cargarModelo(
        '/Estudiante/threejs/modelados/nihonFinal2.glb',
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

export function destruirSeccion3() {
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
    document.getElementById('uiSeccionNihon3')?.remove();
    document.getElementById('loaderSeccionNihon3')?.remove();
    document.getElementById('checklistNihon3')?.remove();
    document.getElementById('videoPopupSNihon3')?.remove();

    //Correcion 6
    //document.getElementById('feedbackPerillaS5')?.remove(); // [G] limpiar feedback perilla

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
    document.getElementById('loaderSeccionNihon3')?.remove();

    const loader = document.createElement('div');
    loader.id = 'loaderSeccionNihon3';
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
    const loader = document.getElementById('loaderSeccionNihon3');
    if (!loader) return;
    loader.style.transition = 'opacity 0.4s';
    loader.style.opacity = '0';
    setTimeout(() => loader.remove(), 400);
}


/* =====================================================
   INTERFAZ PRINCIPAL
   ===================================================== */

function mostrarUI() {
    document.getElementById('uiSeccionNihon3')?.remove();
    const contenedor = document.getElementById('areaThreeJs');

    const ui = document.createElement('div');
    ui.id = 'uiSeccionNihon3';
    ui.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:hidden;';

    ui.innerHTML = `
        <div id="checklistSNihon3" style="
            position:absolute;top:16px;right:16px;width:350px;
            background:white;border-radius:12px;padding:14px;pointer-events:all;
            box-shadow:0 4px 20px rgba(0,0,0,0.12);font-family:'DM Sans',sans-serif;z-index:3;">
            <p style="font-size:0.78rem;font-weight:600;color:#1e5c3a;
                margin:0 0 10px;text-transform:uppercase;letter-spacing:0.05em;">
                Pasos para el chequeo básico
            </p>
            ${PARTES.map((parte, i) => `
                <div id="check-${parte.id}" style="
                    display:flex;align-items:center;gap:10px;
                    padding:4px;border-radius:8px;margin-bottom:4px;
                    background:${i === 0 ? '#e8f5ee' : 'transparent'};
                    border:1.5px solid ${i === 0 ? '#1e5c3a' : '#e0e6e0'};
                    transition:all 0.2s;cursor:pointer;pointer-events:all;"
                    onclick="window.irAParteSNihon3(${i})">
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
 
        <div id="instruccionSNihon3" style="
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
 
        <div id="panelLateralSNihon3" style="
            position:absolute;top:0;left:-320px;bottom:0;width:300px;
            background:white;box-shadow:4px 0 20px rgba(0,0,0,0.12);
            padding:20px;pointer-events:all;overflow-y:auto;
            transition:left 0.35s cubic-bezier(0.16,1,0.3,1);
            font-family:'DM Sans',sans-serif;font-size:0.88rem;
            line-height:1.6;color:#1a2e1f;z-index:5;">
            <div style="display:flex;align-items:center;
                justify-content:space-between;margin-bottom:16px;">
                <h4 style="font-size:1rem;color:#1e5c3a;margin:0;">Chequeo Básico</h4>
                <button onclick="window.togglePanelSNihon3()" style="
                    background:none;border:none;cursor:pointer;
                    color:#5a7a62;font-size:1.2rem;padding:4px;">✕</button>
            </div>
            <p style="margin:0 0 12px;">
               La Prueba de Usuario (Chequeo Básico) es una rutina de verificación interna del equipo que comprueba de forma automática que todos sus sistemas funcionan correctamente, incluyendo la carga, la descarga, la impresora, la alarma y el marcapasos, generando al final un reporte impreso que debe archivarse. 
IMPORTANTE: Si el papel aparece con la cuadrícula hacia abajo, el papel está mal puesto. Ábralo deslizando el botón del compartimento y reintrodúzcalo con la cuadrícula hacia arriba.
            </p>
        </div>
 
        <div id="overlayPanelS3" onclick="window.togglePanelSNihon3()" style="
            position:absolute;inset:0;background:rgba(0,0,0,0.2);
            pointer-events:none;opacity:0;transition:opacity 0.35s;z-index:4;">
        </div>
 
        <button onclick="window.togglePanelSNihon3()" style="
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
    indiceActivo = indice;
    indiceImagenActual = 0;
    const parte = PARTES[indice];

    // Instrucción: usa la del primer paso si tiene pasos, sino la de la parte
    const instruccionTexto = parte.pasos?.[0]?.instruccion
        ?? parte.instrucciones?.[0]
        ?? parte.instruccion;
    const instruccionEl = document.getElementById('instruccionSNihon3');
    if (instruccionEl) instruccionEl.textContent = instruccionTexto;

    const primerObjeto = parte.pasos?.[0]?.objeto ?? parte.objeto;

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

    // correcion 8
    // ═══════════════════════════════════════════════════════════════
    // [I] BLOQUEO DE ÓRBITA Y FEEDBACK DE PERILLA
    // Si el paso es tipo 'rotar': bloquea la órbita y muestra el
    // indicador "modo actual → modo objetivo".
    // Copia este if/else en cada sección.
    // ═══════════════════════════════════════════════════════════════
    if (parte.tipo === 'rotar') {
        controls.enableRotate = false;
        controls.enablePan = false;
       // mostrarFeedbackPerilla(parte); // muestra el indicador solo si hay anguloObjetivo
    } else {
        controls.enableRotate = true;
        controls.enablePan = true;
    }

      // parte corregida
    if (parte.imagenesPantalla?.length) {
        cambiarImagenPantalla(parte.imagenesPantalla[0]);
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
    if (controls) controls.enableRotate = true;
    const instruccion = document.getElementById('instruccionSNihon3');
    if (instruccion) instruccion.textContent = 'Prueba de chequeo básico completada, selecciona de nuevo un paso de la lista para recordar';
}

function todasCompletadas() {
    const cs = document.getElementById('contenedorSenales');
    if (cs) cs.innerHTML = '';
    window._senalObjeto = null;

    const instruccion = document.getElementById('instruccionSNihon3');
    if (instruccion) instruccion.textContent = '¡Prueba de chequeo básico completada!';

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

window.irAParteSNihon3 = function (indice) {
    const icon = document.getElementById(`icon-${PARTES[indice].id}`);
    if (indice > indiceActivo && icon?.innerHTML !== '✓') return;
    activarParte(indice);
};


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

window.togglePanelSNihon3 = function () {
    const panel = document.getElementById('panelLateralSNihon3');
    const overlay = document.getElementById('overlayPanelSNihon3');
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
    objetoRotando = null;
    renderer.domElement.style.cursor = 'default';

    const parte = PARTES[indiceActivo];
    if (parte.tipo !== 'rotar' || panelAbierto) return;

    reproducirSonidoCorrecto();

    if (parte.video) {
        mostrarVideoPopup(parte, () => avanzarDespuesDeVideo(parte));
    } else {
        avanzarDespuesDeVideo(parte);
    }
}

function onClickCanvas(event) {
    if (!modeloCargado || rotandoObjeto || panelAbierto) return;

    const hits = getMeshesYHits(event);
    if (!hits.length) return;

    const parte = PARTES[indiceActivo];
    const nombreHit = hits[0].object.name;

    // ===== Pasos en orden estricto =====
    if (parte.pasos?.length) {
        const pasoActual = parte.pasos[indiceImagenActual];
        if (nombreHit !== pasoActual.objeto) return;

        reproducirSonidoCorrecto();
        efectoClick(hits[0].object);

        // Primero muestra la imagen del paso actual
        if (pasoActual.imagen) cambiarImagenPantalla(pasoActual.imagen);

        const siguientePaso = indiceImagenActual + 1;

        if (siguientePaso < parte.pasos.length) {
            // Hay más pasos — avanza el índice y actualiza señal e instrucción
            indiceImagenActual = siguientePaso;
            const proxPaso = parte.pasos[siguientePaso];

            const instruccionEl = document.getElementById('instruccionSNihon4');
            if (instruccionEl) instruccionEl.textContent = proxPaso.instruccion ?? parte.instruccion;

            crearSenal(proxPaso.objeto);
            window._senalObjeto = proxPaso.objeto;

        } else {
            // Último paso — espera un momento para que se vea la imagen y completa
            setTimeout(() => {
                if (parte.video) {
                    mostrarVideoPopup(parte, () => avanzarDespuesDeVideo(parte));
                } else {
                    avanzarDespuesDeVideo(parte);
                }
            }, 1000);
        }
        return;
    }

    // ===== Partes sin pasos (imagenesPantalla u objeto simple) =====
    const validos = parte.objetosGrupo ?? [parte.objeto];
    if (!validos.includes(nombreHit)) return;

    reproducirSonidoCorrecto();
    efectoClick(hits[0].object);

    if (parte.imagenesPantalla?.length) {
        const siguienteImg = indiceImagenActual + 1;
        if (siguienteImg < parte.imagenesPantalla.length) {
            indiceImagenActual = siguienteImg;
            cambiarImagenPantalla(parte.imagenesPantalla[siguienteImg]);

            // Instrucción personalizada si tiene instrucciones por índice
            const instruccionEl = document.getElementById('instruccionSNihon3');
            if (instruccionEl && parte.instrucciones?.[siguienteImg]) {
                instruccionEl.textContent = parte.instrucciones[siguienteImg];
            }

            // Si es la última imagen completa en este mismo click
            const esUltima = siguienteImg === parte.imagenesPantalla.length - 1;
            if (!esUltima) return;
        }
    }

    // Completa la parte
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

    const mats = Array.isArray(pantalla.material) ? pantalla.material : [pantalla.material];
    mats.forEach(mat => {
        mat.map = textura;
        mat.color.set(0xffffff);
        mat.needsUpdate = true;
    });
}

function cambiarImagenPantalla(rutaImagen) {
    if (!modeloCargado || !rutaImagen) return;
    let pantalla = null;
    modeloCargado.traverse(o => { if (o.name === 'pantalla001') pantalla = o; });
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
    document.getElementById('videoPopupSNihon3')?.remove();

    const contenedor = document.getElementById('areaThreeJs');
    const popup = document.createElement('div');
    popup.id = 'videoPopupSNihon3';
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
                <iframe id="ytFramePopupSNihon3"
                    src="${construirUrlVideo(parte)}"
                    style="position:absolute;top:0;left:0;
                           width:100%;height:100%;border:none;"
                    allowfullscreen>
                </iframe>
            </div>
            <p id="avisoPopupSNihon3" style="
                color:#e05c3a;font-size:0.78rem;
                text-align:center;margin:10px 0 0;">
                ⚠️ El video debe terminar para continuar
            </p>
        </div>`;

    contenedor.appendChild(popup);
    setTimeout(() => iniciarYTPopupSNihon3(onTerminado), 600);
}

function cerrarVideoPopup() {
    document.getElementById('videoPopupSNihon3')?.remove();
    panelAbierto = false;
}

function iniciarYTPopupSNihon3(onTerminado) {
    if (!document.getElementById('ytApiScript')) {
        const tag = document.createElement('script');
        tag.id = 'ytApiScript';
        tag.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(tag);
    }

    const activar = () => {
        const frame = document.getElementById('ytFramePopupSNihon3');
        if (!frame || !window.YT?.Player) return;
        if (ytPlayer) { try { ytPlayer.destroy(); } catch { } ytPlayer = null; }

        ytPlayer = new YT.Player('ytFramePopupSNihon3', {
            events: {
                onStateChange: e => {
                    if (e.data === YT.PlayerState.ENDED) {
                        document.getElementById('avisoPopupSNihon3')?.remove();
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
    document.getElementById('videoPopupSNihon3')?.remove();
    panelAbierto = false;
}