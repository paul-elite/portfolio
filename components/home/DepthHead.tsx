'use client';

import { useRef } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';

/* A 3D-photo head: the portrait is textured onto a finely subdivided plane and
   pushed into relief by a depth map (estimated from the single photo). It
   turns with a slow idle sway and follows the pointer for parallax. Even
   lighting + flat plane normals keep the baked-in photo lighting intact — the
   dimensionality comes from the silhouette and parallax as it rotates. */

const PORTRAIT_ASPECT = 1200 / 1670; // w / h of the cropped asset
const PLANE_H = 2.6;
const PLANE_W = PLANE_H * PORTRAIT_ASPECT;

function Head({ animate }: { animate: boolean }) {
  const group = useRef<THREE.Group>(null);
  const [portrait, depth] = useLoader(THREE.TextureLoader, ['/head/portrait.png', '/head/depth.png']);

  portrait.colorSpace = THREE.SRGBColorSpace;
  portrait.anisotropy = 8;
  depth.colorSpace = THREE.NoColorSpace;
  depth.minFilter = THREE.LinearFilter;
  depth.magFilter = THREE.LinearFilter;
  depth.generateMipmaps = false;

  useFrame((state) => {
    if (!group.current) return;
    const g = group.current;
    if (!animate) {
      g.rotation.set(0, 0, 0);
      return;
    }
    const t = state.clock.elapsedTime;
    const px = state.pointer.x; // -1..1 across the canvas
    const py = state.pointer.y;
    // idle sway + pointer parallax (kept within a believable range for a
    // single-photo depth — beyond ~26° the flat side of the relief shows)
    const targetY = Math.sin(t * 0.45) * 0.12 + px * 0.33;
    const targetX = Math.cos(t * 0.35) * 0.04 - py * 0.18;
    g.rotation.y += (targetY - g.rotation.y) * 0.06;
    g.rotation.x += (targetX - g.rotation.x) * 0.06;
    g.position.y = Math.sin(t * 0.6) * 0.02;
  });

  return (
    <group ref={group}>
      <mesh>
        <planeGeometry args={[PLANE_W, PLANE_H, 300, 300]} />
        <meshStandardMaterial
          map={portrait}
          displacementMap={depth}
          displacementScale={0.7}
          displacementBias={-0.32}
          transparent
          alphaTest={0.35}
          roughness={1}
          metalness={0}
        />
      </mesh>
    </group>
  );
}

export default function DepthHead({ animate = true }: { animate?: boolean }) {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
      camera={{ position: [0, 0, 5], fov: 30 }}
      frameloop={animate ? 'always' : 'demand'}
      style={{ width: '100%', height: '100%', background: 'transparent' }}
    >
      <ambientLight intensity={1.15} />
      <directionalLight position={[0, 0, 4]} intensity={0.25} />
      <Head animate={animate} />
    </Canvas>
  );
}
