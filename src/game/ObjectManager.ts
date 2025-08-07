import * as PIXI from 'pixi.js'
import { ObjectFactory } from './ObjectFactory'

export class ObjectManager {
  private objects: PIXI.Container[] = []
  private background: PIXI.Container

  constructor(background: PIXI.Container) {
    this.background = background
  }

  initializeObjects(config: any): void {
    this.clearAllObjects()
    
    // Create only clouds at the beginning
    const numObjects = Math.max(15, Math.floor((config.width * config.height) / 40000))
    
    for (let i = 0; i < numObjects; i++) {
      const objectY = config.balloon.initialY + Math.random() * (config.height * 2) - config.height
      const cloudObject = ObjectFactory.createCloud()
      
      cloudObject.x = Math.random() * (config.width + 200) - 100
      cloudObject.y = objectY
      cloudObject.alpha = 0.7 + Math.random() * 0.3
      
      this.objects.push(cloudObject)
      this.background.addChild(cloudObject)
    }
  }

  spawnObjectsByAltitude(multiplier: number, cameraY: number, config: any): void {
    // Only spawn occasionally to avoid too many objects
    if (Math.random() > 0.02) return // 2% chance per frame
    
    const spawnY = cameraY - 100 // Spawn above camera view
    let newObject: PIXI.Container | null = null
    
    if (multiplier < 3) {
      // Low altitude: only clouds
      if (Math.random() < 0.8) {
        newObject = ObjectFactory.createCloud()
        newObject.alpha = 0.7 + Math.random() * 0.3
      }
    } else if (multiplier < 8) {
      // Mid altitude: clouds + stars + shooting stars
      const rand = Math.random()
      if (rand < 0.4) {
        newObject = ObjectFactory.createCloud()
        newObject.alpha = 0.5 + Math.random() * 0.3
      } else if (rand < 0.8) {
        newObject = ObjectFactory.createStar()
        newObject.alpha = 0.7 + Math.random() * 0.3
      } else {
        newObject = ObjectFactory.createShootingStar()
        newObject.alpha = 0.8 + Math.random() * 0.2
      }
    } else {
      // High altitude: only stars and planets
      const rand = Math.random()
      if (rand < 0.4) {
        newObject = ObjectFactory.createStar()
        newObject.alpha = 0.8 + Math.random() * 0.2
      } else if (rand < 0.8) {
        newObject = ObjectFactory.createPlanet()
        newObject.alpha = 0.7 + Math.random() * 0.3
      } else {
        newObject = ObjectFactory.createShootingStar()
        newObject.alpha = 0.9 + Math.random() * 0.1
      }
    }
    
    if (newObject) {
      newObject.x = Math.random() * (config.width + 200) - 100
      newObject.y = spawnY
      this.objects.push(newObject)
      this.background.addChild(newObject)
    }
  }

  updateObjects(delta: number, cameraY: number, config: any): void {
    const time = Date.now() * 0.01
    const screenBottom = cameraY + config.height + 200
    
    // Use reverse loop to safely remove objects
    for (let i = this.objects.length - 1; i >= 0; i--) {
      const obj = this.objects[i]
      const speed = 0.2 + (i % 3) * 0.1
      obj.y += speed * delta

      const bounds = obj.getBounds()
      const isShootingStar = bounds.width > bounds.height * 2
      const isStar = bounds.width < 10 && bounds.height < 10

      if (isShootingStar) {
        // Shooting stars move faster on X axis and disappear randomly
        obj.x += speed * delta * 3
        
        // Random chance to disappear (like real shooting stars)
        if (Math.random() < 0.001) { // 0.1% chance per frame
          this.background.removeChild(obj)
          this.objects.splice(i, 1)
          continue
        }
      }
      
      if (isStar) {
        obj.alpha = 0.6 + Math.sin(time + i) * 0.3
      }

      // Remove objects that go off screen
      if (obj.y > screenBottom || obj.x > config.width + 300 || obj.x < -300) {
        this.background.removeChild(obj)
        this.objects.splice(i, 1)
      }
    }
  }

  redistributeObjects(config: any, cameraY: number): void {
    this.objects.forEach(obj => {
      obj.x = Math.random() * (config.width + 200) - 100
      obj.y = cameraY + Math.random() * (config.height * 4) - config.height * 2
    })
  }

  clearAllObjects(): void {
    this.objects.forEach(obj => this.background.removeChild(obj))
    this.objects = []
  }

  getObjectCount(): number {
    return this.objects.length
  }
}
