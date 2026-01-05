import { createContext } from 'react'

export interface PaginationContextValue {
	page: number
	perPage: number
	totalItems: number
	setPage: (page: number) => void
	setPerPage: (perPage: number) => void
	setTotalItems: (total: number) => void
	totalPages: number
}

export const PaginationContext = createContext<PaginationContextValue | null>(null)
