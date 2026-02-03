import { spawn } from 'node:child_process'

export async function copyToClipboard(text: string): Promise<void> {
  const platform = process.platform
  let cmd: string
  let args: string[]

  if (platform === 'darwin') {
    cmd = 'pbcopy'
    args = []
  } else if (platform === 'win32') {
    cmd = 'clip'
    args = []
  } else {
    cmd = 'xclip'
    args = ['-selection', 'clipboard']
  }

  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, { stdio: ['pipe', 'ignore', 'ignore'] })
    proc.stdin.write(text)
    proc.stdin.end()
    proc.on('close', (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`Failed to copy to clipboard (exit code: ${code})`))
      }
    })
    proc.on('error', reject)
  })
}
