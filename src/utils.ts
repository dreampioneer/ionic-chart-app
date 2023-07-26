export class Utils {
  static transparentize(color: string, alpha: number): string {
    // Implementation of the transparentize method
    // Add your logic here to adjust the transparency of the color
    return `rgba(${parseInt(color.slice(-6, -4), 16)}, ${parseInt(color.slice(-4, -2), 16)}, ${parseInt(color.slice(-2), 16)}, ${alpha})`;
  }

  // Other utility functions can be defined here
}
