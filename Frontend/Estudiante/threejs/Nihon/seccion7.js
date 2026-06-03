/* =====================================================
   seccion7.js — Sección 7: Palas Internas
   Sin modelo 3D — solo video YouTube obligatorio
   ===================================================== */

let ytPlayer = null;
let videoTerminado = false;

const VIDEO_ID = '4SwWNiyTK-c';

/* ===== INICIAR SECCIÓN 7 ===== */
export function iniciarSeccion7(contenedorId) {
    destruirSeccion7();

    const contenedor = document.getElementById(contenedorId);
    if (!contenedor) return;
    contenedor.style.position = 'relative';

    const btnCompletar = document.getElementById('btnCompletar');
    const yaCompletada = btnCompletar?.disabled &&
        btnCompletar?.textContent.includes('completada');

    videoTerminado = false;

    // Si ya estaba completada no bloqueamos el botón
    if (!yaCompletada) bloquearBotonCompletar(true);

    mostrarUI(contenedorId, yaCompletada);
}

/* ===== DESTRUIR SECCIÓN 7 ===== */
export function destruirSeccion7() {
    if (ytPlayer) {
        try { ytPlayer.stopVideo(); ytPlayer.destroy(); } catch { }
        ytPlayer = null;
    }
    document.getElementById('uiSeccion7')?.remove();
    videoTerminado = false;
}


/* ===== UI PRINCIPAL ===== */
function mostrarUI(contenedorId, yaCompletada) {
    document.getElementById('uiSeccion7')?.remove();

    const contenedor = document.getElementById(contenedorId);
    const ui = document.createElement('div');
    ui.id = 'uiSeccion7';
    ui.style.cssText = `
        position:absolute;inset:0;
        display:flex;flex-direction:row;
        font-family:'DM Sans',sans-serif;
        background:#f4f6f4;
        overflow:hidden;`;

    ui.innerHTML = `
        <!-- ===== PANEL LATERAL IZQUIERDO ===== -->
        <div id="panelLateralS7" style="
            width:0;flex-shrink:0;overflow:hidden;
            background:white;
            box-shadow:4px 0 20px rgba(0,0,0,0.12);
            transition:width 0.35s cubic-bezier(0.16,1,0.3,1);
            font-family:'DM Sans',sans-serif;
            font-size:0.88rem;line-height:1.6;color:#1a2e1f;
            display:flex;flex-direction:column;z-index:5;">
            <div style="padding:20px;overflow-y:auto;flex:1;">
                <div style="display:flex;align-items:center;
                    justify-content:space-between;margin-bottom:16px;">
                    <h4 style="font-size:1rem;color:#1e5c3a;margin:0;">
                        Palas Internas
                    </h4>
                    <button onclick="window.togglePanelS7()" style="
                        background:none;border:none;cursor:pointer;
                        color:#5a7a62;font-size:1.2rem;padding:4px;">✕
                    </button>
                </div>

                <p style="margin:0 0 14px;">
                    Las Palas Internas son una variante de la desfibrilación utilizada
                    exclusivamente en cirugías a corazón abierto, donde las palas estériles
                    se colocan directamente sobre el miocardio, requiriendo niveles de energía
                    significativamente menores (máximo 50 Joules) debido al contacto directo
                    con el tejido cardíaco.
                </p>

                <div style="
                    background:#fef0ed;border-radius:10px;padding:12px;
                    border-left:3px solid #c0392b;margin-bottom:12px;">
                    <p style="margin:0;font-size:0.83rem;color:#c0392b;font-weight:600;">
                        Exclusivo para   cirugía cardíaca
                    </p>
                </div>

                

                <div style="
                    background:#e8f0fb;border-radius:10px;padding:12px;
                    border-left:3px solid #4a90d9;">
                    <p style="margin:0 0 6px;font-size:0.83rem;color:#2c5f8a;font-weight:600;">
                        Descarga desde panel frontal
                    </p>
                    <p style="margin:0;font-size:0.82rem;color:#2c5f8a;">
                        Las palas internas No tienen botón de descarga propio.
                        La descarga se hace SIEMPRE desde el botón 3 del panel frontal.
                    </p>
                </div>
            </div>
        </div>

        <!-- ===== ÁREA DEL VIDEO ===== -->
        <div style="
            flex:1;display:flex;flex-direction:column;
            align-items:center;justify-content:center;
            padding:32px;gap:20px;position:relative;">

            <!-- Botón abrir panel -->
            <button onclick="window.togglePanelS7()" style="
                position:absolute;bottom:24px;left:24px;
                width:44px;height:44px;border-radius:50%;
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
            </button>

            <!-- Título -->
            <div style="text-align:center;">
                <p style="font-size:0.75rem;color:#5a7a62;margin:0 0 6px;
                    font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">
                    Sección 7
                </p>
                <h3 style="font-size:1.2rem;color:#1a2e1f;margin:0;">
                    Palas Internas
                </h3>
            </div>

            <!-- Contenedor del video -->
            <div style="
                width:100%;max-width:800px;
                border-radius:14px;overflow:hidden;
                box-shadow:0 4px 24px rgba(0,0,0,0.14);
                position:relative;padding-bottom:56.25%;height:0;">
                <div id="ytPlayerS7" style="
                    position:absolute;top:0;left:0;
                    width:100%;height:100%;"></div>
            </div>

            <!-- Indicador de progreso del video -->
            ${!yaCompletada ? `
            <div id="indicadorVideoS7" style="
                display:flex;align-items:center;gap:8px;
                background:rgba(30,92,58,0.9);color:white;
                padding:7px 18px;border-radius:20px;
                font-size:0.78rem;pointer-events:none;">
                <span id="puntoPulsarS7" style="
                    width:8px;height:8px;border-radius:50%;
                    background:#7fffb5;
                    animation:pulsarS7 1.2s ease-in-out infinite;
                    display:inline-block;"></span>
                <span id="textoIndicadorS7">Mira el video completo para continuar</span>
            </div>
            <style>
                @keyframes pulsarS7 {
                    0%,100%{opacity:1;transform:scale(1);}
                    50%{opacity:0.4;transform:scale(0.7);}
                }
            </style>
            ` : ''}
        </div>`;

    contenedor.appendChild(ui);

    // Cargar la API de YouTube e iniciar el player
    _cargarYouTubeAPI(yaCompletada);
}


/* ===== PANEL LATERAL ===== */
let _panelAbierto = false;
window.togglePanelS7 = function () {
    const panel = document.getElementById('panelLateralS7');
    if (!panel) return;
    _panelAbierto = !_panelAbierto;
    panel.style.width = _panelAbierto ? '300px' : '0';
};


/* ===== YOUTUBE PLAYER ===== */
function _cargarYouTubeAPI(yaCompletada) {
    if (!document.getElementById('ytApiScript')) {
        const tag = document.createElement('script');
        tag.id  = 'ytApiScript';
        tag.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(tag);
    }

    const activar = () => {
        const target = document.getElementById('ytPlayerS7');
        if (!target || !window.YT?.Player) return;

        ytPlayer = new YT.Player('ytPlayerS7', {
            videoId: VIDEO_ID,
            playerVars: {
                rel: 0,
                modestbranding: 1,
                // Deshabilitar avance manual si no está completada
                controls: yaCompletada ? 1 : 1,
            },
            events: {
                onStateChange: (e) => _onPlayerState(e, yaCompletada),
            }
        });
    };

    // Si la API ya cargó, activar directo; si no, esperar el callback
    if (window.YT?.Player) {
        activar();
    } else {
        const prevCallback = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
            prevCallback?.();
            activar();
        };
    }
}

function _onPlayerState(event, yaCompletada) {
    if (yaCompletada) return; // si ya completó no necesita hacer nada

    if (event.data === YT.PlayerState.ENDED) {
        videoTerminado = true;
        _videoCompletado();
    }
}

function _videoCompletado() {
    // Actualizar indicador
    const punto    = document.getElementById('puntoPulsarS7');
    const texto    = document.getElementById('textoIndicadorS7');
    const indicador = document.getElementById('indicadorVideoS7');

    if (punto)  punto.style.animation = 'none';
    if (texto)  texto.textContent = '¡Video completado! Ya puedes continuar';
    if (indicador) {
        indicador.style.background = 'rgba(30,92,58,0.95)';
    }

    // Desbloquear botón completar
    bloquearBotonCompletar(false);

    // Ocultar indicador después de 3 segundos
    setTimeout(() => {
        if (indicador) {
            indicador.style.transition = 'opacity 0.5s';
            indicador.style.opacity = '0';
            setTimeout(() => indicador?.remove(), 500);
        }
    }, 3000);
}


/* ===== BOTÓN COMPLETAR ===== */
function bloquearBotonCompletar(bloqueado) {
    const btn = document.getElementById('btnCompletar');
    if (!btn) return;
    if (btn.textContent.includes('completada')) return;
    btn.disabled      = bloqueado;
    btn.style.opacity = bloqueado ? '0.5' : '1';
    btn.style.cursor  = bloqueado ? 'not-allowed' : 'pointer';
    btn.title         = bloqueado ? 'Mira el video completo para continuar' : '';
}