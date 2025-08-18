export class RiskCalculator {

  static calculateCrashRisk(multiplier: number): number {
    // Target probabilities: 48% reach 2x, 24% reach 4x, 12% reach 8x, etc.
    // This means: 52% crash before 2x, 24% crash between 2x-4x, 12% crash between 4x-8x
    
    if (multiplier < 1.0) return 0; // No crash before game starts
    
    // Calculate which "zone" we're in based on powers of 2
    const logMultiplier = Math.log2(multiplier);
    const zone = Math.floor(logMultiplier); // 0 for 1x-2x, 1 for 2x-4x, 2 for 4x-8x, etc.
    
    // Target survival probabilities at key thresholds
    // P(reach 2x) = 0.48, P(reach 4x) = 0.24, P(reach 8x) = 0.12, etc.
    const baseSurvivalProb = 0.48; // 48% chance to reach 2x
    
    // Calculate target survival probability for current zone
    const targetSurvivalProb = baseSurvivalProb / Math.pow(2, zone);
    const nextZoneSurvivalProb = baseSurvivalProb / Math.pow(2, zone + 1);
    
    // Calculate how far we are within the current zone (0 to 1)
    const progressInZone = logMultiplier - zone;
    
    // Calculate the crash risk per frame needed to achieve target distribution
    // We need to go from targetSurvivalProb to nextZoneSurvivalProb over this zone
    
    // Current survival probability at this exact multiplier (linear interpolation in log space)
    const currentSurvivalProb = targetSurvivalProb * Math.pow(nextZoneSurvivalProb / targetSurvivalProb, progressInZone);
    
    // Risk per frame calculation
    // We want the probability to decrease smoothly within each zone
    const riskFactor = 0.001; // Base risk factor - adjust this to tune game difficulty
    const zoneMultiplier = Math.pow(2, zone); // 1, 2, 4, 8, 16...
    
    // Risk increases exponentially with multiplier, but in a controlled way
    const risk = riskFactor * zoneMultiplier * (1 + progressInZone);
    
    // Cap maximum risk to prevent instant crashes
    return Math.min(risk, 0.02); // Max 2% per frame
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
    const crashRisk = this.calculateCrashRisk(multiplier);
    return Math.random() < crashRisk;
  }

  // Helper method to get the theoretical survival probability at any multiplier
  static getSurvivalProbability(multiplier: number): number {
    if (multiplier <= 1.0) return 1.0;
    
    const logMultiplier = Math.log2(multiplier);
    const baseSurvivalProb = 0.48;
    
    // Survival probability decreases by half for each doubling of multiplier
    return baseSurvivalProb / Math.pow(2, logMultiplier - 1);
  }
}
