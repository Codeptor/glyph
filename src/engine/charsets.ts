import type { CharacterSet, TerminalCharset } from '@/types'

const CHARSET_MAP: Record<CharacterSet, string> = {
  standard: '@%#*+=-:. ',
  blocks: '\u2588\u2593\u2592\u2591 ',
  detailed:
    '$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,"^`\'. ',
  minimal: '\u00b7\u2591\u2588',
  binary: '01',
  custom: '',
  'letters-upper': 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  'letters-lower': 'abcdefghijklmnopqrstuvwxyz',
  'letters-mixed': 'AaBbCcDdEeFfGgHhIiJjKkLlMm',
  'letters-symbols': '@#$%&*+=!?<>{}[]()',
}

const TERMINAL_CHARSET_MAP: Record<TerminalCharset, string> = {
  '101010': '101010',
  brackets: '[]/\\<>',
  dollar: '$_+',
  mixed: '01[]$_+/\\<>',
  pipes: '{}[]|/\\_+-',
}

export function getCharset(set: CharacterSet, customCharset: string): string {
  if (set === 'custom') return customCharset || ' .:-=+*#%@'
  return CHARSET_MAP[set]
}

export function getTerminalCharset(set: TerminalCharset): string {
  return TERMINAL_CHARSET_MAP[set]
}

export function getCharForBrightness(brightness: number, chars: string): string {
  if (chars.length === 0) return ' '
  const clamped = Math.max(0, Math.min(1, brightness))
  // invert: bright pixels → dense chars (visible on dark bg), dark → sparse/space (hidden)
  const index = Math.floor((1 - clamped) * (chars.length - 1))
  return chars[index]
}
