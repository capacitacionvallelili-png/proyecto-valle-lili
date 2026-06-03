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


const PARTES = [
    {
        id: 'perilla',
        nombre: 'Gire la perilla de selección hasta la posición MARCAP. El equipo entra automáticamente en Modo a demanda.',
        objeto: 'perilla001',
        // Correcion 3
        anguloObjetivo: 'Marcapasos',
        tipo: 'rotar',
        camaraOffset: { x: 0, y: -0.1, z: 0.8 },
        instruccion: "Gira la perilla hasta el modo marcapasos"

    },
    // ─── PASO CON MINIJUEGO DE ELECTRODOS ───────────────────────────────────

    {
        id: 'selector',
        nombre: 'Solo si el médico indica Modo fijo: En la pantalla, ubique la opción Modo Marcap. Gire la perilla de navegación hasta seleccionar [Modo fijo] y presiónela para confirmar. Si no se indica, continúe al siguiente paso el equipo ya está en Modo a demanda.',
        objeto: 'selector',
        tipo: 'click',
        //camaraOffset: { x: 0, y: 0, z: 0.9 },
        instruccion: 'Si recibe la indicación del medico gira la perilla de navegación'

    },
    {
        id: 'selector1',
        nombre: 'Observe la pantalla. Verá el trazado de ECG. Gire la perilla de navegación para seleccionar una derivada donde la onda R se vea claramente.',
        objeto: 'selector',
        tipo: 'click',
       // camaraOffset: { x: 0, y: 0, z: 0.9 },
        objeto: 'selector', imagen: '/Estudiante/threejs/img/marcapasos.png', instruccion: 'Gire la perilla para seleccionar una derivada donde se vea bien la onda'

    },
    {
        id: 'selector2',
        nombre: 'Verifique que aparecen marcadores blancos sobre cada onda R en el trazado. Si los marcadores no coinciden con las ondas R o aparecen en otro lugar, seleccione una derivada diferente.',
        objeto: 'selector',
        tipo: 'click',
        //camaraOffset: { x: 0, y: 0, z: 0.9 },
        pasos: [
            { objeto: 'selector', imagen: '/Estudiante/threejs/img/marcapasos.png', instruccion: 'Seleccione otra derivada diferente' },

        ],
        //video: 'https://youtu.be/pIyeGQ2r87Y',
    },
    {
        id: 'selector3',
        nombre: 'Gire la perilla de navegación para ajustar la frecuencia del marcapasos al valor indicado por el médico',
        objeto: 'selector',
        tipo: 'click',
        //camaraOffset: { x: 0, y: 0, z: 0.9 },
        pasos: [
            { objeto: 'selector', imagen: '/Estudiante/threejs/img/marcapasos.png', instruccion: 'Seleccione otra derivada diferente' },

        ],
        //video: 'https://youtu.be/pIyeGQ2r87Y',
    },

    {
        id: 'selector4',
        nombre: 'Presione el botón de pantalla [Inic estim] para iniciar la estimulación. La pantalla mostrará el mensaje "Estimulac".',
        objeto: 'selector',
        tipo: 'click',
       // camaraOffset: { x: 0, y: 0, z: 0.9 },
        pasos: [
            { objeto: 'selector', imagen: '/Estudiante/threejs/img/marcapasos.png', instruccion: 'Presione el botón de pantalla' },

        ],
        //video: 'https://youtu.be/pIyeGQ2r87Y',
    },



];


/* =====================================================
   CONFIGURACIÓN DEL MINIJUEGO DE ELECTRODOS
   ===================================================== */
const ELECTRODOS_CONFIG = [
    {
        id: 'R',
        label: 'R',
        desc: 'R',
        color: '#e24b4a',
        targetPctX: 38.5,
        targetPctY: 26.2,
        radius: 27,
    },
    {
        id: 'L',
        label: 'L',
        desc: 'L',
        color: '#ba7517',
        targetPctX: 61.6,
        targetPctY: 26.2,
        radius: 27,
    },
    {
        id: 'F',
        label: 'F',
        desc: 'F',
        color: '#1d9e75',
        targetPctX: 61.5,
        targetPctY: 68.1,
        radius: 27,
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

export function iniciarSeccion7(contenedorId) {
    destruirSeccion7();

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

export function destruirSeccion7() {
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
    document.getElementById('uiSeccion7')?.remove();
    document.getElementById('loaderSeccion7')?.remove();
    document.getElementById('checklistS7')?.remove();
    document.getElementById('videoPopupS7')?.remove();
    document.getElementById('minijuegoElectrodosS7')?.remove();

    //Correcion 6
    document.getElementById('feedbackPerillaS7')?.remove(); // [G] limpiar feedback perilla

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
    document.getElementById('loaderSeccion7')?.remove();

    const loader = document.createElement('div');
    loader.id = 'loaderSeccion7';
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
    const loader = document.getElementById('loaderSeccion7');
    if (!loader) return;
    loader.style.transition = 'opacity 0.4s';
    loader.style.opacity = '0';
    setTimeout(() => loader.remove(), 400);
}


/* =====================================================
   INTERFAZ PRINCIPAL
   ===================================================== */

function mostrarUI() {
    document.getElementById('uiSeccion7')?.remove();
    const contenedor = document.getElementById('areaThreeJs');

    const ui = document.createElement('div');
    ui.id = 'uiSeccion7';
    ui.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:hidden;';

    ui.innerHTML = `
        <div id="checklistS7" style="
            position:absolute;top:16px;right:16px;width:410px;
            background:white;border-radius:12px;padding:14px;pointer-events:all;
            box-shadow:0 4px 20px rgba(0,0,0,0.12);font-family:'DM Sans',sans-serif;z-index:3;">
            <p style="font-size:0.78rem;font-weight:600;color:#1e5c3a;
                margin:0 0 10px;text-transform:uppercase;letter-spacing:0.05em;">
                Pasos para el modo marcapasos
            </p>
            ${PARTES.map((parte, i) => `
                <div id="check-${parte.id}" style="
                    display:flex;align-items:center;gap:10px;
                    padding:4px;border-radius:8px;margin-bottom:4px;
                    background:${i === 0 ? '#e8f5ee' : 'transparent'};
                    border:1.5px solid ${i === 0 ? '#1e5c3a' : '#e0e6e0'};
                    transition:all 0.2s;cursor:pointer;pointer-events:all;"
                    onclick="window.irAParteS7(${i})">
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

        <div id="instruccionS7" style="
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

        <div id="panelLateralS7" style="
            position:absolute;top:0;left:-320px;bottom:0;width:300px;
            background:white;box-shadow:4px 0 20px rgba(0,0,0,0.12);
            padding:20px;pointer-events:all;overflow-y:auto;
            transition:left 0.35s cubic-bezier(0.16,1,0.3,1);
            font-family:'DM Sans',sans-serif;font-size:0.88rem;
            line-height:1.6;color:#1a2e1f;z-index:5;">
            <div style="display:flex;align-items:center;
                justify-content:space-between;margin-bottom:16px;">
                <h4 style="font-size:1rem;color:#1e5c3a;margin:0;">Marcapasos</h4>
                <button onclick="window.togglePanelS7()" style="
                    background:none;border:none;cursor:pointer;
                    color:#5a7a62;font-size:1.2rem;padding:4px;">✕</button>
            </div>
            <p style="margin:0 0 12px;">
               El modo marcapasos del Mindray BeneHeart D6 permite enviar impulsos eléctricos al corazón para mantener una 
               frecuencia cardíaca adecuada cuando el paciente presenta ritmos lentos o inestables. Puede funcionar en 
               modo a demanda, donde solo estimula si la frecuencia del paciente baja del valor programado, o en modo fijo,
                donde administra impulsos de manera continua a una frecuencia establecida.
            </p>
        </div>

        <div id="overlayPanelS7" onclick="window.togglePanelS7()" style="
            position:absolute;inset:0;background:rgba(0,0,0,0.2);
            pointer-events:none;opacity:0;transition:opacity 0.35s;z-index:4;">
        </div>

        <button onclick="window.togglePanelS7()" style="
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

    const instruccionTexto = parte.pasos?.[0]?.instruccion
        ?? parte.instrucciones?.[0]
        ?? parte.instruccion;
    const instruccionEl = document.getElementById('instruccionS7');
    if (instruccionEl) instruccionEl.textContent = instruccionTexto;

    // Si es minijuego: mostrar botón de inicio, NO lanzar overlay directo
    if (parte.tipo === 'minijuego') {
        actualizarChecklist();
        const cs = document.getElementById('contenedorSenales');
        if (cs) cs.innerHTML = '';
        window._senalObjeto = null;
        if (controls) controls.enableRotate = true;

        const instrEl = document.getElementById('instruccionS7');
        if (instrEl) {
            instrEl.style.whiteSpace = 'normal';
            instrEl.style.pointerEvents = 'all';
            instrEl.innerHTML = `
                <span style="color:#5a7a62;margin-right:10px;">
                    Para conectar los electrodos al paciente dale al botón de iniciar
                </span>
                <button
                    onclick="window._lanzarMinijuegoS7()"
                    style="background:#1e5c3a;color:white;border:none;
                        padding:5px 14px;border-radius:16px;font-size:0.78rem;
                        font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;">
                    Iniciar
                </button>`;
        }

        window._lanzarMinijuegoS7 = () => {
            mostrarMinijuegoElectrodos(parte, () => avanzarDespuesDeVideo(parte));
        };
        return;
    }

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


    crearSenal(primerObjeto);
    actualizarChecklist();

    if (parte.pasos?.[0]?.imagen) {
        cambiarImagenPantalla(parte.pasos[0].imagen);
    } else if (parte.imagenesPantalla?.length) {
        cambiarImagenPantalla(parte.imagenesPantalla[0]);
    }

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
        mostrarFeedbackPerilla(parte); // muestra el indicador solo si hay anguloObjetivo
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
    const instruccion = document.getElementById('instruccionS7');
    if (instruccion) instruccion.textContent = 'Marcapasos completado, selecciona de nuevo un paso de la lista y recuerda';
}

function todasCompletadas() {
    const cs = document.getElementById('contenedorSenales');
    if (cs) cs.innerHTML = '';
    window._senalObjeto = null;

    const instruccion = document.getElementById('instruccionS7');
    if (instruccion) instruccion.textContent = 'Marcapasos completado!';

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

window.irAParteS7 = function (indice) {
    const icon = document.getElementById(`icon-${PARTES[indice].id}`);
    if (indice > indiceActivo && icon?.innerHTML !== '✓') return;
    activarParte(indice);
};


/* =====================================================
   MINIJUEGO DE ELECTRODOS
   ===================================================== */

function mostrarMinijuegoElectrodos(parte, onCompletado) {
    panelAbierto = true;
    document.getElementById('minijuegoElectrodosS7')?.remove();

    // Keyframes — solo se insertan una vez en el documento
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
    overlay.id = 'minijuegoElectrodosS7';
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

            <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                <div>
                    <p style="margin:0;font-size:0.9rem;font-weight:600;color:#1e5c3a;">
                        Coloca los electrodos
                    </p>
                    <p style="margin:4px 0 0;font-size:0.78rem;color:#5a7a62;">
                        Arrastra cada electrodo al punto correcto del cuerpo del paciente
                    </p>
                </div>
                <span id="contadorElectrodos" style="
                    font-size:0.75rem;color:#9ab0a0;
                    background:#f0f5f0;padding:4px 10px;
                    border-radius:20px;">0 / ${ELECTRODOS_CONFIG.length}</span>
            </div>

            <div style="display:flex;gap:24px;align-items:flex-start;flex-wrap:wrap;">

                <div style="display:flex;flex-direction:column;gap:6px;min-width:80px;">
                    <p style="margin:0 0 4px;font-size:0.72rem;color:#9ab0a0;
                        text-transform:uppercase;letter-spacing:0.05em;">Electrodos</p>
                    <div id="bandejaElectrodos" style="
                        display:flex;flex-direction:column;gap:10px;
                        padding:10px;
                        background:#f5f8f5;
                        border:1.5px dashed #c8d8c8;
                        border-radius:10px;
                        min-height:60px;
                        align-items:center;">
                    </div>
                </div>

                <div style="position:relative;flex:1;min-width:220px;">
                    <img
                        id="torsoImg"
                        src="/Estudiante/threejs/img/torso.png"
                        draggable="false"
                        style="width:100%;max-width:550px;display:block;
                            border-radius:10px;user-select:none;pointer-events:none;">
                    <div id="zonasDrop" style="position:absolute;inset:0;"></div>
                    <div id="electrodosColocados" style="position:absolute;inset:0;pointer-events:none;"></div>
                </div>
            </div>

            <div id="feedbackElectrodos" style="
                min-height:22px;font-size:0.8rem;
                text-align:center;color:#5a7a62;
                transition:color 0.2s;"></div>

            <div id="wrapContinuarElectrodos" style="display:none;justify-content:center;">
                <button id="btnContinuarElectrodos" style="
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

    // ── Helper: bandeja de electrodos ──
    function renderBandeja() {
        const bandeja = document.getElementById('bandejaElectrodos');
        if (!bandeja) return;
        bandeja.innerHTML = '';
        ELECTRODOS_CONFIG.forEach(e => {
            if (mjState.colocados[e.id]) return;
            const el = document.createElement('div');
            el.dataset.eid = e.id;
            el.style.cssText = `
                width:46px;height:46px;border-radius:50%;
                background:${e.color};
                color:white;font-weight:700;font-size:14px;
                display:flex;align-items:center;justify-content:center;
                cursor:grab;user-select:none;
                border:2.5px solid rgba(255,255,255,0.5);
                box-shadow:0 2px 6px rgba(0,0,0,0.18);`;
            el.title = e.desc;
            el.textContent = e.label;
            bandeja.appendChild(el);
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
                border:2px dashed ${e.color};
                background:${e.color}18;
                display:flex;align-items:center;justify-content:center;
                font-size:11px;color:${e.color};font-weight:700;
                pointer-events:none;
                animation:pulsarZona 1.6s ease-in-out infinite;`;
            zona.textContent = e.label;
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

    // Inicializar bandeja y zonas
    renderBandeja();
    const imgEl = document.getElementById('torsoImg');
    if (imgEl.complete && imgEl.naturalWidth > 0) {
        renderZonas();
    } else {
        imgEl.addEventListener('load', renderZonas, { once: true });
    }
    const ro = new ResizeObserver(renderZonas);
    ro.observe(imgEl);

    // Botón continuar
    document.getElementById('btnContinuarElectrodos').addEventListener('click', () => {
        ro.disconnect();
        cerrarMinijuego();
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
        const edata = ELECTRODOS_CONFIG.find(e => e.id === eid);

        ghost = document.createElement('div');
        ghost.style.cssText = `
            position:fixed;
            width:46px;height:46px;border-radius:50%;
            background:${edata.color};
            color:white;font-weight:700;font-size:14px;
            display:flex;align-items:center;justify-content:center;
            pointer-events:none;z-index:9999;opacity:0.92;
            border:2.5px solid rgba(255,255,255,0.7);
            transform:translate(-50%,-50%);
            box-shadow:0 4px 12px rgba(0,0,0,0.25);`;
        ghost.textContent = edata.label;
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
        const edata = ELECTRODOS_CONFIG.find(e => e.id === eid);

        // Posición del drop como porcentaje de la imagen
        const img = document.getElementById('torsoImg');
        const rect = img.getBoundingClientRect();
        const pctX = ((cx - rect.left) / rect.width) * 100;
        const pctY = ((cy - rect.top) / rect.height) * 100;

        // Convertir radius a % para comparar en la misma unidad
        const rPctX = (edata.radius / rect.width) * 100;
        const rPctY = (edata.radius / rect.height) * 100;

        const dx = (pctX - edata.targetPctX) / rPctX;
        const dy = (pctY - edata.targetPctY) / rPctY;
        const dist = Math.sqrt(dx * dx + dy * dy); // < 1 = dentro del círculo

        const feedback = document.getElementById('feedbackElectrodos');

        if (dist <= 1) {
            mjState.colocados[eid] = true;
            reproducirSonidoCorrecto();
            colocarElectrodo(edata);
            feedback.style.color = '#1e5c3a';
            feedback.textContent = `${edata.desc} — posición correcta`;

            const total = ELECTRODOS_CONFIG.length;
            const hechos = Object.keys(mjState.colocados).length;
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
            feedback.textContent = `Posición incorrecta para ${edata.label},  inténtalo de nuevo`;
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

function cerrarMinijuego() {
    document.getElementById('minijuegoElectrodosS7')?.remove();
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
    document.getElementById('feedbackPerillaS7')?.remove();
    if (!parte.anguloObjetivo) return;

    const contenedor = document.getElementById('areaThreeJs');
    const div = document.createElement('div');
    div.id = 'feedbackPerillaS7';
    contenedor.appendChild(div);
}

// ═══════════════════════════════════════════════════════════════════
// [K] actualizarFeedbackPerilla — actualiza el modo mostrado mientras se gira.
// Se llama desde onMouseMove. Cambia el ID del elemento en cada sección.
// ═══════════════════════════════════════════════════════════════════
function actualizarFeedbackPerilla(modoActualNombre) {
    const el = document.getElementById('feedbackModoActualS7');
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

window.togglePanelS7 = function () {
    const panel = document.getElementById('panelLateralS7');
    const overlay = document.getElementById('overlayPanelS7');
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
    const objRotado = objetoRotando;;
    renderer.domElement.style.cursor = 'default';

    const parte = PARTES[indiceActivo];
    if (parte.tipo !== 'rotar' || panelAbierto) return;

    //correcion 11
    // ═══════════════════════════════════════════════════════════════
    if (parte.anguloObjetivo && objRotado) {
        const modoObjetivo = MODOS_PERILLA.find(m => m.nombre === parte.anguloObjetivo);
        if (!modoObjetivo) {
            console.warn(`[seccion4] anguloObjetivo "${parte.anguloObjetivo}" no existe en MODOS_PERILLA`);
        } else {
            const diferencia = Math.abs(objRotado.rotation.x - modoObjetivo.angulo);
            if (diferencia > TOLERANCIA_ANGULO_PERILLA) {
                mostrarToastPerilla(`Gira hacia  "${parte.anguloObjetivo}"`, false);
                controls.enableRotate = false; // sigue bloqueado para reintentar
                return;
            }
        }
    }

    // Ángulo correcto (o sin restricción) → completar
    mostrarToastPerilla(
        parte.anguloObjetivo ? `¡Modo  ${parte.anguloObjetivo} alcanzado!` : '¡Listo!',
        true
    );
    document.getElementById('feedbackPerillaS7')?.remove();
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
    document.getElementById('toastPerillaS7')?.remove();
    const contenedor = document.getElementById('areaThreeJs');
    const toast = document.createElement('div');
    toast.id = 'toastPerillaS7';
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

    const nombreHit = hits[0].object.name;

    if (parte.pasos?.length) {
        const pasoActual = parte.pasos[indiceImagenActual];
        if (nombreHit !== pasoActual.objeto) return;

        reproducirSonidoCorrecto();
        efectoClick(hits[0].object);

        const siguientePaso = indiceImagenActual + 1;

        if (siguientePaso < parte.pasos.length) {
            indiceImagenActual = siguientePaso;
            const proxPaso = parte.pasos[siguientePaso];

            if (proxPaso.imagen) cambiarImagenPantalla(proxPaso.imagen);

            const instruccionEl = document.getElementById('instruccionS7');
            if (instruccionEl) instruccionEl.textContent = proxPaso.instruccion ?? parte.instruccion;

            crearSenal(proxPaso.objeto);
            window._senalObjeto = proxPaso.objeto;

        } else {
            if (parte.video) {
                mostrarVideoPopup(parte, () => avanzarDespuesDeVideo(parte));
            } else {
                avanzarDespuesDeVideo(parte);
            }
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

            const instruccionEl = document.getElementById('instruccionS7');
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
    document.getElementById('videoPopupS7')?.remove();

    const contenedor = document.getElementById('areaThreeJs');
    const popup = document.createElement('div');
    popup.id = 'videoPopupS7';
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
                <iframe id="ytFramePopupS7"
                    src="${construirUrlVideo(parte)}"
                    style="position:absolute;top:0;left:0;
                           width:100%;height:100%;border:none;"
                    allowfullscreen>
                </iframe>
            </div>
            <p id="avisoPopupS7" style="
                color:#e05c3a;font-size:0.78rem;
                text-align:center;margin:10px 0 0;">
                El video debe terminar para continuar
            </p>
        </div>`;

    contenedor.appendChild(popup);
    setTimeout(() => iniciarYTPopupS7(onTerminado), 600);
}

function cerrarVideoPopup() {
    document.getElementById('videoPopupS7')?.remove();
    panelAbierto = false;
}

function iniciarYTPopupS7(onTerminado) {
    if (!document.getElementById('ytApiScript')) {
        const tag = document.createElement('script');
        tag.id = 'ytApiScript';
        tag.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(tag);
    }

    const activar = () => {
        const frame = document.getElementById('ytFramePopupS7');
        if (!frame || !window.YT?.Player) return;
        if (ytPlayer) { try { ytPlayer.destroy(); } catch { } ytPlayer = null; }

        ytPlayer = new YT.Player('ytFramePopupS7', {
            events: {
                onStateChange: e => {
                    if (e.data === YT.PlayerState.ENDED) {
                        document.getElementById('avisoPopupS7')?.remove();
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
    document.getElementById('videoPopupS7')?.remove();
    document.getElementById('minijuegoElectrodosS7')?.remove();
    panelAbierto = false;
}