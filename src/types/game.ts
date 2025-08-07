// Game Types
export interface GameConfig {
  width: number
  height: number
  balloon: BalloonConfig
  risk: RiskConfig
  scoring: ScoringConfig
  clouds: CloudConfig
}

export interface BalloonConfig {
  initialY: number
  speed: number
  maxSpeed: number
  acceleration: number
  swayAmplitude: number
  swaySpeed: number
  radius: number
}

export interface RiskConfig {
  minSafeTime: number
  maxTime: number
  baseRiskMultiplier: number
  riskIncreaseRate: number
}

export interface ScoringConfig {
  pointsPerSecond: number
  heightMultiplier: number
  landingBonus: number
}

export interface CloudConfig {
  count: number
  speedVariation: number
  alphaRange: [number, number]
  scaleRange: [number, number]
}

// Game Events
export interface GameEvents {
  onGameStateChange?: (state: GameState) => void
  onScoreUpdate?: (score: number, multiplier: number, altitude: number) => void
  onRiskUpdate?: (riskLevel: number) => void
  onCrash?: (finalScore: number) => void
  onLand?: (finalScore: number) => void
}

// Game State
export enum GameState {
  WAITING = 'waiting',
  PLAYING = 'playing',
  LANDED = 'landed',
  CRASHED = 'crashed'
}

// Sound Effects
export interface SoundEffects {
  wind?: HTMLAudioElement
  pop?: HTMLAudioElement
  land?: HTMLAudioElement
  start?: HTMLAudioElement
}

// Particle System
export interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  color: number
  size: number
}

// Animation Tweens
export interface Tween {
  target: any
  property: string
  from: number
  to: number
  duration: number
  elapsed: number
  easing?: (t: number) => number
  onComplete?: () => void
}

// Game Statistics
export interface GameStats {
  gamesPlayed: number
  highScore: number
  totalTimePlayed: number
  successfulLandings: number
  crashes: number
  averageScore: number
}
