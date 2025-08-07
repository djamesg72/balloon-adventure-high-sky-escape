/**
 * Audio Manager for Balloon Adventure Game
 * Handles sound effects and background music
 */

export interface AudioOptions {
  volume?: number
  loop?: boolean
  playbackRate?: number
}

export class AudioManager {
  private sounds: Map<string, HTMLAudioElement> = new Map()
  private masterVolume: number = 1.0
  private muted: boolean = false

  constructor() {
    // Initialize with default volume from localStorage
    const savedVolume = localStorage.getItem('balloon-game-volume')
    if (savedVolume) {
      this.masterVolume = parseFloat(savedVolume)
    }

    const savedMuted = localStorage.getItem('balloon-game-muted')
    if (savedMuted) {
      this.muted = savedMuted === 'true'
    }
  }

  /**
   * Load a sound effect
   */
  async loadSound(name: string, url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const audio = new Audio()
      
      audio.oncanplaythrough = () => {
        this.sounds.set(name, audio)
        resolve()
      }
      
      audio.onerror = (error) => {
        console.warn(`Failed to load sound: ${name}`, error)
        reject(error)
      }
      
      audio.src = url
      audio.preload = 'auto'
    })
  }

  /**
   * Play a sound effect
   */
  playSound(name: string, options: AudioOptions = {}): void {
    if (this.muted) return

    const sound = this.sounds.get(name)
    if (!sound) {
      console.warn(`Sound not found: ${name}`)
      return
    }

    try {
      // Clone the audio element for overlapping sounds
      const audioClone = sound.cloneNode() as HTMLAudioElement
      
      audioClone.volume = (options.volume ?? 1.0) * this.masterVolume
      audioClone.loop = options.loop ?? false
      audioClone.playbackRate = options.playbackRate ?? 1.0
      
      audioClone.play().catch(error => {
        console.warn(`Failed to play sound: ${name}`, error)
      })

      // Clean up after playback
      if (!audioClone.loop) {
        audioClone.addEventListener('ended', () => {
          audioClone.remove()
        })
      }
    } catch (error) {
      console.warn(`Error playing sound: ${name}`, error)
    }
  }

  /**
   * Stop a specific sound
   */
  stopSound(name: string): void {
    const sound = this.sounds.get(name)
    if (sound) {
      sound.pause()
      sound.currentTime = 0
    }
  }

  /**
   * Stop all sounds
   */
  stopAllSounds(): void {
    this.sounds.forEach(sound => {
      sound.pause()
      sound.currentTime = 0
    })
  }

  /**
   * Set master volume (0.0 - 1.0)
   */
  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume))
    localStorage.setItem('balloon-game-volume', this.masterVolume.toString())
  }

  /**
   * Get master volume
   */
  getMasterVolume(): number {
    return this.masterVolume
  }

  /**
   * Mute/unmute all sounds
   */
  setMuted(muted: boolean): void {
    this.muted = muted
    localStorage.setItem('balloon-game-muted', muted.toString())
    
    if (muted) {
      this.stopAllSounds()
    }
  }

  /**
   * Check if muted
   */
  isMuted(): boolean {
    return this.muted
  }

  /**
   * Create procedural wind sound (Web Audio API)
   */
  createWindSound(): void {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      
      // Create noise buffer
      const bufferSize = audioContext.sampleRate * 2
      const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate)
      const data = buffer.getChannelData(0)
      
      // Generate pink noise for wind effect
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.1
      }
      
      // Create filter for wind-like sound
      const source = audioContext.createBufferSource()
      const filter = audioContext.createBiquadFilter()
      const gainNode = audioContext.createGain()
      
      source.buffer = buffer
      source.loop = true
      
      filter.type = 'lowpass'
      filter.frequency.value = 300
      filter.Q.value = 1
      
      gainNode.gain.value = this.muted ? 0 : 0.1 * this.masterVolume
      
      source.connect(filter)
      filter.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      source.start()
      
      // Store reference for wind sound control
      ;(this as any).windSource = source
      ;(this as any).windGain = gainNode
      
    } catch (error) {
      console.warn('Failed to create wind sound:', error)
    }
  }

  /**
   * Update wind intensity
   */
  setWindIntensity(intensity: number): void {
    const windGain = (this as any).windGain
    if (windGain) {
      const volume = this.muted ? 0 : intensity * 0.2 * this.masterVolume
      windGain.gain.setValueAtTime(volume, windGain.context.currentTime)
    }
  }

  /**
   * Load default game sounds
   */
  async loadDefaultSounds(): Promise<void> {
    const soundUrls = {
      pop: this.createPopSound(),
      land: this.createLandSound(),
      start: this.createStartSound()
    }

    const loadPromises = Object.entries(soundUrls).map(([name, url]) => 
      this.loadSound(name, url).catch(() => {
        // Ignore load failures for procedural sounds
      })
    )

    await Promise.allSettled(loadPromises)
  }

  /**
   * Create pop sound (procedural)
   */
  private createPopSound(): string {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.type = 'square'
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.1)
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.start()
      oscillator.stop(audioContext.currentTime + 0.1)
      
      return 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DsuWkeBDaJ0O3QgS4HHnLA7+OZUQ0PVqzn77BdGAg+ltryxnkpBSl+zPLaizsIGGS57OOYTgwOUarm7L5uHAU6jdXzzn4wByF8wvPbkEELElyx6OyrWBUIQ5zd8sFuIAM5kdDw0H8vBx9vtu3lnVIPA1ap5+62XBoHN4nQ8tCALAcddsLu45ZQDAxOruLuuW0bBzuL0vLOcDEDH3DA8diHXA0OVqzn77BdGAg+ltryxnkpBSl+zPLaizsIGGS57OOYTgwOUarm7L5uHAU6jdXzzn4wByF8wvPbkEELElyx6OyrWBUIQ5zd8sFuIAM5kdDw0H8vBx9vtu3lnVIPA1ap5+62XBoHN4nQ8tCALAcddsLu45ZQDAxOruLuuW0bBzuL0vLOcDEDH3DA8diHXA0OVqzn77BdGAg+ltryxnkpBSl+zPLaizsIGGS57OOYTgwOUarm7L5uHAU6jdXzzn4wByF8wvPbkEELElyx6OyrWBUIQ5zd8sFuIAM5kdDw0H8vBx9vtu3lnVIPA1ap5+62XBoHN4nQ8tCALAcddsLu45ZQDAxOruLuuW0bBzuL0vLOcDEDH3DA8diHXA=='
    } catch {
      return ''
    }
  }

  /**
   * Create landing sound (procedural)
   */
  private createLandSound(): string {
    // Returns empty string - would need more complex audio generation
    return ''
  }

  /**
   * Create start sound (procedural)
   */
  private createStartSound(): string {
    // Returns empty string - would need more complex audio generation
    return ''
  }

  /**
   * Cleanup audio resources
   */
  destroy(): void {
    this.stopAllSounds()
    
    // Stop wind sound
    const windSource = (this as any).windSource
    if (windSource) {
      windSource.stop()
    }
    
    this.sounds.clear()
  }
}
