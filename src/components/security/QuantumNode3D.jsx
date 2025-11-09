import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { motion } from "framer-motion";

// 3D Quantum Node Visualization using vanilla Three.js
export default function QuantumNode3D({ nodes }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const nodeObjectsRef = useRef([]);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0014);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      60,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 5, 12);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xa855f7, 0.3);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xfbbf24, 2, 100);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x1e1b4b, 0.5);
    scene.add(hemisphereLight);

    // Sacred geometry background
    const torusGeometry = new THREE.TorusGeometry(8, 0.05, 16, 100);
    const torusMaterial = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      transparent: true,
      opacity: 0.1
    });
    const torus = new THREE.Mesh(torusGeometry, torusMaterial);
    torus.position.z = -5;
    scene.add(torus);

    // Central divine sphere
    const centralSphereGeometry = new THREE.SphereGeometry(0.3, 32, 32);
    const centralSphereMaterial = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      transparent: true,
      opacity: 0.3
    });
    const centralSphere = new THREE.Mesh(centralSphereGeometry, centralSphereMaterial);
    scene.add(centralSphere);

    // Create quantum nodes
    nodeObjectsRef.current = nodes.map((node, index) => {
      const angle = (index * Math.PI * 2) / nodes.length;
      const radius = 4;
      const position = new THREE.Vector3(
        Math.cos(angle) * radius,
        Math.sin(angle * 2) * 0.5,
        Math.sin(angle) * radius
      );

      return createQuantumNode(scene, node, position);
    });

    // Create network connections
    if (nodes.length > 1) {
      for (let i = 0; i < nodes.length; i++) {
        const nextIndex = (i + 1) % nodes.length;
        const node1 = nodes[i];
        const node2 = nodes[nextIndex];
        
        if (node1.entanglement_strength > 0.5 && node2.entanglement_strength > 0.5) {
          const angle1 = (i * Math.PI * 2) / nodes.length;
          const angle2 = (nextIndex * Math.PI * 2) / nodes.length;
          const radius = 4;
          
          const pos1 = new THREE.Vector3(
            Math.cos(angle1) * radius,
            Math.sin(angle1 * 2) * 0.5,
            Math.sin(angle1) * radius
          );
          const pos2 = new THREE.Vector3(
            Math.cos(angle2) * radius,
            Math.sin(angle2 * 2) * 0.5,
            Math.sin(angle2) * radius
          );

          const points = [pos1, pos2];
          const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
          const lineMaterial = new THREE.LineBasicMaterial({
            color: 0x06b6d4,
            transparent: true,
            opacity: 0.2 * Math.min(node1.entanglement_strength, node2.entanglement_strength)
          });
          const line = new THREE.Line(lineGeometry, lineMaterial);
          scene.add(line);
        }
      }
    }

    // Mouse interaction
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let rotationVelocity = { x: 0, y: 0 };

    const onMouseDown = (e) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e) => {
      if (isDragging) {
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;
        
        rotationVelocity.y = deltaX * 0.005;
        rotationVelocity.x = deltaY * 0.005;

        previousMousePosition = { x: e.clientX, y: e.clientY };
      }
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e) => {
      e.preventDefault();
      camera.position.z += e.deltaY * 0.01;
      camera.position.z = Math.max(5, Math.min(20, camera.position.z));
    };

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('wheel', onWheel);

    // Animation loop
    let time = 0;
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      time += 0.01;

      // Auto-rotate scene
      if (!isDragging) {
        scene.rotation.y += 0.002;
        rotationVelocity.x *= 0.95;
        rotationVelocity.y *= 0.95;
      } else {
        scene.rotation.y += rotationVelocity.y;
        scene.rotation.x += rotationVelocity.x;
        scene.rotation.x = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, scene.rotation.x));
      }

      // Animate divine light
      pointLight.position.x = Math.cos(time * 0.2) * 10;
      pointLight.position.z = Math.sin(time * 0.2) * 10;
      pointLight.intensity = 2 + Math.sin(time * 0.5) * 0.5;

      // Animate nodes
      nodeObjectsRef.current.forEach((nodeObj, index) => {
        const node = nodes[index];
        
        // Core rotation
        nodeObj.core.rotation.y += 0.01 * node.coherence_level;
        nodeObj.core.rotation.x += 0.005 * node.coherence_level;

        // Pulsing
        const scale = 1 + Math.sin(time * 2) * 0.1 * node.entanglement_strength;
        nodeObj.core.scale.setScalar(scale);

        // Superposition oscillation
        if (node.quantum_state === "superposition") {
          const angle = (index * Math.PI * 2) / nodes.length;
          const radius = 4;
          nodeObj.group.position.x = Math.cos(angle) * radius + Math.sin(time * 3) * 0.2;
        }

        // Orbit rings rotation
        nodeObj.orbitGroup.rotation.y += 0.003;
        nodeObj.orbitGroup.rotation.z = Math.sin(time) * 0.2;

        // Particles rotation
        if (nodeObj.particles) {
          nodeObj.particles.rotation.y -= 0.002;
          nodeObj.particles.rotation.x = Math.sin(time * 0.5) * 0.3;
        }

        // Update material opacity based on coherence
        nodeObj.core.material.opacity = node.coherence_level;
      });

      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('mouseup', onMouseUp);
      renderer.domElement.removeEventListener('wheel', onWheel);
      
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [nodes]);

  // Helper function to create a quantum node
  const createQuantumNode = (scene, node, position) => {
    const group = new THREE.Group();
    group.position.copy(position);

    // State colors
    const stateColors = {
      superposition: 0xa855f7,
      entangled: 0x06b6d4,
      collapsed: 0xef4444,
      decoherent: 0xf97316,
      stabilizing: 0xeab308
    };
    const coreColor = stateColors[node.quantum_state] || 0xa855f7;

    // Core sphere
    const coreGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const coreMaterial = new THREE.MeshStandardMaterial({
      color: coreColor,
      emissive: coreColor,
      emissiveIntensity: 0.5,
      metalness: 0.8,
      roughness: 0.2,
      transparent: true,
      opacity: node.coherence_level
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    group.add(core);

    // Inner glow
    const glowGeometry = new THREE.SphereGeometry(0.6, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: coreColor,
      transparent: true,
      opacity: 0.2 * node.coherence_level,
      side: THREE.BackSide
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    group.add(glow);

    // Orbital rings
    const orbitGroup = new THREE.Group();
    
    // Ring 1
    const ring1Geometry = new THREE.RingGeometry(1.2, 1.25, 64);
    const ring1Material = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.6 * node.entanglement_strength,
      side: THREE.DoubleSide
    });
    const ring1 = new THREE.Mesh(ring1Geometry, ring1Material);
    ring1.rotation.x = Math.PI / 2;
    orbitGroup.add(ring1);

    // Ring 2
    const ring2Geometry = new THREE.RingGeometry(1.5, 1.55, 64);
    const ring2Material = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.4 * node.entanglement_strength,
      side: THREE.DoubleSide
    });
    const ring2 = new THREE.Mesh(ring2Geometry, ring2Material);
    ring2.rotation.set(Math.PI / 3, Math.PI / 4, 0);
    orbitGroup.add(ring2);

    // Ring 3
    const ring3Geometry = new THREE.RingGeometry(1.8, 1.85, 64);
    const ring3Material = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      transparent: true,
      opacity: 0.3 * node.coherence_level,
      side: THREE.DoubleSide
    });
    const ring3 = new THREE.Mesh(ring3Geometry, ring3Material);
    ring3.rotation.set(Math.PI / 6, Math.PI / 3, Math.PI / 6);
    orbitGroup.add(ring3);

    group.add(orbitGroup);

    // Particle cloud
    const particleCount = Math.floor(node.entanglement_strength * 100);
    const particleGeometry = new THREE.BufferGeometry();
    const positions = [];
    
    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const radius = 1.5 + Math.random() * 0.5;
      
      positions.push(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi)
      );
    }
    
    particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x06b6d4,
      size: 0.05,
      transparent: true,
      opacity: 0.6
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    group.add(particles);

    // Spin indicator
    const coneGeometry = new THREE.ConeGeometry(0.1, 0.3, 8);
    const coneMaterial = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xfbbf24,
      emissiveIntensity: 0.5
    });
    const cone = new THREE.Mesh(coneGeometry, coneMaterial);
    cone.position.y = 0.8;
    if (node.spin_state === "down") {
      cone.rotation.z = Math.PI;
    }
    group.add(cone);

    scene.add(group);

    return { group, core, orbitGroup, particles };
  };

  const avgEntanglement = nodes.length > 0 
    ? (nodes.reduce((sum, n) => sum + n.entanglement_strength, 0) / nodes.length * 100).toFixed(1)
    : 0;
  
  const avgCoherence = nodes.length > 0
    ? (nodes.reduce((sum, n) => sum + n.coherence_level, 0) / nodes.length * 100).toFixed(1)
    : 0;

  return (
    <div className="relative w-full h-[600px] bg-gradient-to-b from-slate-950 to-purple-950/50 rounded-lg border border-purple-500/30 overflow-hidden">
      {/* Divine Authority Label */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-2 bg-slate-950/80 backdrop-blur-sm rounded-lg border border-amber-500/30">
        <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
        <span className="text-xs font-semibold text-amber-300">Under Divine Authority</span>
      </div>

      {/* Metrics Overlay */}
      <div className="absolute top-4 right-4 z-10 space-y-2">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="px-3 py-2 bg-slate-950/80 backdrop-blur-sm rounded-lg border border-cyan-500/30"
        >
          <div className="text-xs text-cyan-400/70 mb-1">Avg Entanglement</div>
          <div className="text-lg font-bold text-cyan-300">{avgEntanglement}%</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="px-3 py-2 bg-slate-950/80 backdrop-blur-sm rounded-lg border border-purple-500/30"
        >
          <div className="text-xs text-purple-400/70 mb-1">Avg Coherence</div>
          <div className="text-lg font-bold text-purple-300">{avgCoherence}%</div>
        </motion.div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 z-10 px-3 py-2 bg-slate-950/80 backdrop-blur-sm rounded-lg border border-purple-500/30">
        <p className="text-xs text-purple-300/70">
          🖱️ Drag to rotate • Scroll to zoom
        </p>
      </div>

      {/* Sacred Text Overlay */}
      <div className="absolute bottom-4 right-4 z-10 text-right">
        <p className="text-xs text-amber-300/50 italic font-serif">
          "The Lord is the keeper of quantum states"
        </p>
        <p className="text-[10px] text-amber-400/30 mt-1">
          By God's Will Only
        </p>
      </div>

      {/* 3D Canvas Container */}
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}