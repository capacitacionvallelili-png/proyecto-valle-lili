/* =====================================================
   escena.js — Base Three.js optimizada
   - Renderer global reutilizable (evita Context Lost)
   - Cache de modelos (evita recargar el .glb)
   ===================================================== */

import * as THREE from './libs/three.module.js';
import { GLTFLoader } from './libs/GLTFLoader.js';
import { OrbitControls } from './libs/OrbitControls.js';

export { THREE };

/* ===== RENDERER GLOBAL ===== */
function obtenerRenderer(contenedor) {
    if (!window._threeRenderer) {
        window._threeRenderer = new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: 'high-performance'
        });
        window._threeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }

    window._threeRenderer.setSize(contenedor.clientWidth, contenedor.clientHeight);

    if (window._threeRenderer.domElement.parentNode !== contenedor) {
        contenedor.appendChild(window._threeRenderer.domElement);
    }

    return window._threeRenderer;
}

/* ===== INICIALIZAR ESCENA ===== */
export function inicializarEscena(contenedorId) {
    const contenedor = document.getElementById(contenedorId);

    const escena = new THREE.Scene();
    escena.background = new THREE.Color(0xf4f6f4);

    const reloj = new THREE.Clock();

    const camara = new THREE.PerspectiveCamera(
        45,
        contenedor.clientWidth / contenedor.clientHeight,
        0.01,
        1000
    );
    camara.position.set(0, 0, 1);

    const renderer = obtenerRenderer(contenedor);

    escena.add(new THREE.AmbientLight(0xffffff, 0.7));
    const luzDir = new THREE.DirectionalLight(0xffffff, 0.8);
    luzDir.position.set(5, 10, 5);
    escena.add(luzDir);

    const controls = new OrbitControls(camara, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 0.5;
    controls.maxDistance = 20;
    controls.target.set(0, 0, 0);
    controls.update();

    const onResize = () => {
        camara.aspect = contenedor.clientWidth / contenedor.clientHeight;
        camara.updateProjectionMatrix();
        renderer.setSize(contenedor.clientWidth, contenedor.clientHeight);
    };
    window.addEventListener('resize', onResize);

    return { escena, camara, renderer, controls, reloj };
}

/* ===== CARGAR MODELO GLB con cache ===== */
export function cargarModelo(ruta, escena, camara, controls, onCargado) {

    if (!window._cacheModelos) window._cacheModelos = {};

    if (window._cacheModelos[ruta]) {
        console.log('Modelo desde cache');
        _aplicarModelo(
            window._cacheModelos[ruta],
            window._cacheModelos[ruta]._animaciones || [],
            escena, camara, controls, onCargado
        );
        return;
    }

    const loader = new GLTFLoader();
    loader.load(
        ruta,
        (gltf) => {
            gltf.scene._animaciones = gltf.animations;
            window._cacheModelos[ruta] = gltf.scene;
            console.log('Modelo cargado');
            _aplicarModelo(gltf.scene, gltf.animations, escena, camara, controls, onCargado);
        },
        (progreso) => {
            const pct = Math.round((progreso.loaded / progreso.total) * 100);
            const loaderTxt = document.getElementById('loaderPct') ||
                  document.getElementById('loaderPct2');
            if (loaderTxt) {
                loaderTxt.textContent = pct >= 100 ? 'Procesando...' : pct;
            }
        },
        (error) => console.error('Error:', error)
    );
}

/* ===== CENTRAR Y ESCALAR MODELO ===== */
function _aplicarModelo(modelo, animaciones, escena, camara, controls, onCargado) {
    modelo.scale.setScalar(0.05);
    escena.add(modelo);

    // ─────────────────────────────────────────────────────────────────
    // BUG FIX — el modelo en cache es el mismo objeto JavaScript.
    // Si _aplicarModelo ya lo centró antes, su position y rotation
    // ya están aplicados. Volver a calcular el bounding box y aplicar
    // -centro produce un desplazamiento doble en cada recarga.
    //
    // Solución: guardar la posición y rotación originales la primera
    // vez (_posicionOriginal / _rotacionOriginal), y restaurarlas
    // siempre antes de recalcular el bounding box.
    // Así el centrado produce el mismo resultado en todas las cargas.
    // ─────────────────────────────────────────────────────────────────
    if (!modelo._posicionOriginal) {
        // Primera carga: guardar posición y rotación originales del GLB
        modelo._posicionOriginal = modelo.position.clone();
        modelo._rotacionOriginal = modelo.rotation.clone();
    } else {
        // Cargas siguientes (desde cache): restaurar antes de centrar
        modelo.position.copy(modelo._posicionOriginal);
        modelo.rotation.copy(modelo._rotacionOriginal);
    }

    // Calcular bounding box sobre la posición original (siempre igual)
    const caja   = new THREE.Box3().setFromObject(modelo);
    const centro = caja.getCenter(new THREE.Vector3());
    const tamaño = caja.getSize(new THREE.Vector3());

    // Centrar el modelo (mismo resultado en todas las cargas)
    modelo.position.set(-centro.x, -centro.y, -centro.z);
    modelo.rotation.y = Math.PI / 2;

    const maxDim = Math.max(tamaño.x, tamaño.y, tamaño.z);
    controls.minDistance = maxDim * 0.1;
    controls.maxDistance = maxDim * 5;

    console.log('🎬 Animaciones:', animaciones.map(a => a.name));

    const mixer = new THREE.AnimationMixer(modelo);
    if (onCargado) onCargado(modelo, animaciones, mixer);
}

/* ===== LIMPIAR RENDERER ===== */
export function limpiarRenderer(destroy = false) {
    if (!window._threeRenderer) return;

    const canvas = window._threeRenderer.domElement;
    if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
    }

    if (destroy) {
        try { window._threeRenderer.dispose(); } catch { }
        window._threeRenderer = null;
        window._cacheModelos = {};
    }
}