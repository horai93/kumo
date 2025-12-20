export interface CloudflareApiResponse<T> {
  success: boolean
  errors: CloudflareApiError[]
  messages: CloudflareApiMessage[]
  result: T
  result_info?: ResultInfo
}

export interface CloudflareApiError {
  code: number
  message: string
  documentation_url?: string
}

export interface CloudflareApiMessage {
  code: number
  message: string
}

export interface ResultInfo {
  page: number
  per_page: number
  count: number
  total_count: number
}

export interface Account {
  id: string
  name: string
  type: string
  created_on: string
}

export interface Worker {
  id: string
  etag: string
  created_on: string
  modified_on: string
  compatibility_date?: string
  compatibility_flags?: string[]
  handlers?: string[]
  has_assets?: boolean
  has_modules?: boolean
  last_deployed_from?: string
  logpush?: boolean
  usage_model?: string
  placement_mode?: string
}
