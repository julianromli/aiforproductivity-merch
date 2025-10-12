// Color constants for product variants
// Add more colors here as needed
export const COLOR_MAP = {
  Black: '#000000',
  White: '#FFFFFF',
  Custom: '#CCCCCC',
} as const

export type ColorName = keyof typeof COLOR_MAP

export const COLOR_OPTIONS: Array<{ value: ColorName; label: string }> = [
  { value: 'Black', label: 'Black' },
  { value: 'White', label: 'White' },
  { value: 'Custom', label: 'Custom' },
]
