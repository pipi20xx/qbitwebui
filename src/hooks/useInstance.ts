import { useContext } from 'react'
import { InstanceContext } from '../contexts/instanceContext'
import type { Instance } from '../api/instances'

export function useInstance(): Instance {
	const context = useContext(InstanceContext)
	if (!context) {
		throw new Error('useInstance must be used within InstanceProvider')
	}
	return context.instance
}
