export function calculateGST(amount: number, gstRate: number = 18): number {
  return +(amount * (gstRate / 100)).toFixed(2);
}
