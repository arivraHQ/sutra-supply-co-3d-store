"use client";

import * as THREE from "three";
import { useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Decal, useGLTF } from "@react-three/drei";
import type { GLTF } from "three-stdlib";
import type { TeeFit } from "@/content/site";

const MODEL_PATH = "/models/tshirt.glb";

type TeeGLTF = GLTF & {
  nodes: {
    T_Shirt_male: THREE.Mesh;
  };
  materials: {
    lambert1: THREE.MeshStandardMaterial;
  };
};

export interface TeeProps {
  color: string;
  fit: TeeFit;
  hasPocket?: boolean;
  graphicText?: string;
  opacity?: number;
  children?: React.ReactNode;
}

function makeGraphicPrintTexture(
  text: string,
  teeHex: string,
): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.clearRect(0, 0, 512, 512);
  const c = new THREE.Color(teeHex);
  const lum = c.r * 0.299 + c.g * 0.587 + c.b * 0.114;
  const inkColor = lum < 0.45 ? "#F1EDE4" : "#151515";

  ctx.strokeStyle = inkColor;
  ctx.lineWidth = 4;
  ctx.strokeRect(52, 92, 408, 256);

  ctx.fillStyle = "#FF4B1F";
  ctx.fillRect(72, 114, 72, 14);

  ctx.fillStyle = inkColor;
  ctx.textAlign = "left";
  ctx.font = "800 42px sans-serif";
  const lines = text.split("\n");
  lines.forEach((line, i) => {
    ctx.fillText(line, 72, 192 + i * 54);
  });

  ctx.font = "500 18px monospace";
  ctx.fillText("240–280 GSM // FAZALGANJ MILL", 72, 316);

  for (let i = 0; i < 500; i++) {
    ctx.fillStyle = "rgba(0,0,0,0.06)";
    ctx.fillRect((i * 73) % 440 + 40, (i * 137) % 280 + 80, 2, 2);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function Tee({
  color,
  fit,
  hasPocket = false,
  graphicText,
  opacity = 1,
  children,
}: TeeProps) {
  const { nodes, materials } = useGLTF(MODEL_PATH) as unknown as TeeGLTF;

  const targetColor = useMemo(() => new THREE.Color(color), [color]);

  // Clone base GLB material per tee instance so each rail tee keeps its own colorway
  const shirtMaterial = useMemo(() => {
    const cloned = materials.lambert1.clone();
    cloned.color = new THREE.Color(color);
    cloned.roughness = 0.88;
    cloned.metalness = 0.0;
    cloned.aoMapIntensity = 0.65;
    cloned.normalScale = new THREE.Vector2(1.15, 1.15);
    cloned.side = THREE.DoubleSide;
    return cloned;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [materials.lambert1]);

  const pocketMaterial = useMemo(() => {
    const cloned = materials.lambert1.clone();
    cloned.color = new THREE.Color(color);
    cloned.roughness = 0.92;
    cloned.metalness = 0.0;
    cloned.aoMapIntensity = 0.55;
    return cloned;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [materials.lambert1]);

  const graphicTex = useMemo(() => {
    if (!graphicText) return null;
    return makeGraphicPrintTexture(graphicText, color);
  }, [graphicText, color]);

  useEffect(() => {
    return () => {
      shirtMaterial.dispose();
      pocketMaterial.dispose();
    };
  }, [shirtMaterial, pocketMaterial]);

  useEffect(() => {
    return () => {
      graphicTex?.dispose();
    };
  }, [graphicTex]);

  useFrame((_, delta) => {
    const step = Math.min(1, delta * 8);
    shirtMaterial.color.lerp(targetColor, step);
    shirtMaterial.transparent = opacity < 0.995;
    shirtMaterial.opacity = opacity;

    pocketMaterial.color.lerp(targetColor, step);
    pocketMaterial.transparent = opacity < 0.995;
    pocketMaterial.opacity = opacity;
  });

  const isOversized = fit === "Oversized";
  const meshScale: [number, number, number] = isOversized
    ? [2.56, 2.48, 2.48]
    : [2.35, 2.38, 2.35];

  return (
    <group position={[0, -0.68, 0]} scale={meshScale}>
      <mesh
        geometry={nodes.T_Shirt_male.geometry}
        material={shirtMaterial}
        dispose={null}
      >
        {graphicTex && (
          <Decal
            position={[0, 0.035, 0.13]}
            rotation={[0, 0, 0]}
            scale={[0.165, 0.165, 0.18]}
            map={graphicTex}
            polygonOffsetFactor={-4}
          />
        )}
        {children}
      </mesh>

      {hasPocket && (
        <mesh
          position={[0.072, 0.082, 0.118]}
          rotation={[-0.08, 0.22, 0]}
          material={pocketMaterial}
        >
          <boxGeometry args={[0.052, 0.06, 0.008]} />
        </mesh>
      )}
    </group>
  );
}

useGLTF.preload(MODEL_PATH);
