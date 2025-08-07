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
    // Simple arithmetic progression: +0.01 each step
    const timeInSeconds = elapsedTimeMs / 500; // Convert to seconds
    const stepsPerSecond = 1 + elapsedTimeMs / 1000; // How many steps per second (controls speed)
    const incrementPerStep = 0.01; // Exactly 0.01 increase per step
    
    const totalSteps = Math.floor(timeInSeconds * stepsPerSecond);
    const totalMultiplier = 1.0 + (totalSteps * incrementPerStep);
    
    return totalMultiplier;
  }

  static shouldCrash(multiplier: number): boolean {
    const crashRisk = this.calculateCrashRisk(multiplier)
    return Math.random() < crashRisk
  }
}
