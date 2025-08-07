export class RiskCalculator {
  static calculateCrashRisk(multiplier: number): number {
    // Base risk starts very low and increases geometrically
    const baseRisk = 0.0001 // 0.01% at 1x multiplier
    const riskGrowthFactor = 2.0 // Risk doubles with each multiplier
    
    // Calculate risk: baseRisk * (riskGrowthFactor ^ (multiplier - 1))
    const risk = baseRisk * Math.pow(riskGrowthFactor, multiplier - 1)
    
    // Cap maximum risk at 1% per frame
    return Math.min(risk, 0.01)
  }

  static calculateMultiplier(elapsedTimeMs: number): number {
    // Geometric multiplier growth: 1.01^(time_in_seconds)
    const timeInSeconds = elapsedTimeMs / 1000
    return Math.pow(1.01, timeInSeconds)
  }

  static shouldCrash(multiplier: number): boolean {
    const crashRisk = this.calculateCrashRisk(multiplier)
    return Math.random() < crashRisk
  }
}
