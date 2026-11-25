"use client";

import * as THREE from "three";
import { useEffect, useMemo } from "react";
import { COLORS } from "@/tokens/theme";

export function WoodenHanger() {
  const hookGeo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -0.14, 0),
      new THREE.Vector3(0, -0.06, 0),
      new THREE.Vector3(0.03, 0.015, 0),
      new THREE.Vector3(0, 0.048, 0),
      new THREE.Vector3(-0.036, 0.018, 0),
      new THREE.Vector3(-0.032, -0.018, 0),
    ]);
    return new THREE.TubeGeometry(curve, 24, 0.0085, 8, false);
  }, []);

  useEffect(() => {
    return () => {
      hookGeo.dispose();
    };
  }, [hookGeo]);

  return (
    <group>
      {/* Steel hook wrapping around the rail */}
      <mesh geometry={hookGeo}>
        <meshStandardMaterial
          color={COLORS.rod}
          metalness={0.78}
          roughness={0.26}
        />
      </mesh>

      {/* Center wooden collar block */}
      <mesh position={[0, -0.145, 0]}>
        <boxGeometry args={[0.075, 0.048, 0.036]} />
        <meshStandardMaterial
          color={COLORS.hanger}
          roughness={0.62}
          metalness={0.04}
        />
      </mesh>

      {/* Left angled wooden shoulder arm */}
      <mesh position={[-0.195, -0.195, 0]} rotation={[0, 0, 0.25]}>
        <boxGeometry args={[0.38, 0.03, 0.026]} />
        <meshStandardMaterial
          color={COLORS.hanger}
          roughness={0.62}
          metalness={0.04}
        />
      </mesh>

      {/* Right angled wooden shoulder arm */}
      <mesh position={[0.195, -0.195, 0]} rotation={[0, 0, -0.25]}>
        <boxGeometry args={[0.38, 0.03, 0.026]} />
        <meshStandardMaterial
          color={COLORS.hanger}
          roughness={0.62}
          metalness={0.04}
        />
      </mesh>
    </group>
  );
}
