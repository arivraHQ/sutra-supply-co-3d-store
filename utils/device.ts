/**
 * Determines whether the device lacks WebGL or has severely constrained hardware
 * (<= 2 CPU cores or <= 2 GB RAM) and should render the 2D fallback UI.
 * Avoids triggering on 4 GB / 4-core devices because mobile browsers commonly
 * clamp navigator.deviceMemory to 4 for privacy.
 */
export function shouldUse2DFallback(): boolean {
  if (typeof navigator === "undefined") return false;

  const cores = navigator.hardwareConcurrency ?? 8;
  const mem =
    (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;

  if (cores <= 2 || mem <= 2) return true;

  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");
    return !gl;
  } catch {
    return true;
  }
}
