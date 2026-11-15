'use client';

import { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

/* A full 3D bust generated from the single portrait (Hunyuan3D). Rendered as a
   clay sculpture you can orbit 360°: drag to spin, slow idle auto-rotate.
   Monochrome on purpose — honest about the generated geometry and it reads as
   an intentional sculpture rather than a photo pretending to be 3D. */

const MODEL = '/head/head.glb';

function Bust() {
  const gltf = useGLTF(MODEL, true);

  const object = useMemo(() => {
    const o = gltf.scene.clone(true);
    // center the bust, normalise scale, then drop it so the HEAD sits at origin
    const box = new THREE.Box3().setFromObject(o);
    const c = box.getCenter(new THREE.Vector3());
    const s = box.getSize(new THREE.Vector3());
    o.position.sub(c);
    o.scale.setScalar(2 / Math.max(s.x, s.y, s.z));
    o.position.y -= 0.05; // nudge so the whole head centres, a hint of shoulder below

    const clay = new THREE.MeshStandardMaterial({ color: '#c6a089', roughness: 0.72, metalness: 0 });
    o.traverse((m) => {
      const mesh = m as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.geometry.computeVertexNormals();
        mesh.material = clay;
        mesh.castShadow = true;
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
      style={{ width: '100%', height: '100%', background: 'transparent', cursor: 'grab' }}
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[2, 2.5, 3]} intensity={1.15} />
      <directionalLight position={[-3, 1, -2]} intensity={0.4} />
      <directionalLight position={[0, 1, -3]} intensity={0.5} />
      <Suspense fallback={null}>
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
