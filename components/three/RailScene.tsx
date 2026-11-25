"use client";

import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { easing } from "maath";
import { COLORS, type TeeColorId } from "@/tokens/theme";
import { getColorHex, type Product } from "@/content/site";
import { Tee } from "./Tee";
import { WoodenHanger } from "./WoodenHanger";

const ROD_Y = 0.86;
const SIDE_RAD = (85 * Math.PI) / 180;

let cachedWallShadow: THREE.CanvasTexture | null = null;
function getWallShadowTexture(): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  if (cachedWallShadow) return cachedWallShadow;

  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const grad = ctx.createRadialGradient(128, 128, 12, 128, 128, 124);
  grad.addColorStop(0, "rgba(21, 21, 21, 0.26)");
  grad.addColorStop(0.55, "rgba(21, 21, 21, 0.09)");
  grad.addColorStop(1, "rgba(21, 21, 21, 0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  const tex = new THREE.CanvasTexture(canvas);
  cachedWallShadow = tex;
  return tex;
}

function smoothstep01(t: number): number {
  const c = THREE.MathUtils.clamp(t, 0, 1);
  return c * c * (3 - 2 * c);
}

interface RailSceneProps {
  products: Product[];
  targetProgressRef: React.MutableRefObject<number>;
  isDraggingRef: React.MutableRefObject<boolean>;
  activeColorOverrides: Record<string, TeeColorId>;
  activeIndex: number;
  pullingSlug: string | null;
  reducedMotion: boolean;
  onActiveIndexChange: (idx: number) => void;
  onSelectTee: (index: number) => void;
}

function ResponsiveCamera() {
  const { camera, size } = useThree();
  useFrame(() => {
    const aspect = size.width / Math.max(size.height, 1);
    const targetZ = aspect < 0.75 ? 7.6 : aspect < 1.1 ? 6.8 : 6.1;
    const targetY = aspect < 0.75 ? 0.16 : 0.28;
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.15);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.15);
    camera.lookAt(0, -0.02, 0);
  });
  return null;
}

function RailRig({
  products,
  targetProgressRef,
  isDraggingRef,
  activeColorOverrides,
  activeIndex,
  pullingSlug,
  reducedMotion,
  onActiveIndexChange,
  onSelectTee,
}: RailSceneProps) {
  const progressRef = useRef(0);
  const swingRef = useRef(0);
  const pullRef = useRef(0);
  const lastReportedIdx = useRef(0);
  const slotRefs = useRef<(THREE.Group | null)[]>([]);
  const shadowRefs = useRef<(THREE.Mesh | null)[]>([]);
  const wallShadowTex = useMemo(() => getWallShadowTexture(), []);

  // Reset progress cleanly when product list changes (e.g. filter chips)
  useEffect(() => {
    progressRef.current = 0;
    targetProgressRef.current = 0;
    lastReportedIdx.current = 0;
    swingRef.current = 0;
  }, [products, targetProgressRef]);

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const maxIdx = Math.max(0, products.length - 1);

    // Clamp target
    const clampedTarget = THREE.MathUtils.clamp(
      targetProgressRef.current,
      0,
      maxIdx,
    );

    // On pointer release, snap target to nearest integer
    const effectiveTarget = isDraggingRef.current
      ? clampedTarget
      : Math.round(clampedTarget);
    if (!isDraggingRef.current) {
      targetProgressRef.current = effectiveTarget;
    }

    const prevP = progressRef.current;
    if (reducedMotion) {
      progressRef.current = effectiveTarget;
    } else {
      easing.damp(
        progressRef,
        "current",
        effectiveTarget,
        isDraggingRef.current ? 0.08 : 0.17,
        delta,
      );
    }

    const p = progressRef.current;
    const velocity = (p - prevP) / Math.max(delta, 0.001);

    // Pendulum swing on hangers proportional to velocity
    const targetSwing = reducedMotion
      ? 0
      : THREE.MathUtils.clamp(-velocity * 0.055, -0.22, 0.22);
    easing.damp(swingRef, "current", targetSwing, 0.14, delta);

    // Pull-forward click transition (0 -> 1 over 600ms)
    const pullTarget = pullingSlug ? 1 : 0;
    easing.damp(pullRef, "current", pullTarget, 0.16, delta);
    const pull = pullRef.current;

    // Notify React UI only when rounded integer slot changes
    const rounded = THREE.MathUtils.clamp(Math.round(p), 0, maxIdx);
    if (rounded !== lastReportedIdx.current) {
      lastReportedIdx.current = rounded;
      onActiveIndexChange(rounded);
    }

    // Position every tee on the rail
    for (let i = 0; i < products.length; i++) {
      const group = slotRefs.current[i];
      if (!group) continue;

      const d = i - p;
      const absD = Math.abs(d);
      const t = smoothstep01(absD);
      const sign = d === 0 ? 0 : Math.sign(d);

      // X compression: right stacks at 1.2 + (d-1)*0.3; left at -1.2 - (|d|-1)*0.3
      let x = 0;
      if (absD <= 1) {
        x = sign * 1.2 * t;
      } else if (d > 1) {
        x = 1.2 + (d - 1) * 0.3;
      } else {
        x = -1.2 - (absD - 1) * 0.3;
      }

      const rotY = -sign * t * SIDE_RAD;
      const scale = 1 - 0.06 * t;
      const z = -0.24 * t;

      // Apply 600ms pull-forward when clicking the active front tee
      const isPullingTarget = pullingSlug === products[i].slug;
      const finalX = isPullingTarget
        ? x
        : x + sign * pull * 1.6;
      const finalZ = isPullingTarget ? z + pull * 1.35 : z - pull * 0.4;
      const finalScale = isPullingTarget ? scale * (1 + pull * 0.18) : scale;

      group.position.set(finalX, ROD_Y, finalZ);
      group.rotation.set(0, rotY, swingRef.current * (1 - 0.35 * t));
      group.scale.setScalar(finalScale);

      // Update fake wall shadow behind tee
      const shadow = shadowRefs.current[i];
      if (shadow) {
        shadow.position.set(finalX * 0.96, 0.05, -0.58);
        shadow.scale.set(
          (1.15 - 0.35 * t) * finalScale,
          1.85 * finalScale,
          1,
        );
        const shadowMat = shadow.material as THREE.MeshBasicMaterial;
        const leftFade =
          d < -1 ? THREE.MathUtils.clamp(1 - (-d - 1.1) / 1.8, 0, 1) : 1;
        shadowMat.opacity = (1 - 0.35 * t) * leftFade * (1 - pull * 0.7);
      }
    }
  });

  return (
    <group>
      <ResponsiveCamera />

      {/* Soft studio lighting — zero real-time shadow maps, zero external HDR */}
      <ambientLight intensity={0.75} color="#F7F4EC" />
      <directionalLight position={[2.8, 3.6, 4.2]} intensity={1.15} color="#FFFBF4" />
      <directionalLight position={[-3.5, 1.4, -2.5]} intensity={0.65} color="#E6E1D6" />

      <Environment resolution={128}>
        <Lightformer
          form="rect"
          intensity={1.6}
          color="#FFFDF8"
          scale={[6, 2, 1]}
          position={[0, 3.2, 2]}
          rotation={[Math.PI / 3, 0, 0]}
        />
        <Lightformer
          form="rect"
          intensity={1.1}
          color="#EAE4D8"
          scale={[3, 4, 1]}
          position={[-4, 0.5, 1.5]}
          rotation={[0, Math.PI / 2.2, 0]}
        />
        <Lightformer
          form="rect"
          intensity={0.9}
          color="#FFFFFF"
          scale={[3, 4, 1]}
          position={[4, 0.8, 1]}
          rotation={[0, -Math.PI / 2.2, 0]}
        />
      </Environment>

      {/* Horizontal steel clothing rod + ceiling drop brackets */}
      <group>
        <mesh position={[0, ROD_Y, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.022, 0.022, 9.6, 20]} />
          <meshStandardMaterial
            color={COLORS.rod}
            metalness={0.82}
            roughness={0.24}
          />
        </mesh>

        {/* Left & Right ceiling suspension drop rods */}
        {[-2.35, 2.35].map((rx) => (
          <group key={rx} position={[rx, ROD_Y, 0]}>
            <mesh position={[0, 0.75, 0]}>
              <cylinderGeometry args={[0.011, 0.011, 1.5, 12]} />
              <meshStandardMaterial
                color={COLORS.rod}
                metalness={0.8}
                roughness={0.28}
              />
            </mesh>
            <mesh>
              <cylinderGeometry args={[0.036, 0.036, 0.065, 16]} />
              <meshStandardMaterial
                color={COLORS.ink}
                metalness={0.3}
                roughness={0.5}
              />
            </mesh>
          </group>
        ))}
      </group>

      {/* Tees + hangers + fake radial wall shadows */}
      {products.map((product, i) => {
        const d = i - activeIndex;
        const leftFade =
          d < -1 ? THREE.MathUtils.clamp(1 - (-d - 1.1) / 1.8, 0.12, 1) : 1;
        const colorId = activeColorOverrides[product.id] ?? product.defaultColor;
        const hex = getColorHex(colorId);

        return (
          <group key={product.id}>
            {wallShadowTex && (
              <mesh
                ref={(el) => {
                  shadowRefs.current[i] = el;
                }}
                position={[0, 0.05, -0.58]}
              >
                <planeGeometry args={[1.1, 1.1]} />
                <meshBasicMaterial
                  map={wallShadowTex}
                  transparent
                  depthWrite={false}
                  opacity={0.75}
                />
              </mesh>
            )}

            <group
              ref={(el) => {
                slotRefs.current[i] = el;
              }}
              position={[i * 1.2, ROD_Y, 0]}
              onClick={(e) => {
                e.stopPropagation();
                onSelectTee(i);
              }}
              onPointerOver={(e) => {
                e.stopPropagation();
                document.body.style.cursor = "pointer";
              }}
              onPointerOut={() => {
                document.body.style.cursor = "auto";
              }}
            >
              <WoodenHanger />
              <group position={[0, -0.01, 0]}>
                <Tee
                  color={hex}
                  fit={product.fit}
                  hasPocket={product.hasPocket}
                  graphicText={product.graphicText}
                  opacity={leftFade}
                />
              </group>
            </group>
          </group>
        );
      })}
    </group>
  );
}

export function RailScene(props: RailSceneProps) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ fov: 30, position: [0, 0.28, 6.1], near: 0.1, far: 30 }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
      }}
    >
      <RailRig {...props} />
    </Canvas>
  );
}
