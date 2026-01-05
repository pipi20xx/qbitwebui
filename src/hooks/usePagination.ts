import { useContext } from 'react'
import { PaginationContext } from '../contexts/paginationContext'

export function usePagination() {
	const ctx = useContext(PaginationContext)
	if (!ctx) throw new Error('usePagination must be used within PaginationProvider')
	return ctx
}
