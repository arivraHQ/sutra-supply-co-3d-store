"use client";

import * as THREE from "three";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Decal, Environment, Lightformer, OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { COLORS } from "@/tokens/theme";
import type { TeeFit } from "@/content/site";
import type { PrintPlacement } from "@/store/cart";
import { Tee } from "./Tee";

export type CameraPreset = "front" | "back" | "detail";

export interface ProductSceneHandle {
  captureThumbnail: () => string | undefined;
}

export interface ProductSceneProps {
  colorHex: string;
  fit: TeeFit;
  hasPocket?: boolean;
  graphicText?: string;
  cameraPreset: CameraPreset;
  presetVersion: number;
  hasInteracted: boolean;
  reducedMotion: boolean;
  onUserInteract: () => void;
  decalTexture: THREE.Texture | null;
  placement: PrintPlacement;
  offsetX: number;
  offsetY: number;
  decalScale: number;
  decalRotationDeg: number;
}

const PRESET_VIEWS: Record<
  CameraPreset,
  { pos: [number, number, number]; target: [number, number, number] }
> = {
  front: { pos: [0, -0.25, 3.25], target: [0, -0.64, 0] },
  back: { pos: [0, -0.25, -3.25], target: [0, -0.64, 0] },
  detail: { pos: [0.16, -0.36, 2.05], target: [0.04, -0.54, 0] },
};

const PLACEMENT_ANCHORS: Record<
  PrintPlacement,
  { x: number; y: number; z: number; baseScale: number; isBack: boolean }
> = {
  "left-chest": { x: 0.072, y: 0.085, z: 0.125, baseScale: 0.078, isBack: false },
  "center-chest": { x: 0, y: 0.04, z: 0.135, baseScale: 0.16, isBack: false },
  back: { x: 0, y: 0.04, z: -0.12, baseScale: 0.185, isBack: true },
};

let cachedBackdropShadow: THREE.CanvasTexture | null = null;
function getBackdropShadow(): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  if (cachedBackdropShadow) return cachedBackdropShadow;
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const grad = ctx.createRadialGradient(128, 128, 10, 128, 128, 122);
  grad.addColorStop(0, "rgba(21, 21, 21, 0.22)");
  grad.addColorStop(0.55, "rgba(21, 21, 21, 0.08)");
  grad.addColorStop(1, "rgba(21, 21, 21, 0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);
  cachedBackdropShadow = new THREE.CanvasTexture(canvas);
  return cachedBackdropShadow;
}

function ProductStage({
  colorHex,
  fit,
  hasPocket,
  graphicText,
  cameraPreset,
  presetVersion,
  hasInteracted,
  reducedMotion,
  onUserInteract,
  decalTexture,
  placement,
  offsetX,
  offsetY,
  decalScale,
  decalRotationDeg,
  captureRef,
}: ProductSceneProps & {
  captureRef: React.MutableRefObject<(() => string | undefined) | null>;
}) {
  const { camera, gl, scene, size, invalidate } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const teeGroupRef = useRef<THREE.Group>(null);
  const isTransitioningRef = useRef(false);
  const currentColorRef = useRef(new THREE.Color(colorHex));
  const targetColor = useMemo(() => new THREE.Color(colorHex), [colorHex]);
  const backdropShadow = useMemo(() => getBackdropShadow(), []);

  // Trigger camera preset lerp whenever preset or presetVersion updates
  useEffect(() => {
    isTransitioningRef.current = true;
    invalidate();
  }, [cameraPreset, presetVersion, invalidate]);

  // Trigger demand frames when color or decal properties change
  useEffect(() => {
    invalidate();
  }, [
    colorHex,
    fit,
    decalTexture,
    placement,
    offsetX,
    offsetY,
    decalScale,
    decalRotationDeg,
    invalidate,
  ]);

  // Register thumbnail snapshot capture function
  useEffect(() => {
    captureRef.current = () => {
      try {
        gl.render(scene, camera);
        const srcCanvas = gl.domElement;
        const thumb = document.createElement("canvas");
        thumb.width = 160;
        thumb.height = 160;
        const ctx = thumb.getContext("2d");
        if (!ctx) return undefined;
        ctx.fillStyle = COLORS.bg;
        ctx.fillRect(0, 0, 160, 160);
        const aspect = srcCanvas.width / Math.max(srcCanvas.height, 1);
        const drawW = aspect >= 1 ? 160 : 160 * aspect;
        const drawH = aspect >= 1 ? 160 / aspect : 160;
        ctx.drawImage(
          srcCanvas,
          (160 - drawW) / 2,
          (160 - drawH) / 2,
          drawW,
          drawH,
        );
        return thumb.toDataURL("image/png", 0.82);
      } catch {
        return undefined;
      }
    };
    return () => {
      captureRef.current = null;
    };
  }, [camera, captureRef, gl, scene]);

  // Gentle idle rotation using frameloop="demand" that stops permanently on interaction
  useEffect(() => {
    if (hasInteracted || reducedMotion) return;
    let rafId = 0;
    let lastTime = performance.now();
    const tick = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      if (teeGroupRef.current) {
        teeGroupRef.current.rotation.y += dt * 0.22;
        invalidate();
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [hasInteracted, reducedMotion, invalidate]);

  // Reset tee rotation when user clicks a camera preset
  useEffect(() => {
    if (teeGroupRef.current && hasInteracted) {
      teeGroupRef.current.rotation.y = 0;
    }
  }, [cameraPreset, presetVersion, hasInteracted]);

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    let needsAnotherFrame = false;

    // Smooth color lerp check to keep demand loop awake only while lerping
    const colorDist =
      Math.abs(currentColorRef.current.r - targetColor.r) +
      Math.abs(currentColorRef.current.g - targetColor.g) +
      Math.abs(currentColorRef.current.b - targetColor.b);
    if (colorDist > 0.002) {
      currentColorRef.current.lerp(targetColor, Math.min(1, delta * 8));
      needsAnotherFrame = true;
    }

    // Camera preset transition (pulls slightly further back on narrow mobile viewports)
    if (isTransitioningRef.current && controlsRef.current) {
      const view = PRESET_VIEWS[cameraPreset];
      const aspect = size.width / Math.max(size.height, 1);
      const mobileScale = aspect < 0.9 ? 1.24 : 1;
      const desiredPos = new THREE.Vector3(
        view.pos[0],
        view.pos[1],
        view.pos[2] * mobileScale,
      );
      const desiredTarget = new THREE.Vector3(...view.target);
      const alpha = reducedMotion ? 1 : Math.min(1, delta * 7);

      camera.position.lerp(desiredPos, alpha);
      controlsRef.current.target.lerp(desiredTarget, alpha);
      controlsRef.current.update();

      if (
        camera.position.distanceTo(desiredPos) < 0.015 &&
        controlsRef.current.target.distanceTo(desiredTarget) < 0.015
      ) {
        camera.position.copy(desiredPos);
        controlsRef.current.target.copy(desiredTarget);
        controlsRef.current.update();
        isTransitioningRef.current = false;
      } else {
        needsAnotherFrame = true;
      }
    }

    if (needsAnotherFrame) {
      invalidate();
    }
  });

  const anchor = PLACEMENT_ANCHORS[placement];
  const decalPos: [number, number, number] = [
    anchor.x + offsetX,
    anchor.y + offsetY,
    anchor.z,
  ];
  const decalRot: [number, number, number] = [
    0,
    anchor.isBack ? Math.PI : 0,
    (decalRotationDeg * Math.PI) / 180,
  ];
  const finalScale = anchor.baseScale * decalScale;

  return (
    <>
      <ambientLight intensity={0.78} color="#F7F4EC" />
      <directionalLight position={[2.6, 3.4, 4.0]} intensity={1.15} color="#FFFBF4" />
      <directionalLight position={[-3.2, 1.2, -2.8]} intensity={0.7} color="#E6E1D6" />

      <Environment resolution={128}>
        <Lightformer
          form="rect"
          intensity={1.55}
          color="#FFFDF8"
          scale={[5, 2, 1]}
          position={[0, 3.2, 2]}
          rotation={[Math.PI / 3, 0, 0]}
        />
        <Lightformer
          form="rect"
          intensity={1.05}
          color="#EAE4D8"
          scale={[3, 4, 1]}
          position={[-4, 0.5, 1.5]}
          rotation={[0, Math.PI / 2.2, 0]}
        />
        <Lightformer
          form="rect"
          intensity={0.95}
          color="#FFFFFF"
          scale={[3, 4, 1]}
          position={[4, 0.8, 1]}
          rotation={[0, -Math.PI / 2.2, 0]}
        />
      </Environment>

      {/* Soft fake wall shadow beneath/behind tee */}
      {backdropShadow && (
        <mesh position={[0, -1.65, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.1, 1.5]} />
          <meshBasicMaterial
            map={backdropShadow}
            transparent
            depthWrite={false}
            opacity={0.75}
          />
        </mesh>
      )}

      <group ref={teeGroupRef} position={[0, 0.12, 0]}>
        <Tee
          color={colorHex}
          fit={fit}
          hasPocket={hasPocket}
          graphicText={graphicText}
        >
          {decalTexture && (
            <Decal
              position={decalPos}
              rotation={decalRot}
              scale={[finalScale, finalScale, 0.22]}
              map={decalTexture}
              polygonOffsetFactor={-4}
            />
          )}
        </Tee>
      </group>

      <OrbitControls
        ref={controlsRef}
        target={[0, -0.64, 0]}
        enablePan={false}
        enableDamping
        dampingFactor={0.07}
        minPolarAngle={Math.PI * 0.28}
        maxPolarAngle={Math.PI * 0.68}
        minDistance={1.85}
        maxDistance={4.4}
        onStart={() => {
          isTransitioningRef.current = false;
          onUserInteract();
        }}
      />
    </>
  );
}

export const ProductScene = forwardRef<ProductSceneHandle, ProductSceneProps>(
  function ProductScene(props, ref) {
    const captureRef = useRef<(() => string | undefined) | null>(null);

    useImperativeHandle(ref, () => ({
      captureThumbnail: () => captureRef.current?.(),
    }));

    return (
      <Canvas
        frameloop="demand"
        dpr={[1, 1.75]}
        camera={{ fov: 32, position: [0, -0.25, 3.25], near: 0.1, far: 25 }}
        gl={{
          antialias: true,
          alpha: true,
          preserveDrawingBuffer: true,
          powerPreference: "high-performance",
        }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
        }}
      >
        <ProductStage {...props} captureRef={captureRef} />
      </Canvas>
    );
  },
);
