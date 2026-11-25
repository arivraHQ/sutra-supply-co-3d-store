export const COLORS = {
  bg: "#E8E4DA", // store wall
  ink: "#151515",
  accent: "#FF4B1F", // signal orange
  rod: "#9C9C98", // steel
  hanger: "#B58B5A", // wood
  muted: "#7A776F",
} as const;

export const TEE_PALETTE = {
  "off-white": {
    id: "off-white",
    name: "Off-White",
    hex: "#F1EDE4",
  },
  black: {
    id: "black",
    name: "Pitch Black",
    hex: "#1B1B1B",
  },
  olive: {
    id: "olive",
    name: "Army Olive",
    hex: "#5E6340",
  },
  rust: {
    id: "rust",
    name: "Brick Rust",
    hex: "#A2482A",
  },
  sand: {
    id: "sand",
    name: "Raw Sand",
    hex: "#CDB892",
  },
  "ash-grey": {
    id: "ash-grey",
    name: "Ash Grey",
    hex: "#A7A8A4",
  },
} as const;

export type TeeColorId = keyof typeof TEE_PALETTE;

export const MOTION = {
  ease: [0.65, 0, 0.35, 1] as const,
  durationMs: 650,
  durationSec: 0.65,
  pullForwardMs: 600,
} as const;
