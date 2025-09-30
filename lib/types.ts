export interface Product {
  id: string
  name: string
  price: number
  currency: string
  category: string
  description: string | null
  image_url: string
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
  ai_prompts?: AIPrompt[]
}

export interface AIPrompt {
  id: string
  product_id: string
  prompt_template: string
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  prompt_instructions: string | null
  created_at: string
}

export interface PaginationParams {
  page?: number
  limit?: number
  search?: string
  category?: string
  is_active?: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
