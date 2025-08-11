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
    
    // Scale factor for the balloon sprite
    const scale = 0.6
    
    // Create the main balloon envelope (elliptical shape like opening screen)
    const body = new PIXI.Graphics()
    
    // Create radial gradient effect for balloon body
    const gradient = new PIXI.Graphics()
    
    // Outer balloon envelope
    gradient.beginFill(0x1e3a8a, 1.0) // Dark blue outer
    gradient.drawEllipse(0, 0, 45 * scale, 55 * scale)
    gradient.endFill()
    
    gradient.beginFill(0x3b82f6, 0.9) // Medium blue
    gradient.drawEllipse(0, 0, 40 * scale, 50 * scale)
    gradient.endFill()
    
    gradient.beginFill(0x60a5fa, 0.8) // Light blue
    gradient.drawEllipse(0, 0, 35 * scale, 45 * scale)
    gradient.endFill()
    
    gradient.beginFill(0x93c5fd, 0.7) // Lightest blue center
    gradient.drawEllipse(-8 * scale, -8 * scale, 25 * scale, 35 * scale)
    gradient.endFill()
    
    balloon.addChild(gradient)
    
    // Balloon segments (horizontal lines like real hot air balloons)
    const segments = new PIXI.Graphics()
    segments.lineStyle(1 * scale, 0x1e3a8a, 0.6)
    
    // Horizontal segments
    const segmentY = [-15, 0, 15, 30]
    segmentY.forEach(y => {
      const yPos = y * scale
      const width = Math.sqrt(Math.max(0, (45 * scale) ** 2 - yPos ** 2)) * 2
      segments.moveTo(-width / 2, yPos)
      segments.quadraticCurveTo(0, yPos - 5 * scale, width / 2, yPos)
    })
    
    // Vertical segments
    segments.lineStyle(0.8 * scale, 0x1e3a8a, 0.4)
    const segmentX = [-25, 0, 25]
    segmentX.forEach(x => {
      const xPos = x * scale
      segments.moveTo(xPos, -45 * scale)
      segments.lineTo(xPos, 40 * scale)
    })
    
    balloon.addChild(segments)
    
    // Highlight on balloon
    const highlight = new PIXI.Graphics()
    highlight.beginFill(0xffffff, 0.3)
    highlight.drawEllipse(-15 * scale, -20 * scale, 12 * scale, 15 * scale)
    highlight.endFill()
    balloon.addChild(highlight)
    
    // Basket
    const basket = new PIXI.Graphics()
    
    // Main basket body with gradient effect
    basket.beginFill(0x5a2d0c) // Dark brown
    basket.drawRect(-12 * scale, 45 * scale, 24 * scale, 18 * scale)
    basket.endFill()
    
    basket.beginFill(0x6b3410) // Medium brown
    basket.drawRect(-11 * scale, 46 * scale, 22 * scale, 16 * scale)
    basket.endFill()
    
    basket.beginFill(0x8b4513) // Light brown top
    basket.drawRect(-11 * scale, 46 * scale, 22 * scale, 3 * scale)
    basket.endFill()
    
    // Basket weave pattern
    basket.lineStyle(0.5 * scale, 0x5a2d0c, 1)
    for (let i = -8; i <= 8; i += 4) {
      basket.moveTo(i * scale, 47 * scale)
      basket.lineTo(i * scale, 61 * scale)
    }
    
    // Horizontal weave lines
    for (let i = 49; i <= 59; i += 3) {
      basket.moveTo(-10 * scale, i * scale)
      basket.lineTo(10 * scale, i * scale)
    }
    
    balloon.addChild(basket)
    
    // Connecting ropes
    const ropes = new PIXI.Graphics()
    ropes.lineStyle(1.5 * scale, 0x2c3e50, 1)
    
    // Left rope
    ropes.moveTo(-25 * scale, 35 * scale)
    ropes.lineTo(-8 * scale, 45 * scale)
    
    // Center rope
    ropes.moveTo(0, 40 * scale)
    ropes.lineTo(0, 45 * scale)
    
    // Right rope
    ropes.moveTo(25 * scale, 35 * scale)
    ropes.lineTo(8 * scale, 45 * scale)
    
    balloon.addChild(ropes)
    
    // Small basket details (decorative circles)
    const details = new PIXI.Graphics()
    details.beginFill(0x5a2d0c)
    details.drawCircle(-6 * scale, 55 * scale, 1 * scale)
    details.drawCircle(6 * scale, 55 * scale, 1 * scale)
    details.endFill()
    balloon.addChild(details)
    
    // Glow effect for the entire balloon
    const glow = new PIXI.Graphics()
    glow.beginFill(0xFF6B6B, 0.2)
    glow.drawEllipse(0, 0, 55 * scale, 65 * scale)
    glow.endFill()
    glow.filters = [new PIXI.filters.BlurFilter(4)]
    
    // Add glow behind everything
    balloon.addChildAt(glow, 0)
    
    return balloon
  }
}
