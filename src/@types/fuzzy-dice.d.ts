declare module 'fuzzy-dice' {

  export enum Outcome {
    FAILURE = 'failure',
    PARTIAL_SUCCESS = 'partial success',
    SUCCESS = 'success',
    CRITICAL_SUCCESS = 'critical success'
  }

  export type rollResponse = {
    num_successes: number;
    num_criticals: number;
  }

  export type opposedCheckResponse = {
    num_successes: number;
    num_criticals: number;
    num_opposed_successes: number;
    outcome: Outcome;
    magnitude: number;
  }

  export class Dice {
    num_sides: number;
    num_blank_sides: number;
    num_crit_sides: number;
    crit_threshold: number;
    generator?: () => number;

    constructor(num_sides:number, num_blank_sides:number, num_crit_sides:number, crit_threshold:number, generator?)
  }

  export function roll(dice: Dice, pdice: number):rollResponse;
  export function opposed_check(dice_type: Dice, num_dice: number, opposed_dice_type: Dice, num_opposed_dice: number):opposedCheckResponse;
}