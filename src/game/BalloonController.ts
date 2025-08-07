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
    
    const body = this.balloon.children[1] as PIXI.Graphics
    const glow = this.balloon.children[0] as PIXI.Graphics
    
    body.clear()
    glow.clear()
    
    const intensity = Math.floor(0x6B * (1 - risk))
    const color = 0xFF0000 | (intensity << 8) | intensity
    const glowAlpha = 0.3 + risk * 0.3
    const glowSize = 45 + risk * 5

    body.beginFill(color)
    body.drawCircle(0, 0, 40)
    body.endFill()

    glow.beginFill(color, glowAlpha)
    glow.drawCircle(0, 0, glowSize)
    glow.endFill()

    // Shake at high risk
    if (risk > 0.7) {
      this.balloon.x += (Math.random() - 0.5) * (risk - 0.7) * 10
    }
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
