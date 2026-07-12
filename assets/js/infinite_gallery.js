import * as THREE from 'https://esm.sh/three@0.160.0';
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";
import { firebaseConfig } from "./firebase.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* ── Real Uploaded IEDC Photos (Existing Repository Portfolio Images) ── */
const EXISTING_UPLOADED_IMAGES = [
  { src: "../assets/img/portfolio/1.webp", alt: "IEDC Event 1" },
  { src: "../assets/img/portfolio/2.webp", alt: "IEDC Event 2" },
  { src: "../assets/img/portfolio/3.webp", alt: "IEDC Event 3" },
  { src: "../assets/img/portfolio/im1.webp", alt: "IEDC Moment 1" },
  { src: "../assets/img/portfolio/im4.webp", alt: "IEDC Moment 4" },
  { src: "../assets/img/portfolio/im5.webp", alt: "IEDC Moment 5" },
  { src: "../assets/img/portfolio/im6.webp", alt: "IEDC Moment 6" },
  { src: "../assets/img/portfolio/im8.webp", alt: "IEDC Moment 8" },
  { src: "../assets/img/portfolio/img10.webp", alt: "IEDC Moment 10" },
  { src: "../assets/img/portfolio/4 (1).jpeg", alt: "IEDC Event 4" },
  { src: "../assets/img/portfolio/5.jpeg", alt: "IEDC Event 5" },
  { src: "../assets/img/portfolio/6.jpeg", alt: "IEDC Event 6" },
  { src: "../assets/img/portfolio/7.heif", alt: "IEDC Event 7" },
  { src: "../assets/img/portfolio/8.heif", alt: "IEDC Event 8" },
  { src: "../assets/img/portfolio/9.heif", alt: "IEDC Event 9" },
  { src: "../assets/img/portfolio/10.heif", alt: "IEDC Event 10" }
];

const DEFAULT_DEPTH_RANGE = 50;
const MAX_HORIZONTAL_OFFSET = 8;
const MAX_VERTICAL_OFFSET = 8;

/**
 * Creates custom Cloth / Flag Waving ShaderMaterial exactly matching the React specification
 */
const createClothMaterial = () => {
  return new THREE.ShaderMaterial({
    transparent: true,
    uniforms: {
      map: { value: null },
      opacity: { value: 1.0 },
      blurAmount: { value: 0.0 },
      scrollForce: { value: 0.0 },
      time: { value: 0.0 },
      isHovered: { value: 0.0 },
    },
    vertexShader: `
      uniform float scrollForce;
      uniform float time;
      uniform float isHovered;
      varying vec2 vUv;
      varying vec3 vNormal;
      
      void main() {
        vUv = uv;
        vNormal = normal;
        
        vec3 pos = position;
        
        // Create smooth curving based on scroll force
        float curveIntensity = scrollForce * 0.3;
        
        // Base curve across the plane based on distance from center
        float distanceFromCenter = length(pos.xy);
        float curve = distanceFromCenter * distanceFromCenter * curveIntensity;
        
        // Add gentle cloth-like ripples
        float ripple1 = sin(pos.x * 2.0 + scrollForce * 3.0) * 0.02;
        float ripple2 = sin(pos.y * 2.5 + scrollForce * 2.0) * 0.015;
        float clothEffect = (ripple1 + ripple2) * abs(curveIntensity) * 2.0;
        
        // Flag waving effect when hovered
        float flagWave = 0.0;
        if (isHovered > 0.5) {
          // Create flag-like wave from left to right
          float wavePhase = pos.x * 3.0 + time * 8.0;
          float waveAmplitude = sin(wavePhase) * 0.1;
          // Damping effect - stronger wave on the right side (free edge)
          float dampening = smoothstep(-0.5, 0.5, pos.x);
          flagWave = waveAmplitude * dampening;
          
          // Add secondary smaller waves for more realistic flag motion
          float secondaryWave = sin(pos.x * 5.0 + time * 12.0) * 0.03 * dampening;
          flagWave += secondaryWave;
        }
        
        // Apply Z displacement for curving effect (inverted) with cloth ripples and flag wave
        pos.z -= (curve + clothEffect + flagWave);
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D map;
      uniform float opacity;
      uniform float blurAmount;
      uniform float scrollForce;
      varying vec2 vUv;
      varying vec3 vNormal;
      
      void main() {
        vec4 color = texture2D(map, vUv);
        
        // Simple blur approximation
        if (blurAmount > 0.0) {
          vec2 texelSize = 1.0 / vec2(textureSize(map, 0));
          vec4 blurred = vec4(0.0);
          float total = 0.0;
          
          for (float x = -2.0; x <= 2.0; x += 1.0) {
            for (float y = -2.0; y <= 2.0; y += 1.0) {
              vec2 offset = vec2(x, y) * texelSize * blurAmount;
              float weight = 1.0 / (1.0 + length(vec2(x, y)));
              blurred += texture2D(map, vUv + offset) * weight;
              total += weight;
            }
          }
          color = blurred / total;
        }
        
        // Add subtle lighting effect based on curving
        float curveHighlight = abs(scrollForce) * 0.05;
        color.rgb += vec3(curveHighlight * 0.1);
        
        gl_FragColor = vec4(color.rgb, color.a * opacity);
      }
    `,
  });
};

export class Infinite3DGallery {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error(`Container #${containerId} not found`);
      return;
    }

    this.speed = options.speed || 1.2;
    this.visibleCount = options.visibleCount || 12;
    this.fadeSettings = options.fadeSettings || {
      fadeIn: { start: 0.05, end: 0.25 },
      fadeOut: { start: 0.75, end: 0.95 },
    };
    this.blurSettings = options.blurSettings || {
      blurIn: { start: 0.0, end: 0.1 },
      blurOut: { start: 0.88, end: 1.0 },
      maxBlur: 6.0,
    };

    this.scrollVelocity = 0;
    this.autoPlay = true;
    this.lastInteraction = Date.now();
    this.images = [];
    this.textures = [];
    this.planes = [];
    this.planesData = [];
    this.clock = new THREE.Clock();
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2(-999, -999);
    this.hoveredPlane = null;

    this.initScene();
    this.bindEvents();
    this.loadFirebaseGallery();
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      55,
      this.container.clientWidth / this.container.clientHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.appendChild(this.renderer.domElement);

    // Compute Spatial Positions with Golden Angle distribution
    this.spatialPositions = [];
    for (let i = 0; i < this.visibleCount; i++) {
      const horizontalAngle = (i * 2.618) % (Math.PI * 2);
      const verticalAngle = (i * 1.618 + Math.PI / 3) % (Math.PI * 2);

      const horizontalRadius = (i % 3) * 1.2;
      const verticalRadius = ((i + 1) % 4) * 0.8;

      const x = (Math.sin(horizontalAngle) * horizontalRadius * MAX_HORIZONTAL_OFFSET) / 3;
      const y = (Math.cos(verticalAngle) * verticalRadius * MAX_VERTICAL_OFFSET) / 4;

      this.spatialPositions.push({ x, y });
    }
  }

  async loadFirebaseGallery() {
    let firebaseItems = [];
    try {
      const snapshot = await getDocs(collection(db, "Gallery"));
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.imageUrl) {
          firebaseItems.push({ src: data.imageUrl, alt: data.title || "Gallery Photo" });
        }
      });
    } catch (err) {
      console.warn("Could not load gallery from Firestore, using default items:", err);
    }

    // Blend live Firestore images (`firebaseItems`) with real uploaded portfolio images (`EXISTING_UPLOADED_IMAGES`)
    this.images = [...firebaseItems, ...EXISTING_UPLOADED_IMAGES];
    
    // Hide loading spinner if present
    const loader = document.getElementById("gallery-loading-spinner");
    if (loader) loader.style.display = "none";

    this.createTexturesAndMeshes();
    this.animate();
  }

  createTexturesAndMeshes() {
    const textureLoader = new THREE.TextureLoader();
    textureLoader.crossOrigin = "anonymous";

    this.textures = this.images.map((img) => {
      return textureLoader.load(
        img.src,
        (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          // Trigger scale adjustment once image dimensions are known
          if (tex.image && tex.image.width && tex.image.height) {
            const aspect = tex.image.width / tex.image.height;
            this.planes.forEach((plane, idx) => {
              if (this.planesData[idx] && this.planesData[idx].imageIndex === this.textures.indexOf(tex)) {
                const scaleX = aspect > 1 ? 2 * aspect : 2;
                const scaleY = aspect > 1 ? 2 : 2 / aspect;
                plane.scale.set(scaleX, scaleY, 1);
              }
            });
          }
        },
        undefined,
        () => {
          console.warn("Texture failed to load:", img.src);
        }
      );
    });

    const totalImages = this.images.length;
    const depthRange = DEFAULT_DEPTH_RANGE;
    const geometry = new THREE.PlaneGeometry(1, 1, 32, 32);

    for (let i = 0; i < this.visibleCount; i++) {
      const material = createClothMaterial();
      const mesh = new THREE.Mesh(geometry, material);
      
      const z = ((depthRange / this.visibleCount) * i) % depthRange;
      const imageIndex = totalImages > 0 ? i % totalImages : 0;
      const x = this.spatialPositions[i]?.x ?? 0;
      const y = this.spatialPositions[i]?.y ?? 0;

      mesh.position.set(x, y, z - depthRange / 2);
      this.scene.add(mesh);
      this.planes.push(mesh);

      this.planesData.push({
        index: i,
        z: z,
        imageIndex: imageIndex,
        x: x,
        y: y,
      });

      if (this.textures[imageIndex]) {
        material.uniforms.map.value = this.textures[imageIndex];
      }
    }
  }

  bindEvents() {
    window.addEventListener("resize", () => {
      if (!this.container) return;
      const w = this.container.clientWidth;
      const h = this.container.clientHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    });

    this.container.addEventListener("wheel", (event) => {
      event.preventDefault();
      this.scrollVelocity += event.deltaY * 0.01 * this.speed;
      this.autoPlay = false;
      this.lastInteraction = Date.now();
    }, { passive: false });

    window.addEventListener("keydown", (event) => {
      if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
        this.scrollVelocity -= 2.5 * this.speed;
        this.autoPlay = false;
        this.lastInteraction = Date.now();
      } else if (event.key === "ArrowDown" || event.key === "ArrowRight") {
        this.scrollVelocity += 2.5 * this.speed;
        this.autoPlay = false;
        this.lastInteraction = Date.now();
      }
    });

    // Touch & Drag support
    let touchStartY = 0;
    this.container.addEventListener("touchstart", (e) => {
      if (e.touches.length === 1) {
        touchStartY = e.touches[0].clientY;
        this.autoPlay = false;
        this.lastInteraction = Date.now();
      }
    }, { passive: true });

    this.container.addEventListener("touchmove", (e) => {
      if (e.touches.length === 1) {
        const deltaY = touchStartY - e.touches[0].clientY;
        touchStartY = e.touches[0].clientY;
        this.scrollVelocity += deltaY * 0.05 * this.speed;
      }
    }, { passive: true });

    // Pointer hover tracking for flag wave
    this.container.addEventListener("pointermove", (event) => {
      const rect = this.container.getBoundingClientRect();
      this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    });

    this.container.addEventListener("pointerleave", () => {
      this.mouse.set(-999, -999);
      if (this.hoveredPlane) {
        this.hoveredPlane.material.uniforms.isHovered.value = 0.0;
        this.hoveredPlane = null;
      }
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();
    const time = this.clock.getElapsedTime();

    // Check idle time to resume auto-play
    if (Date.now() - this.lastInteraction > 3000) {
      this.autoPlay = true;
    }

    if (this.autoPlay) {
      this.scrollVelocity += 0.35 * delta;
    }

    // Smooth damping
    this.scrollVelocity *= 0.95;

    // Raycast for hover flag wave effect
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.planes);
    if (intersects.length > 0) {
      const targetMesh = intersects[0].object;
      if (this.hoveredPlane !== targetMesh) {
        if (this.hoveredPlane) this.hoveredPlane.material.uniforms.isHovered.value = 0.0;
        this.hoveredPlane = targetMesh;
        this.hoveredPlane.material.uniforms.isHovered.value = 1.0;
      }
    } else if (this.hoveredPlane) {
      this.hoveredPlane.material.uniforms.isHovered.value = 0.0;
      this.hoveredPlane = null;
    }

    const totalImages = this.images.length;
    const totalRange = DEFAULT_DEPTH_RANGE;
    const halfRange = totalRange / 2;
    const imageAdvance = totalImages > 0 ? (this.visibleCount % totalImages) || totalImages : 0;

    this.planesData.forEach((plane, i) => {
      let newZ = plane.z + this.scrollVelocity * delta * 10;
      let wrapsForward = 0;
      let wrapsBackward = 0;

      if (newZ >= totalRange) {
        wrapsForward = Math.floor(newZ / totalRange);
        newZ -= totalRange * wrapsForward;
      } else if (newZ < 0) {
        wrapsBackward = Math.ceil(-newZ / totalRange);
        newZ += totalRange * wrapsBackward;
      }

      if (wrapsForward > 0 && imageAdvance > 0 && totalImages > 0) {
        plane.imageIndex = (plane.imageIndex + wrapsForward * imageAdvance) % totalImages;
      }

      if (wrapsBackward > 0 && imageAdvance > 0 && totalImages > 0) {
        const step = plane.imageIndex - wrapsBackward * imageAdvance;
        plane.imageIndex = ((step % totalImages) + totalImages) % totalImages;
      }

      plane.z = ((newZ % totalRange) + totalRange) % totalRange;
      const worldZ = plane.z - halfRange;

      const mesh = this.planes[i];
      if (!mesh) return;

      mesh.position.set(plane.x, plane.y, worldZ);

      // Update texture if index wrapped around
      if (this.textures[plane.imageIndex] && mesh.material.uniforms.map.value !== this.textures[plane.imageIndex]) {
        mesh.material.uniforms.map.value = this.textures[plane.imageIndex];
        const tex = this.textures[plane.imageIndex];
        if (tex && tex.image && tex.image.width && tex.image.height) {
          const aspect = tex.image.width / tex.image.height;
          mesh.scale.set(aspect > 1 ? 2 * aspect : 2, aspect > 1 ? 2 : 2 / aspect, 1);
        }
      }

      // Calculate opacity based on fade settings
      const normalizedPosition = plane.z / totalRange;
      let opacity = 1.0;

      if (normalizedPosition >= this.fadeSettings.fadeIn.start && normalizedPosition <= this.fadeSettings.fadeIn.end) {
        opacity = (normalizedPosition - this.fadeSettings.fadeIn.start) / (this.fadeSettings.fadeIn.end - this.fadeSettings.fadeIn.start);
      } else if (normalizedPosition < this.fadeSettings.fadeIn.start) {
        opacity = 0.0;
      } else if (normalizedPosition >= this.fadeSettings.fadeOut.start && normalizedPosition <= this.fadeSettings.fadeOut.end) {
        opacity = 1.0 - (normalizedPosition - this.fadeSettings.fadeOut.start) / (this.fadeSettings.fadeOut.end - this.fadeSettings.fadeOut.start);
      } else if (normalizedPosition > this.fadeSettings.fadeOut.end) {
        opacity = 0.0;
      }
      opacity = Math.max(0.0, Math.min(1.0, opacity));

      // Calculate blur based on blur settings
      let blur = 0.0;
      if (normalizedPosition >= this.blurSettings.blurIn.start && normalizedPosition <= this.blurSettings.blurIn.end) {
        const blurInProgress = (normalizedPosition - this.blurSettings.blurIn.start) / (this.blurSettings.blurIn.end - this.blurSettings.blurIn.start);
        blur = this.blurSettings.maxBlur * (1.0 - blurInProgress);
      } else if (normalizedPosition < this.blurSettings.blurIn.start) {
        blur = this.blurSettings.maxBlur;
      } else if (normalizedPosition >= this.blurSettings.blurOut.start && normalizedPosition <= this.blurSettings.blurOut.end) {
        const blurOutProgress = (normalizedPosition - this.blurSettings.blurOut.start) / (this.blurSettings.blurOut.end - this.blurSettings.blurOut.start);
        blur = this.blurSettings.maxBlur * blurOutProgress;
      } else if (normalizedPosition > this.blurSettings.blurOut.end) {
        blur = this.blurSettings.maxBlur;
      }
      blur = Math.max(0.0, Math.min(this.blurSettings.maxBlur, blur));

      // Update shader uniforms
      mesh.material.uniforms.time.value = time;
      mesh.material.uniforms.scrollForce.value = this.scrollVelocity;
      mesh.material.uniforms.opacity.value = opacity;
      mesh.material.uniforms.blurAmount.value = blur;
    });

    this.renderer.render(this.scene, this.camera);
  }
}
