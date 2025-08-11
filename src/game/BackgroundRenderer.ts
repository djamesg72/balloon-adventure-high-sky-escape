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
    
    // Color lookup table for performance - changed to blue sky colors
    const colors = [
      [0x87CEEB, 0x6495ED, 0x4682B4], // Low altitude - sky blue tones
      [0x6495ED, 0x4682B4, 0x2F4F4F], // Mid altitude - deeper blues
      [0x4682B4, 0x2F4F4F, 0x191970], // High altitude - dark blue
      [0x2F4F4F, 0x191970, 0x000080], // Higher altitude - midnight blue
      [0x191970, 0x000080, 0x000000]  // Space - navy to black
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
