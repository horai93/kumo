const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']

export function createSpinner(message: string) {
  let frameIndex = 0
  let interval: ReturnType<typeof setInterval> | null = null

  const start = () => {
    interval = setInterval(() => {
      process.stdout.write(`\r${SPINNER_FRAMES[frameIndex]} ${message}`)
      frameIndex = (frameIndex + 1) % SPINNER_FRAMES.length
    }, 80)
  }

  const stop = (finalMessage?: string) => {
    if (interval) {
      clearInterval(interval)
      interval = null
    }
    process.stdout.write('\r\x1b[K') // Clear line
    if (finalMessage) {
      console.log(finalMessage)
    }
  }

  return { start, stop }
}
