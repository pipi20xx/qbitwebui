import { createContext } from 'react'
import type { Instance } from '../api/instances'

interface InstanceContextValue {
	instance: Instance
}

export const InstanceContext = createContext<InstanceContextValue | null>(null)
