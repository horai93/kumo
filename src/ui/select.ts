import { search } from '@inquirer/prompts'
import type { Worker } from '../api/types.ts'

export interface WorkerChoice {
  name: string
  value: Worker
  description: string
}

export async function selectWorker(workers: Worker[]): Promise<Worker> {
  const choices: WorkerChoice[] = workers.map((worker) => ({
    name: worker.id,
    value: worker,
    description: `Modified: ${new Date(worker.modified_on).toLocaleDateString()}`,
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
