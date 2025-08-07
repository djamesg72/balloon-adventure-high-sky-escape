export enum GameState {
  WAITING = 'waiting',
  PLAYING = 'playing',
  LANDED = 'landed',
  CRASHED = 'crashed'
}

export interface GameConfig {
  width: number
  height: number
  balloon: {
    radius: number
    initialY: number
    speed: number
    maxSpeed: number
    acceleration: number
    swayAmplitude: number
    swaySpeed: number
  }
  risk: {
    minSafeTime: number
    maxTime: number
    baseRiskMultiplier: number
  }
  scoring: {
    pointsPerSecond: number
    heightMultiplier: number
  }
}

export interface GameCallbacks {
  onScoreUpdate?: (score: number, multiplier: number) => void
  onGameStateChange?: (state: GameState) => void
  onCrash?: (finalScore: number) => void
  onLand?: (finalScore: number) => void
}
