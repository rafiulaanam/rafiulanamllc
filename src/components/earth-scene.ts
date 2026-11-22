import * as THREE from 'three';
import { geographicMarkets } from '@/lib/business-markets';

const globeVertex = `
  varying vec2 texCoord;
  varying vec3 surfaceNormal;
  void main() {
    texCoord = uv;
    surfaceNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const globeFragment = `
  uniform sampler2D dayMap;
  uniform sampler2D cityMap;
  uniform vec3 sun;
  varying vec2 texCoord;
  varying vec3 surfaceNormal;
  void main() {
    vec3 normalDirection = normalize(surfaceNormal);
    float daylight = dot(normalDirection, sun);
    float day = smoothstep(-0.13, 0.36, daylight);
    vec3 surface = texture2D(dayMap, texCoord).rgb;
    vec3 cities = texture2D(cityMap, texCoord).rgb;
    float rim = pow(1.0 - max(0.0, normalDirection.z), 3.0);
    vec3 night = surface * vec3(0.10, 0.18, 0.22) + vec3(0.006, 0.016, 0.022);
    vec3 light = surface * (0.55 + max(daylight, 0.0) * 0.47);
    vec3 color = mix(night, light, day);
    color += cities * vec3(1.50, 1.15, 0.63) * (1.0 - day);
    color += rim * vec3(0.052, 0.28, 0.23) * (0.7 + 0.3 * day);
    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`;

const cloudFragment = `
  uniform sampler2D cloudMap;
  uniform vec3 sun;
  varying vec2 texCoord;
  varying vec3 surfaceNormal;
  void main() {
    vec3 normalDirection = normalize(surfaceNormal);
    float density = smoothstep(0.12, 0.9, texture2D(cloudMap, texCoord).r);
    float light = smoothstep(-0.28, 0.64, dot(normalDirection, sun));
    vec3 color = mix(vec3(0.038, 0.083, 0.093), vec3(0.68, 0.79, 0.77), light);
    gl_FragColor = vec4(color, density * (0.16 + light * 0.5));
    #include <colorspace_fragment>
  }
`;

const airFragment = `
  varying vec3 surfaceNormal;
  void main() {
    float rim = pow(1.0 - abs(normalize(surfaceNormal).z), 4.6);
    gl_FragColor = vec4(0.18, 0.77, 0.60, rim * 0.48);
    #include <colorspace_fragment>
  }
`;

const chapters = [
  [0, .57, -.13, .77], [.13, .58, .04, .68], [.32, -.63, -.18, .64],
  [.60, .46, -.26, .50], [.82, .56, -.06, .66], [1, .49, -.32, .87],
] as const;

function spatialTarget(progress: number) {
  const upper = chapters.findIndex(chapter => chapter[0] >= progress);
  const right = Math.max(1, upper);
  const a = chapters[right - 1];
  const b = chapters[right];
  const ratio = THREE.MathUtils.smoothstep(progress,a[0],b[0]);
  return [THREE.MathUtils.lerp(a[1],b[1],ratio),THREE.MathUtils.lerp(a[2],b[2],ratio),THREE.MathUtils.lerp(a[3],b[3],ratio)];
}

function starfield() {
  const random = THREE.MathUtils.seededRandom;
  random(192);
  const positions = new Float32Array(340 * 3);
  for (let i = 0; i < positions.length; i += 3) {
    positions[i] = random() * 8 - 4;
    positions[i + 1] = random() * 2.4 - 1.2;
    positions[i + 2] = -3;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
  return new THREE.Points(geometry,new THREE.PointsMaterial({
    color:0xa8d0cf,size:1.13,sizeAttenuation:false,transparent:true,opacity:.31,depthWrite:false,
  }));
}

function pingAt(latitude: number, longitude: number) {
  const phi = THREE.MathUtils.degToRad(longitude + 180);
  const theta = THREE.MathUtils.degToRad(90 - latitude);
  const normal = new THREE.Vector3(-Math.cos(phi) * Math.sin(theta),Math.cos(theta),Math.sin(phi) * Math.sin(theta));
  const marker = new THREE.Group();
  marker.position.copy(normal.clone().multiplyScalar(1.021));
  marker.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),normal);
  const ring = new THREE.Mesh(new THREE.RingGeometry(.023,.028,42),new THREE.MeshBasicMaterial({
    color:0x78e6bd,transparent:true,opacity:.6,depthWrite:false,
  }));
  const dot = new THREE.Mesh(new THREE.CircleGeometry(.007,16),new THREE.MeshBasicMaterial({color:0xbbffe6}));
  marker.add(dot,ring);
  return {marker,ring};
}

export async function mountEarth(host: HTMLDivElement, signal: AbortSignal, marketSlugs: string[]) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('webgl2',{alpha:true,antialias:true,powerPreference:'low-power'});
  if (!context) return;
  const renderer = new THREE.WebGLRenderer({canvas,context,alpha:true,antialias:true,powerPreference:'low-power'});
  canvas.className = 'earth-canvas';
  renderer.setClearColor(0,0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const textures = ['day','night','clouds'].map(name => {
    const texture = new THREE.Texture<ImageBitmap>();
    texture.colorSpace = name === 'clouds' ? THREE.NoColorSpace : THREE.SRGBColorSpace;
    return texture;
  });
  const decoded = await Promise.allSettled(['day','night','clouds'].map(async (name,index) => {
    const response = await fetch('/media/earth/' + name + '.webp',{signal});
    if (!response.ok) throw new Error('Earth texture could not load.');
    const image = await createImageBitmap(await response.blob(),{imageOrientation:'flipY'});
    textures[index].image = image;
    textures[index].needsUpdate = true;
  }));
  if (signal.aborted || decoded.some(result => result.status === 'rejected')) {
    for (const texture of textures) { texture.image?.close(); texture.dispose(); }
    renderer.dispose();
    renderer.forceContextLoss();
    return;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1,1,1,-1,.1,20);
  camera.position.z = 6;
  const globe = new THREE.Group();
  const surface = new THREE.Group();
  const sun = new THREE.Vector3(-.7,.27,.62).normalize();
  const [dayMap,cityMap,cloudMap] = textures;
  const sphere = new THREE.Mesh(new THREE.SphereGeometry(1,80,56),new THREE.ShaderMaterial({
    vertexShader:globeVertex,fragmentShader:globeFragment,uniforms:{dayMap:{value:dayMap},cityMap:{value:cityMap},sun:{value:sun}},
  }));
  const clouds = new THREE.Mesh(new THREE.SphereGeometry(1.012,64,48),new THREE.ShaderMaterial({
    vertexShader:globeVertex,fragmentShader:cloudFragment,uniforms:{cloudMap:{value:cloudMap},sun:{value:sun}},
    transparent:true,depthWrite:false,
  }));
  const air = new THREE.Mesh(new THREE.SphereGeometry(1.041,64,48),new THREE.ShaderMaterial({
    vertexShader:globeVertex,fragmentShader:airFragment,side:THREE.BackSide,transparent:true,depthWrite:false,
    blending:THREE.AdditiveBlending,
  }));
  const pings = marketSlugs.flatMap(slug => {
    const market = geographicMarkets[slug];
    return market ? [pingAt(market.latitude,market.longitude)] : [];
  });
  surface.add(sphere,...pings.map(ping => ping.marker));
  globe.add(surface,clouds,air);
  const stars = starfield();
  scene.add(stars,globe);
  host.appendChild(canvas);

  let aspect = 1;
  let compact = false;
  let progress = 0;
  let renderedProgress = 0;
  let target = spatialTarget(progress);
  let pointerX = 0;
  let pointerY = 0;
  let previous = 0;
  let elapsed = 0;
  let frame = 0;
  let disposed = false;
  const cameraHeight = new THREE.Vector3();

  function resize() {
    const {clientWidth:width,clientHeight:height} = host;
    if (!height || !width) return;
    aspect = width / height;
    compact = width < 761;
    camera.left = -aspect;
    camera.right = aspect;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,compact ? 1.3 : 1.5,Math.sqrt(1_950_000 / (width * height))));
    renderer.setSize(width,height,false);
    updateScroll();
  }

  function updateScroll() {
    const available = Math.max(1,document.documentElement.scrollHeight - window.innerHeight);
    progress = THREE.MathUtils.clamp(window.scrollY / available,0,1);
    target = spatialTarget(progress);
  }

  function pointerMove(event: PointerEvent) {
    if (event.pointerType === 'touch') return;
    pointerX = event.clientX / window.innerWidth * 2 - 1;
    pointerY = 1 - event.clientY / window.innerHeight * 2;
  }

  function clearPointer() {
    pointerX = 0;
    pointerY = 0;
  }

  function render(time: number) {
    if (disposed || document.hidden) return;
    const delta = previous ? Math.min((time - previous) / 1000,.05) : 0;
    previous = time;
    elapsed += delta;
    const [x,y,scale] = target;
    const ease = delta ? 1 - Math.exp(-5 * delta) : 1;
    cameraHeight.set(aspect * x * (compact ? .7 : 1) + pointerX * .045,
      y - (compact ? .31 : 0) + pointerY * .042,0);
    globe.position.lerp(cameraHeight,ease);
    const size = THREE.MathUtils.lerp(globe.scale.x,scale * (compact ? .88 : 1),ease);
    globe.scale.setScalar(size);
    globe.rotation.x = THREE.MathUtils.lerp(globe.rotation.x,.10 + pointerY * .06,ease);
    renderedProgress = THREE.MathUtils.lerp(renderedProgress,progress,ease);
    globe.rotation.z = THREE.MathUtils.lerp(globe.rotation.z,-.17 + renderedProgress * .32 + pointerX * .035,ease);
    surface.rotation.y = -1.04 + elapsed * .035 + renderedProgress * 1.45;
    clouds.rotation.y = surface.rotation.y + elapsed * .013 + .045;
    stars.position.x = pointerX * .09;
    for (const [index,{ring}] of pings.entries()) {
      const phase = (elapsed * .49 + index * .53) % 1;
      ring.scale.setScalar(.85 + phase * 1.65);
      ring.material.opacity = (1 - phase) * .7;
    }
    renderer.render(scene,camera);
    if (host.dataset.earthState !== 'live') host.dataset.earthState = 'live';
    frame = requestAnimationFrame(render);
  }

  function visibility() {
    cancelAnimationFrame(frame);
    previous = 0;
    if (!document.hidden && !disposed) frame = requestAnimationFrame(render);
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(frame);
    delete host.dataset.earthState;
    canvas.remove();
    canvas.removeEventListener('webglcontextlost',dispose);
    window.removeEventListener('resize',resize);
    window.removeEventListener('scroll',updateScroll);
    window.removeEventListener('pointermove',pointerMove);
    document.removeEventListener('pointerleave',clearPointer);
    document.removeEventListener('visibilitychange',visibility);
    scene.traverse(object => {
      if (object instanceof THREE.Mesh || object instanceof THREE.Points) {
        object.geometry.dispose();
        object.material.dispose();
      }
    });
    for (const texture of textures) { texture.image.close(); texture.dispose(); }
    renderer.dispose();
    renderer.forceContextLoss();
  }

  canvas.addEventListener('webglcontextlost',dispose);
  window.addEventListener('resize',resize,{passive:true});
  window.addEventListener('scroll',updateScroll,{passive:true});
  window.addEventListener('pointermove',pointerMove,{passive:true});
  document.addEventListener('pointerleave',clearPointer);
  document.addEventListener('visibilitychange',visibility);
  resize();
  visibility();
  return dispose;
}
