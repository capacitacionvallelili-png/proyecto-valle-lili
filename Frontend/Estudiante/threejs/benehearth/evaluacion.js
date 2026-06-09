/* =====================================================
   evaluacion.js — Evaluación Beneheart D6
   ===================================================== */

import { inicializarEscena, cargarModelo, limpiarRenderer, THREE } from '../escena.js';

const API = 'https://backend-production-2be1d.up.railway.app/Vallelili';
const TOKEN = localStorage.getItem('token');
const HEADERS = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TOKEN}` };

const NOMBRES_LEGIBLES = {
    'Flecha1': 'Botón Flecha', 'Flecha2': 'Botón Flecha', 'Flecha3': 'Botón Flecha',
    'B_SelecDerivada': 'Botón selección derivada', 'B_pausa': 'Botón pausa',
    'B_Menu': 'Botón Menú', 'B_Resumen': 'Botón Resumen', 'B_PNI': 'Botón PNI',
    'B_Evento': 'Botón Evento', 'Carga': 'Botón de carga', 'Descarga': 'Botón de descarga',
    'SelecEnergia': 'Selector de energía', 'perilla001': 'Perilla de selección',
    'selector': 'Perilla de navegación', 'boton2': 'Botón de carga (pala)',
    'botonVolumen': 'Selector de energía (pala)', 'Boton3D': 'Botón de descarga pala derecha',
    'Boton3': 'Botón de descarga pala izquierda',
    
};

const CORRECTOS_P1 = new Set(['Boton3D', 'Boton3']);

const TARJETAS_P2 = [
    { id: 1, texto: 'Conectar y verificar el trazado electrocardiográfico utilizando los electrodos de ECG', imagen: '/Estudiante/threejs/img/ritmocardiaco.png', orden_correcto: 1 },
    { id: 2, texto: 'Seleccionar el nivel de energía indicado', imagen: '/Estudiante/threejs/img/energiaseleccionada.png', orden_correcto: 2 },
    { id: 3, texto: 'Activar el modo sincrónico (el equipo debe mostrar la marca sobre cada QRS)', imagen: '/Estudiante/threejs/img/cardioversion/acceder.png', orden_correcto: 3 },
    { id: 4, texto: 'Cargar la energía', imagen: '/Estudiante/threejs/img/cardioversion/cargaSincronizada.png', orden_correcto: 4 },
    { id: 5, texto: 'Generar la descarga manteniendo los botones oprimidos hasta que el equipo descargue', imagen: '/Estudiante/threejs/img/cardioversion/descargaSincronizada.png', orden_correcto: 5 },
];

const IMAGENES_SELECTOR_P3 = [
    { hasta: 0.8, imagen: '/Estudiante/threejs/img/MODOMONITOR.png', nombre: 'Palas', correcta: false },
    { hasta: 1.6, imagen: '/Estudiante/threejs/img/19.png', nombre: 'Derivada I', correcta: true },
    { hasta: 2.4, imagen: '/Estudiante/threejs/img/20.png', nombre: 'Derivada II', correcta: true },
    { hasta: Infinity, imagen: '/Estudiante/threejs/img/21.png', nombre: 'Derivada III', correcta: true },
];
const CICLO_DERIVADA_P3 = [
    { imagen: '/Estudiante/threejs/img/MODOMONITOR.png', nombre: 'Palas', correcta: false },
    { imagen: '/Estudiante/threejs/img/19.png', nombre: 'Derivada I', correcta: true },
    { imagen: '/Estudiante/threejs/img/20.png', nombre: 'Derivada II', correcta: true },
    { imagen: '/Estudiante/threejs/img/21.png', nombre: 'Derivada III', correcta: true },
];
let _indiceCicloP3 = 0;

const OPCIONES_P4 = [
    { id: 'A', texto: 'Activar el modo sincrónico y cardiovertir', correcta: false, color: '#4a90d9', bg: '#e8f0fb' },
    { id: 'B', texto: 'Desfibrilar en modo asincrónico', correcta: true, color: '#1e5c3a', bg: '#e8f5ee' },
    { id: 'C', texto: 'Iniciar terapia de marcapasos', correcta: false, color: '#b8860b', bg: '#fff8e1' },
    { id: 'D', texto: 'Cambiar a derivada II y esperar', correcta: false, color: '#c0392b', bg: '#fef0ed' },
];

const OPCIONES_P5 = [
    { id: 'A', tipo: 'seleccion', texto: 'Presionar ambos botones de pala simultáneamente apuntando hacia el suelo', imagen: '/Estudiante/threejs/img/evaluacion/palas.png', color: '#c0392b', bg: '#fef0ed', correcta: false },
    { id: 'B', tipo: 'tiempo', texto: 'Esperar ____ minuto(s) hasta que el equipo descargue automáticamente', imagen: '/Estudiante/threejs/img/evaluacion/reloj.png', color: '#1e5c3a', bg: '#e8f5ee', correcta: true, tiempoEsperado: '1' },
    { id: 'C', tipo: 'seleccion', texto: 'Presionar el botón "DESACTIVAR" en el panel frontal', imagen: '/Estudiante/threejs/img/evaluacion/desactivar.png', color: '#4a90d9', bg: '#e8f0fb', correcta: true },
    { id: 'D', tipo: 'seleccion', texto: 'Girar la perilla a modo monitor para que el sistema libere la energía', imagen: '/Estudiante/threejs/img/evaluacion/monitor.png', color: '#b8860b', bg: '#fff8e1', correcta: false },
];

const PREGUNTAS = [
    { num: 1, tipo: '3d_click', enunciado: 'Durante una desfibrilación manual con palas, el operador ya cargó la energía desde el panel frontal y el equipo está listo para descargar. Sin embargo, al presionar el botón del panel frontal, el equipo no descarga. ¿Desde dónde debe ejecutarse la descarga cuando se usan palas?', instruccion: 'Selecciona la opción correcta directamente en el modelado' },
    { num: 2, tipo: 'ordenar', enunciado: 'El médico indica que se debe realizar una cardioversión sincronizada. El paciente ya cuenta con trazado de ECG visible en el monitor. Ordena los pasos que debe seguir el operador.' },
    { num: 3, tipo: '3d_selector', enunciado: 'El desfibrilador está encendido en modo monitor. Se conectan los electrodos de ECG, sin embargo no se logra visualizar en la pantalla el trazado electrocardiográfico. ¿Qué se debe hacer para visualizarlo?', instruccion: 'Gira la perilla de navegación o usa el botón de derivada' },
    { num: 4, tipo: 'opcion_multiple', enunciado: 'Un paciente conectado con electrodos desechables (parches) presenta en pantalla el siguiente ritmo. El médico indica tratar el ritmo de paro. Seleccione la acción correcta que debe realizar el operador:', imagenContexto: '/Estudiante/threejs/img/ritmocardiaco.png' },
    { num: 5, tipo: 'seleccion_multiple', enunciado: 'Durante el uso del desfibrilador, el médico decide que ya no es necesario realizar descarga. La energía del desfibrilador quedó cargada. ¿Cuáles son las DOS formas de desactivar esa energía?' },
];

const IMG_CONTROLES = '/Estudiante/threejs/img/controles.png';

// Rutas de los sonidos de retroalimentación
const SONIDO_CORRECTO = '/Estudiante/threejs/audios/correct.mp3';
const SONIDO_INCORRECTO = '/Estudiante/threejs/audios/bad.mp3';

const RETROALIMENTACION = {
    1: { imagen: '/Estudiante/threejs/img/retroalimentacion/P_B1.png', texto: 'Cuando las palas están conectadas, el equipo activa exclusivamente los botones de descarga ubicados en la parte superior de cada pala, deshabilitando el disparo desde el panel frontal.' },
    2: { imagen: '/Estudiante/threejs/img/retroalimentacion/P_B2.png', texto: 'Para la cardioversión sincronizada primero se verifica el ECG, se selecciona la energía, se activa el modo sincrónico, se carga y finalmente se mantienen presionados los botones de descarga.' },
    3: { imagen: '/Estudiante/threejs/img/retroalimentacion/P_B3.png', texto: 'PALAS indica que la fuente de monitoreo activa son las palas, no los electrodos. Para visualizar la señal del cable de ECG el operador debe girar la perilla y seleccionar derivada I, II o III.' },
    4: { imagen: '/Estudiante/threejs/img/retroalimentacion/P_B4.png', texto: 'La FV es un ritmo de paro que requiere desfibrilación asincrónica. La cardioversión sincronizada se usa para ritmos organizados, no para FV.' },
    5: { imagen: '/Estudiante/threejs/img/retroalimentacion/P_B5.png', texto: 'El Mindray D6 ofrece dos métodos seguros: esperar 1 minuto hasta la descarga automática, o presionar el botón Desactivar que libera la energía internamente.' },
};

/* =====================================================
   ESTADO
   ===================================================== */
let _contenedorId = null, _asignacionId = null, _numIntento = 1, _intentosAntes = 0, _respuestas = [];
let _escena3d = null, _camara3d = null, _renderer3d = null, _controls3d = null, _reloj3d = null, _modelo3d = null;
let _animFrame3d = null, _raycaster3d = null, _mouse3d = null;
let _materialOriginal = {}, _meshHighlight = null;
let _rotandoSelector = false, _selectorObj = null, _mouseXAnteriorP3 = 0, _imagenActualP3 = null, _cachTexturasP3 = {};
let _estadoPregunta = {};
let _manitoAnimId = null;
let _pulsoAnimId = null;


/* =====================================================
   INICIALIZAR
   ===================================================== */
export async function iniciarEvaluacion(contenedorId, asigId) {
    _contenedorId = contenedorId; _asignacionId = asigId;
    _respuestas = []; _estadoPregunta = {}; _intentosAntes = 0; _numIntento = 1; _indiceCicloP3 = 0;
    _ocultarFilaSecciones(true);
    try {
        const r = await fetch(`${API}/resultados/misResultados/${_asignacionId}`, { headers: HEADERS });
        if (r.ok) { const data = await r.json(); _intentosAntes = Array.isArray(data) ? data.length : 0; _numIntento = _intentosAntes + 1; }
    } catch { _intentosAntes = 0; _numIntento = 1; }
    if (_intentosAntes >= 2) { mostrarAgotado(); return; }
    mostrarPregunta(0);
}

export function destruirEvaluacion() {
    _destruir3d();
    document.getElementById('uiEvaluacion')?.remove();
    _ocultarFilaSecciones(false);
    _contenedorId = _asignacionId = null; _respuestas = []; _estadoPregunta = {};
}

function _ocultarFilaSecciones(ocultar) {
    const fila = document.getElementById('filaSecciones');
    if (fila) fila.style.display = ocultar ? 'none' : '';
}

function _destruir3d() {
    cancelAnimationFrame(_animFrame3d); _animFrame3d = null;
    cancelAnimationFrame(_manitoAnimId); _manitoAnimId = null;
    cancelAnimationFrame(_pulsoAnimId); _pulsoAnimId = null;
    if (_renderer3d) {
        _renderer3d.domElement.removeEventListener('click', _onClickEval);
        _renderer3d.domElement.removeEventListener('mousedown', _onMouseDownP3);
        _renderer3d.domElement.removeEventListener('mousemove', _onMouseMoveP3);
        _renderer3d.domElement.removeEventListener('mouseup', _onMouseUpP3);
        _renderer3d.domElement.removeEventListener('click', _onClickP3Botones);
        if (_renderer3d.domElement.parentNode) _renderer3d.domElement.parentNode.removeChild(_renderer3d.domElement);
    }
    if (_escena3d) { while (_escena3d.children.length) _escena3d.remove(_escena3d.children[0]); _escena3d = null; }
    _restaurarColores();
    _camara3d = _controls3d = _reloj3d = _modelo3d = _renderer3d = null;
    _raycaster3d = _mouse3d = null; _meshHighlight = null; _materialOriginal = {};
    _rotandoSelector = false; _selectorObj = null; _imagenActualP3 = null; _cachTexturasP3 = {}; _indiceCicloP3 = 0;
}

function _restaurarColores() {
    Object.entries(_materialOriginal).forEach(([nombre, hex]) => {
        const m = _buscarMeshEnCache(nombre);
        if (m?.material?.color) { m.material.color.setHex(hex); m.material.needsUpdate = true; }
    });
    _materialOriginal = {};
}

function _buscarMeshEnCache(nombre) {
    const modelo = window._cacheModelos?.['/Estudiante/threejs/modelados/Final.glb'];
    if (!modelo) return null;
    let found = null;
    modelo.traverse(o => { if (o.name === nombre) found = o; });
    return found;
}


/* =====================================================
   ROUTER
   ===================================================== */
function mostrarPregunta(indice) {
    _destruir3d();
    document.getElementById('uiEvaluacion')?.remove();
    const contenedor = document.getElementById(_contenedorId);
    if (!contenedor) return;
    const p = PREGUNTAS[indice];
    if (p.tipo === '3d_click') _mostrarPregunta3DClick(contenedor, p, indice);
    else if (p.tipo === '3d_selector') _mostrarPregunta3DSelector(contenedor, p, indice);
    else if (p.tipo === 'ordenar') _mostrarPreguntaOrdenar(contenedor, p, indice);
    else if (p.tipo === 'opcion_multiple') _mostrarPreguntaOpcionMultiple(contenedor, p, indice);
    else if (p.tipo === 'seleccion_multiple') _mostrarPreguntaSeleccionMultiple(contenedor, p, indice);
}


/* =====================================================
   SONIDOS DE RETROALIMENTACIÓN
   ===================================================== */
function _reproducirSonido(esCorrecta) {
    try {
        const audio = new Audio(esCorrecta ? SONIDO_CORRECTO : SONIDO_INCORRECTO);
        audio.volume = 0.7;
        audio.play().catch(() => { });
    } catch { }
}


/* =====================================================
   AVANZAR + BANNER RETRO
   ===================================================== */
function _avanzar(indice) {
    const respActual = _respuestas.find(r => r.numPregunta === PREGUNTAS[indice].num);
    const esCorrecta = respActual?.esCorrecta ?? false;
    _estadoPregunta[PREGUNTAS[indice].num] = esCorrecta;
    // Reproducir sonido antes del banner
    _reproducirSonido(esCorrecta);
    _mostrarBannerRetro(esCorrecta, () => {
        _destruir3d();
        const siguiente = indice + 1;
        if (siguiente < PREGUNTAS.length) mostrarPregunta(siguiente);
        else enviarResultados();
    });
}

function _mostrarBannerRetro(esCorrecta, onDone) {
    document.getElementById('bannerRetroEval')?.remove();
    const banner = document.createElement('div');
    banner.id = 'bannerRetroEval';
    banner.style.cssText = `position:fixed;inset:0;z-index:9999;display:flex;flex-direction:column;
        align-items:center;justify-content:center;
        background:${esCorrecta ? 'rgba(30,92,58,0.93)' : 'rgba(192,57,43,0.93)'};
        font-family:'DM Sans',sans-serif;animation:fadeInBanner 0.25s ease;`;
    banner.innerHTML = `
        <style>@keyframes fadeInBanner{from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}}</style>
        <div style="font-size:1.5rem;font-weight:700;color:white;">${esCorrecta ? '¡Correcto!' : 'Incorrecto'}</div>
        <div style="font-size:0.88rem;color:rgba(255,255,255,0.8);margin-top:8px;">
            ${esCorrecta ? 'Muy bien, continúa.' : 'Respuesta incorrecta'}
        </div>`;
    document.body.appendChild(banner);
    setTimeout(() => {
        banner.style.transition = 'opacity 0.3s'; banner.style.opacity = '0';
        setTimeout(() => { banner.remove(); onDone(); }, 300);
    }, 1200);
}


/* =====================================================
   BARRA + FOOTER
   ===================================================== */
function _barraProgressHTML(indice) {
    return `<div style="background:#163d27;color:white;padding:12px 20px;
        display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">
        <span style="font-size:0.85rem;opacity:0.85;">Evaluación — Beneheart D6 &nbsp;·&nbsp; Intento ${_numIntento} de 2</span>
        <div style="display:flex;gap:6px;">
            ${PREGUNTAS.map((p, i) => {
        const est = _estadoPregunta[p.num];
        let bg, color, content;
        if (i < indice && est !== undefined) { bg = est ? '#2d7a50' : '#c0392b'; color = 'white'; content = est ? '✓' : '✗'; }
        else if (i === indice) { bg = 'white'; color = '#163d27'; content = i + 1; }
        else { bg = 'rgba(255,255,255,0.2)'; color = 'white'; content = i + 1; }
        return `<div style="width:28px;height:28px;border-radius:50%;background:${bg};color:${color};
                    display:flex;align-items:center;justify-content:center;font-size:0.72rem;font-weight:600;">${content}</div>`;
    }).join('')}
        </div>
    </div>`;
}

function _footerHTML(indice) {
    return `<div style="background:white;border-top:1px solid #dde3dd;padding:12px 24px;display:flex;justify-content:flex-end;flex-shrink:0;">
        <button id="btnContinuarEval" onclick="window._evalContinuar()" disabled
            style="padding:10px 28px;border:none;border-radius:10px;background:#e0e6e0;color:#9ab0a0;
                font-family:'DM Sans',sans-serif;font-size:0.9rem;font-weight:600;cursor:not-allowed;transition:all 0.2s;">
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
    if (btn) { btn.disabled = false; btn.style.background = '#1e5c3a'; btn.style.color = 'white'; btn.style.cursor = 'pointer'; }
}


/* =====================================================
   UI 3D
   ===================================================== */
function _crearUI3D(contenedor, pregunta, indice, instruccionExtra = '') {
    const ui = document.createElement('div');
    ui.id = 'uiEvaluacion';
    ui.style.cssText = `position:absolute;inset:0;display:flex;flex-direction:column;
        font-family:'DM Sans',sans-serif;background:#f4f6f4;`;
    ui.innerHTML = `
        ${_barraProgressHTML(indice)}
        <div style="flex:1;display:flex;overflow:hidden;">
            <div style="width:300px;flex-shrink:0;background:white;border-right:1px solid #dde3dd;
                display:flex;flex-direction:column;padding:20px;gap:14px;overflow-y:auto;">
                <div>
                    <p style="font-size:0.72rem;color:#5a7a62;margin:0 0 6px;font-weight:600;
                        text-transform:uppercase;letter-spacing:0.05em;">
                        Pregunta ${pregunta.num} de ${PREGUNTAS.length}
                    </p>
                    <p style="font-size:0.9rem;color:#1a2e1f;line-height:1.6;margin:0;">${pregunta.enunciado}</p>
                </div>
                <div style="background:#f0f5f0;border-radius:10px;padding:10px 12px;">
                    <span style="font-size:0.78rem;color:#5a7a62;">${pregunta.instruccion}</span>
                </div>
                ${instruccionExtra}
                <div id="indicadorSeleccion" style="min-height:44px;border-radius:10px;
                    border:1.5px dashed #c8d8c8;padding:10px 14px;
                    font-size:0.82rem;color:#9ab0a0;display:flex;align-items:center;gap:8px;">
                    <span>Ningún elemento seleccionado aún</span>
                </div>
                <div id="loaderEval3d" style="display:flex;flex-direction:column;align-items:center;gap:8px;padding:12px 0;">
                    <div style="width:28px;height:28px;border:3px solid #e0e6e0;border-top-color:#1e5c3a;
                        border-radius:50%;animation:spinEval 0.8s linear infinite;"></div>
                    <span style="font-size:0.75rem;color:#5a7a62;">Cargando... <span id="loaderPct">0</span>%</span>
                </div>
                <style>@keyframes spinEval{to{transform:rotate(360deg);}}</style>
            </div>
            <div id="canvasEval3d" style="flex:1;position:relative;overflow:hidden;">
                <div style="position:absolute;bottom:16px;right:16px;z-index:20;
                    background:rgba(255,255,255,0.92);border-radius:12px;
                    border:1px solid rgba(0,0,0,0.08);padding:8px;width:148px;
                    box-shadow:0 4px 16px rgba(0,0,0,0.12);">
                    <p style="font-size:0.62rem;color:#5a7a62;font-weight:600;
                        text-transform:uppercase;letter-spacing:0.05em;margin:0 0 6px;text-align:center;">
                        Cómo interactuar
                    </p>
                    <img src="${IMG_CONTROLES}" alt="Controles"
                        style="width:100%;border-radius:8px;display:block;"
                        onerror="this.closest('div').style.display='none'">
                </div>
            </div>
        </div>
        ${_footerHTML(indice)}`;
    contenedor.appendChild(ui);
}

function _iniciarManito(canvasContainer, mensaje) {
    cancelAnimationFrame(_manitoAnimId);
    document.getElementById('manitoEval')?.remove();
    const manito = document.createElement('div');
    manito.id = 'manitoEval';
    manito.style.cssText = `position:absolute;pointer-events:none;z-index:15;
        display:flex;flex-direction:column;align-items:center;gap:4px;`;
    manito.innerHTML = `
        <div id="manitoIcon" style="font-size:2.2rem;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.35));">👆</div>
        <div style="background:#1e5c3a;color:white;font-size:0.68rem;padding:4px 10px;
            border-radius:20px;white-space:nowrap;font-family:'DM Sans',sans-serif;font-weight:600;">
            ${mensaje}
        </div>
        <style>
            @keyframes manitoFloat{0%,100%{transform:translateY(0) scale(1);}50%{transform:translateY(-10px) scale(1.08);}}
            #manitoIcon{animation:manitoFloat 1.4s ease-in-out infinite;}
        </style>`;
    canvasContainer.appendChild(manito);
    function pos() {
        const canvas = canvasContainer.querySelector('canvas');
        if (!canvas) { _manitoAnimId = requestAnimationFrame(pos); return; }
        const containerRect = canvasContainer.getBoundingClientRect();
        const canvasRect = canvas.getBoundingClientRect();
        const cx = canvasRect.left - containerRect.left + canvasRect.width * 0.3;
        const cy = canvasRect.top - containerRect.top + canvasRect.height * 0.58;
        manito.style.left = (cx + 20) + 'px';
        manito.style.top = (cy - 40) + 'px';
        _manitoAnimId = requestAnimationFrame(pos);
    }
    pos();
}

function _quitarManito() {
    cancelAnimationFrame(_manitoAnimId);
    document.getElementById('manitoEval')?.remove();
}


/* =====================================================
   PREGUNTA 1
   ===================================================== */
function _mostrarPregunta3DClick(contenedor, pregunta, indice) {
    _crearUI3D(contenedor, pregunta, indice);
    window._evalContinuar = () => _avanzar(indice);
    const base = inicializarEscena('canvasEval3d');
    _escena3d = base.escena; _camara3d = base.camara; _renderer3d = base.renderer;
    _controls3d = base.controls; _reloj3d = base.reloj;
    _raycaster3d = new THREE.Raycaster(); _mouse3d = new THREE.Vector2();
    cargarModelo('/Estudiante/threejs/modelados/Final.glb', _escena3d, _camara3d, _controls3d,
        (modelo) => {
            _modelo3d = modelo;
            _modelo3d.traverse(o => { if (o.name === 'perilla001') o.rotation.x = -1.57; });
            let pantalla = null;
            _modelo3d.traverse(o => { if (o.name === 'pantalla') pantalla = o; });
            if (pantalla) {
                new THREE.TextureLoader().load('/Estudiante/threejs/img/cargaenergia.png', tex => {
                    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping; tex.flipY = false; tex.needsUpdate = true;
                    const mats = Array.isArray(pantalla.material) ? pantalla.material : [pantalla.material];
                    mats.forEach(m => { m.map = tex; m.color.set(0xffffff); m.needsUpdate = true; });
                });
            }
            document.getElementById('loaderEval3d')?.remove();
            const canvasContainer = document.getElementById('canvasEval3d');
            if (canvasContainer) _iniciarManito(canvasContainer, 'Haz click sobre el modelado para elegir la respuesta correcta');
            function animar() {
                _animFrame3d = requestAnimationFrame(animar);
                if (!_escena3d || !_camara3d || !_renderer3d) return;
                _controls3d.update(); _renderer3d.render(_escena3d, _camara3d);
            }
            animar();
            _renderer3d.domElement.addEventListener('click', _onClickEval);
        }
    );
}

function _onClickEval(event) {
    if (!_modelo3d || !_renderer3d) return;
    _quitarManito();
    const rect = _renderer3d.domElement.getBoundingClientRect();
    _mouse3d.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    _mouse3d.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    _raycaster3d.setFromCamera(_mouse3d, _camara3d);
    const meshes = []; _modelo3d.traverse(o => { if (o.isMesh) meshes.push(o); });
    const hits = _raycaster3d.intersectObjects(meshes, true);
    if (!hits.length) return;
    const mesh = hits[0].object, nombre = mesh.name;
    if (!NOMBRES_LEGIBLES[nombre]) return;
    if (_meshHighlight) {
        const prev = _meshHighlight.name;
        if (_materialOriginal[prev] !== undefined) { _meshHighlight.material.color.setHex(_materialOriginal[prev]); _meshHighlight.material.needsUpdate = true; }
        if (CORRECTOS_P1.has(prev)) {
            CORRECTOS_P1.forEach(n => {
                if (n !== prev) { const otro = _getMesh(n); if (otro && _materialOriginal[n] !== undefined) { otro.material.color.setHex(_materialOriginal[n]); otro.material.needsUpdate = true; } }
            });
        }
    }
    const COLOR_SEL = 0x4a90d9;
    if (CORRECTOS_P1.has(nombre)) {
        CORRECTOS_P1.forEach(n => { const m = _getMesh(n); if (m?.material?.color) { _materialOriginal[n] = m.material.color.getHex(); m.material.color.setHex(COLOR_SEL); m.material.needsUpdate = true; } });
        _meshHighlight = mesh;
    } else {
        if (mesh.material?.color) { _materialOriginal[nombre] = mesh.material.color.getHex(); mesh.material.color.setHex(COLOR_SEL); mesh.material.needsUpdate = true; }
        _meshHighlight = mesh;
    }
    _guardarRespuesta(1, CORRECTOS_P1.has(nombre));
    _actualizarIndicador(CORRECTOS_P1.has(nombre) ? 'Botones de descarga de las palas (ambos)' : NOMBRES_LEGIBLES[nombre]);
    _habilitarContinuar();
}

function _getMesh(nombre) {
    if (!_modelo3d) return null;
    let found = null; _modelo3d.traverse(o => { if (o.name === nombre) found = o; }); return found;
}


/* =====================================================
   PREGUNTA 3
   ===================================================== */
function _mostrarPregunta3DSelector(contenedor, pregunta, indice) {
    const instrExtra = `
        <div style="background:#fff8e1;border-radius:10px;padding:10px 12px;
            border:1px solid #f0c040;font-size:0.78rem;color:#7a6000;line-height:1.5;">
            <strong>Opción 1:</strong> Haz clic y arrastra la perilla de navegación hacia la derecha.<br>
            <strong>Opción 2:</strong> Haz clic en el botón de selección de derivada para cambiar.
        </div>`;
    _crearUI3D(contenedor, pregunta, indice, instrExtra);
    window._evalContinuar = () => _avanzar(indice);
    const base = inicializarEscena('canvasEval3d');
    _escena3d = base.escena; _camara3d = base.camara; _renderer3d = base.renderer;
    _controls3d = base.controls; _reloj3d = base.reloj;
    _raycaster3d = new THREE.Raycaster(); _mouse3d = new THREE.Vector2();
    _indiceCicloP3 = 0;
    cargarModelo('/Estudiante/threejs/modelados/Final.glb', _escena3d, _camara3d, _controls3d,
        (modelo) => {
            _modelo3d = modelo;
            _modelo3d.traverse(o => { if (o.name === 'perilla001') o.rotation.x = -0.9; });
            _camara3d.position.set(-0.2, 0, 0.8);
            _camara3d.lookAt(0, 0, 0);
            _controls3d.target.set(-0.2, 0, 0); _controls3d.update();
            _controls3d.enableRotate = false; _controls3d.enableZoom = false; _controls3d.enablePan = false;
            _modelo3d.traverse(o => { if (o.name === 'selector') _selectorObj = o; });
            _aplicarTexturaPantalla('/Estudiante/threejs/img/MODOMONITOR.png');
            _imagenActualP3 = '/Estudiante/threejs/img/MODOMONITOR.png';
            document.getElementById('loaderEval3d')?.remove();
            _iniciarAnimacionPulsoObjetos(['selector', 'B_SelecDerivada']);
            _actualizarIndicadorP3(IMAGENES_SELECTOR_P3[0]);
            const canvasContainer = document.getElementById('canvasEval3d');
            if (canvasContainer) _iniciarManito(canvasContainer, 'Gira la perilla o usa el botón derivada');
            function animar() {
                _animFrame3d = requestAnimationFrame(animar);
                if (!_escena3d || !_camara3d || !_renderer3d) return;
                _controls3d.update(); _renderer3d.render(_escena3d, _camara3d);
            }
            animar();
            _renderer3d.domElement.addEventListener('mousedown', _onMouseDownP3);
            _renderer3d.domElement.addEventListener('mousemove', _onMouseMoveP3);
            _renderer3d.domElement.addEventListener('mouseup', _onMouseUpP3);
            _renderer3d.domElement.addEventListener('click', _onClickP3Botones);
        }
    );
}

function _iniciarAnimacionPulsoObjetos(nombres) {
    if (!_modelo3d) return;
    const objetos = [];
    _modelo3d.traverse(o => { if (nombres.includes(o.name)) objetos.push(o); });
    if (!objetos.length) return;
    const escalaBase = objetos.map(o => o.scale.clone());
    const AMPLITUD = 0.08, VELOCIDAD = 2.5;
    let frame = 0;
    function animar() {
        if (!_modelo3d) return;
        const t = performance.now() / 1000;
        objetos.forEach((obj, i) => { const factor = 1 + Math.sin(t * VELOCIDAD * Math.PI * 2) * AMPLITUD; obj.scale.copy(escalaBase[i]).multiplyScalar(factor); });
        frame = requestAnimationFrame(animar);
    }
    _pulsoAnimId = animar();
    const detener = () => {
        cancelAnimationFrame(frame);
        objetos.forEach((obj, i) => obj.scale.copy(escalaBase[i]));
        _renderer3d?.domElement.removeEventListener('mousedown', detener);
    };
    _renderer3d?.domElement.addEventListener('mousedown', detener, { once: true });
}

function _onMouseDownP3(event) {
    if (!_modelo3d || !_renderer3d || !_selectorObj) return;
    const rect = _renderer3d.domElement.getBoundingClientRect();
    _mouse3d.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    _mouse3d.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    _raycaster3d.setFromCamera(_mouse3d, _camara3d);
    const meshes = []; _modelo3d.traverse(o => { if (o.isMesh) meshes.push(o); });
    const hits = _raycaster3d.intersectObjects(meshes, true);
    if (!hits.length) return;
    if (hits[0].object.name === 'selector') {
        _rotandoSelector = true; _mouseXAnteriorP3 = event.clientX;
        _renderer3d.domElement.style.cursor = 'grabbing'; _quitarManito();
    }
}

function _onMouseMoveP3(event) {
    if (!_rotandoSelector || !_selectorObj) return;
    const deltaX = event.clientX - _mouseXAnteriorP3; _mouseXAnteriorP3 = event.clientX;
    _selectorObj.rotation.x = Math.max(0, Math.min(_selectorObj.rotation.x + deltaX * 0.015, 3.5));
    _actualizarImagenP3(_selectorObj.rotation.x);
}

function _onMouseUpP3() {
    if (!_rotandoSelector) return;
    _rotandoSelector = false;
    if (_renderer3d) _renderer3d.domElement.style.cursor = 'default';
}

function _onClickP3Botones(event) {
    if (!_modelo3d || !_renderer3d) return;
    const rect = _renderer3d.domElement.getBoundingClientRect();
    _mouse3d.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    _mouse3d.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    _raycaster3d.setFromCamera(_mouse3d, _camara3d);
    const meshes = []; _modelo3d.traverse(o => { if (o.isMesh) meshes.push(o); });
    const hits = _raycaster3d.intersectObjects(meshes, true);
    if (!hits.length || hits[0].object.name !== 'B_SelecDerivada') return;
    _quitarManito();
    try { const a = new Audio('/Estudiante/threejs/audios/pop.mp3'); a.volume = 0.7; a.play().catch(() => { }); } catch { }
    _indiceCicloP3 = (_indiceCicloP3 + 1) % CICLO_DERIVADA_P3.length;
    const config = CICLO_DERIVADA_P3[_indiceCicloP3];
    _aplicarTexturaPantalla(config.imagen); _imagenActualP3 = config.imagen;
    _actualizarIndicadorP3(config); _guardarRespuesta(3, config.correcta); _habilitarContinuar();
}

function _actualizarImagenP3(angulo) {
    const config = IMAGENES_SELECTOR_P3.find(c => angulo < c.hasta) ?? IMAGENES_SELECTOR_P3[IMAGENES_SELECTOR_P3.length - 1];
    if (_imagenActualP3 === config.imagen) return;
    _imagenActualP3 = config.imagen; _aplicarTexturaPantalla(config.imagen);
    _actualizarIndicadorP3(config); _guardarRespuesta(3, config.correcta); _habilitarContinuar();
}

function _actualizarIndicadorP3(config) {
    const indicador = document.getElementById('indicadorSeleccion');
    if (!indicador) return;
    indicador.style.borderColor = '#4a90d9';
    indicador.style.background = '#eef4fb';
    indicador.innerHTML = `<span style="color:#1a2e1f;font-weight:500;">Seleccionaste: <strong>${config.nombre}</strong></span>`;
}

function _aplicarTexturaPantalla(ruta) {
    if (!_modelo3d) return;
    let pantalla = null; _modelo3d.traverse(o => { if (o.name === 'pantalla') pantalla = o; });
    if (!pantalla) return;
    const aplicar = tex => {
        tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping; tex.flipY = false; tex.needsUpdate = true;
        const mats = Array.isArray(pantalla.material) ? pantalla.material : [pantalla.material];
        mats.forEach(m => { m.map = tex; m.color.set(0xffffff); m.needsUpdate = true; });
    };
    if (_cachTexturasP3[ruta]) aplicar(_cachTexturasP3[ruta]);
    else new THREE.TextureLoader().load(ruta, tex => { _cachTexturasP3[ruta] = tex; aplicar(tex); });
}


/* =====================================================
   PREGUNTA 2 — ORDENAR
   ===================================================== */
function _mostrarPreguntaOrdenar(contenedor, pregunta, indice) {
    const ui = document.createElement('div');
    ui.id = 'uiEvaluacion';
    ui.style.cssText = `position:absolute;inset:0;display:flex;flex-direction:column;
        font-family:'DM Sans',sans-serif;background:#f4f6f4;`;
    const tarjetasMezcladas = [...TARJETAS_P2].sort(() => Math.random() - 0.5);
    const COLORES = [{ bg: '#e8f0fb', border: '#4a90d9' }, { bg: '#e8f5ee', border: '#1e5c3a' }, { bg: '#fff8e1', border: '#b8860b' }, { bg: '#fef0ed', border: '#c0392b' }, { bg: '#f3eeff', border: '#7c4dff' }];
    ui.innerHTML = `
        ${_barraProgressHTML(indice)}
        <div style="background:white;padding:16px 24px;border-bottom:1px solid #dde3dd;flex-shrink:0;">
            <p style="font-size:0.72rem;color:#5a7a62;margin:0 0 6px;font-weight:600;text-transform:uppercase;">Pregunta ${pregunta.num} de ${PREGUNTAS.length}</p>
            <p style="font-size:0.92rem;color:#1a2e1f;line-height:1.6;margin:0;">${pregunta.enunciado}</p>
        </div>
        <div style="flex:1;overflow-y:auto;display:flex;flex-direction:column;align-items:center;padding:20px;gap:14px;">
            <p style="font-size:0.8rem;color:#5a7a62;margin:0;text-align:center;">Arrastra las tarjetas para ordenarlas correctamente (de izquierda a derecha)</p>
            <div id="listaOrdenar" style="width:100%;max-width:1100px;display:flex;flex-direction:row;gap:10px;align-items:stretch;">
                ${tarjetasMezcladas.map((t, i) => {
        const c = COLORES[i % COLORES.length];
        const imgHTML = t.imagen ? `<img src="${t.imagen}" alt="" draggable="false" style="width:200px;height:150px;object-fit:cover;border-radius:6px;display:block;flex-shrink:0;" onerror="this.style.display='none'">` : '';
        return `<div data-id="${t.id}" draggable="true" style="flex:1;min-width:0;display:flex;flex-direction:column;align-items:center;gap:8px;background:${c.bg};border:2px solid ${c.border};border-radius:12px;padding:12px;cursor:grab;user-select:none;box-shadow:0 2px 6px rgba(0,0,0,0.07);transition:box-shadow 0.15s,border-color 0.15s;text-align:center;overflow:hidden;">
                        <div class="num-orden" style="width:28px;height:28px;border-radius:50%;flex-shrink:0;background:${c.border};color:white;display:flex;align-items:center;justify-content:center;font-size:0.78rem;font-weight:700;">${i + 1}</div>
                        ${imgHTML}
                        <span style="font-size:0.78rem;color:#1a2e1f;line-height:1.4;font-weight:500;">${t.texto}</span>
                    </div>`;
    }).join('')}
            </div>
        </div>
        ${_footerHTML(indice)}
        <style>
            #listaOrdenar [data-id].drag-over{border-color:#1e5c3a!important;box-shadow:0 0 0 3px #1e5c3a40;}
            #listaOrdenar [data-id].arrastrando{opacity:0.45;}
        </style>`;
    contenedor.appendChild(ui);
    const lista = document.getElementById('listaOrdenar');
    let draggingEl = null;
    lista.addEventListener('dragstart', e => { draggingEl = e.target.closest('[data-id]'); if (!draggingEl) return; draggingEl.classList.add('arrastrando'); e.dataTransfer.effectAllowed = 'move'; });
    lista.addEventListener('dragend', () => { draggingEl?.classList.remove('arrastrando'); draggingEl = null; lista.querySelectorAll('[data-id]').forEach(el => el.classList.remove('drag-over')); _actualizarNumerosOrden(); _evaluarOrdenP2(pregunta.num); _habilitarContinuar(); });
    lista.addEventListener('dragover', e => { e.preventDefault(); const sobre = e.target.closest('[data-id]'); if (!sobre || sobre === draggingEl) return; lista.querySelectorAll('[data-id]').forEach(el => el.classList.remove('drag-over')); sobre.classList.add('drag-over'); const rect = sobre.getBoundingClientRect(); if (e.clientX < rect.left + rect.width / 2) lista.insertBefore(draggingEl, sobre); else lista.insertBefore(draggingEl, sobre.nextSibling); });
    _agregarSoporteTouchOrdenar(lista, pregunta.num);
    window._evalContinuar = () => _avanzar(indice);
}

function _actualizarNumerosOrden() {
    document.getElementById('listaOrdenar')?.querySelectorAll('[data-id]').forEach((el, i) => { const n = el.querySelector('.num-orden'); if (n) n.textContent = i + 1; });
}

function _evaluarOrdenP2(numPregunta) {
    const lista = document.getElementById('listaOrdenar');
    if (!lista) return;
    const esCorrecta = [...lista.querySelectorAll('[data-id]')].every((el, i) => { const t = TARJETAS_P2.find(t => t.id === parseInt(el.dataset.id)); return t?.orden_correcto === i + 1; });
    _guardarRespuesta(numPregunta, esCorrecta);
}

function _agregarSoporteTouchOrdenar(lista, numPregunta) {
    let touchDragging = null, ghost = null;
    lista.addEventListener('touchstart', e => { const el = e.target.closest('[data-id]'); if (!el) return; touchDragging = el; el.classList.add('arrastrando'); ghost = el.cloneNode(true); ghost.style.cssText += `;position:fixed;opacity:0.75;pointer-events:none;z-index:9999;width:${el.offsetWidth}px;`; document.body.appendChild(ghost); }, { passive: true });
    lista.addEventListener('touchmove', e => { if (!touchDragging || !ghost) return; e.preventDefault(); const t = e.touches[0]; ghost.style.left = (t.clientX - ghost.offsetWidth / 2) + 'px'; ghost.style.top = (t.clientY - ghost.offsetHeight / 2) + 'px'; const sobre = document.elementFromPoint(t.clientX, t.clientY)?.closest('[data-id]'); if (sobre && sobre !== touchDragging) { const rect = sobre.getBoundingClientRect(); if (t.clientY < rect.top + rect.height / 2) lista.insertBefore(touchDragging, sobre); else lista.insertBefore(touchDragging, sobre.nextSibling); } }, { passive: false });
    lista.addEventListener('touchend', () => { touchDragging?.classList.remove('arrastrando'); ghost?.remove(); ghost = null; touchDragging = null; _actualizarNumerosOrden(); _evaluarOrdenP2(numPregunta); _habilitarContinuar(); });
}


/* =====================================================
   PREGUNTA 4 — ABCD con imagen centrada
   ===================================================== */
function _mostrarPreguntaOpcionMultiple(contenedor, pregunta, indice) {
    const ui = document.createElement('div');
    ui.id = 'uiEvaluacion';
    ui.style.cssText = `position:absolute;inset:0;display:flex;flex-direction:column;
        font-family:'DM Sans',sans-serif;background:#f4f6f4;`;

    ui.innerHTML = `
        ${_barraProgressHTML(indice)}

        <!-- Enunciado -->
        <div style="background:white;padding:16px 24px;border-bottom:1px solid #dde3dd;flex-shrink:0;">
            <p style="font-size:0.72rem;color:#5a7a62;margin:0 0 6px;font-weight:600;text-transform:uppercase;">
                Pregunta ${pregunta.num} de ${PREGUNTAS.length}
            </p>
            <p style="font-size:0.92rem;color:#1a2e1f;line-height:1.6;margin:0;">${pregunta.enunciado}</p>
        </div>

        <!-- Contenido principal: imagen + opciones -->
        <div style="flex:1;overflow-y:auto;display:flex;flex-direction:column;
            align-items:center;justify-content:center;padding:20px;gap:20px;">

            <!-- Imagen de contexto centrada -->
            ${pregunta.imagenContexto ? `
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px;">
                <p style="font-size:0.72rem;color:#5a7a62;font-weight:600;
                    text-transform:uppercase;margin:0;letter-spacing:0.05em;">
                    Ritmo en pantalla
                </p>
                <img src="${pregunta.imagenContexto}" alt="Ritmo cardíaco"
                    style="height:300px;max-width:100%;border-radius:12px;
                           border:1.5px solid #dde3dd;object-fit:contain;
                           box-shadow:0 2px 8px rgba(0,0,0,0.08);"
                    onerror="this.parentElement.style.display='none'">
            </div>` : ''}

            <!-- Opciones en FILA -->
            <div style="display:flex;flex-direction:row;gap:12px;
                width:100%;max-width:1060px;align-items:stretch;">
                ${OPCIONES_P4.map(op => `
                    <div data-opcion4="${op.id}" style="
                        flex:1;min-width:0;
                        display:flex;flex-direction:column;align-items:center;
                        gap:12px;text-align:center;
                        background:white;border:2.5px solid #dde3dd;border-radius:14px;
                        padding:20px 14px;cursor:pointer;
                        transition:border-color 0.2s,background 0.2s;">
                        <div style="width:44px;height:44px;border-radius:50%;flex-shrink:0;
                            background:${op.bg};border:2.5px solid ${op.color};
                            display:flex;align-items:center;justify-content:center;
                            font-size:1rem;font-weight:700;color:${op.color};">
                            ${op.id}
                        </div>
                        <span style="font-size:0.86rem;color:#1a2e1f;line-height:1.5;">
                            ${op.texto}
                        </span>
                    </div>`).join('')}
            </div>

            
        </div>

        ${_footerHTML(indice)}
        <style>
            [data-opcion4].seleccionada4 {
                background: var(--op4-bg) !important;
                border-color: var(--op4-color) !important;
            }
        </style>`;

    contenedor.appendChild(ui);

    OPCIONES_P4.forEach(op => {
        const el = contenedor.querySelector(`[data-opcion4="${op.id}"]`);
        if (!el) return;
        el.style.setProperty('--op4-color', op.color);
        el.style.setProperty('--op4-bg', op.bg);
        el.addEventListener('click', () => {
            contenedor.querySelectorAll('[data-opcion4]').forEach(e => e.classList.remove('seleccionada4'));
            el.classList.add('seleccionada4');
            _guardarRespuesta(pregunta.num, op.correcta);
            _habilitarContinuar();
        });
    });

    window._evalContinuar = () => _avanzar(indice);
}


/* =====================================================
   PREGUNTA 5 — SELECCIÓN MÚLTIPLE
   ===================================================== */
function _mostrarPreguntaSeleccionMultiple(contenedor, pregunta, indice) {
    const ui = document.createElement('div');
    ui.id = 'uiEvaluacion';
    ui.style.cssText = `position:absolute;inset:0;display:flex;flex-direction:column;font-family:'DM Sans',sans-serif;background:#f4f6f4;`;
    ui.innerHTML = `
        ${_barraProgressHTML(indice)}
        <div style="background:white;padding:16px 24px;border-bottom:1px solid #dde3dd;flex-shrink:0;">
            <p style="font-size:0.72rem;color:#5a7a62;margin:0 0 6px;font-weight:600;text-transform:uppercase;">Pregunta ${pregunta.num} de ${PREGUNTAS.length}</p>
            <p style="font-size:0.92rem;color:#1a2e1f;line-height:1.6;margin:0;">${pregunta.enunciado}</p>
        </div>
        <div style="flex:1;overflow-y:auto;display:flex;flex-direction:column;align-items:center;padding:20px;gap:12px;">
            <p style="font-size:0.8rem;color:#5a7a62;margin:0;text-align:center;">Selecciona todas las opciones que consideres correctas</p>
            <div style="display:flex;flex-direction:row;gap:12px;width:100%;max-width:1060px;align-items:stretch;height:340px;">
                ${OPCIONES_P5.map(op => `
                    <div data-opcion="${op.id}" style="flex:1;min-width:0;display:flex;flex-direction:column;background:white;border:2.5px solid #dde3dd;border-radius:14px;overflow:hidden;cursor:pointer;transition:border-color 0.2s,background 0.2s;box-sizing:border-box;">
                        <img src="${op.imagen}" alt="Opción ${op.id}" draggable="false" style="width:100%;height:190px;object-fit:cover;flex-shrink:0;display:block;" onerror="this.style.display='none'">
                        <div style="flex:1;padding:10px;display:flex;flex-direction:column;gap:6px;background:inherit;">
                            <div style="display:flex;align-items:center;justify-content:space-between;">
                                <span style="width:24px;height:24px;border-radius:50%;background:${op.bg};border:2px solid ${op.color};display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:700;color:${op.color};flex-shrink:0;">${op.id}</span>
                                <div class="check-indicator" style="width:20px;height:20px;border-radius:50%;border:2.5px solid #dde3dd;background:white;transition:all 0.2s;flex-shrink:0;"></div>
                            </div>
                            <span style="font-size:0.77rem;color:#1a2e1f;line-height:1.4;">
                                ${op.tipo === 'tiempo' ? op.texto.replace('____', `<input id="inputTiempoP5" type="number" min="0" max="60" placeholder="?" style="width:42px;text-align:center;border:2px solid ${op.color};border-radius:6px;padding:2px 4px;font-size:0.82rem;font-weight:700;color:${op.color};background:${op.bg};outline:none;">`) : op.texto}
                            </span>
                        </div>
                    </div>`).join('')}
            </div>
        </div>
        ${_footerHTML(indice)}
        <style>
            [data-opcion].seleccionada{background:var(--op-bg)!important;border-color:var(--op-color)!important;}
            [data-opcion].seleccionada .check-indicator{background:var(--op-color)!important;border-color:var(--op-color)!important;}
        </style>`;
    contenedor.appendChild(ui);
    const seleccionadas = new Set();
    OPCIONES_P5.forEach(op => { const el = contenedor.querySelector(`[data-opcion="${op.id}"]`); if (!el) return; el.style.setProperty('--op-color', op.color); el.style.setProperty('--op-bg', op.bg); });
    contenedor.querySelectorAll('[data-opcion]').forEach(el => {
        el.addEventListener('click', e => {
            if (e.target.id === 'inputTiempoP5') return;
            const id = el.dataset.opcion;
            if (seleccionadas.has(id)) { seleccionadas.delete(id); el.classList.remove('seleccionada'); el.querySelector('.check-indicator').style.background = 'white'; el.querySelector('.check-indicator').style.borderColor = '#dde3dd'; }
            else { seleccionadas.add(id); el.classList.add('seleccionada'); const c = op_color(id); el.querySelector('.check-indicator').style.background = c; el.querySelector('.check-indicator').style.borderColor = c; }
            _evaluarSeleccionMultipleP5(pregunta.num, seleccionadas); _habilitarContinuar();
        });
    });
    const inputTiempo = document.getElementById('inputTiempoP5');
    if (inputTiempo) { inputTiempo.addEventListener('input', () => { _evaluarSeleccionMultipleP5(pregunta.num, seleccionadas); if (inputTiempo.value.trim() !== '') _habilitarContinuar(); }); }
    window._evalContinuar = () => _avanzar(indice);
}

function op_color(id) { return OPCIONES_P5.find(o => o.id === id)?.color ?? '#1e5c3a'; }

function _evaluarSeleccionMultipleP5(numPregunta, seleccionadas) {
    const inputTiempo = document.getElementById('inputTiempoP5');
    const bActiva = seleccionadas.has('B') && inputTiempo?.value?.trim() === '1';
    _guardarRespuesta(numPregunta, bActiva && seleccionadas.has('C') && !seleccionadas.has('A') && !seleccionadas.has('D'));
}

function _actualizarIndicador(nombreLegible) {
    const indicador = document.getElementById('indicadorSeleccion');
    if (!indicador) return;
    indicador.style.borderColor = '#4a90d9'; indicador.style.background = '#eef4fb';
    indicador.innerHTML = `<span style="color:#1a2e1f;font-weight:500;">Seleccionaste: <strong>${nombreLegible}</strong></span>`;
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
    ui.style.cssText = `position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:#f4f6f4;font-family:'DM Sans',sans-serif;`;
    ui.innerHTML = `<div style="text-align:center;color:#5a7a62;"><div style="width:40px;height:40px;border:3px solid #e0e6e0;border-top-color:#1e5c3a;border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto 12px;"></div><p>Guardando resultado...</p><style>@keyframes spin{to{transform:rotate(360deg);}}</style></div>`;
    contenedor.appendChild(ui);
    try {
        const r = await fetch(`${API}/resultados/guardar`, { method: 'POST', headers: HEADERS, body: JSON.stringify({ asignacionId: _asignacionId, Respuestas: _respuestas }) });
        if (!r.ok) throw new Error(await r.text());
        mostrarResultado(await r.json());
    } catch (err) {
        document.getElementById('uiEvaluacion')?.remove();
        const c2 = document.getElementById(_contenedorId); if (!c2) return;
        const uiErr = document.createElement('div'); uiErr.id = 'uiEvaluacion';
        uiErr.style.cssText = `position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:#f4f6f4;font-family:'DM Sans',sans-serif;`;
        uiErr.innerHTML = `<div style="text-align:center;color:#c0392b;max-width:320px;padding:24px;"><p style="font-weight:600;margin-bottom:8px;">Error al guardar el resultado</p><p style="font-size:0.85rem;color:#5a7a62;">${err.message}</p><button onclick="window._evalVolver()" style="margin-top:16px;padding:10px 24px;border:none;border-radius:10px;background:#1e5c3a;color:white;cursor:pointer;font-family:'DM Sans',sans-serif;">Volver al módulo</button></div>`;
        c2.appendChild(uiErr); window._evalVolver = _salir;
    }
}


/* =====================================================
   RESULTADO FINAL
   ===================================================== */
function mostrarResultado(resultado) {
    document.getElementById('uiEvaluacion')?.remove();
    const contenedor = document.getElementById(_contenedorId);
    if (!contenedor) return;

    const puntaje = resultado.Puntaje, aprobado = puntaje >= 80, esInt2 = resultado.numIntento === 2;
    const colorPuntaje = aprobado ? '#1e5c3a' : '#c0392b', bgPuntaje = aprobado ? '#e8f5ee' : '#fef0ed';
    const incorrectas = esInt2 ? _respuestas.filter(r => !r.esCorrecta && RETROALIMENTACION[r.numPregunta]) : [];

    const ui = document.createElement('div');
    ui.id = 'uiEvaluacion';
    ui.style.cssText = `position:absolute;inset:0;display:flex;flex-direction:column;font-family:'DM Sans',sans-serif;background:#f4f6f4;overflow:hidden;`;

    const puntajeHTML = `
        <div style="background:white;border-bottom:1px solid #e8ece8;padding:74px 40px 10px;flex-shrink:0;display:flex;align-items:center;gap:24px;">
            <div style="width:80px;height:80px;border-radius:50%;background:${bgPuntaje};border:3px solid ${colorPuntaje};display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                <span style="font-size:1.5rem;font-weight:700;color:${colorPuntaje};">${puntaje}%</span>
            </div>
            <div style="flex:1;">
                <p style="font-size:1.15rem;font-weight:600;color:#1a2e1f;margin:0 0 4px;">
                    ${aprobado ? '¡Aprobaste la evaluación!' : 'No aprobaste esta vez'}
                </p>
                <p style="font-size:0.86rem;color:#5a7a62;margin:0;">
                    ${aprobado ? 'Superaste el umbral mínimo de aprobación (80%).' : 'El puntaje mínimo para aprobar es 80%.'}
                    ${!esInt2 ? ' — Tienes un intento más disponible.' : (aprobado ? '' : ' Has agotado tus intentos.')}
                </p>
                <div style="display:flex;gap:6px;margin-top:10px;">
                    ${PREGUNTAS.map(p => {
        const est = _estadoPregunta[p.num];
        return `<div style="width:26px;height:26px;border-radius:50%;background:${est === true ? '#1e5c3a' : est === false ? '#c0392b' : '#e0e6e0'};color:white;font-size:0.7rem;font-weight:600;display:flex;align-items:center;justify-content:center;" title="Pregunta ${p.num}">${est === true ? '✓' : est === false ? '✗' : p.num}</div>`;
    }).join('')}
                </div>
            </div>
            <div style="display:flex;flex-direction:column;gap:8px;flex-shrink:0;">
                ${!esInt2 ? `<button onclick="window._evalReintentar()" style="padding:10px 22px;border:none;border-radius:10px;background:#1e5c3a;color:white;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:0.88rem;font-weight:600;">Intentar de nuevo</button>` : ''}
                <button onclick="window._evalVolver()" style="padding:10px 22px;border:1.5px solid #dde3dd;border-radius:10px;background:white;color:#1a2e1f;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:0.88rem;">Volver al módulo</button>
            </div>
        </div>`;

    let centralHTML = '';

    if (esInt2 && incorrectas.length > 0) {
        centralHTML = `
            <div style="flex:1;display:flex;flex-direction:column;padding:24px 32px;gap:14px;overflow:hidden;">
                <div style="display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">
                    <p style="font-size:0.72rem;font-weight:600;color:#c0392b;text-transform:uppercase;letter-spacing:0.06em;margin:0;">
                        ${incorrectas.length} pregunta${incorrectas.length > 1 ? 's' : ''} incorrecta${incorrectas.length > 1 ? 's' : ''}
                    </p>
                    ${incorrectas.length > 1 ? `
                    <div style="display:flex;align-items:center;gap:8px;">
                        <button onclick="window._carruselRetro(-1)" style="width:32px;height:32px;border-radius:50%;border:1.5px solid #dde3dd;background:white;cursor:pointer;font-size:0.9rem;color:#5a7a62;display:flex;align-items:center;justify-content:center;">←</button>
                        <span id="carruselCounter" style="font-size:0.8rem;color:#5a7a62;min-width:36px;text-align:center;">1 / ${incorrectas.length}</span>
                        <button onclick="window._carruselRetro(1)" style="width:32px;height:32px;border-radius:50%;border:1.5px solid #dde3dd;background:white;cursor:pointer;font-size:0.9rem;color:#5a7a62;display:flex;align-items:center;justify-content:center;">→</button>
                    </div>`: ''}
                </div>
                <div id="carruselRetro" style="flex:1;position:relative;overflow:hidden;min-height:0;">
                    ${incorrectas.map((r, i) => {
            const retro = RETROALIMENTACION[r.numPregunta];
            return `<div class="slide-retro" data-slide="${i}" style="position:absolute;inset:0;display:${i === 0 ? 'flex' : 'none'};background:white;border-radius:16px;border:1px solid #f0e0e0;overflow:hidden;">
                            <div style="width:52%;flex-shrink:0;overflow:hidden;background:#f8f0f0;">
                                <img src="${retro.imagen}" alt="Retro P${r.numPregunta}" style="width:100%;height:100%;object-fit:contain;display:block;" onerror="this.parentElement.style.background='#f0f4f0'">
                            </div>
                            <div style="flex:1;padding:28px 32px;display:flex;flex-direction:column;justify-content:center;gap:12px;overflow-y:auto;">
                                <div style="display:inline-flex;align-items:center;gap:8px;background:#fef0ed;border-radius:8px;padding:5px 12px;width:fit-content;">
                                    <span style="width:18px;height:18px;border-radius:50%;background:#c0392b;color:white;font-size:0.65rem;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;">✗</span>
                                    <span style="font-size:0.72rem;font-weight:600;color:#c0392b;text-transform:uppercase;letter-spacing:0.05em;">Pregunta ${r.numPregunta} incorrecta</span>
                                </div>
                                <p style="font-size:0.95rem;color:#1a2e1f;line-height:1.65;margin:0;">${retro.texto}</p>
                                ${incorrectas.length > 1 ? `<div style="display:flex;gap:6px;margin-top:4px;">${incorrectas.map((_, j) => `<div class="punto-retro" data-punto="${j}" style="width:7px;height:7px;border-radius:50%;background:${j === i ? '#c0392b' : '#e0e6e0'};transition:background 0.2s;"></div>`).join('')}</div>` : ''}
                            </div>
                        </div>`;
        }).join('')}
                </div>
            </div>`;
    } else {
        const correctas = _respuestas.filter(r => r.esCorrecta).length;
        centralHTML = `
            <div style="flex:1;display:flex;align-items:center;justify-content:center;padding:24px;">
                <div style="background:white;border-radius:20px;border:1px solid #e8ece8;padding:36px 44px;max-width:520px;width:100%;display:flex;flex-direction:column;align-items:center;gap:20px;">
                    <div style="text-align:center;">
                        <p style="font-size:1.05rem;font-weight:600;color:#1a2e1f;margin:0 0 6px;">
                            Respondiste ${correctas} de ${PREGUNTAS.length} correctamente
                        </p>
                        <p style="font-size:0.84rem;color:#5a7a62;margin:0;line-height:1.6;">
                            ${esInt2 ? (aprobado ? 'Excelente trabajo.' : 'Has agotado los intentos disponibles.') : (aprobado ? '¡Lo lograste en el primer intento!' : 'Puedes volver a intentarlo.')}
                        </p>
                    </div>
                    <div style="width:100%;display:flex;flex-direction:column;gap:8px;">
                        ${PREGUNTAS.map(p => {
            const resp = _respuestas.find(r => r.numPregunta === p.num);
            const ok = resp?.esCorrecta ?? false;
            return `<div style="display:flex;align-items:center;gap:12px;background:${ok ? '#f0f8f4' : '#fef6f5'};border:1px solid ${ok ? '#c8e6d8' : '#f5ccc8'};border-radius:10px;padding:10px 16px;">
                                <div style="width:22px;height:22px;border-radius:50%;flex-shrink:0;background:${ok ? '#1e5c3a' : '#c0392b'};color:white;font-size:0.7rem;font-weight:700;display:flex;align-items:center;justify-content:center;">${ok ? '✓' : '✗'}</div>
                                <span style="font-size:0.84rem;color:#1a2e1f;font-weight:500;">Pregunta ${p.num}</span>
                                <span style="font-size:0.8rem;color:${ok ? '#1e5c3a' : '#c0392b'};margin-left:auto;font-weight:600;">${ok ? 'Correcta' : 'Incorrecta'}</span>
                            </div>`;
        }).join('')}
                    </div>
                    ${!esInt2 && !aprobado ? `<p style="font-size:0.8rem;color:#5a7a62;text-align:center;margin:0;background:#fff8e1;border:1px solid #f0c040;border-radius:8px;padding:10px 16px;width:100%;box-sizing:border-box;">Puedes intentar la evaluación máximo 2 veces.</p>` : ''}
                </div>
            </div>`;
    }

    ui.innerHTML = puntajeHTML + centralHTML;
    contenedor.appendChild(ui);

    if (esInt2 && incorrectas.length > 1) {
        let _slideActual = 0; const total = incorrectas.length;
        window._carruselRetro = (dir) => {
            const slides = document.querySelectorAll('.slide-retro'), puntos = document.querySelectorAll('.punto-retro');
            slides[_slideActual].style.display = 'none';
            if (puntos[_slideActual]) puntos[_slideActual].style.background = '#e0e6e0';
            _slideActual = (_slideActual + dir + total) % total;
            slides[_slideActual].style.display = 'flex';
            if (puntos[_slideActual]) puntos[_slideActual].style.background = '#c0392b';
            const counter = document.getElementById('carruselCounter');
            if (counter) counter.textContent = `${_slideActual + 1} / ${total}`;
        };
    }

    window._evalReintentar = () => { _destruir3d(); document.getElementById('uiEvaluacion')?.remove(); iniciarEvaluacion(_contenedorId, _asignacionId); };
    window._evalVolver = _salir;
}


/* =====================================================
   INTENTOS AGOTADOS
   ===================================================== */
function mostrarAgotado() {
    const contenedor = document.getElementById(_contenedorId); if (!contenedor) return;
    const ui = document.createElement('div'); ui.id = 'uiEvaluacion';
    ui.style.cssText = `position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:#f4f6f4;font-family:'DM Sans',sans-serif;`;
    ui.innerHTML = `<div style="text-align:center;max-width:360px;padding:24px;">
        <div style="font-size:2.5rem;margin-bottom:12px;">🔒</div>
        <h3 style="color:#1a2e1f;margin-bottom:8px;">Intentos agotados</h3>
        <p style="font-size:0.88rem;color:#5a7a62;line-height:1.6;">Ya realizaste los 2 intentos permitidos para esta evaluación.</p>
        <button onclick="window._evalVolver()" style="margin-top:20px;padding:11px 28px;border:none;border-radius:10px;background:#1e5c3a;color:white;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:0.9rem;">Volver al módulo</button>
    </div>`;
    contenedor.appendChild(ui);
    window._evalVolver = _salir;
}


/* =====================================================
   SALIR
   ===================================================== */
function _salir() {
    _destruir3d(); _restaurarColores();
    document.getElementById('uiEvaluacion')?.remove();
    _ocultarFilaSecciones(false);
    limpiarRenderer(false);
    window.dispatchEvent(new CustomEvent('evaluacionTerminada'));
}