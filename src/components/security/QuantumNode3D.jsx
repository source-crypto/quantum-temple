import React, { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere, Ring, Line, Text } from "@react-three/drei";
import * as THREE from "three";
import { motion } from "framer-motion";

// 3D Quantum Node Visualization Component
function QuantumNodeMesh({ node, position = [0, 0, 0] }) {
  const meshRef = useRef();
  const orbitRef = useRef();
  const particlesRef = useRef();
  const [hovered, setHovered] = useState(false);

  // Color mapping based on quantum state
  const stateColors = {
    superposition: "#a855f7", // purple
    entangled: "#06b6d4", // cyan
    collapsed: "#ef4444", // red
    decoherent: "#f97316", // orange
    stabilizing: "#eab308" // yellow
  };

  const coreColor = stateColors[node.quantum_state] || "#a855f7";
  const entanglementColor = new THREE.Color(0x06b6d4);
  const coherenceColor = new THREE.Color(0xa855f7);

  // Animate based on quantum state
  useFrame((state, delta) => {
    if (meshRef.current) {
      // Rotation speed based on coherence
      meshRef.current.rotation.y += delta * node.coherence_level * 0.5;
      meshRef.current.rotation.x += delta * node.coherence_level * 0.2;

      // Pulsing effect based on entanglement
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1 * node.entanglement_strength;
      meshRef.current.scale.setScalar(scale);

      // Superposition oscillation
      if (node.quantum_state === "superposition") {
        meshRef.current.position.x = position[0] + Math.sin(state.clock.elapsedTime * 3) * 0.2;
      }
    }

    // Orbit rings rotation
    if (orbitRef.current) {
      orbitRef.current.rotation.y += delta * 0.3;
      orbitRef.current.rotation.z = Math.sin(state.clock.elapsedTime) * 0.2;
    }

    // Particle cloud animation
    if (particlesRef.current) {
      particlesRef.current.rotation.y -= delta * 0.2;
      particlesRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
    }
  });

  // Generate entanglement particles
  const particleCount = Math.floor(node.entanglement_strength * 100);
  const particles = React.useMemo(() => {
    const temp = [];
    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const radius = 1.5 + Math.random() * 0.5;
      
      temp.push(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi)
      );
    }
    return new Float32Array(temp);
  }, [particleCount]);

  return (
    <group position={position}>
      {/* Core Quantum Sphere */}
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial
          color={coreColor}
          emissive={coreColor}
          emissiveIntensity={hovered ? 0.8 : 0.5}
          metalness={0.8}
          roughness={0.2}
          transparent
          opacity={node.coherence_level}
        />
      </mesh>

      {/* Inner Glow */}
      <mesh>
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshBasicMaterial
          color={coreColor}
          transparent
          opacity={0.2 * node.coherence_level}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Orbital Rings - Representing Entanglement */}
      <group ref={orbitRef}>
        <Ring
          args={[1.2, 1.25, 64]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <meshBasicMaterial
            color={entanglementColor}
            transparent
            opacity={0.6 * node.entanglement_strength}
            side={THREE.DoubleSide}
          />
        </Ring>
        <Ring
          args={[1.5, 1.55, 64]}
          rotation={[Math.PI / 3, Math.PI / 4, 0]}
        >
          <meshBasicMaterial
            color={entanglementColor}
            transparent
            opacity={0.4 * node.entanglement_strength}
            side={THREE.DoubleSide}
          />
        </Ring>
        <Ring
          args={[1.8, 1.85, 64]}
          rotation={[Math.PI / 6, Math.PI / 3, Math.PI / 6]}
        >
          <meshBasicMaterial
            color={coherenceColor}
            transparent
            opacity={0.3 * node.coherence_level}
            side={THREE.DoubleSide}
          />
        </Ring>
      </group>

      {/* Entanglement Particle Cloud */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particles.length / 3}
            array={particles}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.05}
          color={entanglementColor}
          transparent
          opacity={0.6}
          sizeAttenuation
        />
      </points>

      {/* Node Label */}
      <Text
        position={[0, 2.5, 0]}
        fontSize={0.3}
        color="#e9d5ff"
        anchorX="center"
        anchorY="middle"
      >
        {node.node_id}
      </Text>

      {/* Health Score Indicator */}
      <Text
        position={[0, -2.5, 0]}
        fontSize={0.2}
        color={node.health_score >= 90 ? "#4ade80" : node.health_score >= 75 ? "#fbbf24" : "#ef4444"}
        anchorX="center"
        anchorY="middle"
      >
        {node.health_score}% Health
      </Text>

      {/* Entanglement Lines to Other Nodes */}
      {node.entanglement_strength > 0.9 && (
        <>
          <Line
            points={[[0, 0, 0], [3, 1, 2]]}
            color={entanglementColor}
            lineWidth={2}
            transparent
            opacity={0.3 * node.entanglement_strength}
          />
          <Line
            points={[[0, 0, 0], [-3, -1, 2]]}
            color={entanglementColor}
            lineWidth={2}
            transparent
            opacity={0.3 * node.entanglement_strength}
          />
        </>
      )}

      {/* Spin State Indicator */}
      <mesh position={[0, 0.8, 0]} rotation={node.spin_state === "up" ? [0, 0, 0] : [Math.PI, 0, 0]}>
        <coneGeometry args={[0.1, 0.3, 8]} />
        <meshStandardMaterial
          color="#fbbf24"
          emissive="#fbbf24"
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  );
}

// Divine Light Source - Controlled by Lord Jesus
function DivineLight() {
  const lightRef = useRef();

  useFrame((state) => {
    if (lightRef.current) {
      // Gentle pulsing divine light
      lightRef.current.intensity = 2 + Math.sin(state.clock.elapsedTime * 0.5) * 0.5;
      
      // Orbiting around the scene
      const radius = 10;
      lightRef.current.position.x = Math.cos(state.clock.elapsedTime * 0.2) * radius;
      lightRef.current.position.z = Math.sin(state.clock.elapsedTime * 0.2) * radius;
    }
  });

  return (
    <>
      <pointLight ref={lightRef} position={[10, 10, 10]} color="#fbbf24" intensity={2} />
      <ambientLight intensity={0.3} color="#a855f7" />
      <hemisphereLight intensity={0.5} color="#ffffff" groundColor="#1e1b4b" />
    </>
  );
}

// Network Connection Lines
function NetworkConnections({ nodes }) {
  return (
    <group>
      {nodes.map((node, i) => {
        if (i === 0) return null;
        const prevNode = nodes[i - 1];
        
        // Calculate positions
        const angle1 = (i - 1) * (Math.PI * 2) / nodes.length;
        const angle2 = i * (Math.PI * 2) / nodes.length;
        const radius = 4;
        
        const pos1 = [
          Math.cos(angle1) * radius,
          Math.sin(angle1 * 2) * 0.5,
          Math.sin(angle1) * radius
        ];
        const pos2 = [
          Math.cos(angle2) * radius,
          Math.sin(angle2 * 2) * 0.5,
          Math.sin(angle2) * radius
        ];

        return (
          <Line
            key={`connection-${i}`}
            points={[pos1, pos2]}
            color="#06b6d4"
            lineWidth={1}
            transparent
            opacity={0.2 * Math.min(node.entanglement_strength, prevNode.entanglement_strength)}
          />
        );
      })}
    </group>
  );
}

// Main 3D Scene Component
export default function QuantumNode3D({ nodes }) {
  const [selectedNode, setSelectedNode] = useState(null);

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
          <div className="text-lg font-bold text-cyan-300">
            {nodes.length > 0 
              ? (nodes.reduce((sum, n) => sum + n.entanglement_strength, 0) / nodes.length * 100).toFixed(1)
              : 0}%
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="px-3 py-2 bg-slate-950/80 backdrop-blur-sm rounded-lg border border-purple-500/30"
        >
          <div className="text-xs text-purple-400/70 mb-1">Avg Coherence</div>
          <div className="text-lg font-bold text-purple-300">
            {nodes.length > 0 
              ? (nodes.reduce((sum, n) => sum + n.coherence_level, 0) / nodes.length * 100).toFixed(1)
              : 0}%
          </div>
        </motion.div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 z-10 px-3 py-2 bg-slate-950/80 backdrop-blur-sm rounded-lg border border-purple-500/30">
        <p className="text-xs text-purple-300/70">
          🖱️ Drag to rotate • Scroll to zoom • Hover nodes for details
        </p>
      </div>

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 5, 12], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
      >
        {/* Divine Lighting */}
        <DivineLight />

        {/* Quantum Nodes in Circular Formation */}
        {nodes.map((node, index) => {
          const angle = (index * Math.PI * 2) / nodes.length;
          const radius = 4;
          const position = [
            Math.cos(angle) * radius,
            Math.sin(angle * 2) * 0.5, // Slight vertical variation
            Math.sin(angle) * radius
          ];

          return (
            <QuantumNodeMesh
              key={node.id || index}
              node={node}
              position={position}
            />
          );
        })}

        {/* Network Connections */}
        {nodes.length > 1 && <NetworkConnections nodes={nodes} />}

        {/* Central Divine Sphere */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.3, 32, 32]} />
          <meshBasicMaterial
            color="#fbbf24"
            transparent
            opacity={0.3}
          />
        </mesh>

        {/* Sacred Geometry Background */}
        <mesh position={[0, 0, -5]} rotation={[0, 0, 0]}>
          <torusGeometry args={[8, 0.05, 16, 100]} />
          <meshBasicMaterial
            color="#a855f7"
            transparent
            opacity={0.1}
          />
        </mesh>

        {/* Controls */}
        <OrbitControls
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={20}
          autoRotate={true}
          autoRotateSpeed={0.5}
        />
      </Canvas>

      {/* Sacred Text Overlay */}
      <div className="absolute bottom-4 right-4 z-10 text-right">
        <p className="text-xs text-amber-300/50 italic font-serif">
          "The Lord is the keeper of quantum states"
        </p>
        <p className="text-[10px] text-amber-400/30 mt-1">
          By God's Will Only
        </p>
      </div>
    </div>
  );
}