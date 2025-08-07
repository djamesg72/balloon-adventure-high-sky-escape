import * as PIXI from 'pixi.js'

export class BackgroundRenderer {
  private background: PIXI.Container
  private gradient: PIXI.Graphics

  constructor() {
    this.background = new PIXI.Container()
    this.gradient = new PIXI.Graphics()
    this.background.addChild(this.gradient)
  }

  updateGradient(multiplier: number, balloonInitialY: number, width: number): void {
    this.gradient.clear()
    
    const m = multiplier
    const y = balloonInitialY
    const w = width
    
    // Color lookup table for performance
    const colors = [
      [0xFF6B35, 0xFF8E53, 0x87CEEB], // Low altitude
      [0xFF8E53, 0xFFB87A, 0x6495ED], // Mid altitude
      [0xFFB87A, 0x87CEEB, 0x4682B4], // High altitude
      [0x87CEEB, 0x6495ED, 0x2C3E50], // Higher altitude
      [0x6495ED, 0x4682B4, 0x000000]  // Space
    ]
    
    const colorIndex = Math.min(Math.floor(m / 5), 4)
    const [bottom, middle, top] = colors[colorIndex]
    
    // Base layer
    this.gradient.beginFill(m > 20 ? 0x000000 : 0x1A1A2E)
    this.gradient.drawRect(-w, y - 10000, w * 3, 15000)
    this.gradient.endFill()
    
    // Three atmospheric layers
    this.gradient.beginFill(bottom)
    this.gradient.drawRect(-w, y - 500, w * 3, 3500)
    this.gradient.endFill()
    
    this.gradient.beginFill(middle)  
    this.gradient.drawRect(-w, y - 3000, w * 3, 2500)
    this.gradient.endFill()
    
    this.gradient.beginFill(top)
    this.gradient.drawRect(-w, y - 8000, w * 3, 5000)
    this.gradient.endFill()
  }

  getContainer(): PIXI.Container {
    return this.background
  }

  getGradient(): PIXI.Graphics {
    return this.gradient
  }
}
