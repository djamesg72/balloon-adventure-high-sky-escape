import * as PIXI from 'pixi.js'

export class ObjectFactory {
  static createCloud(): PIXI.Container {
    const cloud = new PIXI.Container()
    const g = new PIXI.Graphics()
    
    g.beginFill(0xFFFFFF, 0.8)
    
    const circles = [
      { x: 0, y: 0, r: 25 },
      { x: 20, y: -5, r: 20 },
      { x: -15, y: -10, r: 18 },
      { x: 35, y: 5, r: 15 },
      { x: -25, y: 8, r: 12 }
    ]
    
    circles.forEach(circle => {
      g.drawCircle(circle.x, circle.y, circle.r)
    })
    
    g.endFill()
    cloud.addChild(g)
    
    return cloud
  }

  static createStar(): PIXI.Container {
    const star = new PIXI.Container()
    const g = new PIXI.Graphics()
    
    g.beginFill(0xFFFFFF, 0.9)
    g.drawCircle(0, 0, 2 + Math.random() * 3)
    g.endFill()
    
    star.addChild(g)
    return star
  }

  static createPlanet(): PIXI.Container {
    const planet = new PIXI.Container()
    const g = new PIXI.Graphics()
    
    const colors = [0xFF6B6B, 0x4ECDC4, 0x45B7D1, 0x96CEB4, 0xFECE2F, 0xE17055, 0x74B9FF]
    const color = colors[Math.floor(Math.random() * colors.length)]
    const size = 15 + Math.random() * 25
    
    g.beginFill(color, 0.8)
    g.drawCircle(0, 0, size)
    g.endFill()
    
    // Optional rings
    if (Math.random() < 0.3) {
      g.lineStyle(2, color, 0.4)
      g.drawEllipse(0, 0, size * 1.5, size * 0.5)
    }
    
    planet.addChild(g)
    return planet
  }

  static createShootingStar(): PIXI.Container {
    const star = new PIXI.Container()
    const g = new PIXI.Graphics()
    
    g.lineStyle(3, 0xFFFFFF, 0.8)
    g.moveTo(0, 0)
    g.lineTo(-30 - Math.random() * 20, 10 + Math.random() * 10)
    
    g.beginFill(0xFFFFFF, 1.0)
    g.drawCircle(0, 0, 3)
    g.endFill()
    
    star.addChild(g)
    return star
  }

  static createBalloon(): PIXI.Container {
    const balloon = new PIXI.Container()
    
    // Glow effect
    const glow = new PIXI.Graphics()
    glow.beginFill(0xFF6B6B, 0.3)
    glow.drawCircle(0, 0, 45)
    glow.endFill()
    glow.filters = [new PIXI.filters.BlurFilter(3)]

    // Main balloon body
    const body = new PIXI.Graphics()
    body.beginFill(0xFF6B6B)
    body.drawCircle(0, 0, 40)
    body.endFill()

    // Highlight
    const highlight = new PIXI.Graphics()
    highlight.beginFill(0xFFAAAA, 0.6)
    highlight.drawCircle(-15, -15, 15)
    highlight.endFill()

    // Basket
    const basket = new PIXI.Graphics()
    basket.beginFill(0x8B4513)
    basket.drawRect(-8, 40, 16, 20)
    basket.endFill()

    // String
    const string = new PIXI.Graphics()
    string.lineStyle(2, 0x000000)
    string.moveTo(0, 40)
    string.lineTo(0, 40)
    string.closePath()

    balloon.addChild(glow, body, highlight, basket, string)
    return balloon
  }
}
