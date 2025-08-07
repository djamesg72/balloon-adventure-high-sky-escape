import * as PIXI from 'pixi.js'

export class CameraController {
  private cameraY: number = 0
  private stage: PIXI.Container

  constructor(stage: PIXI.Container) {
    this.stage = stage
  }

  update(balloonY: number, screenHeight: number): void {
    const targetCameraY = balloonY - (screenHeight * 0.7) // Keep balloon in lower 30% of screen
    this.cameraY += (targetCameraY - this.cameraY) * 0.05 // Smooth camera follow
    
    // Apply camera position to the stage
    this.stage.y = -this.cameraY
  }

  reset(): void {
    this.cameraY = 0
    this.stage.y = 0
  }

  getCameraY(): number {
    return this.cameraY
  }
}
