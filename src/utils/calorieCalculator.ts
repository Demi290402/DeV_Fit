/**
 * Scientific Calorie & Metabolic Calculation Engine for DeV Fit
 * 
 * Formulations implemented:
 * 1. Keytel et al. (2005) - "Prediction of energy expenditure from heart rate monitoring during submaximal exercise"
 *    - Men: [(-55.0969 + (0.6309 * HR) + (0.1988 * Weight) + (0.2017 * Age)) / 4.184] * Duration_min
 *    - Women: [(-20.4022 + (0.4472 * HR) - (0.1263 * Weight) + (0.074 * Age)) / 4.184] * Duration_min
 * 
 * 2. Compendium of Physical Activities (Ainsworth et al.) for Resistance Training:
 *    - Metabolic energy: (MET * 3.5 * Weight_kg / 200) * Duration_min
 *    - Mechanical work: (Volume_kg * 9.81 * 0.65m) / (0.22 * 4184 J/kcal)
 * 
 * 3. Compendium of Physical Activities & Margaria formula for Running:
 *    - Energy expenditure ~= 1.036 * Weight_kg * Distance_km
 *    - Speed-adjusted METs: 8.0 MET (8 km/h) up to 13.5 MET (15 km/h)
 * 
 * 4. Fallback when user body stats are unknown:
 *    - Derived strictly from work sets and tonnage (~4.2 kcal per completed set + 0.015 * totalVolumeKg)
 */

export interface CalorieCalcUser {
  gender?: 'male' | 'female' | 'other';
  weightKg?: number;
  age?: number;
}

export interface CalorieCalcWorkout {
  durationSeconds: number;
  avgHeartRate?: number;
  totalVolumeKg?: number;
  completedSetsCount?: number;
  activityType?: 'strength' | 'running' | 'other';
  distanceKm?: number;
}

/**
 * Calculates scientifically grounded calories burned for a workout.
 */
export function calculateWorkoutCalories(
  user: CalorieCalcUser | undefined,
  workout: CalorieCalcWorkout
): number {
  const durationMin = Math.max(1, workout.durationSeconds / 60);
  const weight = user?.weightKg && user.weightKg > 30 && user.weightKg < 250 ? user.weightKg : 70;
  const gender = user?.gender === 'male' ? 'male' : 'female';
  const age = user?.age && user.age > 10 && user.age < 100 ? user.age : 28;

  // Case 1: Real Heart Rate measured from smart device
  if (workout.avgHeartRate && workout.avgHeartRate >= 50 && workout.avgHeartRate <= 220) {
    const hr = workout.avgHeartRate;
    let caloriesPerMin: number;

    if (gender === 'male') {
      const kjPerMin = -55.0969 + (0.6309 * hr) + (0.1988 * weight) + (0.2017 * age);
      caloriesPerMin = kjPerMin / 4.184;
    } else {
      const kjPerMin = -20.4022 + (0.4472 * hr) - (0.1263 * weight) + (0.074 * age);
      caloriesPerMin = kjPerMin / 4.184;
    }

    // Ensure non-negative physiological rate (at least BMR equivalent ~1.1 kcal/min)
    caloriesPerMin = Math.max(1.1, caloriesPerMin);
    return Math.round(caloriesPerMin * durationMin);
  }

  // Case 2: Running Activity without heart rate
  if (workout.activityType === 'running' && workout.distanceKm && workout.distanceKm > 0) {
    const distance = workout.distanceKm;
    const speedKmH = distance / (durationMin / 60);

    let met = 9.0;
    if (speedKmH <= 8.0) met = 8.0;
    else if (speedKmH <= 9.7) met = 9.8;
    else if (speedKmH <= 11.3) met = 11.0;
    else if (speedKmH <= 12.9) met = 11.8;
    else if (speedKmH <= 14.5) met = 12.8;
    else met = 14.0;

    // Compendium formula: (MET * 3.5 * weight / 200) * durationMin
    const metCalories = (met * 3.5 * weight / 200) * durationMin;
    // Margaria distance formula verification: 1.036 * weight * distance
    const margariaCalories = 1.036 * weight * distance;

    // Blend standard MET and distance work
    const blendedRunningCalories = Math.round((metCalories * 0.5) + (margariaCalories * 0.5));
    return Math.max(20, blendedRunningCalories);
  }

  // Case 3: Resistance Training with User Weight known
  if (user?.weightKg && user.weightKg > 30) {
    // Standard moderate-to-vigorous resistance training MET = 5.0
    const aerobicCost = (5.0 * 3.5 * weight / 200) * durationMin;
    
    // Mechanical work: lifting mass against gravity (approx 0.65m displacement, 22% muscle mechanical efficiency)
    let mechanicalKcal = 0;
    if (workout.totalVolumeKg && workout.totalVolumeKg > 0) {
      const mechanicalWorkJoules = workout.totalVolumeKg * 9.81 * 0.65;
      const metabolicJoules = mechanicalWorkJoules / 0.22;
      mechanicalKcal = metabolicJoules / 4184;
    }

    const totalResistanceCalories = Math.round(aerobicCost + mechanicalKcal);
    return Math.max(30, totalResistanceCalories);
  }

  // Case 4: Fallback when user body stats are completely missing
  // Calculated conservatively based on sets and volume
  const sets = workout.completedSetsCount || 10;
  const vol = workout.totalVolumeKg || 0;
  const conservativeCalories = Math.round((sets * 4.2) + (vol * 0.015) + (durationMin * 2.5));
  return Math.max(25, conservativeCalories);
}

/**
 * Calculates running pace in min/km from distance (km) and duration (seconds).
 * Example: 5 km in 25 min (1500s) -> { paceMinutesPerKm: 5.0, paceString: "5'00\" /km" }
 */
export function calculatePace(
  distanceKm: number,
  durationSeconds: number
): { paceMinutesPerKm: number; paceString: string; speedKmH: number } {
  if (!distanceKm || distanceKm <= 0 || !durationSeconds || durationSeconds <= 0) {
    return { paceMinutesPerKm: 0, paceString: "--'--\" /km", speedKmH: 0 };
  }

  const paceSecondsPerKm = durationSeconds / distanceKm;
  const minutes = Math.floor(paceSecondsPerKm / 60);
  const seconds = Math.round(paceSecondsPerKm % 60);
  const paceMinutesPerKm = paceSecondsPerKm / 60;
  const speedKmH = Number((distanceKm / (durationSeconds / 3600)).toFixed(2));

  const paceString = `${minutes}'${seconds.toString().padStart(2, '0')}" /km`;

  return {
    paceMinutesPerKm,
    paceString,
    speedKmH
  };
}
