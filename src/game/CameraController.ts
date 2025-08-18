import * as PIXI from 'pixi.js'

export class CameraController {
  private cameraY: number = 0
  private stage: PIXI.Container

  constructor(stage: PIXI.Container) {
    this.stage = stage
  }

  private isMobileDevice(): boolean {
    // Check if device is mobile based on screen size and user agent
    const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    const isMobileScreen = window.innerWidth <= 768 || window.innerHeight <= 600
    return isMobileUserAgent || isMobileScreen
  }

  public update(yPos: number, screenHeight: number): void {
    // Adjust balloon position based on device type
    let balloonScreenPosition: number
    
    if (this.isMobileDevice()) {
      // On mobile, position balloon higher up (around 40% from top) to account for UI
      balloonScreenPosition = screenHeight * 0.4
    } else {
      // On desktop, keep balloon in lower area (70% from top)
      balloonScreenPosition = screenHeight * 0.7
    }
    
    const targetCameraY = yPos - balloonScreenPosition
    this.cameraY += (targetCameraY - this.cameraY) * 0.05 // Smooth camera follow
    
    // Apply camera position to the stage
    this.stage.y = -this.cameraY
  }

  public reset(): void {
    this.cameraY = 0
    this.stage.y = 0
  }

  public getCameraY(): number {
    return this.cameraY
  }
}
