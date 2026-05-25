// hero-terminal.js
let React;
let useCallback;
let useEffect;
let useMemo;
let useRef;
let useState;
let createRoot;
let Renderer;
let Program;
let Mesh;
let Geometry;

let moduleLoadPromise = null;

async function ensureTerminalDependencies() {
  if (moduleLoadPromise) return moduleLoadPromise;

  moduleLoadPromise = Promise.all([
    import("https://esm.sh/react@18.3.1"),
    import("https://esm.sh/react-dom@18.3.1/client"),
    import("https://cdn.jsdelivr.net/npm/ogl@0.0.32/dist/ogl.mjs"),
  ])
    .then(([reactModule, reactDomModule, oglModule]) => {
      React = reactModule.default || reactModule;
      ({ useCallback, useEffect, useMemo, useRef, useState } = reactModule);
      ({ createRoot } = reactDomModule);
      ({ Renderer, Program, Mesh, Geometry } = oglModule);
    })
    .catch((error) => {
      moduleLoadPromise = null;
      throw error;
    });

  return moduleLoadPromise;
}

function hexToRgb(hex) {
  let h = hex.replace("#", "").trim();
  if (h.length === 3) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  }

  const num = parseInt(h, 16);
  return [((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255];
}

const vertexShader = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragmentShader = `
precision mediump float;

varying vec2 vUv;

uniform float iTime;
uniform vec3  iResolution;
uniform float uScale;

uniform vec2  uGridMul;
uniform float uDigitSize;
uniform float uScanlineIntensity;
uniform float uGlitchAmount;
uniform float uFlickerAmount;
uniform float uNoiseAmp;
uniform float uChromaticAberration;
uniform float uDither;
uniform float uCurvature;
uniform vec3  uTint;
uniform vec2  uMouse;
uniform float uMouseStrength;
uniform float uUseMouse;
uniform float uPageLoadProgress;
uniform float uUsePageLoadAnimation;
uniform float uBrightness;

float time;

float hash21(vec2 p){
  p = fract(p * 234.56);
  p += dot(p, p + 34.56);
  return fract(p.x * p.y);
}

float noise(vec2 p)
{
  return sin(p.x * 10.0) * sin(p.y * (3.0 + sin(time * 0.090909))) + 0.2; 
}

mat2 rotate(float angle)
{
  float c = cos(angle);
  float s = sin(angle);
  return mat2(c, -s, s, c);
}

float fbm(vec2 p)
{
  p *= 1.1;
  float f = 0.0;
  float amp = 0.5 * uNoiseAmp;
  
  mat2 modify0 = rotate(time * 0.02);
  f += amp * noise(p);
  p = modify0 * p * 2.0;
  amp *= 0.454545;
  
  mat2 modify1 = rotate(time * 0.02);
  f += amp * noise(p);
  p = modify1 * p * 2.0;
  amp *= 0.454545;
  
  mat2 modify2 = rotate(time * 0.08);
  f += amp * noise(p);
  
  return f;
}

float pattern(vec2 p, out vec2 q, out vec2 r) {
  vec2 offset1 = vec2(1.0);
  vec2 offset0 = vec2(0.0);
  mat2 rot01 = rotate(0.1 * time);
  mat2 rot1 = rotate(0.1);
  
  q = vec2(fbm(p + offset1), fbm(rot01 * p + offset1));
  r = vec2(fbm(rot1 * q + offset0), fbm(q + offset0));
  return fbm(p + r);
}

float digit(vec2 p){
    vec2 grid = uGridMul * 15.0;
    vec2 s = floor(p * grid) / grid;
    p = p * grid;
    vec2 q, r;
    float intensity = pattern(s * 0.1, q, r) * 1.3 - 0.03;
    
    if(uUseMouse > 0.5){
        vec2 mouseWorld = uMouse * uScale;
        float distToMouse = distance(s, mouseWorld);
        float mouseInfluence = exp(-distToMouse * 8.0) * uMouseStrength * 10.0;
        intensity += mouseInfluence;
        
        float ripple = sin(distToMouse * 20.0 - iTime * 5.0) * 0.1 * mouseInfluence;
        intensity += ripple;
    }
    
    if(uUsePageLoadAnimation > 0.5){
        float cellRandom = fract(sin(dot(s, vec2(12.9898, 78.233))) * 43758.5453);
        float cellDelay = cellRandom * 0.8;
        float cellProgress = clamp((uPageLoadProgress - cellDelay) / 0.2, 0.0, 1.0);
        float fadeAlpha = smoothstep(0.0, 1.0, cellProgress);
        intensity *= fadeAlpha;
    }
    
    p = fract(p);
    p *= uDigitSize;
    
    float px5 = p.x * 5.0;
    float py5 = (1.0 - p.y) * 5.0;
    float x = fract(px5);
    float y = fract(py5);
    
    float i = floor(py5) - 2.0;
    float j = floor(px5) - 2.0;
    float n = i * i + j * j;
    float f = n * 0.0625;
    
    float isOn = step(0.1, intensity - f);
    float brightness = isOn * (0.2 + y * 0.8) * (0.75 + x * 0.25);
    
    return step(0.0, p.x) * step(p.x, 1.0) * step(0.0, p.y) * step(p.y, 1.0) * brightness;
}

float onOff(float a, float b, float c)
{
  return step(c, sin(iTime + a * cos(iTime * b))) * uFlickerAmount;
}

float displace(vec2 look)
{
    float y = look.y - mod(iTime * 0.25, 1.0);
    float window = 1.0 / (1.0 + 50.0 * y * y);
    return sin(look.y * 20.0 + iTime) * 0.0125 * onOff(4.0, 2.0, 0.8) * (1.0 + cos(iTime * 60.0)) * window;
}

vec3 getColor(vec2 p){
    float bar = step(mod(p.y + time * 20.0, 1.0), 0.2) * 0.4 + 1.0;
    bar *= uScanlineIntensity;
    
    float displacement = displace(p);
    p.x += displacement;

    if (uGlitchAmount != 1.0) {
      float extra = displacement * (uGlitchAmount - 1.0);
      p.x += extra;
    }

    float middle = digit(p);
    
    const float off = 0.002;
    float sum = digit(p + vec2(-off, -off)) + digit(p + vec2(0.0, -off)) + digit(p + vec2(off, -off)) +
                digit(p + vec2(-off, 0.0)) + digit(p + vec2(0.0, 0.0)) + digit(p + vec2(off, 0.0)) +
                digit(p + vec2(-off, off)) + digit(p + vec2(0.0, off)) + digit(p + vec2(off, off));
    
    vec3 baseColor = vec3(0.9) * middle + sum * 0.1 * vec3(1.0) * bar;
    return baseColor;
}

vec2 barrel(vec2 uv){
  vec2 c = uv * 2.0 - 1.0;
  float r2 = dot(c, c);
  c *= 1.0 + uCurvature * r2;
  return c * 0.5 + 0.5;
}

void main() {
    time = iTime * 0.333333;
    vec2 uv = vUv;

    if(uCurvature != 0.0){
      uv = barrel(uv);
    }
    
    vec2 p = uv * uScale;
    vec3 col = getColor(p);

    if(uChromaticAberration != 0.0){
      vec2 ca = vec2(uChromaticAberration) / iResolution.xy;
      col.r = getColor(p + ca).r;
      col.b = getColor(p - ca).b;
    }

    col *= uTint;
    col *= uBrightness;

    if(uDither > 0.0){
      float rnd = hash21(gl_FragCoord.xy);
      col += (rnd - 0.5) * (uDither * 0.003922);
    }

    gl_FragColor = vec4(col, 1.0);
}
`;

function HeroTerminal() {
  const containerRef = useRef(null);
  const programRef = useRef(null);
  const rendererRef = useRef(null);
  const rafRef = useRef(0);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const smoothMouseRef = useRef({ x: 0.5, y: 0.5 });
  const frozenTimeRef = useRef(0);
  const loadAnimationStartRef = useRef(0);
  const timeOffsetRef = useRef(Math.random() * 100);

  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : 1024
  );

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, []);

  const isMobile = viewportWidth <= 768;
  const isCoarsePointer =
    typeof window !== "undefined" &&
    window.matchMedia("(pointer: coarse)").matches;
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const liteMode = isMobile || isCoarsePointer || prefersReducedMotion;

  const settings = useMemo(() => {
    const small = viewportWidth <= 600;
    const medium = viewportWidth > 600 && viewportWidth <= 1024;

    return {
      scale: small ? 1.02 : medium ? 1.25 : 1.5,
      gridMul: [small ? 1.35 : 2, 1],
      digitSize: small ? 0.95 : medium ? 1.08 : 1.2,
      timeScale: small ? 0.55 : medium ? 0.8 : 1,
      scanlineIntensity: small ? 0.42 : 0.3,
      glitchAmount: small ? 1.02 : 1.22,
      flickerAmount: 1,
      noiseAmp: 0.08,
      chromaticAberration: small ? 0 : 0.002,
      dither: small ? 0 : 1,
      curvature: small ? 0.08 : 0.2,
      tint: "#67a8ff",
      mouseReact: !isCoarsePointer,
      mouseStrength: 0.18,
      brightness: small ? 0.8 : 0.92,
      pageLoadAnimation: true,
    };
  }, [viewportWidth, isCoarsePointer]);

  const handleMouseMove = useCallback((event) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = 1 - (event.clientY - rect.top) / rect.height;
    mouseRef.current = { x, y };
  }, []);

  useEffect(() => {
    if (liteMode) {
      cancelAnimationFrame(rafRef.current);
      return undefined;
    }

    const container = containerRef.current;
    if (!container) return undefined;

    const tintVec = hexToRgb(settings.tint);
    const dpr = Math.min(window.devicePixelRatio || 1, viewportWidth <= 1024 ? 1.25 : 2);

    let renderer;
    let gl;
    let mesh;

    try {
      renderer = new Renderer({ dpr });
      rendererRef.current = renderer;
      gl = renderer.gl;
      if (!gl) throw new Error("No GL context");
      gl.clearColor(0.01, 0.03, 0.08, 1);
    } catch (err) {
      console.warn("[hero-terminal] WebGL init failed, using static mode", err);
      return undefined;
    }

    const geometry = new Geometry(gl, {
      position: {
        size: 2,
        data: new Float32Array([-1, -1, 3, -1, -1, 3]),
      },
      uv: {
        size: 2,
        data: new Float32Array([0, 0, 2, 0, 0, 2]),
      },
    });

    try {
      const program = new Program(gl, {
        vertex: vertexShader,
        fragment: fragmentShader,
        uniforms: {
          iTime: { value: 0 },
          iResolution: {
            value: new Float32Array([gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height]),
          },
          uScale: { value: settings.scale },
          uGridMul: { value: new Float32Array(settings.gridMul) },
          uDigitSize: { value: settings.digitSize },
          uScanlineIntensity: { value: settings.scanlineIntensity },
          uGlitchAmount: { value: settings.glitchAmount },
          uFlickerAmount: { value: settings.flickerAmount },
          uNoiseAmp: { value: settings.noiseAmp },
          uChromaticAberration: { value: settings.chromaticAberration },
          uDither: { value: settings.dither },
          uCurvature: { value: settings.curvature },
          uTint: { value: new Float32Array(tintVec) },
          uMouse: { value: new Float32Array([smoothMouseRef.current.x, smoothMouseRef.current.y]) },
          uMouseStrength: { value: settings.mouseStrength },
          uUseMouse: { value: settings.mouseReact ? 1 : 0 },
          uPageLoadProgress: { value: 0 },
          uUsePageLoadAnimation: { value: 1 },
          uBrightness: { value: settings.brightness },
        },
      });

      programRef.current = program;
      mesh = new Mesh(gl, { geometry, program });
    } catch (err) {
      console.error("[hero-terminal] Shader setup failed", err);
      return undefined;
    }

    container.appendChild(gl.canvas);
    gl.canvas.style.width = "100%";
    gl.canvas.style.height = "100%";
    gl.canvas.style.display = "block";
    gl.canvas.style.pointerEvents = "none";

    const resize = () => {
      if (!renderer || !programRef.current) return;
      renderer.setSize(container.offsetWidth, container.offsetHeight);
      const w = gl.canvas.width;
      const h = gl.canvas.height;
      programRef.current.uniforms.iResolution.value[0] = w;
      programRef.current.uniforms.iResolution.value[1] = h;
      programRef.current.uniforms.iResolution.value[2] = w / h;
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    const minFrameInterval = 1000 / 60;
    let lastRenderTime = 0;

    const update = (now) => {
      rafRef.current = requestAnimationFrame(update);
      if (now - lastRenderTime < minFrameInterval) return;
      lastRenderTime = now;

      if (settings.pageLoadAnimation && loadAnimationStartRef.current === 0) {
        loadAnimationStartRef.current = now;
      }

      const program = programRef.current;
      if (!program) return;

      const elapsed = (now * 0.001 + timeOffsetRef.current) * settings.timeScale;
      program.uniforms.iTime.value = elapsed;
      frozenTimeRef.current = elapsed;

      if (settings.pageLoadAnimation && loadAnimationStartRef.current > 0) {
        const animationDuration = 1800;
        const animationElapsed = now - loadAnimationStartRef.current;
        const progress = Math.min(animationElapsed / animationDuration, 1);
        program.uniforms.uPageLoadProgress.value = progress;
      } else {
        program.uniforms.uPageLoadProgress.value = 1;
      }

      if (settings.mouseReact) {
        const dampingFactor = 0.08;
        const smoothMouse = smoothMouseRef.current;
        const mouse = mouseRef.current;

        smoothMouse.x += (mouse.x - smoothMouse.x) * dampingFactor;
        smoothMouse.y += (mouse.y - smoothMouse.y) * dampingFactor;

        const mouseUniform = program.uniforms.uMouse.value;
        mouseUniform[0] = smoothMouse.x;
        mouseUniform[1] = smoothMouse.y;
      }

      renderer.render({ scene: mesh });
    };

    rafRef.current = requestAnimationFrame(update);

    if (settings.mouseReact) {
      container.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      cancelAnimationFrame(rafRef.current);
      resizeObserver.disconnect();
      if (settings.mouseReact) container.removeEventListener("mousemove", handleMouseMove);
      if (gl && gl.canvas && gl.canvas.parentElement === container) {
        container.removeChild(gl.canvas);
      }
      if (gl) gl.getExtension("WEBGL_lose_context")?.loseContext();
      loadAnimationStartRef.current = 0;
      timeOffsetRef.current = Math.random() * 100;
    };
  }, [
    liteMode,
    settings.scale,
    settings.gridMul,
    settings.digitSize,
    settings.timeScale,
    settings.scanlineIntensity,
    settings.glitchAmount,
    settings.flickerAmount,
    settings.noiseAmp,
    settings.chromaticAberration,
    settings.dither,
    settings.curvature,
    settings.tint,
    settings.mouseReact,
    settings.mouseStrength,
    settings.pageLoadAnimation,
    settings.brightness,
    handleMouseMove,
    viewportWidth,
  ]);

  const shellChildren = [
    React.createElement(
      "div",
      { className: "hero-terminal-topbar", key: "topbar", "aria-hidden": "true" },
      React.createElement("span", { className: "hero-terminal-dot" }),
      React.createElement("span", { className: "hero-terminal-dot" }),
      React.createElement("span", { className: "hero-terminal-dot" })
    ),
    React.createElement(
      "div",
      { className: "hero-terminal-line", key: "l1" },
      React.createElement("span", { className: "hero-terminal-prompt" }, "archive:init"),
      React.createElement("span", { className: "hero-terminal-text" }, "loading curated frontend builds...")
    ),
    React.createElement(
      "div",
      { className: "hero-terminal-line", key: "l2" },
      React.createElement("span", { className: "hero-terminal-prompt" }, "archive:focus"),
      React.createElement(
        "span",
        { className: "hero-terminal-text" },
        "optimized visuals are enabled for desktop and reduced-motion devices"
      )
    ),
    React.createElement(
      "div",
      { className: "hero-terminal-line", key: "l3" },
      React.createElement("span", { className: "hero-terminal-prompt" }, "archive:status"),
      React.createElement(
        "span",
        { className: "hero-terminal-text" },
        "ready to browse projects, contributors, and featured tools."
      )
    ),
  ];

  if (liteMode) {
    return React.createElement(
      "div",
      {
        className: "hero-terminal-shell hero-terminal-shell-static",
      },
      ...shellChildren
    );
  }

  return React.createElement("div", {
    ref: containerRef,
    className: "faulty-terminal-container hero-terminal-host",
  });
}

async function mountHeroTerminal() {
  const host = document.getElementById("heroTerminal");

  if (!host) {
    console.error("[hero-terminal] mount target #heroTerminal not found");
    return;
  }

  try {
    await ensureTerminalDependencies();
  } catch (error) {
    console.warn("[hero-terminal] Failed to load dependencies", error);
    host.innerHTML = `
      <div class="hero-terminal-shell hero-terminal-shell-static">
        <div class="hero-terminal-topbar" aria-hidden="true">
          <span class="hero-terminal-dot"></span>
          <span class="hero-terminal-dot"></span>
          <span class="hero-terminal-dot"></span>
        </div>
        <div class="hero-terminal-line">
          <span class="hero-terminal-prompt">archive:init</span>
          <span class="hero-terminal-text">loading curated frontend builds...</span>
        </div>
        <div class="hero-terminal-line">
          <span class="hero-terminal-prompt">archive:focus</span>
          <span class="hero-terminal-text">optimized visuals are enabled for desktop and reduced-motion devices</span>
        </div>
        <div class="hero-terminal-line">
          <span class="hero-terminal-prompt">archive:status</span>
          <span class="hero-terminal-text">ready to browse projects, contributors, and featured tools.</span>
        </div>
      </div>
    `;
    return;
  }

  const root = createRoot(host);
  root.render(React.createElement(HeroTerminal));
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mountHeroTerminal);
} else {
  mountHeroTerminal();
}