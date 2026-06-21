export const duration = {
  micro: 150,
  quick: 200,
  normal: 300,
  modal: 250,
  slow: 400,
  splash: 1000,
};

export const easing = {
  standard: [0.4, 0.0, 0.2, 1] as const,
  decelerate: [0.0, 0.0, 0.2, 1] as const,
  accelerate: [0.4, 0.0, 1.0, 1] as const,
  emphasis: [0.2, 0.0, 0.0, 1] as const,
};

export const spring = {
  gentle: { damping: 20, stiffness: 150, mass: 1 },
  snappy: { damping: 14, stiffness: 200, mass: 0.6 },
  smooth: { damping: 18, stiffness: 180, mass: 0.8 },
};

export const motion = {
  pressedScale: 0.97,
  pressedOpacity: 0.85,
  rippleDuration: duration.micro,
};
