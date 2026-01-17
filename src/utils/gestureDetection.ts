import { NormalizedLandmarkList } from '@mediapipe/hands';

export type GestureType =
  | 'index_finger_up'
  | 'palms_facing'
  | 'hands_moving_apart'
  | 'fingertips_touch'
  | 'unknown';

interface HandLandmarks {
  left?: NormalizedLandmarkList;
  right?: NormalizedLandmarkList;
}

function getDistance(
  p1: { x: number; y: number; z: number },
  p2: { x: number; y: number; z: number }
): number {
  return Math.sqrt(
    Math.pow(p1.x - p2.x, 2) +
      Math.pow(p1.y - p2.y, 2) +
      Math.pow(p1.z - p2.z, 2)
  );
}

function getHandScale(hand: NormalizedLandmarkList): number {
  // Wrist (0) to MCP of middle finger (9) for hand scale
  return getDistance(hand[0], hand[9]);
}

function isFingerExtended(
  landmarks: NormalizedLandmarkList,
  tip: number,
  pip: number,
  mcp: number
): boolean {
  return (
    landmarks[tip].y < landmarks[pip].y && landmarks[pip].y < landmarks[mcp].y
  );
}

export function detectIndexFingerUp(landmarks: HandLandmarks): boolean {
  const hand = landmarks.right || landmarks.left;
  if (!hand) return false;
  const indexExtended = isFingerExtended(hand, 8, 6, 5);
  const othersDown =
    hand[12].y > hand[10].y &&
    hand[16].y > hand[14].y &&
    hand[20].y > hand[18].y;
  return indexExtended && othersDown;
}

export function detectPalmsFacing(landmarks: HandLandmarks): boolean {
  const { left, right } = landmarks;
  if (!left || !right) return false;
  const leftPalmFlat = Math.abs(left[8].z - left[0].z) < 0.15;
  const rightPalmFlat = Math.abs(right[8].z - right[0].z) < 0.15;
  return leftPalmFlat && rightPalmFlat && getDistance(left[0], right[0]) < 0.5;
}

export function detectHandsMovingApart(landmarks: HandLandmarks): boolean {
  const { left, right } = landmarks;
  if (!left || !right) return false;
  return getDistance(left[0], right[0]) > 0.35;
}

export function detectFingertipsTouch(landmarks: HandLandmarks): boolean {
  const { left, right } = landmarks;
  if (!left || !right) return false;

  // Calculate distance between index fingertips
  const rawDistance = getDistance(left[8], right[8]);

  // Calculate hand scale for each hand and use the smaller one
  const leftScale = getHandScale(left);
  const rightScale = getHandScale(right);
  const minHandScale = Math.min(leftScale, rightScale);

  // If hands are too far apart, don't even check
  const handCenterDistance = getDistance(left[0], right[0]);
  if (handCenterDistance > 0.5) return false;

  // Normalize by hand scale - use 0.15 threshold for better sensitivity
  return rawDistance / minHandScale < 0.15;
}

export function detectGesture(landmarks: HandLandmarks): GestureType {
  if (detectIndexFingerUp(landmarks)) return 'index_finger_up';
  if (detectFingertipsTouch(landmarks)) return 'fingertips_touch';
  if (detectHandsMovingApart(landmarks)) return 'hands_moving_apart';
  if (detectPalmsFacing(landmarks)) return 'palms_facing';
  return 'unknown';
}
