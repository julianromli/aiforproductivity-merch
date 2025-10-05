import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format currency untuk display
 * - IDR: Rp 10.000 (tanpa koma desimal)
 * - USD/EUR: $10.00 atau €10.00
 */
export function formatCurrency(amount: number, currency: string): string {
  if (currency === 'IDR') {
    // Format IDR: Rp 10.000 (no decimals, use dot as thousand separator)
    const formatted = Math.round(amount).toLocaleString('id-ID')
    return `Rp ${formatted}`
  }
  
  // Format other currencies with decimals
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
  }
  
  const symbol = symbols[currency] || currency
  return `${symbol}${amount.toFixed(2)}`
}
