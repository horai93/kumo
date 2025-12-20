const GITHUB_REPO = 'horai93/kumo'
const CURRENT_VERSION = '0.3.0'

interface GitHubRelease {
  tag_name: string
}

export async function getLatestVersion(): Promise<string | null> {
  try {
    const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`, {
      headers: { Accept: 'application/vnd.github.v3+json' },
    })
    if (!response.ok) return null
    const data = (await response.json()) as GitHubRelease
    return data.tag_name.replace(/^v/, '')
  } catch {
    return null
  }
}

export function getCurrentVersion(): string {
  return CURRENT_VERSION
}

export function compareVersions(current: string, latest: string): boolean {
  const currentParts = current.split('.').map(Number)
  const latestParts = latest.split('.').map(Number)

  for (let i = 0; i < Math.max(currentParts.length, latestParts.length); i++) {
    const c = currentParts[i] ?? 0
    const l = latestParts[i] ?? 0
    if (l > c) return true
    if (l < c) return false
  }
  return false
}

export async function checkForUpdate(): Promise<string | null> {
  const latest = await getLatestVersion()
  if (!latest) return null
  if (compareVersions(CURRENT_VERSION, latest)) {
    return latest
  }
  return null
}
