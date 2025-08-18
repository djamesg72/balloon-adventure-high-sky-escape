import * as PIXI from 'pixi.js'
import { GameState, GameConfig } from '../types/game'
import { ObjectFactory } from './ObjectFactory'
import { BackgroundRenderer } from './BackgroundRenderer'
import { RiskCalculator } from './RiskCalculator'
import { ObjectManager } from './ObjectManager'
import { BalloonController } from './BalloonController'
import { CameraController } from './CameraController'

// Re-export for backward compatibility
export { GameState } from '../types/game'

export class BalloonGame {
  private app: PIXI.Application
  private gameState: GameState = GameState.WAITING
  private balloon1!: PIXI.Container
  private balloon2!: PIXI.Container
  private ui!: PIXI.Container
  
  private hasLanded1: boolean = false
  private hasLanded2: boolean = false
  private hasCrashed1: boolean = false
  private hasCrashed2: boolean = false
  
  // Game variables
  private score: number = 0
  private startTime: number = 0
  private currentMultiplier: number = 1

  // Game modules
  private backgroundRenderer!: BackgroundRenderer
  private objectManager!: ObjectManager
  private balloonController1!: BalloonController  // Separate controller for balloon1
  private balloonController2!: BalloonController  // Separate controller for balloon2
  private cameraController!: CameraController

  // Configuration
  private config: GameConfig = {
    width: 800,
    height: 600,
    balloon: {
      radius: 40,
      initialY: 450,
      speed: 1,
      maxSpeed: 5,
      acceleration: 0.02,
      swayAmplitude: 20,
      swaySpeed: 0.02
    },
    risk: {
      minSafeTime: 3000, // 3 seconds minimum
      maxTime: 30000, // 30 seconds maximum
      baseRiskMultiplier: 1.5,
      riskIncreaseRate: 0.002
    },
    scoring: {
      pointsPerSecond: 10,
      heightMultiplier: 0.1,
      landingBonus: 0
    },
    clouds: {
      count: 20,
      speedVariation: 0.5,
      alphaRange: [0.3, 0.9],
      scaleRange: [0.6, 1.4]
    }
  }

  // Event callbacks
  public onScoreUpdate?: (score: number, multiplier: number) => void
  public onGameStateChange?: (state: GameState) => void
  public onCrash1?: (finalScore: number) => void
  public onCrash2?: (finalScore: number) => void
  public onLand?: (finalScore: number) => void
  public onLand1?: (finalScore: number) => void
  public onLand2?: (finalScore: number) => void

  constructor(canvasElement: HTMLCanvasElement) {
    try {
      console.log('Starting BalloonGame initialization...')
      
      // Get initial screen dimensions
      const screenWidth = window.innerWidth
      const screenHeight = window.innerHeight
      
      console.log(`Screen dimensions: ${screenWidth}x${screenHeight}`)
      
      // Create PIXI application with fullscreen dimensions
      this.app = new PIXI.Application({
        view: canvasElement,
        width: screenWidth,
        height: screenHeight,
        backgroundColor: 0x1a1a2e, // Dark blue night sky
        antialias: true,
        resolution: window.devicePixelRatio || 1
      })

      console.log('PIXI Application created successfully')

      // Update config to match screen size
      this.config.width = screenWidth
      this.config.height = screenHeight
      this.config.balloon.initialY = screenHeight - 150 // Position balloon near bottom

      // Setup responsive canvas
      this.setupResponsiveCanvas()

      // Initialize game modules
      console.log('Initializing game modules...')
      this.initializeBackground()
      this.initializeUI()
      this.initializeBalloons()
      this.initializeObjects()

      // Setup game loop
      this.app.ticker.add(this.gameLoop, this)
      console.log('Game loop started')

      // Setup interactions
      this.setupInteractions()

      // Initial state
      this.resetGame()
      
      console.log('BalloonGame initialization completed successfully')
    } catch (error) {
      console.error('Fatal error during BalloonGame initialization:', error)
      throw new Error(`Failed to initialize BalloonGame: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  private initializeBackground(): void {
    this.backgroundRenderer = new BackgroundRenderer()
    this.app.stage.addChild(this.backgroundRenderer.getContainer())
  }

  private initializeBalloons(): void {
    // Create and setup balloon1
    this.balloon1 = ObjectFactory.createBalloon()
    this.balloon1.x = this.config.width / 4;
    this.balloon1.y = this.config.balloon.initialY
    this.app.stage.addChild(this.balloon1)
    this.balloonController1 = new BalloonController(this.balloon1, this.config)

    // Create and setup balloon2 
    this.balloon2 = ObjectFactory.createBalloon()
    this.balloon2.x = 3 * this.config.width / 4;
    this.balloon2.y = this.config.balloon.initialY
    this.app.stage.addChild(this.balloon2)
    this.balloonController2 = new BalloonController(this.balloon2, this.config)
  }

  private initializeObjects(): void {
    this.objectManager = new ObjectManager(this.backgroundRenderer.getContainer())
    this.objectManager.initializeObjects(this.config)
  }

  private initializeUI(): void {
    this.ui = new PIXI.Container()
    this.app.stage.addChild(this.ui)
  }

  private setupResponsiveCanvas(): void {
    this.cameraController = new CameraController(this.app.stage)
    
    const resize = () => {
      const newWidth = window.innerWidth
      const newHeight = window.innerHeight
      
      // Update config dimensions
      this.config.width = newWidth
      this.config.height = newHeight
      
      // Resize the PIXI application
      this.app.renderer.resize(newWidth, newHeight)
      
      // Update background gradient for new dimensions
      if (this.backgroundRenderer) {
        this.backgroundRenderer.updateGradient(this.currentMultiplier, this.config.balloon.initialY, this.config.width)
      }
      
      // Reposition balloons to new screen positions
      if (this.balloon1) {
        this.balloon1.x = newWidth / 4
        this.config.balloon.initialY = newHeight - 150
        if (this.gameState === GameState.WAITING) {
          this.balloon1.y = this.config.balloon.initialY
        }
      }

      if (this.balloon2) {
        this.balloon2.x = 3 * newWidth / 4
        if (this.gameState === GameState.WAITING) {
          this.balloon2.y = this.config.balloon.initialY
        }
      }
      
      // Redistribute objects for new screen size
      if (this.objectManager) {
        this.objectManager.redistributeObjects(this.config, this.cameraController.getCameraY())
      }
    }

    window.addEventListener('resize', resize)
    resize() // Call once to set initial size
  }

  private setupInteractions(): void {
    // Touch/click to start game
    this.app.stage.interactive = true;
    this.app.stage.on('pointerdown', (event: any) => {
      if (this.gameState === GameState.WAITING && event.target === this.app.stage) {
        this.startGame();
      }
    })
  }

  private updateUI(): void {
    // No UI elements to update in canvas
  }

  public startGame(): void {
    if (this.gameState !== GameState.WAITING) return

    this.gameState = GameState.PLAYING
    this.startTime = Date.now()
    this.hasLanded1 = false // Reset for new round
    this.hasLanded2 = false // Reset for new round
    this.hasCrashed1 = false // Reset crash states
    this.hasCrashed2 = false

    this.onGameStateChange?.(this.gameState)
  }

  public restartGame(): void {
    // Reset all game variables to initial state
    this.score = 0
    this.currentMultiplier = 1
    this.hasLanded1 = false
    this.hasLanded2 = false
    this.hasCrashed1 = false
    this.hasCrashed2 = false
    this.gameState = GameState.WAITING
    this.startTime = 0 // Reset start time
    
    // Reset balloon position
    this.balloonController1.resetPosition()
    this.balloonController2.resetPosition()
    
    // Reset object manager
    this.objectManager.clearAllObjects()
    
    // Reset camera
    this.cameraController.reset()
  }

  public landBalloon1(): void {
    // Don't change game state - just record the score and continue playing
    const finalScore = Math.floor(this.score * this.currentMultiplier)
    this.hasLanded1 = true
    
    // Call the specific balloon 1 land callback
    this.onLand1?.(finalScore)
    // Also call the general land callback for backward compatibility
    this.onLand?.(finalScore)
    
    // Game continues running until crash
  }

  public landBalloon2(): void {
    // Don't change game state - just record the score and continue playing
    const finalScore = Math.floor(this.score * this.currentMultiplier)
    this.hasLanded2 = true
    
    // Call the specific balloon 2 land callback
    this.onLand2?.(finalScore)
    // Also call the general land callback for backward compatibility
    this.onLand?.(finalScore)
    
    // Game continues running until crash
  }

  public landBalloon(): void {
    // Legacy method - lands both balloons
    this.landBalloon1()
    this.landBalloon2()
  }

  private gameLoop(delta: number): void {
    // Always update background
    this.backgroundRenderer.updateGradient(this.currentMultiplier, this.config.balloon.initialY, this.config.width)
    
    if (this.gameState === GameState.PLAYING) {
      const currentTime = Date.now()
      const elapsedTime = currentTime - this.startTime;

      // Update balloon positions (only if not crashed)
      if (!this.hasCrashed1) {
        this.balloonController1.updatePosition(delta, true)
      }
      if (!this.hasCrashed2) {
        this.balloonController2.updatePosition(delta, true)
      }

      // Update camera to follow first balloon (or you could use average position)
      const balloonPos = this.balloonController1.getBalloonPosition()
      this.cameraController.update(balloonPos.y, this.config.height)

      // Update score and multiplier with geometric expansion
      const timeBonus = elapsedTime / 1000 * this.config.scoring.pointsPerSecond
      this.score = Math.floor(timeBonus)
      
      // Geometric multiplier growth: 1.01^(time_in_seconds)
      this.currentMultiplier = RiskCalculator.calculateMultiplier(elapsedTime)

      // Risk-based crash system - check each balloon individually
      if (!this.hasCrashed1 && RiskCalculator.shouldCrash(this.currentMultiplier)) {
        this.crashBalloon1()
      }
      if (!this.hasCrashed2 && RiskCalculator.shouldCrash(this.currentMultiplier)) {
        this.crashBalloon2()
      }

      // Check if both balloons have crashed - if so, end the game
      if (this.hasCrashed1 && this.hasCrashed2) {
        this.endGame()
        return
      }

      // Dynamic object spawning based on altitude
      this.objectManager.spawnObjectsByAltitude(this.currentMultiplier, this.cameraController.getCameraY(), this.config)

      // Update risk indicator (balloon color changes) for balloons that haven't crashed
      if (!this.hasCrashed1) {
        this.balloonController1.updateRiskVisual(this.currentMultiplier)
      }
      if (!this.hasCrashed2) {
        this.balloonController2.updateRiskVisual(this.currentMultiplier)
      }

      // Move objects (parallax effect)
      this.objectManager.updateObjects(delta, this.cameraController.getCameraY(), this.config)

      // Update UI
      this.updateUI()

      // Trigger callbacks
      this.onScoreUpdate?.(this.score, this.currentMultiplier)
    } else {
      // When waiting, ensure multiplier is reset to 1
      this.currentMultiplier = 1
      
      // When waiting, add a gentle sway to both balloons
      this.balloonController1.updatePosition(delta, false)
      this.balloonController2.updatePosition(delta, false)
    }
  }

  private crashBalloon1(): void {
    this.hasCrashed1 = true
    
    // Create crash animation (balloon pop effect) for balloon1
    this.balloonController1.createCrashEffect(this.backgroundRenderer.getContainer())
    
    // Calculate final score for this balloon
    const finalScore = this.hasLanded1 ? Math.floor(this.score * this.currentMultiplier) : 0
    this.onCrash1?.(finalScore)
    
    console.log('Balloon 1 crashed! Waiting for balloon 2...')
  }

  private crashBalloon2(): void {
    this.hasCrashed2 = true
    
    // Create crash animation (balloon pop effect) for balloon2
    this.balloonController2.createCrashEffect(this.backgroundRenderer.getContainer())
    
    // Calculate final score for this balloon
    const finalScore = this.hasLanded2 ? Math.floor(this.score * this.currentMultiplier) : 0
    this.onCrash2?.(finalScore)
    
    console.log('Balloon 2 crashed! Waiting for balloon 1...')
  }

  private endGame(): void {
    this.gameState = GameState.CRASHED
    this.onGameStateChange?.(this.gameState)
    console.log('Both balloons crashed! Game over.')
  }

  public resetGame(): void {
    this.gameState = GameState.WAITING
    this.score = 0
    this.currentMultiplier = 1
    this.hasLanded1 = false
    this.hasLanded2 = false
    this.hasCrashed1 = false
    this.hasCrashed2 = false
    
    // Reset balloon position and controller
    this.balloonController1.resetPosition()
    this.balloonController2.resetPosition()
    
    // Reset camera position
    this.cameraController.reset()
    
    // Clear all existing objects and start fresh with only clouds
    this.objectManager.clearAllObjects()
    this.objectManager.initializeObjects(this.config)
    
    // Reset background to initial colors
    this.backgroundRenderer.updateGradient(this.currentMultiplier, this.config.balloon.initialY, this.config.width)
    
    // Update UI
    this.updateUI()
    
    this.onGameStateChange?.(this.gameState)
  }

  public destroy(): void {
    this.app.destroy(true, true)
  }

  public getGameState(): GameState {
    return this.gameState
  }

  public getCurrentScore(): number {
    return this.score
  }

  public getCurrentMultiplier(): number {
    return this.currentMultiplier
  }

  public hasBalloon1Crashed(): boolean {
    return this.hasCrashed1
  }

  public hasBalloon2Crashed(): boolean {
    return this.hasCrashed2
  }

  public hasBalloon1Landed(): boolean {
    return this.hasLanded1
  }

  public hasBalloon2Landed(): boolean {
    return this.hasLanded2
  }
}
