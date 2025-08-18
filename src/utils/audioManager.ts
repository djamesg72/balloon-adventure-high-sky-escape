/**
 * Audio Manager for Balloon Adventure Game
 * Uses real audio files instead of generated frequencies
 */

export interface AudioOptions {
  volume?: number
  loop?: boolean
}

export class AudioManager {
  private sounds: Map<string, HTMLAudioElement> = new Map()
  private masterVolume: number = 1.0
  private muted: boolean = false
  private windSound: HTMLAudioElement | null = null
  private audioUnlocked: boolean = false

  private soundFiles = [
    'pop.mp3',      // Balloon pop/hit sound
    'wind.mp3',     // Wind background sound
    'start.mp3',    // Game start sound
    'countdown.mp3', // Countdown beep sound
    'success.mp3'   // Success/landing sound
  ]

  constructor() {
    // Load saved settings
    const savedVolume = localStorage.getItem('balloon-game-volume')
    if (savedVolume) this.masterVolume = parseFloat(savedVolume)

    // Temporarily disable sounds
    this.muted = true
    
    // const savedMuted = localStorage.getItem('balloon-game-muted')
    // if (savedMuted) this.muted = savedMuted === 'true'

    // No preloading - sounds will be created on demand
  }

  private getOrCreateSound(name: string): HTMLAudioElement | null {
    // Return existing sound if already loaded
    if (this.sounds.has(name)) {
      return this.sounds.get(name)!
    }

    // Find the matching sound file
    const soundFile = this.soundFiles.find(file => file.startsWith(name))
    if (!soundFile) {
      console.warn(`Sound file not found for: ${name}`)
      return null
    }

    try {
      // Create new audio element
      const audio = new Audio(`/sounds/${soundFile}`)
      audio.preload = 'none' // Don't preload - load when needed
      audio.volume = this.muted ? 0 : this.masterVolume
      
      // Handle load errors gracefully
      audio.onerror = () => {
        console.warn(`Failed to load audio file: /sounds/${soundFile}`)
      }
      
      this.sounds.set(name, audio)
      console.log(`Created audio for: ${name}`)
      return audio
    } catch (error) {
      console.warn(`Failed to create audio for ${name}:`, error)
      return null
    }
  }

  private async unlockAudio(): Promise<void> {
    if (!this.audioUnlocked) {
      try {
        // Try to play a silent sound to unlock audio context
        const tempAudio = new Audio()
        tempAudio.volume = 0
        await tempAudio.play()
        this.audioUnlocked = true
        console.log('Audio context unlocked!')
      } catch (error) {
        console.log('Audio unlock attempt failed - continuing without audio:', error instanceof Error ? error.message : String(error))
        this.audioUnlocked = true // Mark as unlocked even if failed to prevent blocking
      }
    }
  }

  async playSound(name: string, options: AudioOptions = {}): Promise<void> {
    if (this.muted) return

    // Don't await - let audio unlock and play in background
    this.unlockAudio()

    const sound = this.getOrCreateSound(name)
    if (!sound) {
      console.warn(`Sound not available: ${name}`)
      return
    }

    try {
      // Clone audio for overlapping sounds
      const audio = sound.cloneNode() as HTMLAudioElement
      audio.volume = (options.volume ?? 1.0) * this.masterVolume
      audio.loop = options.loop ?? false
      
      // Reset playback position
      audio.currentTime = 0
      
      // Don't await - let it play in background
      audio.play().catch(error => {
        console.log(`Audio play failed for ${name} - continuing silently:`, error instanceof Error ? error.message : String(error))
      })
      console.log(`Playing sound: ${name}`)
    } catch (error) {
      console.log(`Audio play failed for ${name} - continuing silently:`, error instanceof Error ? error.message : String(error))
    }
  }

  playPopSound(): void {
    this.playSound('pop', { volume: 0.7 })
  }

  playLandingFanfare(): void {
    this.playSound('success', { volume: 0.8 })
  }

  playStartSound(): void {
    this.playSound('start', { volume: 0.6 })
  }

  playGameStartSound(): void {
    this.playSound('start', { volume: 0.7 }) // Use start.mp3 for game start
  }

  playCountdownBeep(final: boolean = false): void {
    // Use countdown.mp3 for all countdown beeps (both regular and final)
    this.playSound('countdown', { volume: 0.8 })
  }

  playSuccessSound(): void {
    this.playSound('success', { volume: 0.8 })
  }

  playLandingSound(): void {
    // Silenced until new sound is added
    // this.playSound('landing', { volume: 0.6 })
    this.playSuccessSound() // Use the new success sound
  }

  setWindIntensity(intensity: number): void {
    if (this.muted) return
    
    try {
      // Initialize wind sound once if not already created
      if (!this.windSound) {
        const windAudio = this.getOrCreateSound('wind')
        if (windAudio) {
          this.windSound = windAudio.cloneNode() as HTMLAudioElement
          this.windSound.loop = true
          this.windSound.preload = 'auto'
        }
      }
      
      if (this.windSound) {
        if (intensity > 0) {
          // Set volume based on intensity (0-1)
          this.windSound.volume = Math.min(intensity * 0.4 * this.masterVolume, this.masterVolume)
          
          // Start playing if not already playing
          if (this.windSound.paused || this.windSound.ended) {
            this.windSound.currentTime = 0
            this.windSound.play().catch(error => {
              console.log('Wind sound play failed - continuing silently:', error instanceof Error ? error.message : String(error))
            })
          }
        } else {
          // Gradually fade out instead of abrupt stop
          if (!this.windSound.paused) {
            const fadeOut = () => {
              if (this.windSound && this.windSound.volume > 0.01) {
                this.windSound.volume = Math.max(0, this.windSound.volume - 0.05)
                setTimeout(fadeOut, 50)
              } else if (this.windSound) {
                this.windSound.pause()
                this.windSound.currentTime = 0
              }
            }
            fadeOut()
          }
        }
      }
    } catch (error) {
      console.log('Wind sound error - continuing silently:', error instanceof Error ? error.message : String(error))
    }
  }

  startWindSound(): void {
    this.setWindIntensity(0.5)
  }

  stopWindSound(): void {
    try {
      if (this.windSound) {
        this.windSound.pause()
        this.windSound.currentTime = 0
      }
    } catch (error) {
      console.log('Stop wind sound error - ignoring:', error instanceof Error ? error.message : String(error))
    }
  }

  stopAllSounds(): void {
    try {
      this.sounds.forEach(sound => {
        try {
          sound.pause()
          sound.currentTime = 0
        } catch (error) {
          // Ignore individual sound errors
        }
      })
      this.stopWindSound()
    } catch (error) {
      console.log('Stop all sounds error - ignoring:', error instanceof Error ? error.message : String(error))
    }
  }

  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume))
    
    try {
      // Update all existing sounds
      this.sounds.forEach(sound => {
        try {
          sound.volume = this.muted ? 0 : this.masterVolume
        } catch (error) {
          // Ignore individual sound errors
        }
      })
      
      if (this.windSound) {
        try {
          this.windSound.volume = this.muted ? 0 : this.masterVolume * 0.3
        } catch (error) {
          // Ignore wind sound error
        }
      }
      
      localStorage.setItem('balloon-game-volume', this.masterVolume.toString())
    } catch (error) {
      console.log('Set master volume error - ignoring:', error instanceof Error ? error.message : String(error))
    }
  }

  getMasterVolume(): number {
    return this.masterVolume
  }

  setMuted(muted: boolean): void {
    this.muted = muted
    
    try {
      // Update volume for all sounds
      this.sounds.forEach(sound => {
        try {
          sound.volume = muted ? 0 : this.masterVolume
        } catch (error) {
          // Ignore individual sound errors
        }
      })
      
      if (muted) {
        this.stopWindSound()
      }
      
      localStorage.setItem('balloon-game-muted', muted.toString())
    } catch (error) {
      console.log('Set muted error - ignoring:', error instanceof Error ? error.message : String(error))
    }
  }

  isMuted(): boolean {
    return this.muted
  }

  destroy(): void {
    try {
      this.stopAllSounds()
      this.sounds.clear()
      this.windSound = null
    } catch (error) {
      console.log('Destroy audio manager error - ignoring:', error instanceof Error ? error.message : String(error))
    }
  }

  // Legacy methods for compatibility - now non-blocking
  async loadGameSounds(): Promise<void> {
    try {
      await this.unlockAudio()
      console.log('Audio manager ready! Sounds will load on demand.')
    } catch (error) {
      console.log('Audio manager initialization warning - continuing without audio:', error instanceof Error ? error.message : String(error))
    }
  }

  stopSound(): void {
    this.stopAllSounds()
  }
}
