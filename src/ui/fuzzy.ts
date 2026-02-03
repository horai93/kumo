export function fuzzyMatch(text: string, pattern: string): boolean {
  const lowerText = text.toLowerCase()
  const lowerPattern = pattern.toLowerCase()
  let patternIdx = 0
  for (const char of lowerText) {
    if (char === lowerPattern[patternIdx]) {
      patternIdx++
      if (patternIdx === lowerPattern.length) return true
    }
  }
  return patternIdx === lowerPattern.length
}
