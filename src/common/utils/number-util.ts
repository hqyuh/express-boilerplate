export default class NumberUtils {
  static numberWithCommas(x: string | number) {
    return x.toString().replaceAll(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
}
