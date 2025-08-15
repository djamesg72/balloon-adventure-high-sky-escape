import * as PIXI from 'pixi.js'

export class CameraController {
  private cameraY: number = 0
  private stage: PIXI.Container

  constructor(stage: PIXI.Container) {
    this.stage = stage
  }

  public update(yPos: number, screenHeight: number): void {
    const targetCameraY = yPos - (screenHeight * 0.7) // Keep balloon in lower 30% of screen
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
