import type { GcpClient } from './client.ts'

export type Project = {
  projectId: string
  name: string
  lifecycleState: 'ACTIVE' | 'DELETE_REQUESTED' | 'DELETE_IN_PROGRESS'
}

type ProjectsResponse = {
  projects?: Project[]
}

export async function getProjects(client: GcpClient): Promise<Project[]> {
  const url = 'https://cloudresourcemanager.googleapis.com/v1/projects?filter=lifecycleState:ACTIVE'
  const response = await client.request<ProjectsResponse>(url)
  return response.projects ?? []
}
