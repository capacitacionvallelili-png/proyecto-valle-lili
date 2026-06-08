/* =====================================================
   evaluacion.js — Evaluación Nihon Koden TEC-5531
   ===================================================== */

import { inicializarEscena, cargarModelo, limpiarRenderer, THREE } from '../escena.js';

const API     = 'http://localhost:8080/Vallelili';
const TOKEN   = localStorage.getItem('token');
const HEADERS = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TOKEN}` };

const MODELO_GLB = '/Estudiante/threejs/modelados/NihonFinal22.glb';

const CAMARA_POSICION = { x: 0.6,  y: 0.5,  z: 1.7 };
const CAMARA_TARGET   = { x: 0.8,  y: -0.5, z: 0   };

const NOMBRES_LEGIBLES = {
    'botonDer':       'Botón descarga pala derecha',
    'botonpala':      'Botón carga pala',
    'palasAdultoDer': 'Palas adulto derecha',
    'BotonIzq':       'Botón pala izquierda',
    'PalasAdultoIzq': 'Palas adulto izquierda',
    'carga':          'Botón de carga (panel)',
    'sinc':           'Botón sincrónico (SYNC)',
    'Deriv':          'Botón DERI',
    'Sensibilidad':   'Selector de sensibilidad',
    'perilla':        'Perilla principal',
    'Impresora':      'Impresora',
    'EKG':            'Conector EKG',
    'boton2':         'Botón de carga (pala)',
    'marcapasos':     'Botón marcapasos',
    'LED003':         'Indicadores LED',
    'alarma':         'Alarma',
    'configurar':     'Botón configuración',
};

const CORRECTOS_P1 = new Set(['carga', 'botonpala']);

const OPCIONES_P2 = [
    { id: 'A', texto: 'Revisar que las palas estén limpias', correcta: true,  color: '#4a90d9', bg: '#e8f0fb' },
    { id: 'B', texto: 'Repetir la prueba de usuario. En caso de que persista la falla, reportar al área de equipos biomédicos por medio de un aviso en SAP', correcta: true,  color: '#1e5c3a', bg: '#e8f5ee' },
    { id: 'C', texto: 'Desconectar las palas y hacer la prueba sin ellas', correcta: false, color: '#b8860b', bg: '#fff8e1' },
    { id: 'D', texto: 'Revisar que las palas estén bien posicionadas', correcta: true,  color: '#c0392b', bg: '#fef0ed' },
];

/* ─── P3: pasos de cardioversión — TODOS estrictos, orden fijo ─── */
const PASOS_P3 = [
    {
        id: 'Deriv',
        label: 'Verificar la visualización del trazado del paciente: ajustar la derivada para obtener la señal ECG',
        objetos: ['Deriv'],
        tipo: 'click',
        texturaInicio: '/Estudiante/threejs/img/PNihon3.DErivada2.png',
    },
    {
        id: 'perilla',
        label: 'Seleccionar el nivel de energía indicado (100 J)',
        objetos: ['perilla'],
        tipo: 'click',
        texturaInicio: '/Estudiante/threejs/img/PNihon3.DErivada2.png',
        animSegPausa: 220,
        animSegFin:   221.7,
    },
    {
        id: 'sinc',
        label: 'Activar el modo sincrónico (SYNC)',
        objetos: ['sinc'],
        tipo: 'click',
        texturaInicio: '/Estudiante/threejs/img/nihon/cardioversion_activada.png',
    },
    {
        id: 'carga',
        label: 'Cargar la energía con las palas sobre el paciente (botón carga panel o pala)',
        objetos: ['carga', 'botonpala'],
        tipo: 'click',
        texturaInicio: '/Estudiante/threejs/img/nihon/cardioversion_activada_energia_cargada.png',
    },
    {
        id: 'descarga',
        label: 'Generar la descarga sobre el paciente (mantener presionado por algunos segundos)',
        objetos: ['botonDer', 'BotonIzq'],
        tipo: 'hold',
        tiempoHold: 2500,
        texturaInicio: '/Estudiante/threejs/img/nihon/cardioversion_activada.png',
    },
];

const TARJETAS_P4 = [
    { id: 'defib_palas',    texto: 'Desfibrilación manual',      color: '#4a90d9', bg: '#e8f0fb', columna_correcta: 'palas'      },
    { id: 'cardio_palas',   texto: 'Cardioversión sincronizada', color: '#1e5c3a', bg: '#e8f5ee', columna_correcta: 'palas'      },
    { id: 'defib_parches',  texto: 'Desfibrilación manual',      color: '#b8860b', bg: '#fff8e1', columna_correcta: 'electrodos' },
    { id: 'cardio_parches', texto: 'Cardioversión sincronizada', color: '#9c65b0', bg: '#f3eafb', columna_correcta: 'electrodos' },
    { id: 'marcap_parches', texto: 'Terapia de marcapasos',      color: '#c0392b', bg: '#fef0ed', columna_correcta: 'electrodos' },
    { id: 'dea_parches',    texto: 'DEA',                        color: '#5a7a62', bg: '#eef5ee', columna_correcta: 'electrodos' },
];

const TARJETAS_P5 = [
    { id: 1, texto: 'Retirar las palas del equipo (si están conectadas)',                                  orden_correcto: 1 },
    { id: 2, texto: 'Conectar el cable del marcapasos al equipo',                                         orden_correcto: 2 },
    { id: 3, texto: 'Colocar los electrodos adhesivos en el paciente (posición AP o anterior-posterior)', orden_correcto: 3 },
    { id: 4, texto: 'Seleccionar el modo marcapasos en el equipo',                                        orden_correcto: 4 },
    { id: 5, texto: 'Ajustar la frecuencia y la corriente de estimulación',                               orden_correcto: 5 },
    { id: 6, texto: 'Iniciar estimulación',                                                               orden_correcto: 6 },
    { id: 7, texto: 'Verificar que se muestre la espiga del marcapaso acompañada de un complejo QRS',     orden_correcto: 7 },
];

const PREGUNTAS = [
    { num: 1, tipo: '3d_click',     enunciado: 'Durante una desfibrilación manual con palas, el operador ya seleccionó el nivel de energía. ¿De qué forma(s) puede iniciar la carga del equipo?', instruccion: 'Selecciona la respuesta directamente en el modelado' },
    { num: 2, tipo: 'opcion_multiple', enunciado: 'Al inicio del turno, el operador debe realizar la prueba de usuario del desfibrilador. Durante la prueba con palas, el equipo indica una falla. ¿Cuál es el paso correcto a seguir? (Selecciona la(s) correctas)' },
    { num: 3, tipo: '3d_secuencia', enunciado: 'El médico indica realizar una cardioversión sincronizada a 120 J. El paciente ya cuenta con trazado de ECG visible en el monitor. Realiza los pasos sobre el modelado en el orden correcto.', instruccion: 'Toca el elemento del modelo, luego verifica el paso' },
    { num: 4, tipo: 'columnas',     enunciado: 'Relaciona cada tipo de conexión con las acciones terapéuticas que permite realizar. Clasifica cada acción según corresponda a Palas o Electrodos desechables (parches).' },
    { num: 5, tipo: 'ordenar',      enunciado: 'El médico indica iniciar terapia de marcapasos transcutáneo. Los parches de electrodos ya están disponibles. Ordena los pasos que debe seguir el operador.' },
];

const IMG_CONTROLES     = '/Estudiante/threejs/img/controles.png';
const SONIDO_CORRECTO   = '/Estudiante/threejs/audios/correct.mp3';
const SONIDO_INCORRECTO = '/Estudiante/threejs/audios/bad.mp3';
const SONIDO_POP        = '/Estudiante/threejs/audios/pop.mp3';

const RETROALIMENTACION = {
    1: { imagen: '/Estudiante/threejs/img/retroalimentacion/P_N1.png', texto: 'La carga puede iniciarse desde el botón de carga del panel frontal o desde el botón de carga ubicado en la pala, ya que el Nihon Koden permite ambas opciones.' },
    2: { imagen: '/Estudiante/threejs/img/retroalimentacion/P_N2.png', texto: 'Ante una falla durante la prueba de usuario, el protocolo indica repetir la prueba antes de tomar decisiones. Si la falla persiste, se debe reportar al área de ingeniería biomédica mediante un aviso en SAP y retirar el equipo de servicio. Intentar continuar usando el equipo o ignorar la falla compromete la seguridad del paciente.' },
    3: { imagen: '/Estudiante/threejs/img/retroalimentacion/P_N3.png', texto: 'La cardioversión sincronizada requiere un orden específico para garantizar que la descarga ocurra sobre el complejo QRS. Por eso, primero se verifica el trazado y se selecciona la energía, luego se activa el modo SYNC para que el equipo identifique cada QRS, se carga la energía y finalmente se genera la descarga manteniendo los botones presionados hasta que el equipo dispare de forma sincronizada.' },
    4: { imagen: '/Estudiante/threejs/img/retroalimentacion/P_N4.png', texto: 'Las palas del Nihon Koden permiten realizar desfibrilación manual y cardioversión sincronizada, ya que requieren contacto directo del operador con el paciente. Los electrodos desechables (parches) amplían las posibilidades terapéuticas porque pueden quedarse adheridos al paciente, lo que permite además la terapia de marcapasos  y el modo DEA' },
    5: { imagen: '/Estudiante/threejs/img/retroalimentacion/P_N5.png', texto: 'El orden correcto para el marcapasos es: retirar palas → conectar cable → colocar electrodos → seleccionar modo → ajustar parámetros → iniciar estimulación → verificar espiga con QRS.' },
};


/* =====================================================
   ESTADO
   ===================================================== */
let _contenedorId = null, _asignacionId = null, _numIntento = 1, _intentosAntes = 0, _respuestas = [];
let _escena3d = null, _camara3d = null, _renderer3d = null, _controls3d = null, _reloj3d = null, _modelo3d = null;
let _animFrame3d = null, _raycaster3d = null, _mouse3d = null;
let _materialOriginal = {}, _meshHighlight = null;
let _estadoPregunta = {};
let _manitoAnimId = null, _pulsoAnimId = null;
let _mixer3d = null, _relojAnim = null, _animaciones3d = [];

// P3 — estado simplificado (sin flex)
let _p3PasoActivo      = 0;
let _p3HoldMesh        = null;
let _p3HoldStart       = 0;
let _p3BarraAnim       = null;
let _p3SeleccionActual = null;
let _p3EnEspera        = false;


/* =====================================================
   INICIALIZAR
   ===================================================== */
export async function iniciarEvaluacion(contenedorId, asigId) {
    _contenedorId = contenedorId; _asignacionId = asigId;
    _respuestas = []; _estadoPregunta = {}; _intentosAntes = 0; _numIntento = 1;
    _ocultarFilaSecciones(true);
    try {
        const r = await fetch(`${API}/resultados/misResultados/${_asignacionId}`, { headers: HEADERS });
        if (r.ok) { const d = await r.json(); _intentosAntes = Array.isArray(d) ? d.length : 0; _numIntento = _intentosAntes + 1; }
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
    cancelAnimationFrame(_p3BarraAnim); _p3BarraAnim = null;
    cancelAnimationFrame(_animFrame3d); _animFrame3d = null;
    cancelAnimationFrame(_manitoAnimId); _manitoAnimId = null;
    cancelAnimationFrame(_pulsoAnimId);  _pulsoAnimId  = null;
    if (_renderer3d) {
        _renderer3d.domElement.removeEventListener('click',     _onClickEval);
        _renderer3d.domElement.removeEventListener('click',     _onClickP3Sec);
        _renderer3d.domElement.removeEventListener('mousedown', _onMouseDownP3);
        _renderer3d.domElement.removeEventListener('mouseup',   _onMouseUpP3);
        _renderer3d.domElement.removeEventListener('mouseleave',_onMouseUpP3);
        if (_renderer3d.domElement.parentNode)
            _renderer3d.domElement.parentNode.removeChild(_renderer3d.domElement);
    }
    if (_escena3d) { while (_escena3d.children.length) _escena3d.remove(_escena3d.children[0]); _escena3d = null; }
    _restaurarColores();
    _camara3d = _controls3d = _reloj3d = _modelo3d = _renderer3d = null;
    _mixer3d = _relojAnim = null; _animaciones3d = [];
    _raycaster3d = _mouse3d = null; _meshHighlight = null; _materialOriginal = {};
    _p3PasoActivo = 0;
    _p3HoldMesh = null; _p3SeleccionActual = null; _p3EnEspera = false;
}

function _restaurarColores() {
    Object.entries(_materialOriginal).forEach(([nombre, hex]) => {
        const m = _buscarMeshEnCache(nombre);
        if (m?.material?.color) { m.material.color.setHex(hex); m.material.needsUpdate = true; }
    });
    _materialOriginal = {};
}

function _buscarMeshEnCache(nombre) {
    const modelo = window._cacheModelos?.[MODELO_GLB];
    if (!modelo) return null;
    let found = null; modelo.traverse(o => { if (o.name === nombre) found = o; });
    return found;
}

function _pop() { try { const a=new Audio(SONIDO_POP); a.volume=0.7; a.play().catch(()=>{}); } catch {} }
function _reproducirSonido(ok) { try { const a=new Audio(ok?SONIDO_CORRECTO:SONIDO_INCORRECTO); a.volume=0.7; a.play().catch(()=>{}); } catch {} }


/* =====================================================
   ROUTER
   ===================================================== */
function mostrarPregunta(indice) {
    _destruir3d();
    document.getElementById('uiEvaluacion')?.remove();
    const contenedor = document.getElementById(_contenedorId); if (!contenedor) return;
    const p = PREGUNTAS[indice];
    if      (p.tipo==='3d_click')       _mostrarPregunta3DClick(contenedor,p,indice);
    else if (p.tipo==='opcion_multiple') _mostrarPreguntaOpcionMultiple(contenedor,p,indice);
    else if (p.tipo==='3d_secuencia')   _mostrarPregunta3DSecuencia(contenedor,p,indice);
    else if (p.tipo==='columnas')       _mostrarPreguntaColumnas(contenedor,p,indice);
    else if (p.tipo==='ordenar')        _mostrarPreguntaOrdenar(contenedor,p,indice,TARJETAS_P5);
}

function _avanzar(indice) {
    const resp = _respuestas.find(r=>r.numPregunta===PREGUNTAS[indice].num);
    const ok   = resp?.esCorrecta ?? false;
    _estadoPregunta[PREGUNTAS[indice].num] = ok;
    _reproducirSonido(ok);
    _mostrarBannerRetro(ok, () => {
        _destruir3d();
        const sig = indice + 1;
        if (sig < PREGUNTAS.length) mostrarPregunta(sig);
        else enviarResultados();
    });
}

function _mostrarBannerRetro(ok, onDone) {
    document.getElementById('bannerRetroEval')?.remove();
    const b = document.createElement('div'); b.id='bannerRetroEval';
    b.style.cssText=`position:fixed;inset:0;z-index:9999;display:flex;flex-direction:column;
        align-items:center;justify-content:center;
        background:${ok?'rgba(30,92,58,0.93)':'rgba(192,57,43,0.93)'};
        font-family:'DM Sans',sans-serif;animation:fadeInBanner 0.25s ease;`;
    b.innerHTML=`<style>@keyframes fadeInBanner{from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}}</style>
        <div style="font-size:1.5rem;font-weight:700;color:white;">${ok?'¡Correcto!':'Incorrecto'}</div>
        <div style="font-size:0.88rem;color:rgba(255,255,255,0.8);margin-top:8px;">${ok?'Muy bien, continúa.':'Respuesta incorrecta'}</div>`;
    document.body.appendChild(b);
    setTimeout(()=>{ b.style.transition='opacity 0.3s'; b.style.opacity='0'; setTimeout(()=>{ b.remove(); onDone(); },300); },1200);
}

function _barraProgressHTML(indice) {
    return `<div style="background:#163d27;color:white;padding:12px 20px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">
        <span style="font-size:0.85rem;opacity:0.85;">Evaluación — Nihon Koden &nbsp;·&nbsp; Intento ${_numIntento} de 2</span>
        <div style="display:flex;gap:6px;">${PREGUNTAS.map((p,i)=>{ const e=_estadoPregunta[p.num]; let bg,co,ct; if(i<indice&&e!==undefined){bg=e?'#2d7a50':'#c0392b';co='white';ct=e?'✓':'✗';}else if(i===indice){bg='white';co='#163d27';ct=i+1;}else{bg='rgba(255,255,255,0.2)';co='white';ct=i+1;} return `<div style="width:28px;height:28px;border-radius:50%;background:${bg};color:${co};display:flex;align-items:center;justify-content:center;font-size:0.72rem;font-weight:600;">${ct}</div>`; }).join('')}</div>
    </div>`;
}

function _footerHTML(indice) {
    return `<div style="background:white;border-top:1px solid #dde3dd;padding:12px 24px;display:flex;justify-content:flex-end;flex-shrink:0;">
        <button id="btnContinuarEval" onclick="window._evalContinuar()" disabled
            style="padding:10px 28px;border:none;border-radius:10px;background:#e0e6e0;color:#9ab0a0;
                font-family:'DM Sans',sans-serif;font-size:0.9rem;font-weight:600;cursor:not-allowed;transition:all 0.2s;">
            ${indice===PREGUNTAS.length-1?'Finalizar':'Continuar'}
        </button>
    </div>`;
}

function _guardarRespuesta(num, ok) {
    const idx=_respuestas.findIndex(r=>r.numPregunta===num);
    if(idx>=0) _respuestas[idx].esCorrecta=ok; else _respuestas.push({numPregunta:num,esCorrecta:ok});
}

function _habilitarContinuar() {
    const btn=document.getElementById('btnContinuarEval');
    if(btn){btn.disabled=false;btn.style.background='#1e5c3a';btn.style.color='white';btn.style.cursor='pointer';}
}


/* =====================================================
   UI 3D COMPARTIDA
   ===================================================== */
function _crearUI3D(contenedor, pregunta, indice, extra='') {
    const ui=document.createElement('div'); ui.id='uiEvaluacion';
    ui.style.cssText=`position:absolute;inset:0;display:flex;flex-direction:column;font-family:'DM Sans',sans-serif;background:#f4f6f4;`;
    ui.innerHTML=`
        ${_barraProgressHTML(indice)}
        <div style="flex:1;display:flex;overflow:hidden;">
            <div style="width:300px;flex-shrink:0;background:white;border-right:1px solid #dde3dd;display:flex;flex-direction:column;padding:20px;gap:14px;overflow-y:auto;">
                <div>
                    <p style="font-size:0.72rem;color:#5a7a62;margin:0 0 6px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Pregunta ${pregunta.num} de ${PREGUNTAS.length}</p>
                    <p style="font-size:0.9rem;color:#1a2e1f;line-height:1.6;margin:0;">${pregunta.enunciado}</p>
                </div>
                <div style="background:#f0f5f0;border-radius:10px;padding:10px 12px;">
                    <span style="font-size:0.78rem;color:#5a7a62;">${pregunta.instruccion}</span>
                </div>
                ${extra}
                <div id="indicadorSeleccion" style="min-height:44px;border-radius:10px;border:1.5px dashed #c8d8c8;padding:10px 14px;font-size:0.82rem;color:#9ab0a0;display:flex;align-items:center;gap:8px;">
                    <span>Ningún elemento seleccionado aún</span>
                </div>
                <div id="loaderEval3d" style="display:flex;flex-direction:column;align-items:center;gap:8px;padding:12px 0;">
                    <div style="width:28px;height:28px;border:3px solid #e0e6e0;border-top-color:#1e5c3a;border-radius:50%;animation:spinEval 0.8s linear infinite;"></div>
                    <span style="font-size:0.75rem;color:#5a7a62;">Cargando... <span id="loaderPct">0</span>%</span>
                </div>
                <style>@keyframes spinEval{to{transform:rotate(360deg);}}</style>
            </div>
            <div id="canvasEval3d" style="flex:1;position:relative;overflow:hidden;">
                <div style="position:absolute;bottom:16px;right:16px;z-index:20;background:rgba(255,255,255,0.92);border-radius:12px;border:1px solid rgba(0,0,0,0.08);padding:8px;width:148px;box-shadow:0 4px 16px rgba(0,0,0,0.12);">
                    <p style="font-size:0.62rem;color:#5a7a62;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin:0 0 6px;text-align:center;">Cómo interactuar</p>
                    <img src="${IMG_CONTROLES}" alt="Controles" style="width:100%;border-radius:8px;display:block;" onerror="this.closest('div').style.display='none'">
                </div>
            </div>
        </div>
        ${_footerHTML(indice)}`;
    contenedor.appendChild(ui);
}

function _iniciarManito(cc,msg) {
    cancelAnimationFrame(_manitoAnimId); document.getElementById('manitoEval')?.remove();
    const m=document.createElement('div'); m.id='manitoEval';
    m.style.cssText=`position:absolute;pointer-events:none;z-index:15;display:flex;flex-direction:column;align-items:center;gap:4px;`;
    m.innerHTML=`<div id="manitoIcon" style="font-size:2.2rem;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.35));">👆</div>
        <div style="background:#1e5c3a;color:white;font-size:0.68rem;padding:4px 10px;border-radius:20px;white-space:nowrap;font-family:'DM Sans',sans-serif;font-weight:600;">${msg}</div>
        <style>@keyframes manitoFloat{0%,100%{transform:translateY(0) scale(1);}50%{transform:translateY(-10px) scale(1.08);}}#manitoIcon{animation:manitoFloat 1.4s ease-in-out infinite;}</style>`;
    cc.appendChild(m);
    function pos(){ const cv=cc.querySelector('canvas'); if(!cv){_manitoAnimId=requestAnimationFrame(pos);return;} const cR=cc.getBoundingClientRect(),cvR=cv.getBoundingClientRect(); m.style.left=(cvR.left-cR.left+cvR.width*0.3+20)+'px'; m.style.top=(cvR.top-cR.top+cvR.height*0.58-40)+'px'; _manitoAnimId=requestAnimationFrame(pos); }
    pos();
}
function _quitarManito(){ cancelAnimationFrame(_manitoAnimId); document.getElementById('manitoEval')?.remove(); }

function _setCamara(){
    if(!_camara3d||!_controls3d) return;
    _camara3d.position.set(CAMARA_POSICION.x,CAMARA_POSICION.y,CAMARA_POSICION.z);
    _controls3d.target.set(CAMARA_TARGET.x,CAMARA_TARGET.y,CAMARA_TARGET.z);
    _controls3d.update();
}

function _cargarModelo3D(onListo) {
    const base=inicializarEscena('canvasEval3d');
    _escena3d=base.escena; _camara3d=base.camara; _renderer3d=base.renderer; _controls3d=base.controls; _reloj3d=base.reloj;
    _raycaster3d=new THREE.Raycaster(); _mouse3d=new THREE.Vector2();
    cargarModelo(MODELO_GLB,_escena3d,_camara3d,_controls3d,(modelo,anim,mixer)=>{
        _modelo3d=modelo; _animaciones3d=anim; _mixer3d=mixer;
        if(_mixer3d) _mixer3d.timeScale=0;
        _relojAnim=new THREE.Clock();
        _setCamara();
        document.getElementById('loaderEval3d')?.remove();
        function loop(){ _animFrame3d=requestAnimationFrame(loop); if(!_escena3d||!_camara3d||!_renderer3d) return; if(_mixer3d) _mixer3d.update(_relojAnim.getDelta()); _controls3d.update(); _renderer3d.render(_escena3d,_camara3d); }
        loop();
        onListo(modelo,anim,mixer);
    });
}

function _pausarEnSegundo(seg) {
    if (!_mixer3d || !_animaciones3d.length) return;
    _animaciones3d.forEach(a => {
        const ac = _mixer3d.clipAction(a);
        ac.reset(); ac.play(); ac.paused = true; ac.time = seg;
        _mixer3d.update(0);
    });
    _mixer3d.timeScale = 0;
}

function _reproducirSegmento(de, hasta) {
    if (!_mixer3d || !_animaciones3d.length) return;
    _animaciones3d.forEach(a => {
        const ac = _mixer3d.clipAction(a);
        ac.reset(); ac.setLoop(THREE.LoopOnce); ac.clampWhenFinished = true;
        ac.time = de; ac.paused = false; ac.play();
    });
    _mixer3d.timeScale = 1;
    setTimeout(() => { if (_mixer3d) _mixer3d.timeScale = 0; }, (hasta - de) * 1000);
}

function _aplicarTexturaPantalla(ruta) {
    if (!_modelo3d||!ruta) return;
    let pantalla=null; _modelo3d.traverse(o=>{ if(o.name==='pantalla001') pantalla=o; });
    if (!pantalla) return;
    new THREE.TextureLoader().load(ruta,tex=>{
        tex.wrapS=tex.wrapT=THREE.ClampToEdgeWrapping; tex.flipY=false; tex.needsUpdate=true;
        const mats=Array.isArray(pantalla.material)?pantalla.material:[pantalla.material];
        mats.forEach(m=>{ m.map=tex; m.color.set(0xffffff); m.needsUpdate=true; });
    });
}

function _resaltarMesh(mesh, hex) {
    if (!mesh?.material?.color) return;
    if (_materialOriginal[mesh.name] === undefined)
        _materialOriginal[mesh.name] = mesh.material.color.getHex();
    mesh.material.color.setHex(hex); mesh.material.needsUpdate = true;
}
function _restaurarMesh(mesh) {
    if (!mesh?.material?.color) return;
    if (_materialOriginal[mesh.name] !== undefined) {
        mesh.material.color.setHex(_materialOriginal[mesh.name]);
        mesh.material.needsUpdate = true;
        delete _materialOriginal[mesh.name];
    }
}

function _actualizarIndicador(txt) {
    const el=document.getElementById('indicadorSeleccion'); if(!el) return;
    el.style.borderColor='#4a90d9'; el.style.background='#eef4fb';
    el.innerHTML=`<span style="color:#1a2e1f;font-weight:500;">${txt}</span>`;
}


/* =====================================================
   PREGUNTA 1
   ===================================================== */
function _mostrarPregunta3DClick(contenedor, pregunta, indice) {
    _crearUI3D(contenedor,pregunta,indice);
    _cargarModelo3D(()=>{
        _pausarEnSegundo(222);
        _aplicarTexturaPantalla('/Estudiante/threejs/img/nihon/PNihon1.png');
        const cc=document.getElementById('canvasEval3d');
        if(cc) _iniciarManito(cc,'Haz click sobre el modelado para elegir la respuesta correcta');
        _renderer3d.domElement.addEventListener('click',_onClickEval);
    });
    window._evalContinuar = () => {
        const resp = _respuestas.find(r => r.numPregunta === 1);
        const esCorrecta = resp?.esCorrecta ?? false;
        if (esCorrecta && _modelo3d && _camara3d && _controls3d) {
            _aplicarTexturaPantalla('/Estudiante/threejs/img/nihon/PNihon1.2.png');
            let pantalla3d = null;
            _modelo3d.traverse(o => { if (o.name === 'pantalla001') pantalla3d = o; });
            if (pantalla3d) {
                const posObj = new THREE.Vector3();
                pantalla3d.getWorldPosition(posObj);
                const posDestino = new THREE.Vector3(posObj.x + 0.05, posObj.y + 0.1, posObj.z + 0.45);
                const posInicio  = _camara3d.position.clone();
                const trgInicio  = _controls3d.target.clone();
                const ini = performance.now(), dur = 700;
                function zoomStep(now) {
                    const t = Math.min((now - ini) / dur, 1);
                    const e = t < 0.5 ? 2*t*t : -1+(4-2*t)*t;
                    _camara3d.position.lerpVectors(posInicio, posDestino, e);
                    _controls3d.target.lerpVectors(trgInicio, posObj, e);
                    _controls3d.update();
                    if (t < 1) requestAnimationFrame(zoomStep);
                }
                requestAnimationFrame(zoomStep);
            }
            setTimeout(() => _avanzar(indice), 1800);
        } else {
            _avanzar(indice);
        }
    };
}

function _onClickEval(event) {
    if(!_modelo3d||!_renderer3d) return;
    _quitarManito();
    const rect=_renderer3d.domElement.getBoundingClientRect();
    _mouse3d.x=((event.clientX-rect.left)/rect.width)*2-1;
    _mouse3d.y=-((event.clientY-rect.top)/rect.height)*2+1;
    _raycaster3d.setFromCamera(_mouse3d,_camara3d);
    const meshes=[]; _modelo3d.traverse(o=>{ if(o.isMesh) meshes.push(o); });
    const hits=_raycaster3d.intersectObjects(meshes,true);
    if(!hits.length) return;
    const mesh=hits[0].object, nombre=mesh.name;
    if(!NOMBRES_LEGIBLES[nombre]) return;
    _pop();
    if(_meshHighlight && _meshHighlight!==mesh) _restaurarMesh(_meshHighlight);
    _resaltarMesh(mesh, 0x4a90d9);
    _meshHighlight=mesh;
    _guardarRespuesta(1, CORRECTOS_P1.has(nombre));
    _actualizarIndicador(`Seleccionaste: <strong>${NOMBRES_LEGIBLES[nombre]}</strong>`);
    _habilitarContinuar();
}


/* =====================================================
   PREGUNTA 2
   ===================================================== */
function _mostrarPreguntaOpcionMultiple(contenedor, pregunta, indice) {
    const ui=document.createElement('div'); ui.id='uiEvaluacion';
    ui.style.cssText=`position:absolute;inset:0;display:flex;flex-direction:column;font-family:'DM Sans',sans-serif;background:#f4f6f4;`;
    ui.innerHTML=`
        ${_barraProgressHTML(indice)}
        <div style="background:white;padding:16px 24px;border-bottom:1px solid #dde3dd;flex-shrink:0;">
            <p style="font-size:0.72rem;color:#5a7a62;margin:0 0 6px;font-weight:600;text-transform:uppercase;">Pregunta ${pregunta.num} de ${PREGUNTAS.length}</p>
            <p style="font-size:0.92rem;color:#1a2e1f;line-height:1.6;margin:0;">${pregunta.enunciado}</p>
        </div>
        <div style="flex:1;overflow-y:auto;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;gap:16px;">
            <div style="display:flex;flex-direction:row;gap:12px;width:100%;max-width:1060px;align-items:stretch;">
                ${OPCIONES_P2.map(op=>`
                    <div data-op2="${op.id}" style="flex:1;min-width:0;display:flex;flex-direction:column;align-items:center;gap:12px;text-align:center;background:white;border:2.5px solid #dde3dd;border-radius:14px;padding:20px 14px;cursor:pointer;transition:border-color 0.2s,background 0.2s;">
                        <div style="width:44px;height:44px;border-radius:50%;flex-shrink:0;background:${op.bg};border:2.5px solid ${op.color};display:flex;align-items:center;justify-content:center;font-size:1rem;font-weight:700;color:${op.color};">${op.id}</div>
                        <div class="chk2" style="width:20px;height:20px;border-radius:50%;border:2.5px solid #dde3dd;background:white;transition:all 0.2s;flex-shrink:0;"></div>
                        <span style="font-size:0.84rem;color:#1a2e1f;line-height:1.5;">${op.texto}</span>
                    </div>`).join('')}
            </div>
        </div>
        ${_footerHTML(indice)}
        <style>[data-op2].sel2{background:var(--c-bg)!important;border-color:var(--c-col)!important;}[data-op2].sel2 .chk2{background:var(--c-col)!important;border-color:var(--c-col)!important;}</style>`;
    contenedor.appendChild(ui);
    const sel=new Set();
    OPCIONES_P2.forEach(op=>{
        const el=contenedor.querySelector(`[data-op2="${op.id}"]`); if(!el) return;
        el.style.setProperty('--c-col',op.color); el.style.setProperty('--c-bg',op.bg);
        el.addEventListener('click',()=>{
            _pop(); const id=op.id;
            if(sel.has(id)){sel.delete(id);el.classList.remove('sel2');el.querySelector('.chk2').style.background='white';el.querySelector('.chk2').style.borderColor='#dde3dd';}
            else{sel.add(id);el.classList.add('sel2');el.querySelector('.chk2').style.background=op.color;el.querySelector('.chk2').style.borderColor=op.color;}
            const ok=sel.has('A')&&sel.has('B')&&sel.has('D')&&!sel.has('C');
            _guardarRespuesta(pregunta.num,ok); _habilitarContinuar();
        });
    });
    window._evalContinuar=()=>_avanzar(indice);
}


/* =====================================================
   PREGUNTA 3 — SECUENCIA 3D (pasos todos estrictos)
   ─────────────────────────────────────────────────────
   Flujo:
   1. Checklist muestra "Paso N" en gris
   2. Usuario toca objeto → resaltado azul + botón "Verificar paso"
      (puede cambiar selección libremente antes de verificar)
   3. Al verificar:
      - Correcto → descripción revelada, ícono ✓, siguiente paso
      - Incorrecto → banner rojo, P3 incorrecta, avanza
   4. Paso hold (descarga):
      - Tocar objeto incorrecto → habilita Continuar (sin fallo inmediato)
      - Tocar objeto correcto → banner + barra progreso
      - Soltar antes de tiempo → puede reintentar
      - Dar Continuar sin completar → incorrecto
   ===================================================== */
function _mostrarPregunta3DSecuencia(contenedor, pregunta, indice) {
    const checklistHTML=`
        <div id="checklistP3" style="display:flex;flex-direction:column;gap:6px;">
            ${PASOS_P3.map((p,i)=>`
                <div id="ckP3-${p.id}" style="display:flex;align-items:flex-start;gap:8px;padding:7px 10px;border-radius:8px;border:1.5px solid ${i===0?'#1e5c3a':'#e0e6e0'};background:${i===0?'#f0f5f0':'transparent'};transition:all 0.2s;">
                    <div id="icP3-${p.id}" style="width:20px;height:20px;border-radius:50%;flex-shrink:0;background:${i===0?'#1e5c3a':'#e0e6e0'};color:white;font-size:0.65rem;font-weight:700;display:flex;align-items:center;justify-content:center;margin-top:1px;">${i+1}</div>
                    <span id="lbP3-${p.id}" style="font-size:0.76rem;color:${i===0?'#5a7a62':'#b0b0b0'};line-height:1.4;">Paso ${i+1}</span>
                </div>`).join('')}
        </div>`;

    _crearUI3D(contenedor,pregunta,indice,checklistHTML);
    document.getElementById('indicadorSeleccion')?.remove();

    window._evalContinuar = () => {
        const pasoActual = PASOS_P3[_p3PasoActivo];
        if (pasoActual && pasoActual.tipo === 'hold') {
            _guardarRespuesta(3, false);
        }
        _avanzar(indice);
    };

    _p3PasoActivo=0; _p3SeleccionActual=null; _p3EnEspera=false;

    _cargarModelo3D(()=>{
        _pausarEnSegundo(219);
        _aplicarTexturaPantalla('/Estudiante/threejs/img/PNihon3.0.png');

        const cc=document.getElementById('canvasEval3d');
        if(cc) _iniciarManito(cc,'Toca el elemento del modelo para ejecutar el paso');

        // Barra de hold
        const bh=document.createElement('div'); bh.id='barraHoldP3';
        bh.style.cssText=`position:absolute;bottom:0;left:0;right:0;height:6px;background:#e0e6e0;z-index:10;display:none;`;
        bh.innerHTML=`<div id="barraHoldFill" style="height:100%;width:0%;background:#1e5c3a;transition:none;"></div>`;
        if(cc) cc.appendChild(bh);

        // Botón verificar
        const btnV=document.createElement('button'); btnV.id='btnVerificarP3';
        btnV.style.cssText=`position:absolute;bottom:60px;left:50%;transform:translateX(-50%);z-index:25;
            padding:10px 28px;border:none;border-radius:10px;background:#1e5c3a;color:white;
            font-family:'DM Sans',sans-serif;font-size:0.9rem;font-weight:600;cursor:pointer;
            display:none;box-shadow:0 4px 14px rgba(0,0,0,0.2);`;
        btnV.textContent='Verificar paso';
        btnV.addEventListener('click', _verificarPasoP3);
        if(cc) cc.appendChild(btnV);

        // Banner instrucción hold
        const holdTip=document.createElement('div'); holdTip.id='holdTipP3';
        holdTip.style.cssText=`position:absolute;bottom:70px;left:50%;transform:translateX(-50%);z-index:25;
            background:rgba(30,92,58,0.93);color:white;padding:10px 20px;border-radius:12px;
            font-family:'DM Sans',sans-serif;font-size:0.82rem;font-weight:600;
            text-align:center;white-space:nowrap;display:none;
            box-shadow:0 4px 14px rgba(0,0,0,0.25);pointer-events:none;`;
        holdTip.innerHTML=`Toca y mantén presionado el botón de descarga`;
        if(cc) cc.appendChild(holdTip);

        _actualizarChecklist3D(0);
        _renderer3d.domElement.addEventListener('click',     _onClickP3Sec);
        _renderer3d.domElement.addEventListener('mousedown', _onMouseDownP3);
        _renderer3d.domElement.addEventListener('mouseup',   _onMouseUpP3);
        _renderer3d.domElement.addEventListener('mouseleave',_onMouseUpP3);
    });
}

function _actualizarChecklist3D(indicePaso) {
    PASOS_P3.forEach((p, i) => {
        const ck = document.getElementById(`ckP3-${p.id}`);
        const ic = document.getElementById(`icP3-${p.id}`);
        const lb = document.getElementById(`lbP3-${p.id}`);
        if (!ck || !ic || !lb) return;
        if (i < indicePaso) {
            // ya completado — descripción ya revelada, solo estilo
            ck.style.background  = '#f0f8f4'; ck.style.borderColor = '#1e5c3a';
            ic.style.background  = '#1e5c3a'; ic.textContent = '✓';
        } else if (i === indicePaso) {
            ck.style.background  = '#f0f5f0'; ck.style.borderColor = '#1e5c3a';
            ic.style.background  = '#1e5c3a'; ic.textContent = String(i + 1);
            lb.style.color = '#5a7a62'; lb.textContent = `Paso ${i + 1}`;
        } else {
            ck.style.background  = 'transparent'; ck.style.borderColor = '#e0e6e0';
            ic.style.background  = '#e0e6e0'; ic.textContent = String(i + 1);
            lb.style.color = '#b0b0b0'; lb.textContent = `Paso ${i + 1}`;
        }
    });
    // Mostrar banner hold si el paso activo es hold
    const tipEl = document.getElementById('holdTipP3');
    if (tipEl) {
        const pasoActivo = PASOS_P3[indicePaso];
        tipEl.style.display = (pasoActivo && pasoActivo.tipo === 'hold') ? 'block' : 'none';
    }
}

function _revelarDescripcionPaso(pasoId) {
    const p = PASOS_P3.find(x => x.id === pasoId); if (!p) return;
    const lb = document.getElementById(`lbP3-${pasoId}`); if (!lb) return;
    lb.textContent = p.label; lb.style.color = '#1e5c3a';
}

function _hitP3(event) {
    if(!_modelo3d||!_renderer3d) return null;
    const rect=_renderer3d.domElement.getBoundingClientRect();
    _mouse3d.x=((event.clientX-rect.left)/rect.width)*2-1;
    _mouse3d.y=-((event.clientY-rect.top)/rect.height)*2+1;
    _raycaster3d.setFromCamera(_mouse3d,_camara3d);
    const meshes=[]; _modelo3d.traverse(o=>{ if(o.isMesh) meshes.push(o); });
    const hits=_raycaster3d.intersectObjects(meshes,true);
    return hits.length?hits[0].object:null;
}

// Click: libre hasta verificar
function _onClickP3Sec(event) {
    const paso = PASOS_P3[_p3PasoActivo];
    if (!paso || paso.tipo === 'hold') return;
    const mesh = _hitP3(event); if (!mesh) return;
    if (!NOMBRES_LEGIBLES[mesh.name]) return;
    _quitarManito(); _pop();
    if (_p3SeleccionActual && _p3SeleccionActual !== mesh) _restaurarMesh(_p3SeleccionActual);
    _resaltarMesh(mesh, 0x4a90d9);
    _p3SeleccionActual = mesh;
    _p3EnEspera = true;
    const btnV = document.getElementById('btnVerificarP3');
    if (btnV) btnV.style.display = 'block';
}

function _verificarPasoP3() {
    if (!_p3SeleccionActual || !_p3EnEspera) return;
    _p3EnEspera = false;
    const btnV = document.getElementById('btnVerificarP3');
    if (btnV) btnV.style.display = 'none';

    const paso    = PASOS_P3[_p3PasoActivo];
    const nombre  = _p3SeleccionActual.name;
    const correcto = paso && paso.objetos.includes(nombre);

    if (!correcto) {
        _restaurarMesh(_p3SeleccionActual); _p3SeleccionActual = null;
        _guardarRespuesta(3, false);
        _avanzar(PREGUNTAS.findIndex(p => p.num === 3));
        return;
    }

    _restaurarMesh(_p3SeleccionActual); _p3SeleccionActual = null;

    if (paso.animSegPausa !== undefined && paso.animSegFin !== undefined)
        _reproducirSegmento(paso.animSegPausa, paso.animSegFin);

    if (paso.texturaInicio) _aplicarTexturaPantalla(paso.texturaInicio);

    _revelarDescripcionPaso(paso.id);
    const ic = document.getElementById(`icP3-${paso.id}`);
    const ck = document.getElementById(`ckP3-${paso.id}`);
    if (ic) { ic.textContent = '✓'; ic.style.background = '#1e5c3a'; }
    if (ck) { ck.style.background = '#f0f8f4'; ck.style.borderColor = '#1e5c3a'; }

    _p3PasoActivo++;
    _actualizarChecklist3D(_p3PasoActivo);

    if (_p3PasoActivo >= PASOS_P3.length) {
        _guardarRespuesta(3, true); _habilitarContinuar();
    }
}

// Hold: mousedown
function _onMouseDownP3(event) {
    const paso = PASOS_P3[_p3PasoActivo];
    if (!paso || paso.tipo !== 'hold') return;
    const mesh = _hitP3(event); if (!mesh) return;
    _quitarManito();

    if (!paso.objetos.includes(mesh.name)) {
        // Objeto incorrecto — habilita Continuar (se marcará incorrecto si lo pulsan)
        _p3HoldStart = -1;
        _habilitarContinuar();
        return;
    }

    // Objeto correcto
    if (_p3HoldMesh) _restaurarMesh(_p3HoldMesh);
    _p3HoldMesh = mesh; _p3HoldStart = performance.now();
    _resaltarMesh(mesh, 0x4a90d9);
    const bh   = document.getElementById('barraHoldP3');
    const fill = document.getElementById('barraHoldFill');
    const tip  = document.getElementById('holdTipP3');
    if (bh)   bh.style.display  = 'block';
    if (fill) fill.style.width  = '0%';
    if (tip)  tip.style.display = 'block';
    function animBarra() {
        const e   = performance.now() - _p3HoldStart;
        const pct = Math.min(e / paso.tiempoHold * 100, 100);
        if (fill) fill.style.width = pct + '%';
        if (pct < 100) _p3BarraAnim = requestAnimationFrame(animBarra);
    }
    _p3BarraAnim = requestAnimationFrame(animBarra);
    _pop();
}

function _onMouseUpP3() {
    if (!_p3HoldMesh) return;
    cancelAnimationFrame(_p3BarraAnim); _p3BarraAnim = null;
    const elapsed = performance.now() - _p3HoldStart;
    const paso = PASOS_P3[_p3PasoActivo];
    const bh   = document.getElementById('barraHoldP3');
    const fill = document.getElementById('barraHoldFill');
    const tip  = document.getElementById('holdTipP3');
    if (bh)   bh.style.display  = 'none';
    if (fill) fill.style.width  = '0%';
    _restaurarMesh(_p3HoldMesh); _p3HoldMesh = null;
    if (!paso || paso.tipo !== 'hold') return;
    if (tip) tip.style.display = 'none';
    if (elapsed < paso.tiempoHold) return; // soltó antes — puede reintentar

    // Hold completado
    _pop();
    if (paso.texturaInicio) _aplicarTexturaPantalla(paso.texturaInicio);
    _revelarDescripcionPaso(paso.id);
    const ic = document.getElementById(`icP3-${paso.id}`);
    const ck = document.getElementById(`ckP3-${paso.id}`);
    if (ic) { ic.textContent = '✓'; ic.style.background = '#1e5c3a'; }
    if (ck) { ck.style.background = '#f0f8f4'; ck.style.borderColor = '#1e5c3a'; }
    _p3PasoActivo++;
    _actualizarChecklist3D(_p3PasoActivo);
    if (_p3PasoActivo >= PASOS_P3.length) { _guardarRespuesta(3, true); _habilitarContinuar(); }
}


/* =====================================================
   PREGUNTA 4 — COLUMNAS
   ===================================================== */
function _mostrarPreguntaColumnas(contenedor,pregunta,indice){
    const ui=document.createElement('div'); ui.id='uiEvaluacion';
    ui.style.cssText=`position:absolute;inset:0;display:flex;flex-direction:column;font-family:'DM Sans',sans-serif;background:#f4f6f4;`;
    ui.innerHTML=`
        ${_barraProgressHTML(indice)}
        <div style="background:white;padding:16px 24px;border-bottom:1px solid #dde3dd;flex-shrink:0;">
            <p style="font-size:0.72rem;color:#5a7a62;margin:0 0 6px;font-weight:600;text-transform:uppercase;">Pregunta ${pregunta.num} de ${PREGUNTAS.length}</p>
            <p style="font-size:0.92rem;color:#1a2e1f;line-height:1.6;margin:0;">${pregunta.enunciado}</p>
        </div>
        <div style="flex:1;overflow-y:auto;display:flex;flex-direction:column;align-items:center;padding:20px;gap:16px;">
            <p style="font-size:0.8rem;color:#5a7a62;margin:0;text-align:center;">Arrastra cada acción a la columna correspondiente</p>
            <div id="bandejaP4" style="display:flex;flex-direction:row;gap:12px;justify-content:center;flex-wrap:wrap;min-height:80px;padding:12px;border:2px dashed #c8d8c8;border-radius:12px;background:#fafafa;width:100%;max-width:1000px;">
                ${TARJETAS_P4.map(t=>`<div data-id="${t.id}" draggable="true" style="width:180px;min-height:70px;display:flex;align-items:center;justify-content:center;background:${t.bg};border:2.5px solid ${t.color};border-radius:12px;padding:10px;cursor:grab;user-select:none;font-size:0.8rem;font-weight:600;color:${t.color};text-align:center;line-height:1.4;">${t.texto}</div>`).join('')}
            </div>
            <div style="display:flex;gap:20px;width:100%;max-width:800px;align-items:stretch;">
                <div style="flex:1;display:flex;flex-direction:column;gap:12px;">
                    <div style="background:#4a90d9;color:white;border-radius:10px;padding:10px 16px;text-align:center;font-weight:600;font-size:0.88rem;">Palas</div>
                    <div id="col-palas" data-col="palas" style="flex:1;min-height:180px;border:2.5px dashed #4a90d9;border-radius:12px;background:#f0f4fb;padding:12px;display:flex;flex-direction:column;gap:10px;align-items:center;">
                        <span class="ph-col" style="color:#9ab0a0;font-size:0.8rem;margin-top:40px;">Arrastra aquí</span>
                    </div>
                </div>
                <div style="flex:1;display:flex;flex-direction:column;gap:12px;">
                    <div style="background:#b8860b;color:white;border-radius:10px;padding:10px 16px;text-align:center;font-weight:600;font-size:0.88rem;">Electrodos desechables (parches)</div>
                    <div id="col-electrodos" data-col="electrodos" style="flex:1;min-height:180px;border:2.5px dashed #b8860b;border-radius:12px;background:#fffbf0;padding:12px;display:flex;flex-direction:column;gap:10px;align-items:center;">
                        <span class="ph-col" style="color:#9ab0a0;font-size:0.8rem;margin-top:40px;">Arrastra aquí</span>
                    </div>
                </div>
            </div>
        </div>
        ${_footerHTML(indice)}
        <style>[data-col].drag-oc{border-style:solid!important;opacity:0.85;}[data-id].arr-col{opacity:0.4;}</style>`;
    contenedor.appendChild(ui);
    const asgn={}; TARJETAS_P4.forEach(t=>asgn[t.id]=null);
    const bandeja=document.getElementById('bandejaP4');
    const cP=document.getElementById('col-palas');
    const cE=document.getElementById('col-electrodos');
    let drag=null;
    [bandeja,cP,cE].forEach(z=>{
        z.addEventListener('dragover',e=>{e.preventDefault();z.classList.add('drag-oc');});
        z.addEventListener('dragleave',()=>z.classList.remove('drag-oc'));
        z.addEventListener('drop',e=>{
            e.preventDefault(); z.classList.remove('drag-oc'); if(!drag) return;
            const id=drag.dataset.id, col=z.dataset.col??null;
            z.querySelectorAll('.ph-col').forEach(p=>p.remove());
            z.appendChild(drag); asgn[id]=col;
            if(TARJETAS_P4.every(t=>asgn[t.id]!==null)){
                const defibIds  = TARJETAS_P4.filter(t=>t.texto==='Desfibrilación manual').map(t=>t.id);
                const defibOk   = defibIds.map(id=>asgn[id]).reduce((a,b)=>a!==b,false) || defibIds.length<2;
                const cardiovIds= TARJETAS_P4.filter(t=>t.texto==='Cardioversión sincronizada').map(t=>t.id);
                const cardiovOk = cardiovIds.map(id=>asgn[id]).reduce((a,b)=>a!==b,false) || cardiovIds.length<2;
                const restOk    = TARJETAS_P4
                    .filter(t=>t.texto!=='Desfibrilación manual'&&t.texto!=='Cardioversión sincronizada')
                    .every(t=>asgn[t.id]===t.columna_correcta);
                _guardarRespuesta(pregunta.num, defibOk && cardiovOk && restOk);
                _habilitarContinuar();
            }
        });
    });
    contenedor.querySelectorAll('[data-id]').forEach(el=>{
        el.addEventListener('dragstart',e=>{drag=el;el.classList.add('arr-col');e.dataTransfer.effectAllowed='move';});
        el.addEventListener('dragend',()=>{el.classList.remove('arr-col');drag=null;});
    });
    window._evalContinuar=()=>_avanzar(indice);
}


/* =====================================================
   PREGUNTA 5 — ORDENAR
   ===================================================== */
function _mostrarPreguntaOrdenar(contenedor,pregunta,indice,tarjetas){
    const ui=document.createElement('div'); ui.id='uiEvaluacion';
    ui.style.cssText=`position:absolute;inset:0;display:flex;flex-direction:column;font-family:'DM Sans',sans-serif;background:#f4f6f4;`;
    const mez=[...tarjetas].sort(()=>Math.random()-0.5);
    const CL=[{bg:'#e8f0fb',b:'#4a90d9'},{bg:'#e8f5ee',b:'#1e5c3a'},{bg:'#fff8e1',b:'#b8860b'},{bg:'#fef0ed',b:'#c0392b'},{bg:'#f3eeff',b:'#7c4dff'},{bg:'#e0f7fa',b:'#0097a7'},{bg:'#fce4ec',b:'#e91e63'}];
    ui.innerHTML=`
        ${_barraProgressHTML(indice)}
        <div style="background:white;padding:16px 24px;border-bottom:1px solid #dde3dd;flex-shrink:0;">
            <p style="font-size:0.72rem;color:#5a7a62;margin:0 0 6px;font-weight:600;text-transform:uppercase;">Pregunta ${pregunta.num} de ${PREGUNTAS.length}</p>
            <p style="font-size:0.92rem;color:#1a2e1f;line-height:1.6;margin:0;">${pregunta.enunciado}</p>
        </div>
        <div style="flex:1;overflow-y:auto;display:flex;flex-direction:column;align-items:center;padding:20px;gap:14px;">
            <p style="font-size:0.8rem;color:#5a7a62;margin:0;text-align:center;">Arrastra las tarjetas para ordenarlas correctamente (de izquierda a derecha)</p>
            <div id="listaOrdenar" style="width:100%;max-width:1200px;display:flex;flex-direction:row;gap:8px;align-items:stretch;">
                ${mez.map((t,i)=>{ const c=CL[i%CL.length]; return `<div data-id="${t.id}" draggable="true" style="flex:1;min-width:0;display:flex;flex-direction:column;align-items:center;gap:8px;background:${c.bg};border:2px solid ${c.b};border-radius:12px;padding:10px;cursor:grab;user-select:none;box-shadow:0 2px 6px rgba(0,0,0,0.07);text-align:center;overflow:hidden;"><div class="num-orden" style="width:28px;height:28px;border-radius:50%;flex-shrink:0;background:${c.b};color:white;display:flex;align-items:center;justify-content:center;font-size:0.78rem;font-weight:700;">${i+1}</div><span style="font-size:0.76rem;color:#1a2e1f;line-height:1.4;font-weight:500;">${t.texto}</span></div>`; }).join('')}
            </div>
        </div>
        ${_footerHTML(indice)}
        <style>#listaOrdenar [data-id].drag-ov{border-color:#1e5c3a!important;box-shadow:0 0 0 3px #1e5c3a40;}#listaOrdenar [data-id].arr-o{opacity:0.45;}</style>`;
    contenedor.appendChild(ui);
    const lista=document.getElementById('listaOrdenar');
    let dEl=null;
    const evaluar=()=>{
        const ok=[...lista.querySelectorAll('[data-id]')].every((el,i)=>{
            const t=tarjetas.find(t=>t.id===parseInt(el.dataset.id)); return t?.orden_correcto===i+1;
        });
        _guardarRespuesta(pregunta.num,ok); _habilitarContinuar();
    };
    const upd=()=>{ lista.querySelectorAll('[data-id]').forEach((el,i)=>{ const n=el.querySelector('.num-orden'); if(n) n.textContent=i+1; }); };
    lista.addEventListener('dragstart',e=>{ dEl=e.target.closest('[data-id]'); if(!dEl) return; dEl.classList.add('arr-o'); e.dataTransfer.effectAllowed='move'; });
    lista.addEventListener('dragend',()=>{ dEl?.classList.remove('arr-o'); dEl=null; lista.querySelectorAll('[data-id]').forEach(el=>el.classList.remove('drag-ov')); upd(); evaluar(); });
    lista.addEventListener('dragover',e=>{ e.preventDefault(); const s=e.target.closest('[data-id]'); if(!s||s===dEl) return; lista.querySelectorAll('[data-id]').forEach(el=>el.classList.remove('drag-ov')); s.classList.add('drag-ov'); const r=s.getBoundingClientRect(); if(e.clientX<r.left+r.width/2) lista.insertBefore(dEl,s); else lista.insertBefore(dEl,s.nextSibling); });
    let tEl=null,ghost=null;
    lista.addEventListener('touchstart',e=>{ const el=e.target.closest('[data-id]'); if(!el) return; tEl=el; el.classList.add('arr-o'); ghost=el.cloneNode(true); ghost.style.cssText+=`;position:fixed;opacity:0.75;pointer-events:none;z-index:9999;width:${el.offsetWidth}px;`; document.body.appendChild(ghost); },{passive:true});
    lista.addEventListener('touchmove',e=>{ if(!tEl||!ghost) return; e.preventDefault(); const t=e.touches[0]; ghost.style.left=(t.clientX-ghost.offsetWidth/2)+'px'; ghost.style.top=(t.clientY-ghost.offsetHeight/2)+'px'; const s=document.elementFromPoint(t.clientX,t.clientY)?.closest('[data-id]'); if(s&&s!==tEl){const r=s.getBoundingClientRect(); if(t.clientY<r.top+r.height/2) lista.insertBefore(tEl,s); else lista.insertBefore(tEl,s.nextSibling);} },{passive:false});
    lista.addEventListener('touchend',()=>{ tEl?.classList.remove('arr-o'); ghost?.remove(); ghost=null; tEl=null; upd(); evaluar(); });
    window._evalContinuar=()=>_avanzar(indice);
}


/* =====================================================
   ENVIAR RESULTADOS
   ===================================================== */
async function enviarResultados(){
    _destruir3d(); document.getElementById('uiEvaluacion')?.remove();
    const c=document.getElementById(_contenedorId); if(!c) return;
    const ui=document.createElement('div'); ui.id='uiEvaluacion';
    ui.style.cssText=`position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:#f4f6f4;font-family:'DM Sans',sans-serif;`;
    ui.innerHTML=`<div style="text-align:center;color:#5a7a62;"><div style="width:40px;height:40px;border:3px solid #e0e6e0;border-top-color:#1e5c3a;border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto 12px;"></div><p>Guardando resultado...</p><style>@keyframes spin{to{transform:rotate(360deg);}}</style></div>`;
    c.appendChild(ui);
    try{
        const r=await fetch(`${API}/resultados/guardar`,{method:'POST',headers:HEADERS,body:JSON.stringify({asignacionId:_asignacionId,Respuestas:_respuestas})});
        if(!r.ok) throw new Error(await r.text());
        mostrarResultado(await r.json());
    }catch(err){
        document.getElementById('uiEvaluacion')?.remove();
        const c2=document.getElementById(_contenedorId); if(!c2) return;
        const uiE=document.createElement('div'); uiE.id='uiEvaluacion';
        uiE.style.cssText=`position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:#f4f6f4;font-family:'DM Sans',sans-serif;`;
        uiE.innerHTML=`<div style="text-align:center;color:#c0392b;max-width:320px;padding:24px;"><p style="font-weight:600;margin-bottom:8px;">Error al guardar el resultado</p><p style="font-size:0.85rem;color:#5a7a62;">${err.message}</p><button onclick="window._evalVolver()" style="margin-top:16px;padding:10px 24px;border:none;border-radius:10px;background:#1e5c3a;color:white;cursor:pointer;font-family:'DM Sans',sans-serif;">Volver al módulo</button></div>`;
        c2.appendChild(uiE); window._evalVolver=_salir;
    }
}


/* =====================================================
   RESULTADO FINAL
   ===================================================== */
function mostrarResultado(resultado){
    document.getElementById('uiEvaluacion')?.remove();
    const c=document.getElementById(_contenedorId); if(!c) return;
    const puntaje=resultado.Puntaje,aprobado=puntaje>=80,esInt2=resultado.numIntento===2;
    const cp=aprobado?'#1e5c3a':'#c0392b',bp=aprobado?'#e8f5ee':'#fef0ed';
    const incorrectas=esInt2?_respuestas.filter(r=>!r.esCorrecta&&RETROALIMENTACION[r.numPregunta]):[];
    const ui=document.createElement('div'); ui.id='uiEvaluacion';
    ui.style.cssText=`position:absolute;inset:0;display:flex;flex-direction:column;font-family:'DM Sans',sans-serif;background:#f4f6f4;overflow:hidden;`;
    const pH=`<div style="background:white;border-bottom:1px solid #e8ece8;padding:74px 40px 10px;flex-shrink:0;display:flex;align-items:center;gap:24px;">
        <div style="width:80px;height:80px;border-radius:50%;background:${bp};border:3px solid ${cp};display:flex;align-items:center;justify-content:center;flex-shrink:0;"><span style="font-size:1.5rem;font-weight:700;color:${cp};">${puntaje}%</span></div>
        <div style="flex:1;"><p style="font-size:1.15rem;font-weight:600;color:#1a2e1f;margin:0 0 4px;">${aprobado?'¡Aprobaste la evaluación!':'No aprobaste esta vez'}</p>
        <p style="font-size:0.86rem;color:#5a7a62;margin:0;">${aprobado?'Superaste el umbral mínimo de aprobación (80%).':'El puntaje mínimo para aprobar es 80%.'} ${!esInt2?' — Tienes un intento más disponible.':(aprobado?'':' Has agotado tus intentos.')}</p>
        <div style="display:flex;gap:6px;margin-top:10px;">${PREGUNTAS.map(p=>{ const e=_estadoPregunta[p.num]; return `<div style="width:26px;height:26px;border-radius:50%;background:${e===true?'#1e5c3a':e===false?'#c0392b':'#e0e6e0'};color:white;font-size:0.7rem;font-weight:600;display:flex;align-items:center;justify-content:center;">${e===true?'✓':e===false?'✗':p.num}</div>`; }).join('')}</div></div>
        <div style="display:flex;flex-direction:column;gap:8px;flex-shrink:0;">${!esInt2?`<button onclick="window._evalReintentar()" style="padding:10px 22px;border:none;border-radius:10px;background:#1e5c3a;color:white;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:0.88rem;font-weight:600;">Intentar de nuevo</button>`:''}
        <button onclick="window._evalVolver()" style="padding:10px 22px;border:1.5px solid #dde3dd;border-radius:10px;background:white;color:#1a2e1f;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:0.88rem;">Volver al módulo</button></div>
    </div>`;
    let cH='';
    if(esInt2&&incorrectas.length>0){
        cH=`<div style="flex:1;display:flex;flex-direction:column;padding:24px 32px;gap:14px;overflow:hidden;">
            <div style="display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">
                <p style="font-size:0.72rem;font-weight:600;color:#c0392b;text-transform:uppercase;letter-spacing:0.06em;margin:0;">${incorrectas.length} pregunta${incorrectas.length>1?'s':''} incorrecta${incorrectas.length>1?'s':''}</p>
                ${incorrectas.length>1?`<div style="display:flex;align-items:center;gap:8px;"><button onclick="window._carruselRetro(-1)" style="width:32px;height:32px;border-radius:50%;border:1.5px solid #dde3dd;background:white;cursor:pointer;font-size:0.9rem;color:#5a7a62;display:flex;align-items:center;justify-content:center;">←</button><span id="carruselCounter" style="font-size:0.8rem;color:#5a7a62;min-width:36px;text-align:center;">1 / ${incorrectas.length}</span><button onclick="window._carruselRetro(1)" style="width:32px;height:32px;border-radius:50%;border:1.5px solid #dde3dd;background:white;cursor:pointer;font-size:0.9rem;color:#5a7a62;display:flex;align-items:center;justify-content:center;">→</button></div>`:''}
            </div>
            <div id="carruselRetro" style="flex:1;position:relative;overflow:hidden;min-height:0;">
                ${incorrectas.map((r,i)=>{ const rr=RETROALIMENTACION[r.numPregunta]; return `<div class="slide-retro" data-slide="${i}" style="position:absolute;inset:0;display:${i===0?'flex':'none'};background:white;border-radius:16px;border:1px solid #f0e0e0;overflow:hidden;"><div style="width:52%;flex-shrink:0;overflow:hidden;background:#f8f0f0;"><img src="${rr.imagen}" style="width:100%;height:100%;object-fit:contain;display:block;" onerror="this.parentElement.style.background='#f0f4f0'"></div><div style="flex:1;padding:28px 32px;display:flex;flex-direction:column;justify-content:center;gap:12px;overflow-y:auto;"><div style="display:inline-flex;align-items:center;gap:8px;background:#fef0ed;border-radius:8px;padding:5px 12px;width:fit-content;"><span style="width:18px;height:18px;border-radius:50%;background:#c0392b;color:white;font-size:0.65rem;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;">✗</span><span style="font-size:0.72rem;font-weight:600;color:#c0392b;text-transform:uppercase;letter-spacing:0.05em;">Pregunta ${r.numPregunta} incorrecta</span></div><p style="font-size:0.95rem;color:#1a2e1f;line-height:1.65;margin:0;">${rr.texto}</p>${incorrectas.length>1?`<div style="display:flex;gap:6px;margin-top:4px;">${incorrectas.map((_,j)=>`<div class="punto-retro" style="width:7px;height:7px;border-radius:50%;background:${j===i?'#c0392b':'#e0e6e0'};transition:background 0.2s;"></div>`).join('')}</div>`:''}</div></div>`; }).join('')}
            </div>
        </div>`;
    } else {
        const correctas=_respuestas.filter(r=>r.esCorrecta).length;
        cH=`<div style="flex:1;display:flex;align-items:center;justify-content:center;padding:24px;">
            <div style="background:white;border-radius:20px;border:1px solid #e8ece8;padding:36px 44px;max-width:520px;width:100%;display:flex;flex-direction:column;align-items:center;gap:20px;">
                <div style="text-align:center;"><p style="font-size:1.05rem;font-weight:600;color:#1a2e1f;margin:0 0 6px;">Respondiste ${correctas} de ${PREGUNTAS.length} correctamente</p>
                <p style="font-size:0.84rem;color:#5a7a62;margin:0;line-height:1.6;">${esInt2?(aprobado?'Excelente trabajo.':'Has agotado los intentos disponibles.'):(aprobado?'¡Lo lograste en el primer intento!':'Puedes volver a intentarlo.')}</p></div>
                <div style="width:100%;display:flex;flex-direction:column;gap:8px;">${PREGUNTAS.map(p=>{ const resp=_respuestas.find(r=>r.numPregunta===p.num); const ok=resp?.esCorrecta??false; return `<div style="display:flex;align-items:center;gap:12px;background:${ok?'#f0f8f4':'#fef6f5'};border:1px solid ${ok?'#c8e6d8':'#f5ccc8'};border-radius:10px;padding:10px 16px;"><div style="width:22px;height:22px;border-radius:50%;flex-shrink:0;background:${ok?'#1e5c3a':'#c0392b'};color:white;font-size:0.7rem;font-weight:700;display:flex;align-items:center;justify-content:center;">${ok?'✓':'✗'}</div><span style="font-size:0.84rem;color:#1a2e1f;font-weight:500;">Pregunta ${p.num}</span><span style="font-size:0.8rem;color:${ok?'#1e5c3a':'#c0392b'};margin-left:auto;font-weight:600;">${ok?'Correcta':'Incorrecta'}</span></div>`; }).join('')}</div>
                ${!esInt2&&!aprobado?`<p style="font-size:0.8rem;color:#5a7a62;text-align:center;margin:0;background:#fff8e1;border:1px solid #f0c040;border-radius:8px;padding:10px 16px;width:100%;box-sizing:border-box;">Puedes intentar la evaluación máximo 2 veces.</p>`:''}
            </div>
        </div>`;
    }
    ui.innerHTML=pH+cH; c.appendChild(ui);
    if(esInt2&&incorrectas.length>1){
        let _sa=0; const tot=incorrectas.length;
        window._carruselRetro=(dir)=>{ const sl=document.querySelectorAll('.slide-retro'),pt=document.querySelectorAll('.punto-retro'); sl[_sa].style.display='none'; if(pt[_sa]) pt[_sa].style.background='#e0e6e0'; _sa=(_sa+dir+tot)%tot; sl[_sa].style.display='flex'; if(pt[_sa]) pt[_sa].style.background='#c0392b'; const ct=document.getElementById('carruselCounter'); if(ct) ct.textContent=`${_sa+1} / ${tot}`; };
    }
    window._evalReintentar=()=>{ _destruir3d(); document.getElementById('uiEvaluacion')?.remove(); iniciarEvaluacion(_contenedorId,_asignacionId); };
    window._evalVolver=_salir;
}


/* =====================================================
   INTENTOS AGOTADOS
   ===================================================== */
function mostrarAgotado(){
    const c=document.getElementById(_contenedorId); if(!c) return;
    const ui=document.createElement('div'); ui.id='uiEvaluacion';
    ui.style.cssText=`position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:#f4f6f4;font-family:'DM Sans',sans-serif;`;
    ui.innerHTML=`<div style="text-align:center;max-width:360px;padding:24px;"><div style="font-size:2.5rem;margin-bottom:12px;">🔒</div><h3 style="color:#1a2e1f;margin-bottom:8px;">Intentos agotados</h3><p style="font-size:0.88rem;color:#5a7a62;line-height:1.6;">Ya realizaste los 2 intentos permitidos para esta evaluación.</p><button onclick="window._evalVolver()" style="margin-top:20px;padding:11px 28px;border:none;border-radius:10px;background:#1e5c3a;color:white;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:0.9rem;">Volver al módulo</button></div>`;
    c.appendChild(ui); window._evalVolver=_salir;
}


/* =====================================================
   SALIR
   ===================================================== */
function _salir(){
    _destruir3d(); _restaurarColores();
    document.getElementById('uiEvaluacion')?.remove();
    _ocultarFilaSecciones(false);
    limpiarRenderer(false);
    window.dispatchEvent(new CustomEvent('evaluacionTerminada'));
}