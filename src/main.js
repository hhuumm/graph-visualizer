import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'

const classPalette = {
  FOUNDATION: '#7775a9',
  KNOWLEDGE: '#667da3',
  EXECUTION: '#806f99',
  TRANSPORT: '#657f91',
}

const classAccents = {
  FOUNDATION: '#c3a9cf',
  KNOWLEDGE: '#8db8c9',
  EXECUTION: '#c39bb6',
  TRANSPORT: '#91b8aa',
}

const graph = {
  nodes: [
    { id: 'NEXUS', type: 'CORE', class: 'FOUNDATION', color: classPalette.FOUNDATION, size: 1.25, position: [-2.2, 0, 0], activity: 98.7, signal: 94, status: 'STABLE' },
    { id: 'ORBITAL', type: 'SYSTEM', class: 'FOUNDATION', color: classPalette.FOUNDATION, size: .75, position: [-6.2, 2.4, 3.2], activity: 84.2, signal: 88, status: 'STABLE' },
    { id: 'HELIX', type: 'DATA', class: 'KNOWLEDGE', color: classPalette.KNOWLEDGE, size: .8, position: [1.1, 3.1, -3.6], activity: 91.4, signal: 76, status: 'SYNCING' },
    { id: 'VECTOR', type: 'SERVICE', class: 'EXECUTION', color: classPalette.EXECUTION, size: .65, position: [1.6, -1.1, 3.8], activity: 76.9, signal: 83, status: 'STABLE' },
    { id: 'PULSE', type: 'SIGNAL', class: 'TRANSPORT', color: classPalette.TRANSPORT, size: .7, position: [-6.1, -3.1, -2.8], activity: 88.1, signal: 68, status: 'ACTIVE' },
    { id: 'AETHER', type: 'CLOUD', class: 'EXECUTION', color: classPalette.EXECUTION, size: .62, position: [-1.1, -4.2, 5.1], activity: 67.5, signal: 79, status: 'STABLE' },
    { id: 'ECHO', type: 'ARCHIVE', class: 'KNOWLEDGE', color: classPalette.KNOWLEDGE, size: .5, position: [-3.1, 4.5, -5], activity: 42.8, signal: 57, status: 'IDLE' },
    { id: 'LYRA', type: 'DATA', class: 'KNOWLEDGE', color: classPalette.KNOWLEDGE, size: .7, position: [6.1, 1.2, -.8], activity: 86.3, signal: 91, status: 'STABLE' },
    { id: 'MUSE', type: 'ARCHIVE', class: 'KNOWLEDGE', color: classPalette.KNOWLEDGE, size: .52, position: [9.1, 3.2, -4.4], activity: 51.4, signal: 73, status: 'IDLE' },
    { id: 'FORGE', type: 'SERVICE', class: 'EXECUTION', color: classPalette.EXECUTION, size: .65, position: [9.7, -1.1, 3.1], activity: 93.2, signal: 86, status: 'ACTIVE' },
    { id: 'RELAY', type: 'SIGNAL', class: 'TRANSPORT', color: classPalette.TRANSPORT, size: .58, position: [5.8, -3.4, 4.7], activity: 79.6, signal: 89, status: 'STABLE' },
    { id: 'SOLACE', type: 'SYSTEM', class: 'FOUNDATION', color: classPalette.FOUNDATION, size: .54, position: [-9.2, -4.8, -6.5], activity: 12.4, signal: 0, status: 'ISOLATED' },
    { id: 'DRIFT', type: 'CLOUD', class: 'EXECUTION', color: classPalette.EXECUTION, size: .48, position: [9.3, 5.4, 6.4], activity: 8.7, signal: 0, status: 'ISOLATED' },
  ],
  links: [
    ['NEXUS', 'ORBITAL'], ['NEXUS', 'HELIX'], ['NEXUS', 'VECTOR'],
    ['NEXUS', 'PULSE'], ['NEXUS', 'AETHER'], ['ORBITAL', 'ECHO'],
    ['HELIX', 'ECHO'], ['VECTOR', 'AETHER'], ['PULSE', 'AETHER'],
    ['ORBITAL', 'PULSE'], ['HELIX', 'VECTOR'],
    ['LYRA', 'MUSE'], ['LYRA', 'FORGE'], ['LYRA', 'RELAY'],
    ['MUSE', 'RELAY'], ['FORGE', 'RELAY'],
  ],
}

const initialNodeCount = graph.nodes.length
const generatedTypes = [
  ['SYSTEM', 'FOUNDATION'], ['DATA', 'KNOWLEDGE'],
  ['SERVICE', 'EXECUTION'], ['SIGNAL', 'TRANSPORT'],
]
for (let index = initialNodeCount; index < 100; index++) {
  const [type, nodeClass] = generatedTypes[index % generatedTypes.length]
  graph.nodes.push({
    id: `NODE-${String(index + 1).padStart(3, '0')}`,
    type,
    class: nodeClass,
    color: classPalette[nodeClass],
    size: .42 + ((index * 17) % 28) / 100,
    position: [
      ((index * 37) % 23 - 11) * 2.4,
      ((index * 19) % 17 - 8) * 1.8,
      ((index * 29) % 21 - 10) * 2.2,
    ],
    activity: 24 + ((index * 31) % 740) / 10,
    signal: 48 + ((index * 23) % 50),
    status: ['STABLE', 'ACTIVE', 'IDLE', 'SYNCING'][index % 4],
  })
}

const spatialExpansion = 3.3
graph.nodes.forEach(node => {
  node.position = node.position.map(coordinate => coordinate * spatialExpansion)
})

document.querySelector('#app').innerHTML = `
  <main id="viewport"></main>
  <header class="topbar">
    <a class="brand" href="#"><span class="brand-mark"></span>QUANTUM<span>GRAPH</span></a>
    <div class="status"><i></i> LIVE NETWORK <strong>07:42:19</strong></div>
  </header>
  <section class="hero-copy">
    <p class="eyebrow">// KNOWLEDGE SYSTEM 01</p>
    <h1>RELATIONSHIPS<br><em>IN MOTION.</em></h1>
    <p class="intro">An interactive spatial map of connected systems. Drag to orbit, scroll to explore, and select a node to inspect its signal.</p>
  </section>
  <nav class="node-list" aria-label="Graph nodes">
    <div class="list-heading"><span>NODE INDEX</span><b>${String(initialNodeCount).padStart(2, '0')}</b></div>
    ${graph.nodes.map((node, index) => `
      <button class="node-item${index === 0 ? ' selected' : ''}${index >= initialNodeCount ? ' quantity-hidden' : ''}" data-node="${node.id}" style="--item-color:${node.color}">
        <span class="item-index">${String(index + 1).padStart(2, '0')}</span>
        <i></i>
        <span class="item-name">${node.id}<small>${node.class}</small></span>
        <span class="item-activity">${node.activity.toFixed(1)}%</span>
      </button>`).join('')}
  </nav>
  <aside class="panel">
    <div class="panel-label">NODE INSPECTOR <span>↗</span></div>
    <div class="node-code">N-001</div>
    <h2 id="node-name">NEXUS</h2>
    <p id="node-type">CORE INFRASTRUCTURE</p>
    <dl><div><dt>CONNECTIONS</dt><dd id="connections">05</dd></div><div><dt>ACTIVITY</dt><dd id="activity" class="active">98.7%</dd></div></dl>
    <div class="signal"><span>SIGNAL</span><div><i id="signal-meter"></i></div><b id="signal-status">STABLE</b></div>
    <button id="send-pulse" class="pulse-button"><i></i>SEND TEST PULSE</button>
  </aside>
  <section class="event-feed" aria-live="polite">
    <div class="feed-title"><span>LIVE TRANSMISSIONS</span><i></i></div>
    <div id="feed-events"></div>
  </section>
  <section class="generator-panel">
    <div class="generator-title"><span>GRAPH GENERATOR <small id="generator-meta">2C · 2O</small></span><b id="quantity-value">${initialNodeCount}</b></div>
    <label for="node-quantity">NODE QUANTITY</label>
    <input id="node-quantity" type="range" min="4" max="100" value="${initialNodeCount}" />
    <button id="randomize">RANDOMIZE TOPOLOGY ✦</button>
  </section>
  <button id="center" class="center-control"><i></i><span>CENTER<br><b>GRAPH</b></span></button>
  <footer><span id="node-count">${String(initialNodeCount).padStart(2, '0')} NODES</span><span id="link-count">${String(graph.links.length).padStart(2, '0')} CONNECTIONS</span><button id="reset">RESET VIEW ↻</button><span class="hint">DRAG TO ORBIT · SCROLL TO ZOOM</span></footer>
  <div class="cursor-label"></div>
`

const viewport = document.querySelector('#viewport')
const scene = new THREE.Scene()
scene.fog = new THREE.FogExp2(0x242229, 0.0075)

const camera = new THREE.PerspectiveCamera(48, innerWidth / innerHeight, .1, 100)
camera.position.set(3, 7, 72)

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
renderer.setSize(innerWidth, innerHeight)
renderer.outputColorSpace = THREE.SRGBColorSpace
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.1
viewport.appendChild(renderer.domElement)

const composer = new EffectComposer(renderer)
composer.addPass(new RenderPass(scene, camera))
composer.addPass(new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), .18, .65, .78))

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.dampingFactor = .045
controls.minDistance = 7
controls.maxDistance = 120
controls.autoRotate = true
controls.autoRotateSpeed = .025

scene.add(new THREE.HemisphereLight(0xd8d1de, 0x34313a, 2.5))
const light = new THREE.DirectionalLight(0xffffff, 3.8)
light.position.set(-3, 7, 8)
scene.add(light)
const fillLight = new THREE.PointLight(0x7775a9, 10, 24)
fillLight.position.set(5, -2, 5)
scene.add(fillLight)

const motePositions = new Float32Array(260 * 3)
for (let index = 0; index < motePositions.length; index += 3) {
  motePositions[index] = (Math.random() - .5) * 150
  motePositions[index + 1] = (Math.random() - .5) * 90
  motePositions[index + 2] = (Math.random() - .5) * 130
}
const moteGeometry = new THREE.BufferGeometry()
moteGeometry.setAttribute('position', new THREE.BufferAttribute(motePositions, 3))
scene.add(new THREE.Points(moteGeometry, new THREE.PointsMaterial({
  color: 0xd8d5e6, size: .075, transparent: true, opacity: .18,
  depthWrite: false, sizeAttenuation: true,
})))

const distantStarPositions = new Float32Array(720 * 3)
for (let index = 0; index < distantStarPositions.length; index += 3) {
  distantStarPositions[index] = (Math.random() - .5) * 190
  distantStarPositions[index + 1] = (Math.random() - .5) * 115
  distantStarPositions[index + 2] = (Math.random() - .5) * 170
}
const distantStarGeometry = new THREE.BufferGeometry()
distantStarGeometry.setAttribute('position', new THREE.BufferAttribute(distantStarPositions, 3))
scene.add(new THREE.Points(distantStarGeometry, new THREE.PointsMaterial({
  color: 0xb8c8dc, size: .026, transparent: true, opacity: .34,
  depthWrite: false, sizeAttenuation: true,
})))

const nodeMeshes = []
const positionById = new Map(graph.nodes.map(node => [node.id, new THREE.Vector3(...node.position)]))
const linkCurves = new Map()
const linkLines = new Map()
const activeSignals = []
let activeNodeCount = initialNodeCount

function buildLinks() {
  new Set(linkLines.values()).forEach(line => {
    scene.remove(line)
    line.geometry.dispose()
    line.material.dispose()
  })
  linkCurves.clear()
  linkLines.clear()
  graph.links.forEach(([from, to], index) => {
  const endpoints = [positionById.get(from), positionById.get(to)]
  const midpoint = endpoints[0].clone().lerp(endpoints[1], .5)
  midpoint.z += 4.8 + (index % 3) * 1.2
  const curve = new THREE.QuadraticBezierCurve3(endpoints[0], midpoint, endpoints[1])
  const reverseCurve = new THREE.QuadraticBezierCurve3(endpoints[1], midpoint, endpoints[0])
  linkCurves.set(`${from}:${to}`, curve)
  linkCurves.set(`${to}:${from}`, reverseCurve)
  const line = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(curve.getPoints(64)),
    new THREE.LineBasicMaterial({ color: 0x9294a3, transparent: true, opacity: .065, depthWrite: false }),
  )
  line.userData.restingCurve = curve
  scene.add(line)
  linkLines.set(`${from}:${to}`, line)
  linkLines.set(`${to}:${from}`, line)
  })
}

buildLinks()

graph.nodes.forEach((node, index) => {
  const group = new THREE.Group()
  group.visible = index < initialNodeCount
  group.position.copy(positionById.get(node.id))
  const geometry = new THREE.BoxGeometry(node.size * 2.35, node.size * 2.35, node.size * 2.35)
  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.BackSide,
    blending: THREE.NormalBlending,
    toneMapped: false,
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(node.color) },
      uAccent: { value: new THREE.Color(classAccents[node.class]) },
      uSeed: { value: index * 7.31 },
      uRadius: { value: node.size },
      uImpact: { value: 0 },
    },
    vertexShader: `
      varying vec3 vOrigin;
      varying vec3 vDirection;
      void main() {
        vec4 localCamera = inverse(modelMatrix) * vec4(cameraPosition, 1.0);
        vOrigin = localCamera.xyz;
        vDirection = position - vOrigin;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      uniform vec3 uAccent;
      uniform float uTime;
      uniform float uSeed;
      uniform float uRadius;
      uniform float uImpact;
      varying vec3 vOrigin;
      varying vec3 vDirection;

      vec2 hitBox(vec3 origin, vec3 direction) {
        vec3 boxMin = vec3(-uRadius * 1.175);
        vec3 boxMax = vec3(uRadius * 1.175);
        vec3 inverseDirection = 1.0 / direction;
        vec3 tMinTemp = (boxMin - origin) * inverseDirection;
        vec3 tMaxTemp = (boxMax - origin) * inverseDirection;
        vec3 tMin = min(tMinTemp, tMaxTemp);
        vec3 tMax = max(tMinTemp, tMaxTemp);
        float tNear = max(max(tMin.x, tMin.y), tMin.z);
        float tFar = min(min(tMax.x, tMax.y), tMax.z);
        return vec2(tNear, tFar);
      }

      float hash(vec3 p) {
        p = fract(p * .3183099 + vec3(.1, .2, .3));
        p *= 17.0;
        return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
      }

      float noise(vec3 p) {
        vec3 i = floor(p);
        vec3 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x),
                       mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
                   mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
                       mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
      }

      float fbm(vec3 p) {
        float value = 0.0;
        float amplitude = .55;
        for (int octave = 0; octave < 4; octave++) {
          value += noise(p) * amplitude;
          p = p * 2.03 + vec3(13.1, 7.7, 5.3);
          amplitude *= .48;
        }
        return value;
      }

      void main() {
        vec3 rayDirection = normalize(vDirection);
        vec2 bounds = hitBox(vOrigin, rayDirection);
        if (bounds.x > bounds.y) discard;
        bounds.x = max(bounds.x, 0.0);
        float travel = bounds.y - bounds.x;
        float stepSize = travel / 46.0;
        vec3 point = vOrigin + bounds.x * rayDirection;
        vec4 accumulated = vec4(0.0);

        for (int stepIndex = 0; stepIndex < 46; stepIndex++) {
          vec3 normalizedPoint = point / uRadius;
          vec3 flow = vec3(uTime * .055, -uTime * .035, uTime * .025);
          vec3 warp = vec3(
            noise(normalizedPoint * 1.45 + flow + uSeed),
            noise(normalizedPoint * 1.45 - flow + uSeed + 8.2),
            noise(normalizedPoint * 1.45 + flow.zyx + uSeed + 16.7)
          ) - .5;
          vec3 cloudPoint = normalizedPoint + warp * .46;
          cloudPoint *= vec3(.78 + .12 * sin(uSeed), 1.08 + .1 * cos(uSeed * .7), .88 + .14 * sin(uSeed * 1.3));
          float detail = fbm(cloudPoint * 2.55 + flow + uSeed);
          float wisps = fbm(cloudPoint * 5.2 - flow * 1.7 + uSeed * .31);
          float boundaryNoise = fbm(normalizedPoint * 1.7 + flow * .45 + uSeed * .73);
          float lobeA = 1.0 - smoothstep(.25, .84, length(cloudPoint - vec3(-.24, .08, .02)));
          float lobeB = 1.0 - smoothstep(.18, .66, length(cloudPoint - vec3(.36, -.08, .12)));
          float lobeC = 1.0 - smoothstep(.16, .58, length(cloudPoint - vec3(.02, .38, -.2)));
          float lobeD = 1.0 - smoothstep(.14, .52, length(cloudPoint - vec3(-.12, -.4, .2)));
          float billowedShape = max(max(lobeA, lobeB), max(lobeC, lobeD));
          float filamentA = (1.0 - smoothstep(.06, .3, length(cloudPoint.yz - vec2(.08, -.04)))) * (1.0 - smoothstep(.42, 1.2, abs(cloudPoint.x)));
          float filamentB = (1.0 - smoothstep(.05, .24, length(cloudPoint.xz - vec2(-.18, .16)))) * (1.0 - smoothstep(.36, 1.0, abs(cloudPoint.y + .05)));
          float abstractShape = max(billowedShape, max(filamentA * .55, filamentB * .42));
          float envelope = smoothstep(.04, .58, abstractShape + boundaryNoise * .24 - uImpact * .08);
          float containmentDistance = length(normalizedPoint) + (boundaryNoise - .5) * .18;
          float invisibleBoundary = 1.0 - smoothstep(.78, 1.08, containmentDistance);
          envelope *= invisibleBoundary;
          float density = smoothstep(.40, .78, detail * .76 + wisps * .34) * envelope;
          density *= .17 * mix(1.0, .09, uImpact);
          float chromaFlow = smoothstep(.22, .88, fbm(cloudPoint * 3.1 + flow.yzx * 2.0 + uSeed * .2));
          float verticalWash = smoothstep(-.9, .75, cloudPoint.y + sin(cloudPoint.x * 2.5) * .16);
          float pigmentBand = sin(detail * 24.0 + wisps * 9.0 + cloudPoint.y * 3.0 + uTime * .08) * .5 + .5;
          pigmentBand = smoothstep(.3, .82, pigmentBand);
          vec3 paintedColor = mix(uColor, uAccent, chromaFlow * .52 + verticalWash * .16);
          paintedColor = mix(paintedColor * .72, paintedColor * 1.24 + uAccent * .18, pigmentBand * .42);
          vec3 litColor = mix(paintedColor * .38, paintedColor * 1.5 + vec3(.07), detail);
          litColor = litColor * (1.0 + uImpact * 4.2) + uAccent * uImpact * .72;
          vec4 sampleColor = vec4(litColor * density, density);
          accumulated += (1.0 - accumulated.a) * sampleColor;
          if (accumulated.a > .92) break;
          point += rayDirection * stepSize;
        }

        float softGlow = pow(accumulated.a, .72);
        vec3 impactFlare = mix(uAccent, vec3(.88, .92, 1.0), uImpact * .58) * softGlow * uImpact * 1.28;
        gl_FragColor = vec4(accumulated.rgb + uColor * softGlow * .08 + impactFlare, accumulated.a * .92);
        if (gl_FragColor.a < .015) discard;
      }
    `,
  })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.userData = { ...node, index, baseScale: 1 }
  group.add(mesh)

  for (let strokeIndex = 0; strokeIndex < 2; strokeIndex++) {
    const direction = strokeIndex === 0 ? 1 : -1
    const strokePoints = [
      new THREE.Vector3(-node.size * 1.55, node.size * .1 * direction, node.size * -.35),
      new THREE.Vector3(-node.size * .7, node.size * .85 * direction, node.size * .28),
      new THREE.Vector3(node.size * .18, node.size * -.45 * direction, node.size * .55),
      new THREE.Vector3(node.size * 1.48, node.size * .3 * direction, node.size * -.22),
    ]
    const gesture = new THREE.CatmullRomCurve3(strokePoints)
    const stroke = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(gesture.getPoints(42)),
      new THREE.LineBasicMaterial({ color: classAccents[node.class], transparent: true, opacity: .1, depthWrite: false }),
    )
    stroke.rotation.set(index * .37, index * .61 + strokeIndex, strokeIndex * 1.7)
    stroke.userData = { artStroke: true, speed: direction * (.018 + index * .0015), phase: index + strokeIndex }
    group.add(stroke)
  }

  scene.add(group)
  nodeMeshes.push(mesh)
})

const raycaster = new THREE.Raycaster()
const pointer = new THREE.Vector2(10, 10)
let hovered = null
let selected = nodeMeshes[0]
let cameraFlight = null
let lastAutoPulse = 0

function addFeedEvent(from, to, label) {
  const feed = document.querySelector('#feed-events')
  const entry = document.createElement('div')
  entry.className = 'feed-entry fresh'
  entry.innerHTML = `<time>${new Date().toLocaleTimeString([], { hour12: false })}</time><span style="--event-color:${from.userData.color}">${from.userData.id}</span><i>→</i><b>${to.userData.id}</b><small>${label}</small>`
  feed.prepend(entry)
  while (feed.children.length > 4) feed.lastElementChild.remove()
  setTimeout(() => entry.classList.remove('fresh'), 500)
}

function addIsolatedFeedEvent(node) {
  const feed = document.querySelector('#feed-events')
  const entry = document.createElement('div')
  entry.className = 'feed-entry fresh isolated'
  entry.innerHTML = `<time>${new Date().toLocaleTimeString([], { hour12: false })}</time><span style="--event-color:${node.userData.color}">${node.userData.id}</span><i>×</i><b>NO ROUTE</b><small>ISOLATED</small>`
  feed.prepend(entry)
  while (feed.children.length > 4) feed.lastElementChild.remove()
  setTimeout(() => entry.classList.remove('fresh'), 500)
}

function emitNodePulse(mesh, color, delay = 0, dissipate = true) {
  setTimeout(() => {
    const count = 72
    const positions = new Float32Array(count * 3)
    const velocities = new Float32Array(count * 3)
    const scales = new Float32Array(count)
    for (let index = 0; index < count; index++) {
      const direction = new THREE.Vector3(
        Math.random() * 2 - 1,
        Math.random() * 1.6 - .55,
        Math.random() * 2 - 1,
      ).normalize()
      const startRadius = mesh.userData.size * (.12 + Math.random() * .28)
      positions.set(direction.clone().multiplyScalar(startRadius).toArray(), index * 3)
      const velocity = direction.multiplyScalar(mesh.userData.size * (.65 + Math.random() * 1.25))
      velocity.y += mesh.userData.size * (.05 + Math.random() * .22)
      velocities.set(velocity.toArray(), index * 3)
      scales[index] = 5 + Math.random() * 11
    }
    const smokeGeometry = new THREE.BufferGeometry()
    smokeGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    smokeGeometry.setAttribute('aVelocity', new THREE.BufferAttribute(velocities, 3))
    smokeGeometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1))
    const smokeMaterial = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false,
      uniforms: {
        uProgress: { value: 0 },
        uOpacity: { value: .42 },
        uColor: { value: new THREE.Color(color).lerp(new THREE.Color(0xdde4ff), .24) },
      },
      vertexShader: `
        attribute vec3 aVelocity;
        attribute float aScale;
        uniform float uProgress;
        varying float vSeed;
        void main() {
          vec3 drift = aVelocity * (uProgress + uProgress * uProgress * .22);
          drift.y += uProgress * uProgress * .24;
          vec4 viewPosition = modelViewMatrix * vec4(position + drift, 1.0);
          gl_Position = projectionMatrix * viewPosition;
          gl_PointSize = aScale * (1.0 + uProgress * 1.35) * min(2.2, 22.0 / max(1.0, -viewPosition.z));
          vSeed = aScale;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uOpacity;
        uniform float uProgress;
        varying float vSeed;
        void main() {
          vec2 centered = gl_PointCoord - .5;
          float radius = length(centered);
          float angle = atan(centered.y, centered.x);
          float edgeVariation = sin(angle * 5.0 + vSeed * 2.1 + uProgress * 4.0) * .035;
          float core = smoothstep(.49 + edgeVariation, .06, radius);
          float hollow = smoothstep(.02, .18, radius);
          float filament = .72 + .28 * sin(angle * 3.0 + radius * 22.0 + vSeed);
          float alpha = core * mix(1.0, hollow, .28) * filament * uOpacity;
          if (alpha < .008) discard;
          vec3 color = mix(uColor * .66, uColor * 1.5 + vec3(.08), core);
          gl_FragColor = vec4(color, alpha);
        }
      `,
    })
    const smoke = new THREE.Points(smokeGeometry, smokeMaterial)
    smoke.position.copy(mesh.parent.position)
    scene.add(smoke)
    activeSignals.push({ type: 'smoke', object: smoke, born: performance.now(), duration: 2050 })
    if (dissipate) {
      mesh.userData.impactStarted = performance.now()
      mesh.userData.impactDuration = 2450
      mesh.userData.activeUntil = performance.now() + 2450
    }
  }, delay)
}

function dispatchGraphWebhook({ from = 'NEXUS', to, event = 'DATA_SYNC' } = {}) {
  const source = nodeMeshes.find(mesh => mesh.userData.id === from) || nodeMeshes[0]
  const possibleTargets = graph.links
    .filter(link => link.includes(source.userData.id))
    .map(link => link.find(id => id !== source.userData.id))
  if (!possibleTargets.length) {
    emitNodePulse(source, source.userData.color, 0, false)
    addIsolatedFeedEvent(source)
    return false
  }
  const targetId = possibleTargets.includes(to) ? to : possibleTargets[Math.floor(Math.random() * possibleTargets.length)]
  const target = nodeMeshes.find(mesh => mesh.userData.id === targetId)
  const curve = linkCurves.get(`${source.userData.id}:${target.userData.id}`)
  const line = linkLines.get(`${source.userData.id}:${target.userData.id}`)
  if (!target || !curve || !line) return false

  if (activeSignals.some(signal => signal.type === 'wave' && signal.object === line)) return false
  line.material.color.set(source.userData.color)
  const travelDuration = Math.min(12000, Math.max(4200, curve.getLength() * 260))
  activeSignals.push({
    type: 'wave', object: line, curve, born: performance.now(),
    travelDuration, duration: travelDuration + 850, target, color: source.userData.color,
    arrivalTriggered: false,
  })
  emitNodePulse(source, source.userData.color, 0, false)
  addFeedEvent(source, target, event)
  return true
}

window.dispatchGraphWebhook = dispatchGraphWebhook

function inspect(mesh) {
  selected = mesh
  const node = mesh.userData
  const connectionCount = graph.links.filter(link => link.includes(node.id)).length
  document.querySelector('.node-code').textContent = `N-${String(node.index + 1).padStart(3, '0')}`
  document.querySelector('#node-name').textContent = node.id
  document.querySelector('#node-type').textContent = `${node.class} · ${node.type}`
  document.querySelector('#connections').textContent = String(connectionCount).padStart(2, '0')
  document.querySelector('#activity').textContent = `${node.activity.toFixed(1)}%`
  document.querySelector('#signal-meter').style.width = `${node.signal}%`
  document.querySelector('#signal-status').textContent = node.status
  document.querySelector('.panel').style.setProperty('--node-color', node.color)
  document.querySelectorAll('.node-item').forEach(item => item.classList.toggle('selected', item.dataset.node === node.id))
}

function focusNode(mesh) {
  inspect(mesh)
  controls.autoRotate = false
  const target = mesh.parent.position.clone()
  const direction = camera.position.clone().sub(controls.target).normalize()
  const destination = target.clone().add(direction.multiplyScalar(4.25 + mesh.userData.size))
  cameraFlight = {
    started: performance.now(),
    duration: 900,
    fromPosition: camera.position.clone(),
    toPosition: destination,
    fromTarget: controls.target.clone(),
    toTarget: target,
  }
}

function randomizeTopology() {
  for (let index = activeSignals.length - 1; index >= 0; index--) {
    const signal = activeSignals[index]
    if (signal.type !== 'wave') continue
    activeSignals.splice(index, 1)
  }

  const visibleNodes = graph.nodes.slice(0, activeNodeCount)
  const visibleIds = new Set(visibleNodes.map(node => node.id))
  const maxOrphans = Math.min(activeNodeCount - 2, Math.floor(activeNodeCount * .34))
  const orphanCount = Math.floor(Math.pow(Math.random(), 1.35) * (maxOrphans + 1))
  const shuffledNodes = [...visibleNodes].sort(() => Math.random() - .5)
  const connectedNodes = orphanCount ? shuffledNodes.slice(0, -orphanCount) : shuffledNodes
  const orphanNodes = visibleNodes.filter(node => !connectedNodes.includes(node))
  const maximumClusters = Math.min(6, Math.max(1, Math.floor(connectedNodes.length / 2)))
  const clusterCount = 1 + Math.floor(Math.pow(Math.random(), .72) * maximumClusters)
  const clusters = Array.from({ length: clusterCount }, () => [])
  connectedNodes.slice(0, clusterCount).forEach((node, index) => clusters[index].push(node))
  const clusterWeights = clusters.map(() => .15 + Math.random() ** 2 * .85)
  connectedNodes.slice(clusterCount).forEach(node => {
    const weightedTotal = clusterWeights.reduce((sum, weight) => sum + weight, 0)
    let roll = Math.random() * weightedTotal
    let destination = 0
    for (let index = 0; index < clusterWeights.length; index++) {
      roll -= clusterWeights[index]
      if (roll <= 0) { destination = index; break }
    }
    clusters[destination].push(node)
  })

  clusters.forEach((cluster, clusterIndex) => {
    const angle = (clusterIndex / clusterCount) * Math.PI * 2 + (Math.random() - .5) * 1.1
    const centerRadius = clusterCount === 1 ? Math.random() * 8 : 17 + Math.random() * 22
    const center = new THREE.Vector3(Math.cos(angle) * centerRadius, (Math.random() - .5) * 22, Math.sin(angle) * centerRadius)
    const spread = 2.5 + Math.random() * 11
    cluster.forEach((node, nodeIndex) => {
      const localAngle = (nodeIndex / Math.max(1, cluster.length)) * Math.PI * 2 + Math.random() * .8
      const position = center.clone().add(new THREE.Vector3(
        Math.cos(localAngle) * (1.5 + Math.random() * spread),
        (Math.random() - .5) * spread * 1.5,
        Math.sin(localAngle) * (1.5 + Math.random() * spread),
      ))
      node.position = position.toArray()
      positionById.set(node.id, position)
    })
  })

  orphanNodes.forEach((node, index) => {
    const angle = (index / Math.max(1, orphanNodes.length)) * Math.PI * 2 + Math.random() * 1.6
    const orphanRadius = 36 + Math.random() * 28
    const position = new THREE.Vector3(Math.cos(angle) * orphanRadius, (Math.random() - .5) * 48, Math.sin(angle) * orphanRadius)
    node.position = position.toArray()
    positionById.set(node.id, position)
  })

  const randomizedLinks = []
  const linkKeys = new Set()
  const addLink = (first, second) => {
    const key = [first.id, second.id].sort().join(':')
    if (first === second || linkKeys.has(key)) return
    linkKeys.add(key)
    randomizedLinks.push([first.id, second.id])
  }
  const topologyTypes = []
  clusters.forEach(cluster => {
    const topology = ['CHAIN', 'RING', 'STAR', 'SPARSE', 'DENSE'][Math.floor(Math.random() * 5)]
    topologyTypes.push(topology)
    if (topology === 'STAR') {
      const hub = cluster[Math.floor(Math.random() * cluster.length)]
      cluster.forEach(node => addLink(hub, node))
    } else {
      for (let index = 1; index < cluster.length; index++) addLink(cluster[index - 1], cluster[index])
      if (topology === 'RING' && cluster.length > 2) addLink(cluster.at(-1), cluster[0])
    }
    const densityMultiplier = topology === 'DENSE' ? 5.5 : topology === 'SPARSE' ? .45 : topology === 'STAR' ? .8 : 1.6
    const extraConnectionChance = Math.min(.7, densityMultiplier / Math.max(1, cluster.length))
    for (let first = 0; first < cluster.length; first++) {
      for (let second = first + 2; second < cluster.length; second++) {
        if (Math.random() < extraConnectionChance) addLink(cluster[first], cluster[second])
      }
    }
  })
  let bridgeCount = 0
  if (clusters.length > 1 && Math.random() < .48) {
    const requestedBridges = 1 + Math.floor(Math.random() * Math.min(3, clusters.length - 1))
    for (let index = 0; index < requestedBridges; index++) {
      const firstCluster = clusters[index % clusters.length]
      const secondCluster = clusters[(index + 1) % clusters.length]
      addLink(firstCluster[Math.floor(Math.random() * firstCluster.length)], secondCluster[Math.floor(Math.random() * secondCluster.length)])
      bridgeCount++
    }
  }
  graph.links = randomizedLinks

  nodeMeshes.forEach((mesh, index) => {
    const visible = index < activeNodeCount
    mesh.parent.visible = visible
    if (visible) mesh.parent.position.copy(positionById.get(mesh.userData.id))
  })
  document.querySelectorAll('.node-item').forEach((item, index) => item.classList.toggle('quantity-hidden', index >= activeNodeCount))
  buildLinks()
  document.querySelector('#node-count').textContent = `${String(activeNodeCount).padStart(2, '0')} NODES`
  document.querySelector('#link-count').textContent = `${String(graph.links.length).padStart(2, '0')} CONNECTIONS`
  document.querySelector('.list-heading b').textContent = String(activeNodeCount).padStart(2, '0')
  document.querySelector('#generator-meta').textContent = `${clusterCount}C · ${orphanCount}O · ${bridgeCount}B · ${topologyTypes.join('/')}`
  if (!visibleIds.has(selected.userData.id)) inspect(nodeMeshes[0])
  else inspect(selected)
  resetView()
}

const quantitySlider = document.querySelector('#node-quantity')
quantitySlider.addEventListener('input', () => {
  document.querySelector('#quantity-value').textContent = quantitySlider.value
})
quantitySlider.addEventListener('change', () => {
  activeNodeCount = Number(quantitySlider.value)
  randomizeTopology()
})
document.querySelector('#randomize').addEventListener('click', randomizeTopology)

addEventListener('pointermove', event => {
  pointer.x = (event.clientX / innerWidth) * 2 - 1
  pointer.y = -(event.clientY / innerHeight) * 2 + 1
  const label = document.querySelector('.cursor-label')
  label.style.transform = `translate(${event.clientX + 18}px, ${event.clientY + 18}px)`
})
addEventListener('click', event => {
  if (event.target.closest('button, a')) return
  if (hovered) focusNode(hovered)
})
document.querySelectorAll('.node-item').forEach(item => {
  item.addEventListener('click', () => {
    const mesh = nodeMeshes.find(candidate => candidate.userData.id === item.dataset.node)
    if (mesh) focusNode(mesh)
  })
})
document.querySelector('#send-pulse').addEventListener('click', () => {
  dispatchGraphWebhook({ from: selected.userData.id, event: 'MANUAL_PULSE' })
})

function resetView() {
  inspect(nodeMeshes[0])
  controls.autoRotate = true
  cameraFlight = {
    started: performance.now(), duration: 900,
    fromPosition: camera.position.clone(), toPosition: new THREE.Vector3(3, 7, 72),
    fromTarget: controls.target.clone(), toTarget: new THREE.Vector3(),
  }
}

document.querySelector('#center').addEventListener('click', resetView)
document.querySelector('#reset').addEventListener('click', resetView)

const clock = new THREE.Clock()
function animate() {
  const t = clock.getElapsedTime()
  const now = performance.now()
  if (now - lastAutoPulse > 2600) {
    const [from, to] = graph.links[Math.floor(Math.random() * graph.links.length)]
    dispatchGraphWebhook({ from, to, event: ['WEBHOOK', 'DATA_SYNC', 'HEARTBEAT'][Math.floor(Math.random() * 3)] })
    lastAutoPulse = now
  }
  if (cameraFlight) {
    const progress = Math.min((performance.now() - cameraFlight.started) / cameraFlight.duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3)
    camera.position.lerpVectors(cameraFlight.fromPosition, cameraFlight.toPosition, eased)
    controls.target.lerpVectors(cameraFlight.fromTarget, cameraFlight.toTarget, eased)
    if (progress === 1) cameraFlight = null
  }
  controls.update()
  raycaster.setFromCamera(pointer, camera)
  hovered = raycaster.intersectObjects(nodeMeshes.slice(0, activeNodeCount))[0]?.object || null
  document.body.classList.toggle('is-hovering', Boolean(hovered))
  const label = document.querySelector('.cursor-label')
  label.textContent = hovered?.userData.id || ''
  label.classList.toggle('show', Boolean(hovered))

  nodeMeshes.forEach((mesh, index) => {
    if (!mesh.parent.visible) return
    const isWorking = (mesh.userData.activeUntil || 0) > now
    const impactAge = now - (mesh.userData.impactStarted || -10000)
    const impactProgress = THREE.MathUtils.clamp(impactAge / (mesh.userData.impactDuration || 1), 0, 1)
    const impactStrength = impactProgress < .38
      ? THREE.MathUtils.smoothstep(impactProgress, 0, .38)
      : 1 - THREE.MathUtils.smoothstep(impactProgress, .38, 1)
    mesh.material.uniforms.uImpact.value = impactStrength
    const target = isWorking ? 1 + impactStrength * .18 : mesh === hovered || mesh === selected ? 1.16 : 1
    mesh.scale.lerp(new THREE.Vector3(target, target, target), .09)
    mesh.material.uniforms.uColor.value.lerp(new THREE.Color(mesh.userData.color), .06)
    mesh.rotation.y = t * .025 + index
    mesh.rotation.x = Math.sin(t * .12 + index) * .035
    mesh.parent.children.forEach(child => {
      if (!child.userData.artStroke) return
      child.rotation.z += child.userData.speed * .003
      child.material.opacity = .07 + Math.sin(t * .3 + child.userData.phase) * .025
    })
    mesh.material.uniforms.uTime.value = t
  })
  for (let index = activeSignals.length - 1; index >= 0; index--) {
    const signal = activeSignals[index]
    const age = now - (signal.born || signal.object.userData.pulseBorn)
    const progress = age / signal.duration
    if (signal.type === 'wave') {
      const positions = signal.object.geometry.attributes.position
      const travelProgress = Math.min(age / signal.travelDuration, 1)
      const waveCenter = Math.min(travelProgress * 1.12, 1.04)
      for (let pointIndex = 0; pointIndex < positions.count; pointIndex++) {
        const along = pointIndex / (positions.count - 1)
        const base = signal.curve.getPoint(along)
        const tangent = signal.curve.getTangent(along).normalize()
        let perpendicular = tangent.clone().cross(camera.getWorldDirection(new THREE.Vector3())).normalize()
        if (perpendicular.lengthSq() < .01) perpendicular = tangent.clone().cross(new THREE.Vector3(0, 1, 0)).normalize()
        const distanceFromPulse = along - waveCenter
        const leadingEnvelope = Math.exp(-distanceFromPulse * distanceFromPulse * 24)
        const leadingWave = Math.sin(along * Math.PI * 8 - travelProgress * Math.PI * 10) * leadingEnvelope * .2
        base.addScaledVector(perpendicular, leadingWave)
        positions.setXYZ(pointIndex, base.x, base.y, base.z)
      }
      positions.needsUpdate = true
      const arrivalFade = age > signal.travelDuration ? 1 - (age - signal.travelDuration) / (signal.duration - signal.travelDuration) : 1
      signal.object.material.opacity = .065 + Math.min(age / 300, .36) * Math.max(0, arrivalFade)
      if (!signal.arrivalTriggered && age >= signal.travelDuration) {
        emitNodePulse(signal.target, signal.color)
        signal.arrivalTriggered = true
      }
    } else if (signal.type === 'smoke') {
      signal.object.material.uniforms.uProgress.value = progress
      signal.object.material.uniforms.uOpacity.value = .42 * Math.pow(1 - progress, 1.7)
    }
    if (progress >= 1) {
      if (signal.type === 'smoke') {
        scene.remove(signal.object)
        signal.object.geometry.dispose()
        signal.object.material.dispose()
      } else {
        const restingPoints = signal.object.userData.restingCurve.getPoints(64)
        signal.object.geometry.setFromPoints(restingPoints)
        signal.object.geometry.setDrawRange(0, restingPoints.length)
        signal.object.material.color.set(0x9294a3)
        signal.object.material.opacity = .065
      }
      activeSignals.splice(index, 1)
    }
  }
  composer.render()
  requestAnimationFrame(animate)
}
inspect(selected)
animate()

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(innerWidth, innerHeight)
  composer.setSize(innerWidth, innerHeight)
})
