'use client';

import { useMemo, useRef } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

/* A small, realistic 3D head. The generated bust (Hunyuan3D) is textured by
   planar-projecting the real portrait onto its front — so it looks like the
   actual photo — then given a gentle idle sway + pointer parallax. The sway is
   kept shallow so the view stays near the front, where the projection is
   accurate (the turned-away side stretches). */

const MODEL = '/head/head.glb';
const TEXTURE = '/head/head-tex.jpg';
const INSET = 0.94; // sample slightly inside the photo so silhouettes stay clean

function Head() {
  const group = useRef<THREE.Group>(null);
  const gltf = useGLTF(MODEL, true);
  const tex = useLoader(THREE.TextureLoader, TEXTURE);
  tex.colorSpace = THREE.SRGBColorSpace;

  const object = useMemo(() => {
    const o = gltf.scene.clone(true);
    const box = new THREE.Box3().setFromObject(o);
    const c = box.getCenter(new THREE.Vector3());
    const s = box.getSize(new THREE.Vector3());
    o.position.sub(c);
    o.scale.setScalar(2 / Math.max(s.x, s.y, s.z));
    o.position.y -= 0.05;

    const mat = new THREE.MeshBasicMaterial({ map: tex });
    o.traverse((m) => {
      const mesh = m as THREE.Mesh;
      if (!mesh.isMesh) return;
      const geo = mesh.geometry;
      geo.computeBoundingBox();
      const bb = geo.boundingBox!;
      const minX = bb.min.x;
      const minY = bb.min.y;
      const W = bb.max.x - bb.min.x;
      const H = bb.max.y - bb.min.y;
      const pos = geo.attributes.position;
      const uv = new Float32Array(pos.count * 2);
      for (let i = 0; i < pos.count; i++) {
        const u = ((pos.getX(i) - minX) / W - 0.5) / INSET + 0.5;
        const v = ((pos.getY(i) - minY) / H - 0.5) / INSET + 0.5;
        uv[i * 2] = 1 - u; // flip to match the front-facing photo
        uv[i * 2 + 1] = v;
      }
      geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
      mesh.material = mat;
    });
    return o;
  }, [gltf, tex]);

  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const targetY = Math.sin(t * 0.4) * 0.2 + state.pointer.x * 0.16;
    const targetX = Math.cos(t * 0.33) * 0.03 - state.pointer.y * 0.08;
    g.rotation.y += (targetY - g.rotation.y) * 0.05;
    g.rotation.x += (targetX - g.rotation.x) * 0.05;
  });

  return <primitive ref={group} object={object} />;
}

useGLTF.preload(MODEL);

export default function HeadModel({ animate = true }: { animate?: boolean }) {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, 0, 4.0], fov: 28 }}
      frameloop={animate ? 'always' : 'demand'}
      style={{ width: '100%', height: '100%', background: 'transparent' }}
    >
      <Head />
    </Canvas>
  );
}
