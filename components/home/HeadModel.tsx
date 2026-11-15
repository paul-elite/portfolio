'use client';

import { Suspense, useEffect, useMemo } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import * as THREE from 'three';

/* A full 3D bust generated from the single portrait (Hunyuan3D), rendered as a
   polished chrome / liquid-metal sculpture you can orbit 360°: drag to spin,
   slow idle auto-rotate. The mirror finish comes from a procedural studio
   environment (RoomEnvironment) — no external HDR to fetch. */

const MODEL = '/head/head.glb';

/* Procedural studio IBL so the metal has something to reflect. */
function StudioEnv() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    return () => {
      env.dispose();
      pmrem.dispose();
      scene.environment = null;
    };
  }, [gl, scene]);
  return null;
}

function Bust() {
  const gltf = useGLTF(MODEL, true);

  const object = useMemo(() => {
    const o = gltf.scene.clone(true);
    const box = new THREE.Box3().setFromObject(o);
    const c = box.getCenter(new THREE.Vector3());
    const s = box.getSize(new THREE.Vector3());
    o.position.sub(c);
    o.scale.setScalar(2 / Math.max(s.x, s.y, s.z));
    o.position.y -= 0.05; // centre the head, a hint of shoulder below

    const chrome = new THREE.MeshStandardMaterial({
      color: '#ffffff',
      metalness: 1.0,
      roughness: 0.12,
      envMapIntensity: 1.0,
    });
    o.traverse((m) => {
      const mesh = m as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.geometry.computeVertexNormals();
        mesh.material = chrome;
      }
    });
    return o;
  }, [gltf]);

  return <primitive object={object} />;
}

useGLTF.preload(MODEL);

export default function HeadModel({ animate = true }: { animate?: boolean }) {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, 0, 4.0], fov: 28 }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
      }}
      style={{ width: '100%', height: '100%', background: 'transparent', cursor: 'grab' }}
    >
      <ambientLight intensity={0.15} />
      <Suspense fallback={null}>
        <StudioEnv />
        <Bust />
      </Suspense>
      <OrbitControls
        makeDefault
        enablePan={false}
        enableZoom={false}
        enableDamping
        dampingFactor={0.08}
        autoRotate={animate}
        autoRotateSpeed={0.7}
        minPolarAngle={Math.PI * 0.3}
        maxPolarAngle={Math.PI * 0.68}
        target={[0, 0, 0]}
      />
    </Canvas>
  );
}
