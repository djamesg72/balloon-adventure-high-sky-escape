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
  private balloon!: PIXI.Container
  private ui!: PIXI.Container
  
  private hasLanded: boolean = false
  
  // Game variables
  private score: number = 0
  private startTime: number = 0
  private currentMultiplier: number = 1

  // Game modules
  private backgroundRenderer!: BackgroundRenderer
  private objectManager!: ObjectManager
  private balloonController!: BalloonController
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
  public onCrash?: (finalScore: number) => void
  public onLand?: (finalScore: number) => void

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
      this.initializeBalloon()
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

  private initializeBalloon(): void {
    this.balloon = ObjectFactory.createBalloon()
    this.balloon.x = this.config.width / 2
    this.balloon.y = this.config.balloon.initialY
    this.app.stage.addChild(this.balloon)
    
    this.balloonController = new BalloonController(this.balloon, this.config)
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
      
      // Reposition balloon to center of new dimensions
      if (this.balloon) {
        this.balloon.x = newWidth / 2
        this.config.balloon.initialY = newHeight - 150
        if (this.gameState === GameState.WAITING) {
          this.balloon.y = this.config.balloon.initialY
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
    this.hasLanded = false // Reset for new round

    this.onGameStateChange?.(this.gameState)
  }

  public restartGame(): void {
    // Reset all game variables to initial state
    this.score = 0
    this.currentMultiplier = 1
    this.hasLanded = false
    this.gameState = GameState.WAITING
    this.startTime = 0 // Reset start time
    
    // Reset balloon position
    this.balloonController.resetPosition()
    
    // Reset object manager
    this.objectManager.clearAllObjects()
    
    // Reset camera
    this.cameraController.reset()
  }

  public landBalloon(): void {
    // Don't change game state - just record the score and continue playing
    const finalScore = Math.floor(this.score * this.currentMultiplier)
    this.hasLanded = true
    
    // Call the land callback but keep the game running
    this.onLand?.(finalScore)
    
    // Game continues running until crash
  }

  private gameLoop(delta: number): void {
    // Always update background
    this.backgroundRenderer.updateGradient(this.currentMultiplier, this.config.balloon.initialY, this.config.width)
    
    if (this.gameState === GameState.PLAYING) {
      const currentTime = Date.now()
      const elapsedTime = currentTime - this.startTime;

      // Update balloon position
      this.balloonController.updatePosition(delta, true)

      // Update camera to follow balloon
      const balloonPos = this.balloonController.getBalloonPosition()
      this.cameraController.update(balloonPos.y, this.config.height)

      // Update score and multiplier with geometric expansion
      const timeBonus = elapsedTime / 1000 * this.config.scoring.pointsPerSecond
      this.score = Math.floor(timeBonus)
      
      // Geometric multiplier growth: 1.01^(time_in_seconds)
      this.currentMultiplier = RiskCalculator.calculateMultiplier(elapsedTime)

      // Risk-based crash system - higher multiplier = higher crash risk
      if (RiskCalculator.shouldCrash(this.currentMultiplier)) {
        this.crashBalloon()
        return
      }

      // Dynamic object spawning based on altitude
      this.objectManager.spawnObjectsByAltitude(this.currentMultiplier, this.cameraController.getCameraY(), this.config)

      // Update risk indicator (balloon color changes) 
      this.balloonController.updateRiskVisual(this.currentMultiplier)

      // Move objects (parallax effect)
      this.objectManager.updateObjects(delta, this.cameraController.getCameraY(), this.config)

      // Update UI
      this.updateUI()

      // Trigger callbacks
      this.onScoreUpdate?.(this.score, this.currentMultiplier)
    } else {
      // When waiting, ensure multiplier is reset to 1
      this.currentMultiplier = 1
      
      // When waiting, add a gentle sway to the balloon
      this.balloonController.updatePosition(delta, false)
    }
  }

  private crashBalloon(): void {
    this.gameState = GameState.CRASHED
    
    // Create crash animation (balloon pop effect)
    this.balloonController.createCrashEffect(this.backgroundRenderer.getContainer())
    
    this.onGameStateChange?.(this.gameState)
    
    // If player landed before crashing, they keep their score; otherwise 0
    const finalScore = this.hasLanded ? Math.floor(this.score * this.currentMultiplier) : 0
    this.onCrash?.(finalScore)
  }

  public resetGame(): void {
    this.gameState = GameState.WAITING
    this.score = 0
    this.currentMultiplier = 1
    this.hasLanded = false
    
    // Reset balloon position and controller
    this.balloonController.resetPosition()
    
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
}
