export class GcpClient {
  constructor(private token: string) {}

  async request<T>(url: string): Promise<T> {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`GCP API request failed: ${response.status} ${response.statusText}\n${text}`)
    }

    return (await response.json()) as T
  }
}
