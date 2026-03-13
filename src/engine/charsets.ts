import type { CharacterSet, BrailleVariant, TerminalCharset } from '@/types'

const CHARSET_MAP: Record<CharacterSet, string> = {
  standard: ' .:-=+*#%@',
  blocks: ' ░▒▓█',
  detailed:
    " .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$",
  minimal: ' ·░█',
  binary: ' 01',
  custom: '',
  'letters-upper': 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  'letters-lower': 'abcdefghijklmnopqrstuvwxyz',
  'letters-mixed': 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz',
  'letters-symbols': '@#$%&*+=-<>~',
}

const BRAILLE_CHARSET = ' ⠁⠂⠃⠄⠅⠆⠇⠈⠉⠊⠋⠌⠍⠎⠏⠐⠑⠒⠓⠔⠕⠖⠗⠘⠙⠚⠛⠜⠝⠞⠟⠠⠡⠢⠣⠤⠥⠦⠧⠨⠩⠪⠫⠬⠭⠮⠯⠰⠱⠲⠳⠴⠵⠶⠷⠸⠹⠺⠻⠼⠽⠾⠿'

const BRAILLE_VARIANT_MAP: Record<BrailleVariant, string> = {
  standard: BRAILLE_CHARSET,
  sparse: ' ⠁⠂⠄⠈⠐⠠⡀⢀⣀⣿',
  dense: ' ⠃⠇⠏⠟⠿',
}

const TERMINAL_CHARSET_MAP: Record<TerminalCharset, string> = {
  '101010': ' 010101',
  brackets: ' []/\\<>',
  dollar: ' $_+',
  mixed: ' 01[]/\\<>$_+|',
  pipes: ' 01{}[]/\\<>|_+-',
}

export function getCharset(set: CharacterSet, customCharset: string): string {
  if (set === 'custom') return customCharset || ' .:-=+*#%@'
  return CHARSET_MAP[set]
}

export function getTerminalCharset(set: TerminalCharset): string {
  return TERMINAL_CHARSET_MAP[set]
}

export function getBrailleCharset(variant: BrailleVariant): string {
  return BRAILLE_VARIANT_MAP[variant]
}

export function getCharForBrightness(brightness: number, chars: string): string {
  if (chars.length === 0) return ' '
  const clamped = Math.max(0, Math.min(1, brightness))
  const index = Math.floor(clamped * (chars.length - 1))
  return chars[index]
}
