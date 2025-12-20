import { search } from '@inquirer/prompts'
import type { Worker } from '../api/types.ts'

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}/${month}/${day}`
}

export interface WorkerChoice {
  name: string
  value: Worker
}

export async function selectWorker(workers: Worker[]): Promise<Worker> {
  // Find the longest worker name for alignment
  const maxNameLength = Math.max(...workers.map((w) => w.id.length))

  const choices: WorkerChoice[] = workers.map((worker) => ({
    name: `${worker.id.padEnd(maxNameLength)}  (${formatDate(worker.modified_on)})`,
    value: worker,
  }))

  const selected = await search<Worker>({
    message: 'Select a Worker to open in browser:',
    source: async (input) => {
      if (!input) {
        return choices
      }
      const term = input.toLowerCase()
      return choices.filter((choice) => choice.name.toLowerCase().includes(term))
    },
    pageSize: 15,
  })

  return selected
}
