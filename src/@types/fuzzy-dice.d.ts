declare module 'fuzzy-dice' {
  export interface rollResponse {
    num_successes: number
    num_criticals: number
  }

  export interface opposedCheckResponse {
    num_successes: number
    num_criticals: number
    num_opposed_successes: number
    outcome: 'failure' | 'partial success' | 'success' | 'critical success'
    magnitude: number
  }

  export class Dice {
    num_sides: number
    num_blank_sides: number
    num_crit_sides: number
    crit_threshold: number
    generator?: () => number

    /* eslint-disable */
    constructor (
      num_sides: number,
      num_blank_sides: number,
      num_crit_sides: number,
      crit_threshold: number,
      generator?
    )
    /* eslint-enable */
  }

  export function roll (dice: Dice, pdice: number): rollResponse

  /* eslint-disable */
  export function opposed_check (
    dice_type: Dice,
    num_dice: number,
    opposed_dice_type: Dice,
    num_opposed_dice: number
  ): opposedCheckResponse
  /* eslint-enable */
}
