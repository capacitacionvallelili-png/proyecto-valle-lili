/* =====================================================
   evaluacion.js — Evaluación Nihon Koden
   ===================================================== */

import { inicializarEscena, cargarModelo, limpiarRenderer, THREE } from '../escena.js';

const API     = 'http://localhost:8080/Vallelili';
const TOKEN   = localStorage.getItem('token');
const HEADERS = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TOKEN}` };

/* ─── Nombres legibles ─── */
const NOMBRES_LEGIBLES = {
    'botonDer':      'Botón descarga pala derecha',
    'botonpala':     'Botón de carga pala',
    'palasAdultoDer':'Palas adulto derecha',
    'BotonIzq':      'Botón descarga pala izquierda',
    'PalasAdultoIzq':'Palas adulto izquierda',
    'carga':         'Botón de carga',
    'sinc':          'Botón sincrónico',
    'botones007':    'Botón panel',
    'botones006':    'Botón panel',
    'Deriv':         'Botón DERI',
    'Sensibilidad':  'Selector de sensibilidad',
    'alarma':        'Botón alarma',
    'configurar':    'Botón configurar',
    'perilla':       'Perilla principal',
    'botones':       'Botones panel',
    'Impresora':     'Impresora',
    'EKG':           'Conector EKG',
};

// Respuestas correctas por pregunta 3D
const CORRECTOS_P1 = new Set(['Deriv']);
const CORRECTOS_P3 = new Set(['sinc']);

// Textura inicial según índice de pregunta
const TEXTURAS_INICIALES = {
    0: '/Estudiante/threejs/img/nihon/modo_monitor_palas.png',
    2: '/Estudiante/threejs/img/nihon/cardioversion_desactivada_electrodos_puestos.png',
};

/* ─── Pregunta 2 ─── */
const TARJETAS_P2 = [
    { id: 1, texto: 'Retirar el juego de palas externas del equipo',                              orden_correcto: 1 },
    { id: 2, texto: 'Conectar las palas internas (cable hacia fuera, insertar hasta que haga click)', orden_correcto: 2 },
    { id: 3, texto: 'Seleccionar la energía de 50 Joules o menos y cargar el equipo',             orden_correcto: 3 },
    { id: 4, texto: 'Presionar el botón 3 del panel frontal para ejecutar la descarga',            orden_correcto: 4 },
];

/* ─── Pregunta 4 ─── */
const TARJETAS_P4 = [
    { id: 'activar',    texto: 'Activar el modo sincrónico antes de cargar',                                         color: '#4a90d9', bg: '#e8f0fb', columna_correcta: 'sincronica'  },
    { id: 'QRS',        texto: 'El equipo espera el complejo QRS del paciente para sincronizar y disparar',          color: '#1e5c3a', bg: '#e8f5ee', columna_correcta: 'sincronica'  },
    { id: 'marcapasos', texto: 'Detener la terapia de marcapasos y girar la perilla a los joules indicados',        color: '#b8860b', bg: '#fff8e1', columna_correcta: 'asincronica' },
    { id: 'sincronico', texto: 'Cargar el equipo y presionar directamente el botón 3 para la descarga',             color: '#9c65b0', bg: '#f3eafb', columna_correcta: 'asincronica' },
];

/* ─── Pregunta 5 ─── */
const OPCIONES_P5 = [
    { id: 'A', tipo: 'seleccion', texto: 'El operador debe elegir el Botón 3',    color: '#c0392b', bg: '#fef0ed', correcta: false },
    { id: 'B', tipo: 'seleccion', texto: 'El operador debe elegir Botón 2',    color: '#1e5c3a', bg: '#e8f5ee', correcta: true  },
    { id: 'C', tipo: 'seleccion', texto: 'El operador debe elegir DERI',       color: '#4a90d9', bg: '#e8f0fb', correcta: false  },
    { id: 'D', tipo: 'seleccion', texto: 'El operador debe elegir Desactivar', color: '#b8860b', bg: '#fff8e1', correcta: false },
];

const PREGUNTAS = [
    {
        num: 1,
        tipo: '3d_click',
        enunciado: 'Durante una desfibrilación manual con palas, el operador ya seleccionó el nivel de energía. ¿De qué forma(s) puede iniciar la carga del equipo? ',
        instruccion: 'Selecciona la respuesta directamente en el modelado',
    },
    {
        num: 2,
        tipo: 'ordenar',
        enunciado: 'Ordena los pasos del procedimiento para usar las palas internas del Nihon Kohden TEC-5531 en cirugía cardiovascular',
    },
    {
        num: 3,
        tipo: '3d_click',
        enunciado: 'Tras realizar una primera cardioversión en modo sincrónico con el Nihon Kohden, el médico solicita una segunda descarga. El operador carga energía inmediatamente y presiona los botones de descarga, pero el equipo no dispara. ¿Cuál es el error cometido?',
        instruccion: 'Selecciona el botón correcto directamente en el modelado',
    },
    {
        num: 4,
        tipo: 'columnas',
        enunciado: 'Con el Desfibrilador Nihon Kohden en terapia de marcapasos y electrodos desechables conectados, el paciente presenta fibrilación ventricular. Clasifica cada acción según el modo al que pertenece.',
    },
    {
        num: 5,
        tipo: 'seleccion_multiple',
        enunciado: 'El Nihon Kohden TEC-5531 tiene seleccionados 100 joules para desfibrilación manual. El operador debe iniciar la carga del equipo antes de la descarga. Selecciona el botón correcto del panel para ejecutar ese paso.',
    },
];

const RETROALIMENTACION = {
    1: {
        imagen: '/Estudiante/threejs/img/retroalimentacion/P_N1.png',
        texto: 'La respuesta correcta botón Deriv porque cuando aparece “PALAS”, el desfibrilador está mostrando la señal obtenida desde las palas y no desde el cable ECG. Al presionar DERI y escoger derivación 1 o 2, el equipo cambia la fuente de monitoreo y muestra el trazado electrocardiográfico del paciente.'
    },
    2: {
       imagen: '/Estudiante/threejs/img/retroalimentacion/P_N2.png',
        texto: 'Este es el orden correcto porque primero se preparan físicamente las palas internas, luego se configura una energía segura para cirugía cardiovascular y finalmente se realiza la descarga.'
    },
    3: { imagen:  '/Estudiante/threejs/img/retroalimentacion/P_N3.png', 
        texto: 'La respuesta  correcta es el botón SYNC porque en cardioversión sincronizada el equipo desactiva automáticamente el modo SYNC después de cada descarga. Por eso, antes de una segunda cardioversión, se debe volver a activar el botón SYNC para que el desfibrilador pueda detectar nuevamente la onda.' 
    },
     4: { imagen:  '/Estudiante/threejs/img/retroalimentacion/P_N4.png', 
        texto: 'La asignación correcta es como se observaba en la imagen' 
    },
     5: { imagen:  '/Estudiante/threejs/img/retroalimentacion/P_N5.png', 
        texto: 'La asignación correcta es (poner cual)' 
    },
};

/* =====================================================
   ESTADO
   ===================================================== */
let _contenedorId       = null;
let _asignacionId       = null;
let _numIntento         = 1;
let _intentosAntes      = 0;
let _respuestas         = [];
let _preguntaIndiceActivo = 0;

let _escena3d    = null;
let _camara3d    = null;
let _renderer3d  = null;
let _controls3d  = null;
let _reloj3d     = null;
let _modelo3d    = null;
let _animFrame3d = null;
let _raycaster3d = null;
let _mouse3d     = null;

let _materialOriginal = {};
let _rotandoSelector  = false;
let _selectorObj      = null;
let _mouseXAnteriorP3 = 0;
let _imagenActualP3   = null;
let _cachTexturasP3   = {};


/* =====================================================
   INICIALIZAR
   ===================================================== */
export async function iniciarEvaluacion(contenedorId, asigId) {
    _contenedorId  = contenedorId;
    _asignacionId  = asigId;
    _respuestas    = [];
    _intentosAntes = 0;
    _numIntento    = 1;

    _ocultarFilaSecciones(true);

    try {
        const r = await fetch(`${API}/resultados/misResultados/${_asignacionId}`, { headers: HEADERS });
        if (r.ok) {
            const data = await r.json();
            _intentosAntes = Array.isArray(data) ? data.length : 0;
            _numIntento    = _intentosAntes + 1;
        }
    } catch { _intentosAntes = 0; _numIntento = 1; }

    if (_intentosAntes >= 2) { mostrarAgotado(); return; }
    mostrarPregunta(0);
}

export function destruirEvaluacion() {
    _destruir3d();
    document.getElementById('uiEvaluacion')?.remove();
    _ocultarFilaSecciones(false);
    _contenedorId = null;
    _asignacionId = null;
    _respuestas   = [];
}

function _ocultarFilaSecciones(ocultar) {
    const fila = document.getElementById('filaSecciones');
    if (fila) fila.style.display = ocultar ? 'none' : '';
}

function _destruir3d() {
    cancelAnimationFrame(_animFrame3d);
    _animFrame3d = null;
    if (_renderer3d) {
        _renderer3d.domElement.removeEventListener('click',     _onClickEval);
        
        if (_renderer3d.domElement.parentNode)
            _renderer3d.domElement.parentNode.removeChild(_renderer3d.domElement);
    }
    if (_escena3d) {
        while (_escena3d.children.length > 0) _escena3d.remove(_escena3d.children[0]);
        _escena3d = null;
    }
    _restaurarColores();
    _camara3d = _controls3d = _reloj3d = _modelo3d = _renderer3d = null;
    _raycaster3d = _mouse3d = null;
    _materialOriginal = {};
    _rotandoSelector = false;
    _selectorObj     = null;
    _imagenActualP3  = null;
    _cachTexturasP3  = {};
}

function _restaurarColores() {
    _materialOriginal = {};
}

function _buscarMeshEnCache(nombre) {
    const modelo = window._cacheModelos?.['/Estudiante/threejs/modelados/nihonanimado4.glb'];
    if (!modelo) return null;
    let found = null;
    modelo.traverse(o => { if (o.name === nombre) found = o; });
    return found;
}


/* =====================================================
   MOSTRAR PREGUNTA
   ===================================================== */
function mostrarPregunta(indice) {
    _destruir3d();
    document.getElementById('uiEvaluacion')?.remove();
    const contenedor = document.getElementById(_contenedorId);
    if (!contenedor) return;
    const pregunta = PREGUNTAS[indice];

    if      (pregunta.tipo === '3d_click')          _mostrarPregunta3DClick(contenedor, pregunta, indice);
    else if (pregunta.tipo === 'ordenar')            _mostrarPreguntaOrdenar(contenedor, pregunta, indice);
    else if (pregunta.tipo === 'columnas')           _mostrarPreguntaColumnas(contenedor, pregunta, indice);
    else if (pregunta.tipo === 'seleccion_multiple') _mostrarPreguntaSeleccionMultiple(contenedor, pregunta, indice);
}


/* =====================================================
   PREGUNTA 3D — clic sobre botones del modelo
   (usada para pregunta 1 y pregunta 3)
   ===================================================== */
function _mostrarPregunta3DClick(contenedor, pregunta, indice) {
    _crearUI3D(contenedor, pregunta, indice);
    _preguntaIndiceActivo = indice;
    window._evalContinuar = () => _avanzar(indice);

    // Textura inicial según qué pregunta es
    const texturaInicial = TEXTURAS_INICIALES[indice]
        ?? '/Estudiante/threejs/img/nihon/modo_monitor_palas.png';

    const base = inicializarEscena('canvasEval3d');
    _escena3d = base.escena; _camara3d = base.camara;
    _renderer3d = base.renderer; _controls3d = base.controls; _reloj3d = base.reloj;
    _raycaster3d = new THREE.Raycaster();
    _mouse3d     = new THREE.Vector2();

    cargarModelo('/Estudiante/threejs/modelados/nihonanimado4.glb',
        _escena3d, _camara3d, _controls3d,
        (modelo) => {
            _modelo3d = modelo;

            // Perilla en posición monitor
            let perilla = null;
            _modelo3d.traverse(o => { if (o.name === 'perilla') perilla = o; });
            if (perilla) perilla.rotation.x = -0.4;

            // Textura en pantalla
            let pantalla = null;
            _modelo3d.traverse(o => { if (o.name === 'pantalla001') pantalla = o; });
            if (pantalla) {
                new THREE.TextureLoader().load(texturaInicial, (tex) => {
                    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
                    tex.flipY = false;
                    tex.needsUpdate = true;
                    const mats = Array.isArray(pantalla.material) ? pantalla.material : [pantalla.material];
                    mats.forEach(m => { m.map = tex; m.color.set(0xffffff); m.needsUpdate = true; });
                });
            }

            document.getElementById('loaderEval3d')?.remove();

            function animar() {
                _animFrame3d = requestAnimationFrame(animar);
                if (!_escena3d || !_camara3d || !_renderer3d) return;
                _controls3d.update();
                _renderer3d.render(_escena3d, _camara3d);
            }
            animar();
            _renderer3d.domElement.addEventListener('click', _onClickEval);
        }
    );
}

function _onClickEval(event) {
    if (!_modelo3d || !_renderer3d) return;
    const rect = _renderer3d.domElement.getBoundingClientRect();
    _mouse3d.x =  ((event.clientX - rect.left) / rect.width)  * 2 - 1;
    _mouse3d.y = -((event.clientY - rect.top)  / rect.height) * 2 + 1;
    _raycaster3d.setFromCamera(_mouse3d, _camara3d);
    const meshes = [];
    _modelo3d.traverse(o => { if (o.isMesh) meshes.push(o); });
    const hits = _raycaster3d.intersectObjects(meshes, true);
    if (!hits.length) return;

    const mesh   = hits[0].object;
    const nombre = mesh.name;
    if (!NOMBRES_LEGIBLES[nombre]) return;

    // Efecto escala leve — sin cambio de color
    const escOrig = mesh.scale.clone();
    mesh.scale.multiplyScalar(1.08);
    setTimeout(() => mesh.scale.copy(escOrig), 200);

    // Correctos según qué pregunta está activa
    const correctos = _preguntaIndiceActivo === 2 ? CORRECTOS_P3 : CORRECTOS_P1;
    const pregunta  = PREGUNTAS[_preguntaIndiceActivo];
    _guardarRespuesta(pregunta.num, correctos.has(nombre));
    _actualizarIndicador(NOMBRES_LEGIBLES[nombre]);
    _habilitarContinuar();
}

function _getMesh(nombre) {
    if (!_modelo3d) return null;
    let found = null;
    _modelo3d.traverse(o => { if (o.name === nombre) found = o; });
    return found;
}


/* =====================================================
   ESTRUCTURA HTML COMPARTIDA PARA PREGUNTAS 3D
   ===================================================== */
function _crearUI3D(contenedor, pregunta, indice, instruccionExtra = '') {
    const ui = document.createElement('div');
    ui.id = 'uiEvaluacion';
    ui.style.cssText = `position:absolute;inset:0;display:flex;flex-direction:column;
        font-family:'DM Sans',sans-serif;background:#f4f6f4;`;
    ui.innerHTML = `
        ${_barraProgressHTML(indice)}
        <div style="flex:1;display:flex;overflow:hidden;">
            <div style="width:320px;flex-shrink:0;background:white;
                border-right:1px solid #dde3dd;display:flex;flex-direction:column;
                padding:20px;gap:16px;overflow-y:auto;">
                <div>
                    <p style="font-size:0.75rem;color:#5a7a62;margin:0 0 8px;
                        font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">
                        Pregunta ${pregunta.num} de ${PREGUNTAS.length}
                    </p>
                    <p style="font-size:0.92rem;color:#1a2e1f;line-height:1.65;margin:0;">
                        ${pregunta.enunciado}
                    </p>
                </div>
                <div style="background:#f0f5f0;border-radius:10px;
                    padding:12px;display:flex;align-items:center;gap:8px;">
                    <span style="font-size:0.8rem;color:#5a7a62;">${pregunta.instruccion}</span>
                </div>
                ${instruccionExtra}
                <div id="indicadorSeleccion" style="min-height:48px;border-radius:10px;
                    border:1.5px dashed #c8d8c8;padding:10px 14px;
                    font-size:0.82rem;color:#9ab0a0;display:flex;align-items:center;gap:8px;">
                    <span>Ningún elemento seleccionado aún</span>
                </div>
                <div id="loaderEval3d" style="display:flex;flex-direction:column;
                    align-items:center;gap:8px;padding:16px 0;">
                    <div style="width:32px;height:32px;border:3px solid #e0e6e0;
                        border-top-color:#1e5c3a;border-radius:50%;
                        animation:spinEval 0.8s linear infinite;"></div>
                    <span style="font-size:0.78rem;color:#5a7a62;">
                        Cargando modelo... <span id="loaderPct">0</span>%
                    </span>
                </div>
                <style>@keyframes spinEval{to{transform:rotate(360deg);}}</style>
            </div>
            <div id="canvasEval3d" style="flex:1;position:relative;overflow:hidden;"></div>
        </div>
        ${_footerHTML(indice)}`;
    contenedor.appendChild(ui);
}


/* =====================================================
   PREGUNTA 2 — ORDENAR TARJETAS
   ===================================================== */
function _mostrarPreguntaOrdenar(contenedor, pregunta, indice) {
    const ui = document.createElement('div');
    ui.id = 'uiEvaluacion';
    ui.style.cssText = `position:absolute;inset:0;display:flex;flex-direction:column;
        font-family:'DM Sans',sans-serif;background:#f4f6f4;`;

    const tarjetasMezcladas = [...TARJETAS_P2].sort(() => Math.random() - 0.5);
    const COLORES = [
        { bg: '#e8f0fb', border: '#4a90d9' },
        { bg: '#e8f5ee', border: '#1e5c3a' },
        { bg: '#fff8e1', border: '#b8860b' },
        { bg: '#fef0ed', border: '#c0392b' },
    ];

    ui.innerHTML = `
        ${_barraProgressHTML(indice)}
        <div style="background:white;padding:20px 24px;border-bottom:1px solid #dde3dd;flex-shrink:0;">
            <p style="font-size:0.75rem;color:#5a7a62;margin:0 0 8px;
                font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">
                Pregunta ${pregunta.num} de ${PREGUNTAS.length}
            </p>
            <p style="font-size:0.95rem;color:#1a2e1f;line-height:1.65;margin:0;">
                ${pregunta.enunciado}
            </p>
        </div>
        <div style="flex:1;overflow-y:auto;display:flex;flex-direction:column;
            align-items:center;padding:24px;gap:16px;">
            <p style="font-size:0.82rem;color:#5a7a62;margin:0;text-align:center;">
                Arrastra las tarjetas para ordenarlas correctamente
            </p>
            <div id="listaOrdenar" style="
                width:100%;max-width:900px;
                display:flex;flex-direction:row;
                gap:12px;align-items:stretch;">
                ${tarjetasMezcladas.map((t, i) => {
                    const c = COLORES[i % COLORES.length];
                    return `
                    <div data-id="${t.id}" draggable="true" style="
                        flex:1;min-width:0;
                        display:flex;flex-direction:column;align-items:center;gap:10px;
                        background:${c.bg};border:2px solid ${c.border};
                        border-radius:12px;padding:16px 12px;
                        cursor:grab;user-select:none;
                        box-shadow:0 2px 6px rgba(0,0,0,0.07);
                        text-align:center;">
                        <div class="num-orden" style="
                            width:32px;height:32px;border-radius:50%;
                            background:${c.border};color:white;
                            display:flex;align-items:center;justify-content:center;
                            font-size:0.82rem;font-weight:700;flex-shrink:0;">
                            ${i + 1}
                        </div>
                        <span style="font-size:0.82rem;color:#1a2e1f;line-height:1.5;font-weight:500;">
                            ${t.texto}
                        </span>
                    </div>`;
                }).join('')}
            </div>
        </div>
        ${_footerHTML(indice)}
        <style>
            #listaOrdenar [data-id].drag-over { border-color:#1e5c3a !important; box-shadow:0 0 0 3px #1e5c3a40; }
            #listaOrdenar [data-id].arrastrando { opacity:0.45; }
        </style>`;
    contenedor.appendChild(ui);

    const lista = document.getElementById('listaOrdenar');
    let draggingEl = null;
    lista.addEventListener('dragstart', e => {
        draggingEl = e.target.closest('[data-id]');
        if (!draggingEl) return;
        draggingEl.classList.add('arrastrando');
        e.dataTransfer.effectAllowed = 'move';
    });
    lista.addEventListener('dragend', () => {
        draggingEl?.classList.remove('arrastrando');
        draggingEl = null;
        lista.querySelectorAll('[data-id]').forEach(el => el.classList.remove('drag-over'));
        _actualizarNumerosOrden();
        _evaluarOrdenP2(pregunta.num);
        _habilitarContinuar();
    });
    lista.addEventListener('dragover', e => {
        e.preventDefault();
        const sobre = e.target.closest('[data-id]');
        if (!sobre || sobre === draggingEl) return;
        lista.querySelectorAll('[data-id]').forEach(el => el.classList.remove('drag-over'));
        sobre.classList.add('drag-over');
        const rect = sobre.getBoundingClientRect();
        if (e.clientX < rect.left + rect.width / 2) lista.insertBefore(draggingEl, sobre);
        else lista.insertBefore(draggingEl, sobre.nextSibling);
    });
    _agregarSoporteTouchOrdenar(lista, pregunta.num);
    window._evalContinuar = () => _avanzar(indice);
}

function _actualizarNumerosOrden() {
    document.getElementById('listaOrdenar')?.querySelectorAll('[data-id]').forEach((el, i) => {
        const num = el.querySelector('.num-orden');
        if (num) num.textContent = i + 1;
    });
}

function _evaluarOrdenP2(numPregunta) {
    const lista = document.getElementById('listaOrdenar');
    if (!lista) return;
    const esCorrecta = [...lista.querySelectorAll('[data-id]')].every((el, i) => {
        const t = TARJETAS_P2.find(t => t.id === parseInt(el.dataset.id));
        return t?.orden_correcto === i + 1;
    });
    _guardarRespuesta(numPregunta, esCorrecta);
}

function _agregarSoporteTouchOrdenar(lista, numPregunta) {
    let touchDragging = null, ghost = null;
    lista.addEventListener('touchstart', e => {
        const el = e.target.closest('[data-id]');
        if (!el) return;
        touchDragging = el;
        el.classList.add('arrastrando');
        ghost = el.cloneNode(true);
        ghost.style.cssText += `;position:fixed;opacity:0.75;pointer-events:none;z-index:9999;width:${el.offsetWidth}px;`;
        document.body.appendChild(ghost);
    }, { passive: true });
    lista.addEventListener('touchmove', e => {
        if (!touchDragging || !ghost) return;
        e.preventDefault();
        const t = e.touches[0];
        ghost.style.left = (t.clientX - ghost.offsetWidth / 2) + 'px';
        ghost.style.top  = (t.clientY - ghost.offsetHeight / 2) + 'px';
        const sobre = document.elementFromPoint(t.clientX, t.clientY)?.closest('[data-id]');
        if (sobre && sobre !== touchDragging) {
            const rect = sobre.getBoundingClientRect();
            if (t.clientY < rect.top + rect.height / 2) lista.insertBefore(touchDragging, sobre);
            else lista.insertBefore(touchDragging, sobre.nextSibling);
        }
    }, { passive: false });
    lista.addEventListener('touchend', () => {
        touchDragging?.classList.remove('arrastrando');
        ghost?.remove(); ghost = null; touchDragging = null;
        _actualizarNumerosOrden();
        _evaluarOrdenP2(numPregunta);
        _habilitarContinuar();
    });
}


/* =====================================================
   PREGUNTA 4 — CLASIFICAR EN COLUMNAS
   ===================================================== */
function _mostrarPreguntaColumnas(contenedor, pregunta, indice) {
    const ui = document.createElement('div');
    ui.id = 'uiEvaluacion';
    ui.style.cssText = `position:absolute;inset:0;display:flex;flex-direction:column;
        font-family:'DM Sans',sans-serif;background:#f4f6f4;`;
    ui.innerHTML = `
        ${_barraProgressHTML(indice)}
        <div style="background:white;padding:20px 24px;border-bottom:1px solid #dde3dd;flex-shrink:0;">
            <p style="font-size:0.75rem;color:#5a7a62;margin:0 0 8px;
                font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">
                Pregunta ${pregunta.num} de ${PREGUNTAS.length}
            </p>
            <p style="font-size:0.95rem;color:#1a2e1f;line-height:1.65;margin:0;">${pregunta.enunciado}</p>
        </div>
        <div style="flex:1;overflow-y:auto;display:flex;flex-direction:column;
            align-items:center;padding:24px;gap:20px;">
            <p style="font-size:0.82rem;color:#5a7a62;margin:0;text-align:center;">
                Arrastra cada acción a la columna correspondiente
            </p>
            <div id="bandejaP4" style="
                display:flex;flex-direction:row;gap:16px;justify-content:center;flex-wrap:wrap;
                min-height:90px;padding:12px;border:2px dashed #c8d8c8;border-radius:12px;
                background:#fafafa;width:100%;max-width:960px;">
                ${TARJETAS_P4.map(t => `
                    <div data-id="${t.id}" draggable="true" style="
                        width:200px;min-height:80px;height:auto;
                        display:flex;align-items:center;justify-content:center;
                        background:${t.bg};border:2.5px solid ${t.color};border-radius:12px;
                        padding:12px;cursor:grab;user-select:none;
                        font-size:0.82rem;font-weight:600;color:${t.color};
                        text-align:center;line-height:1.4;
                        box-shadow:0 2px 8px rgba(0,0,0,0.08);transition:transform 0.15s;">
                        ${t.texto}
                    </div>`).join('')}
            </div>
            <div style="display:flex;gap:20px;width:100%;max-width:760px;align-items:stretch;">
                <div style="flex:1;display:flex;flex-direction:column;gap:12px;">
                    <div style="background:#1e5c3a;color:white;border-radius:10px;
                        padding:10px 16px;text-align:center;font-weight:600;font-size:0.88rem;">
                        Cardioversión sincrónica
                    </div>
                    <div id="col-sincronica" data-col="sincronica" style="
                        flex:1;min-height:160px;border:2.5px dashed #1e5c3a;border-radius:12px;
                        background:#f0f8f3;padding:12px;display:flex;flex-direction:column;
                        gap:10px;align-items:center;justify-content:flex-start;">
                        <span class="placeholder-col" style="color:#9ab0a0;font-size:0.8rem;margin-top:40px;">
                            Arrastra aquí
                        </span>
                    </div>
                </div>
                <div style="flex:1;display:flex;flex-direction:column;gap:12px;">
                    <div style="background:#b8860b;color:white;border-radius:10px;
                        padding:10px 16px;text-align:center;font-weight:600;font-size:0.88rem;">
                        Desfibrilación asincrónica
                    </div>
                    <div id="col-asincronica" data-col="asincronica" style="
                        flex:1;min-height:160px;border:2.5px dashed #b8860b;border-radius:12px;
                        background:#fffbf0;padding:12px;display:flex;flex-direction:column;
                        gap:10px;align-items:center;justify-content:flex-start;">
                        <span class="placeholder-col" style="color:#9ab0a0;font-size:0.8rem;margin-top:40px;">
                            Arrastra aquí
                        </span>
                    </div>
                </div>
            </div>
        </div>
        ${_footerHTML(indice)}
        <style>
            [data-col].drag-over-col { border-style:solid !important; opacity:0.85; }
            [data-id].arrastrando-p4 { opacity:0.4; }
        </style>`;
    contenedor.appendChild(ui);

    // Inicializar asignaciones con las keys correctas del Nihon
    const asignaciones = { activar: null, QRS: null, marcapasos: null, sincronico: null };
    const bandeja       = document.getElementById('bandejaP4');
    const colSincronica  = document.getElementById('col-sincronica');
    const colAsincronica = document.getElementById('col-asincronica');
    let draggingEl = null;

    [bandeja, colSincronica, colAsincronica].forEach(zona => {
        zona.addEventListener('dragover',  e => { e.preventDefault(); zona.classList.add('drag-over-col'); });
        zona.addEventListener('dragleave', () => zona.classList.remove('drag-over-col'));
        zona.addEventListener('drop', e => {
            e.preventDefault();
            zona.classList.remove('drag-over-col');
            if (!draggingEl) return;
            const id  = draggingEl.dataset.id;
            const col = zona.dataset.col ?? null;
            zona.querySelectorAll('.placeholder-col').forEach(p => p.remove());
            zona.appendChild(draggingEl);
            asignaciones[id] = col;
            const todasAsignadas = TARJETAS_P4.every(t => asignaciones[t.id] !== null);
            if (todasAsignadas) { _evaluarColumnasP4(pregunta.num, asignaciones); _habilitarContinuar(); }
        });
    });

    contenedor.querySelectorAll('[data-id]').forEach(el => {
        el.addEventListener('dragstart', e => { draggingEl = el; el.classList.add('arrastrando-p4'); e.dataTransfer.effectAllowed = 'move'; });
        el.addEventListener('dragend',   () => { el.classList.remove('arrastrando-p4'); draggingEl = null; });
    });

    window._evalContinuar = () => _avanzar(indice);
}

function _evaluarColumnasP4(numPregunta, asignaciones) {
    _guardarRespuesta(numPregunta, TARJETAS_P4.every(t => asignaciones[t.id] === t.columna_correcta));
}


/* =====================================================
   PREGUNTA 5 — SELECCIÓN MÚLTIPLE (sin imágenes)
   ===================================================== */
function _mostrarPreguntaSeleccionMultiple(contenedor, pregunta, indice) {
    const ui = document.createElement('div');
    ui.id = 'uiEvaluacion';
    ui.style.cssText = `position:absolute;inset:0;display:flex;flex-direction:column;
        font-family:'DM Sans',sans-serif;background:#f4f6f4;`;

    ui.innerHTML = `
        ${_barraProgressHTML(indice)}
        <div style="background:white;padding:20px 24px;border-bottom:1px solid #dde3dd;flex-shrink:0;">
            <p style="font-size:0.75rem;color:#5a7a62;margin:0 0 8px;
                font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">
                Pregunta ${pregunta.num} de ${PREGUNTAS.length}
            </p>
            <p style="font-size:0.95rem;color:#1a2e1f;line-height:1.65;margin:0;">
                ${pregunta.enunciado}
            </p>
        </div>
        <div style="flex:1;overflow-y:auto;display:flex;flex-direction:column;
            align-items:center;padding:24px;gap:14px;">
            <p style="font-size:0.82rem;color:#5a7a62;margin:0;text-align:center;">
                Selecciona la opción correcta
            </p>
            <div style="
                display:flex;flex-direction:row;gap:14px;
                width:100%;max-width:860px;align-items:stretch;min-height:200px;">
                ${OPCIONES_P5.map(op => `
                    <div data-opcion="${op.id}" style="
                        flex:1;min-width:0;
                        display:flex;flex-direction:column;
                        background:white;
                        border:2.5px solid #dde3dd;
                        border-radius:14px;
                        cursor:pointer;
                        padding:24px 16px;
                        transition:border-color 0.2s, background 0.2s;
                        box-sizing:border-box;
                        gap:16px;">
                        <div style="display:flex;align-items:center;justify-content:space-between;">
                            <span style="
                                width:32px;height:32px;border-radius:50%;
                                background:${op.bg};border:2px solid ${op.color};
                                display:flex;align-items:center;justify-content:center;
                                font-size:0.88rem;font-weight:700;color:${op.color};flex-shrink:0;">
                                ${op.id}
                            </span>
                            <div class="check-indicator" style="
                                width:22px;height:22px;border-radius:50%;
                                border:2.5px solid #dde3dd;background:white;
                                transition:all 0.2s;flex-shrink:0;">
                            </div>
                        </div>
                        <span style="font-size:0.92rem;color:#1a2e1f;line-height:1.5;font-weight:600;">
                            ${op.texto}
                        </span>
                    </div>`).join('')}
            </div>
        </div>
        ${_footerHTML(indice)}
        <style>
            [data-opcion].seleccionada {
                background: var(--op-bg) !important;
                border-color: var(--op-color) !important;
            }
            [data-opcion].seleccionada .check-indicator {
                background: var(--op-color) !important;
                border-color: var(--op-color) !important;
            }
        </style>`;

    contenedor.appendChild(ui);

    const seleccionadas = new Set();

    OPCIONES_P5.forEach(op => {
        const el = contenedor.querySelector(`[data-opcion="${op.id}"]`);
        if (!el) return;
        el.style.setProperty('--op-color', op.color);
        el.style.setProperty('--op-bg',    op.bg);
    });

    contenedor.querySelectorAll('[data-opcion]').forEach(el => {
        el.addEventListener('click', () => {
            const id = el.dataset.opcion;
            if (seleccionadas.has(id)) {
                seleccionadas.delete(id);
                el.classList.remove('seleccionada');
                el.querySelector('.check-indicator').style.background  = 'white';
                el.querySelector('.check-indicator').style.borderColor = '#dde3dd';
            } else {
                seleccionadas.add(id);
                el.classList.add('seleccionada');
                const color = OPCIONES_P5.find(o => o.id === id)?.color ?? '#1e5c3a';
                el.querySelector('.check-indicator').style.background  = color;
                el.querySelector('.check-indicator').style.borderColor = color;
            }
            _evaluarSeleccionMultipleP5(pregunta.num, seleccionadas);
            _habilitarContinuar();
        });
    });

    window._evalContinuar = () => _avanzar(indice);
}

function _evaluarSeleccionMultipleP5(numPregunta, seleccionadas) {
    // Correcta: solo B y C seleccionadas, A y D no
    const esCorrecta =
        seleccionadas.has('B') &&
        seleccionadas.has('C') &&
        !seleccionadas.has('A') &&
        !seleccionadas.has('D');
    _guardarRespuesta(numPregunta, esCorrecta);
}


/* =====================================================
   HELPERS COMUNES
   ===================================================== */
function _actualizarIndicador(nombreLegible) {
    const indicador = document.getElementById('indicadorSeleccion');
    if (!indicador) return;
    indicador.style.borderColor = '#4a90d9';
    indicador.style.background  = '#eef4fb';
    indicador.innerHTML = `
        <span style="color:#1a2e1f;font-weight:500;">
            Seleccionaste: <strong>${nombreLegible}</strong>
        </span>`;
}

function _barraProgressHTML(indice) {
    return `
        <div style="background:#163d27;color:white;padding:12px 20px;
            display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">
            <span style="font-size:0.85rem;opacity:0.85;">
                Evaluación — Nihon Koden &nbsp;·&nbsp; Intento ${_numIntento} de 2
            </span>
            <div style="display:flex;gap:6px;">
                ${PREGUNTAS.map((_, i) => `
                    <div style="width:28px;height:28px;border-radius:50%;
                        background:${i < indice ? '#2d7a50' : i === indice ? 'white' : 'rgba(255,255,255,0.2)'};
                        color:${i === indice ? '#163d27' : 'white'};
                        display:flex;align-items:center;justify-content:center;
                        font-size:0.72rem;font-weight:600;">
                        ${i < indice ? '✓' : i + 1}
                    </div>`).join('')}
            </div>
        </div>`;
}

function _footerHTML(indice) {
    return `
        <div style="background:white;border-top:1px solid #dde3dd;
            padding:12px 24px;display:flex;justify-content:flex-end;flex-shrink:0;">
            <button id="btnContinuarEval" onclick="window._evalContinuar()" disabled
                style="padding:10px 28px;border:none;border-radius:10px;
                    background:#e0e6e0;color:#9ab0a0;font-family:'DM Sans',sans-serif;
                    font-size:0.9rem;font-weight:600;cursor:not-allowed;transition:all 0.2s;">
                ${indice === PREGUNTAS.length - 1 ? 'Finalizar' : 'Continuar'}
            </button>
        </div>`;
}

function _guardarRespuesta(numPregunta, esCorrecta) {
    const idx = _respuestas.findIndex(r => r.numPregunta === numPregunta);
    if (idx >= 0) _respuestas[idx].esCorrecta = esCorrecta;
    else _respuestas.push({ numPregunta, esCorrecta });
}

function _habilitarContinuar() {
    const btn = document.getElementById('btnContinuarEval');
    if (btn) {
        btn.disabled = false;
        btn.style.background = '#1e5c3a';
        btn.style.color      = 'white';
        btn.style.cursor     = 'pointer';
    }
}

function _avanzar(indice) {
    _destruir3d();
    const siguiente = indice + 1;
    if (siguiente < PREGUNTAS.length) mostrarPregunta(siguiente);
    else enviarResultados();
}


/* =====================================================
   ENVIAR RESULTADOS
   ===================================================== */
async function enviarResultados() {
    _destruir3d();
    document.getElementById('uiEvaluacion')?.remove();
    const contenedor = document.getElementById(_contenedorId);
    if (!contenedor) return;

    const ui = document.createElement('div');
    ui.id = 'uiEvaluacion';
    ui.style.cssText = `position:absolute;inset:0;display:flex;align-items:center;
        justify-content:center;background:#f4f6f4;font-family:'DM Sans',sans-serif;`;
    ui.innerHTML = `
        <div style="text-align:center;color:#5a7a62;">
            <div style="width:40px;height:40px;border:3px solid #e0e6e0;
                border-top-color:#1e5c3a;border-radius:50%;
                animation:spin 0.8s linear infinite;margin:0 auto 12px;"></div>
            <p>Guardando resultado...</p>
            <style>@keyframes spin{to{transform:rotate(360deg);}}</style>
        </div>`;
    contenedor.appendChild(ui);

    try {
        const r = await fetch(`${API}/resultados/guardar`, {
            method: 'POST', headers: HEADERS,
            body: JSON.stringify({ asignacionId: _asignacionId, Respuestas: _respuestas })
        });
        if (!r.ok) throw new Error(await r.text());
        mostrarResultado(await r.json());
    } catch (err) {
        document.getElementById('uiEvaluacion')?.remove();
        const c2 = document.getElementById(_contenedorId);
        if (!c2) return;
        const uiErr = document.createElement('div');
        uiErr.id = 'uiEvaluacion';
        uiErr.style.cssText = `position:absolute;inset:0;display:flex;align-items:center;
            justify-content:center;background:#f4f6f4;font-family:'DM Sans',sans-serif;`;
        uiErr.innerHTML = `
            <div style="text-align:center;color:#c0392b;max-width:320px;padding:24px;">
                <p style="font-weight:600;margin-bottom:8px;">Error al guardar el resultado</p>
                <p style="font-size:0.85rem;color:#5a7a62;">${err.message}</p>
                <button onclick="window._evalVolver()"
                    style="margin-top:16px;padding:10px 24px;border:none;border-radius:10px;
                    background:#1e5c3a;color:white;cursor:pointer;font-family:'DM Sans',sans-serif;">
                    Volver al módulo
                </button>
            </div>`;
        c2.appendChild(uiErr);
        window._evalVolver = _salir;
    }
}


/* =====================================================
   PANTALLA DE RESULTADO
   ===================================================== */
function mostrarResultado(resultado) {
    document.getElementById('uiEvaluacion')?.remove();
    const contenedor = document.getElementById(_contenedorId);
    if (!contenedor) return;

    const puntaje  = resultado.Puntaje;
    const aprobado = puntaje >= 80;
    const esInt2   = resultado.numIntento === 2;
    const color    = aprobado ? '#1e5c3a' : '#c0392b';

    // Retroalimentación solo en intento 2 con errores
    const incorrectas = esInt2 ? _respuestas.filter(r => !r.esCorrecta) : [];
    const retroHTML = incorrectas.length > 0 ? `
        <div style="background:white;border-radius:16px;padding:24px;
            box-shadow:0 2px 12px rgba(0,0,0,0.08);margin-bottom:16px;">
            <p style="font-size:0.78rem;font-weight:600;color:#c0392b;
                text-transform:uppercase;letter-spacing:0.05em;margin:0 0 16px;">
                Retroalimentación — preguntas incorrectas
            </p>

            <!-- Fila superior: máximo 2 tarjetas -->
            <div style="display:flex;gap:12px;margin-bottom:12px;">
                ${incorrectas.slice(0, 2).map(r => _tarjetaRetro(r)).join('')}
            </div>

            <!-- Fila inferior: resto -->
            ${incorrectas.length > 2 ? `
            <div style="display:flex;gap:12px;">
                ${incorrectas.slice(2).map(r => _tarjetaRetro(r)).join('')}
            </div>` : ''}
        </div>` : '';

    const ui = document.createElement('div');
    ui.id = 'uiEvaluacion';
    ui.style.cssText = `position:absolute;inset:0;overflow-y:auto;background:#f4f6f4;
        font-family:'DM Sans',sans-serif;display:flex;align-items:flex-start;
        justify-content:center;padding:32px 16px;`;
    ui.innerHTML = `
        <div style="max-width:560px;width:100%;">

            ${retroHTML}

            <div style="background:white;border-radius:16px;padding:32px;text-align:center;
                box-shadow:0 2px 12px rgba(0,0,0,0.08);margin-bottom:16px;">
                <div style="font-size:2.5rem;margin-bottom:12px;">${aprobado ? '' : ''}</div>
                <h2 style="font-size:1.4rem;color:#1a2e1f;margin:0 0 6px;">
                    ${aprobado ? '¡Aprobaste!' : 'No aprobaste'}
                </h2>
                <p style="font-size:3rem;font-weight:700;color:${color};margin:8px 0;">${puntaje}%</p>
                <p style="font-size:0.88rem;color:#5a7a62;margin:0;">
                    ${aprobado
                        ? 'Superaste el umbral mínimo de aprobación (80%).'
                        : 'El puntaje mínimo para aprobar es 80%.'}
                </p>
                ${!esInt2 ? `
                <div style="margin-top:16px;padding:12px;background:#fff8e1;
                    border-radius:10px;border:1px solid #f0c040;font-size:0.82rem;color:#7a6000;">
                    Tienes un intento más disponible.
                </div>` : ''}
            </div>

            <div style="display:flex;gap:10px;">
                ${!esInt2 ? `
                <button onclick="window._evalReintentar()"
                    style="flex:1;padding:12px;border:none;border-radius:10px;
                    background:#1e5c3a;color:white;cursor:pointer;
                    font-family:'DM Sans',sans-serif;font-size:0.9rem;font-weight:600;">
                    Intentar de nuevo
                </button>` : ''}
                <button onclick="window._evalVolver()"
                    style="flex:1;padding:12px;border:2px solid #dde3dd;border-radius:10px;
                    background:white;color:#1a2e1f;cursor:pointer;
                    font-family:'DM Sans',sans-serif;font-size:0.9rem;font-weight:500;">
                    Volver al módulo
                </button>
            </div>
        </div>`;
    contenedor.appendChild(ui);

    window._evalReintentar = () => {
        _destruir3d();
        document.getElementById('uiEvaluacion')?.remove();
        iniciarEvaluacion(_contenedorId, _asignacionId);
    };
    window._evalVolver = _salir;
}

function _tarjetaRetro(r) {
    const retro = RETROALIMENTACION[r.numPregunta];
    if (!retro) return '';
    return `
        <div style="
            flex:1;min-width:0;
            border-radius:12px;overflow:hidden;
            border:1.5px solid #f0e0e0;
            background:#fafafa;">
            <img
                src="${retro.imagen}"
                alt="Retroalimentación P${r.numPregunta}"
                style="width:100%;height:130px;object-fit:cover;display:block;">
            <div style="padding:10px 12px;">
                <p style="font-size:0.72rem;color:#c0392b;font-weight:700;
                    margin:0 0 4px;text-transform:uppercase;letter-spacing:0.04em;">
                    Pregunta ${r.numPregunta}
                </p>
                <p style="font-size:0.8rem;color:#1a2e1f;line-height:1.5;margin:0;">
                    ${retro.texto}
                </p>
            </div>
        </div>`;
}


/* =====================================================
   INTENTOS AGOTADOS
   ===================================================== */
function mostrarAgotado() {
    const contenedor = document.getElementById(_contenedorId);
    if (!contenedor) return;
    const ui = document.createElement('div');
    ui.id = 'uiEvaluacion';
    ui.style.cssText = `position:absolute;inset:0;display:flex;align-items:center;
        justify-content:center;background:#f4f6f4;font-family:'DM Sans',sans-serif;`;
    ui.innerHTML = `
        <div style="text-align:center;max-width:360px;padding:24px;">
            <div style="font-size:2.5rem;margin-bottom:12px;">🔒</div>
            <h3 style="color:#1a2e1f;margin-bottom:8px;">Intentos agotados</h3>
            <p style="font-size:0.88rem;color:#5a7a62;line-height:1.6;">
                Ya realizaste los 2 intentos permitidos para esta evaluación.
            </p>
            <button onclick="window._evalVolver()"
                style="margin-top:20px;padding:11px 28px;border:none;border-radius:10px;
                background:#1e5c3a;color:white;cursor:pointer;
                font-family:'DM Sans',sans-serif;font-size:0.9rem;">
                Volver al módulo
            </button>
        </div>`;
    contenedor.appendChild(ui);
    window._evalVolver = _salir;
}


/* =====================================================
   SALIR
   ===================================================== */
function _salir() {
    _destruir3d();
    document.getElementById('uiEvaluacion')?.remove();
    _ocultarFilaSecciones(false);
    limpiarRenderer(false);
    window.dispatchEvent(new CustomEvent('evaluacionTerminada'));
}