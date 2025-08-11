import * as PIXI from 'pixi.js'
import { RiskCalculator } from './RiskCalculator'

export class BalloonController {
  private balloon: PIXI.Container
  private config: any
  private balloonSpeed: number = 0
  private swayOffset: number = 0

  constructor(balloon: PIXI.Container, config: any) {
    this.balloon = balloon
    this.config = config
    this.balloonSpeed = config.balloon.speed
  }

  updatePosition(delta: number, isPlaying: boolean): void {
    if (isPlaying) {
      // Update balloon movement
      this.balloonSpeed = Math.min(
        this.balloonSpeed + this.config.balloon.acceleration * delta,
        this.config.balloon.maxSpeed
      )
      this.balloon.y -= this.balloonSpeed * delta

      // Balloon sway animation
      this.swayOffset += this.config.balloon.swaySpeed * delta
      this.balloon.x = this.config.width / 2 + 
        Math.sin(this.swayOffset) * this.config.balloon.swayAmplitude
    } else {
      // Gentle sway when waiting
      this.swayOffset += this.config.balloon.swaySpeed * delta * 0.5
      this.balloon.x = this.config.width / 2 + 
        Math.sin(this.swayOffset) * (this.config.balloon.swayAmplitude * 0.5)
    }
  }

  updateRiskVisual(multiplier: number): void {
    const riskLevel = RiskCalculator.calculateCrashRisk(multiplier) * 100
    const risk = Math.min(riskLevel, 1)
    
    // With the new balloon structure:
    // [0] = glow (background)
    // [1] = gradient body
    // [2] = segments
    // [3] = highlight
    // [4] = basket
    // [5] = ropes
    // [6] = details
    
    const glow = this.balloon.children[0] as PIXI.Graphics
    const body = this.balloon.children[1] as PIXI.Graphics
    
    if (glow && body) {
      const scale = 0.6
      
      // Clear and redraw glow with risk-based intensity
      glow.clear()
      const glowAlpha = 0.2 + risk * 0.4
      const glowColor = this.getRiskColor(risk)
      glow.beginFill(glowColor, glowAlpha)
      glow.drawEllipse(0, 0, 55 * scale, 65 * scale)
      glow.endFill()
      glow.filters = [new PIXI.filters.BlurFilter(4 + risk * 2)]
      
      // Clear and redraw body with risk-based colors
      body.clear()
      const baseColor = this.getRiskColor(risk)
      
      // Recreate gradient layers with risk colors
      body.beginFill(this.darkenColor(baseColor), 1.0)
      body.drawEllipse(0, 0, 45 * scale, 55 * scale)
      body.endFill()
      
      body.beginFill(baseColor, 0.9)
      body.drawEllipse(0, 0, 40 * scale, 50 * scale)
      body.endFill()
      
      body.beginFill(this.lightenColor(baseColor), 0.8)
      body.drawEllipse(0, 0, 35 * scale, 45 * scale)
      body.endFill()
      
      body.beginFill(this.lightenColor(baseColor, 0.3), 0.7)
      body.drawEllipse(-8 * scale, -8 * scale, 25 * scale, 35 * scale)
      body.endFill()
    }

    // Shake at high risk
    if (risk > 0.7) {
      this.balloon.x += (Math.random() - 0.5) * (risk - 0.7) * 10
    }
  }

  private getRiskColor(risk: number): number {
    // Interpolate from normal red to danger colors based on risk
    if (risk < 0.3) return 0xFF6B6B // Normal red
    if (risk < 0.6) return 0xFF4444 // Orange-red
    if (risk < 0.8) return 0xFF2222 // Red-orange
    return 0xFF0000 // Pure red (maximum danger)
  }

  private darkenColor(color: number, factor: number = 0.7): number {
    const r = ((color >> 16) & 0xFF) * factor
    const g = ((color >> 8) & 0xFF) * factor
    const b = (color & 0xFF) * factor
    return (Math.floor(r) << 16) | (Math.floor(g) << 8) | Math.floor(b)
  }

  private lightenColor(color: number, factor: number = 0.5): number {
    const r = ((color >> 16) & 0xFF)
    const g = ((color >> 8) & 0xFF)
    const b = (color & 0xFF)
    
    const newR = Math.min(255, r + (255 - r) * factor)
    const newG = Math.min(255, g + (255 - g) * factor)
    const newB = Math.min(255, b + (255 - b) * factor)
    
    return (Math.floor(newR) << 16) | (Math.floor(newG) << 8) | Math.floor(newB)
  }

  resetPosition(): void {
    this.balloon.x = this.config.width / 2
    this.balloon.y = this.config.balloon.initialY
    this.balloon.visible = true
    this.balloonSpeed = this.config.balloon.speed
    this.swayOffset = 0
  }

  createCrashEffect(background: PIXI.Container): void {
    this.balloon.visible = false
    
    // Create particle burst effect
    for (let i = 0; i < 10; i++) {
      const particle = new PIXI.Graphics()
      particle.beginFill(0xFF6B6B)
      particle.drawCircle(0, 0, 3)
      particle.endFill()
      
      particle.x = this.balloon.x
      particle.y = this.balloon.y
      
      const angle = (Math.PI * 2 * i) / 10
      const speed = 5 + Math.random() * 5
      const vx = Math.cos(angle) * speed
      const vy = Math.sin(angle) * speed
      
      background.addChild(particle)
      
      const animateParticle = () => {
        particle.x += vx
        particle.y += vy
        particle.alpha -= 0.02
        
        if (particle.alpha <= 0) {
          background.removeChild(particle)
        } else {
          requestAnimationFrame(animateParticle)
        }
      }
      
      animateParticle()
    }
  }

  getBalloonPosition(): { x: number, y: number } {
    return { x: this.balloon.x, y: this.balloon.y }
  }
}
