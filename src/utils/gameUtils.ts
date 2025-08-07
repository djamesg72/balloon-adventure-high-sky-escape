/**
 * Utility functions for game mathematics and animations
 */

// Easing functions for smooth animations
export const Easing = {
  linear: (t: number): number => t,
  easeInQuad: (t: number): number => t * t,
  easeOutQuad: (t: number): number => t * (2 - t),
  easeInOutQuad: (t: number): number => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  easeInCubic: (t: number): number => t * t * t,
  easeOutCubic: (t: number): number => (--t) * t * t + 1,
  easeInOutCubic: (t: number): number => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  bounce: (t: number): number => {
    if (t < 1 / 2.75) {
      return 7.5625 * t * t
    } else if (t < 2 / 2.75) {
      return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75
    } else if (t < 2.5 / 2.75) {
      return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375
    } else {
      return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375
    }
  }
}

// Risk calculation functions
export class RiskCalculator {
  /**
   * Calculate risk level based on time elapsed
   */
  static calculateRiskLevel(timeElapsed: number, minSafeTime: number, maxTime: number): number {
    if (timeElapsed < minSafeTime) return 0
    const riskTime = timeElapsed - minSafeTime
    const maxRiskTime = maxTime - minSafeTime
    return Math.min(1, riskTime / maxRiskTime)
  }

  /**
   * Calculate crash probability at given time
   */
  static calculateCrashProbability(timeElapsed: number, minSafeTime: number, maxTime: number): number {
    const riskLevel = this.calculateRiskLevel(timeElapsed, minSafeTime, maxTime)
    return Math.pow(riskLevel, 2) * 0.8 // Exponential increase, max 80%
  }

  /**
   * Generate random crash time within bounds
   */
  static generateCrashTime(minSafeTime: number, maxTime: number): number {
    // Use exponential distribution favoring earlier crashes after safe period
    const safeBuffer = minSafeTime
    const dangerPeriod = maxTime - minSafeTime
    
    // Random value between 0 and 1
    const random = Math.random()
    
    // Exponential distribution (adjust lambda for steepness)
    const lambda = 2.0
    const exponentialRandom = -Math.log(1 - random) / lambda
    
    // Normalize to danger period
    const normalizedTime = Math.min(1, exponentialRandom / 3) // Scale to reasonable range
    
    return safeBuffer + normalizedTime * dangerPeriod
  }
}

// Score calculation utilities
export class ScoreCalculator {
  /**
   * Calculate score based on time and altitude
   */
  static calculateScore(
    timeElapsed: number, 
    altitude: number, 
    pointsPerSecond: number, 
    heightMultiplier: number
  ): number {
    const timeBonus = (timeElapsed / 1000) * pointsPerSecond
    const heightBonus = altitude * heightMultiplier
    return Math.floor(timeBonus + heightBonus)
  }

  /**
   * Calculate multiplier based on risk level
   */
  static calculateMultiplier(riskLevel: number, baseMultiplier: number = 1): number {
    return baseMultiplier + (riskLevel * 2) // Up to 3x multiplier at maximum risk
  }

  /**
   * Calculate final score with landing bonus
   */
  static calculateFinalScore(
    baseScore: number, 
    multiplier: number, 
    landingBonus: number = 0
  ): number {
    return Math.floor(baseScore * multiplier + landingBonus)
  }
}

// Animation utilities
export class AnimationUtils {
  /**
   * Create a smooth sway animation value
   */
  static calculateSway(time: number, amplitude: number, frequency: number): number {
    return Math.sin(time * frequency) * amplitude
  }

  /**
   * Interpolate between two values
   */
  static lerp(from: number, to: number, progress: number): number {
    return from + (to - from) * progress
  }

  /**
   * Clamp value between min and max
   */
  static clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max)
  }

  /**
   * Convert time to progress (0-1)
   */
  static timeToProgress(elapsed: number, duration: number): number {
    return Math.min(1, elapsed / duration)
  }

  /**
   * Calculate shake offset for tension effect
   */
  static calculateShake(intensity: number): { x: number; y: number } {
    return {
      x: (Math.random() - 0.5) * intensity,
      y: (Math.random() - 0.5) * intensity
    }
  }
}

// Color utilities
export class ColorUtils {
  /**
   * Interpolate between two colors
   */
  static interpolateColor(color1: number, color2: number, progress: number): number {
    const r1 = (color1 >> 16) & 0xFF
    const g1 = (color1 >> 8) & 0xFF
    const b1 = color1 & 0xFF

    const r2 = (color2 >> 16) & 0xFF
    const g2 = (color2 >> 8) & 0xFF
    const b2 = color2 & 0xFF

    const r = Math.floor(r1 + (r2 - r1) * progress)
    const g = Math.floor(g1 + (g2 - g1) * progress)
    const b = Math.floor(b1 + (b2 - b1) * progress)

    return (r << 16) | (g << 8) | b
  }

  /**
   * Get risk color based on level (0-1)
   */
  static getRiskColor(riskLevel: number): number {
    if (riskLevel < 0.3) return 0x4CAF50 // Green
    if (riskLevel < 0.6) return 0xFF9800 // Orange
    if (riskLevel < 0.8) return 0xFF5722 // Red-Orange
    return 0xF44336 // Red
  }

  /**
   * Create a color from HSL values
   */
  static hslToHex(h: number, s: number, l: number): number {
    l /= 100
    const a = s * Math.min(l, 1 - l) / 100
    const f = (n: number) => {
      const k = (n + h / 30) % 12
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
      return Math.round(255 * color)
    }
    
    const r = f(0)
    const g = f(8)
    const b = f(4)
    
    return (r << 16) | (g << 8) | b
  }
}

// Particle system utilities
export class ParticleUtils {
  /**
   * Create explosion particles
   */
  static createExplosionParticles(
    centerX: number, 
    centerY: number, 
    count: number = 10,
    color: number = 0xFF6B6B
  ) {
    const particles = []
    
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5
      const speed = 3 + Math.random() * 4
      const life = 60 + Math.random() * 30 // 1-1.5 seconds at 60fps
      
      particles.push({
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: life,
        maxLife: life,
        color: color,
        size: 2 + Math.random() * 4
      })
    }
    
    return particles
  }

  /**
   * Create landing particles (confetti)
   */
  static createLandingParticles(
    centerX: number, 
    centerY: number, 
    count: number = 15
  ) {
    const particles = []
    const colors = [0xFFD700, 0xFF6B6B, 0x4CAF50, 0x2196F3, 0xFF9800]
    
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = 2 + Math.random() * 3
      const life = 120 + Math.random() * 60 // 2-3 seconds
      
      particles.push({
        x: centerX + (Math.random() - 0.5) * 40,
        y: centerY + (Math.random() - 0.5) * 20,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2, // Slight upward bias
        life: life,
        maxLife: life,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 3 + Math.random() * 3
      })
    }
    
    return particles
  }
}

// Device and input utilities
export class DeviceUtils {
  /**
   * Check if device is mobile
   */
  static isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }

  /**
   * Check if device supports touch
   */
  static isTouchDevice(): boolean {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0
  }

  /**
   * Get device pixel ratio
   */
  static getPixelRatio(): number {
    return window.devicePixelRatio || 1
  }

  /**
   * Calculate optimal canvas size for device
   */
  static getOptimalCanvasSize(containerWidth: number, containerHeight: number) {
    const ratio = DeviceUtils.getPixelRatio()
    const isMobile = DeviceUtils.isMobile()
    
    // Scale down for mobile devices to improve performance
    const scale = isMobile ? Math.min(ratio, 2) : ratio
    
    return {
      width: Math.floor(containerWidth * scale),
      height: Math.floor(containerHeight * scale),
      scale: scale
    }
  }
}
