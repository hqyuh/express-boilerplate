import Decimal from 'decimal.js';

export default class DecimalUtils {
  static minus(a: number, b: number): number {
    return new Decimal(a).minus(b).toNumber();
  }

  static plus(a: number, b: number): number {
    return new Decimal(a).plus(b).toNumber();
  }

  static times(a: number, b: number): number {
    return new Decimal(a).times(b).toNumber();
  }

  static divided(a: number, b: number): number {
    return new Decimal(a).div(b).toNumber();
  }
}
