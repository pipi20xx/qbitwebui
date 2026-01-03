import { useState, useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from './contexts/ThemeProvider'
import { InstanceProvider } from './contexts/InstanceContext'
import { Layout } from './components/Layout'
import { AuthForm } from './components/AuthForm'
import { InstanceManager } from './components/InstanceManager'
import { TorrentList } from './components/TorrentList'
import { getMe, type User } from './api/auth'
import type { Instance } from './api/instances'

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: 1,
			staleTime: 1000,
		},
	},
})

type View = 'loading' | 'auth' | 'instances' | 'torrents'

export default function App() {
	const [view, setView] = useState<View>('loading')
	const [user, setUser] = useState<User | null>(null)
	const [currentInstance, setCurrentInstance] = useState<Instance | null>(null)

	useEffect(() => {
		getMe()
			.then((u) => {
				if (u) {
					setUser(u)
					setView('instances')
				} else {
					setView('auth')
				}
			})
			.catch(() => setView('auth'))
	}, [])

	if (view === 'loading') {
		return (
			<ThemeProvider>
				<div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
					<div className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading...</div>
				</div>
			</ThemeProvider>
		)
	}

	if (view === 'auth') {
		return (
			<ThemeProvider>
				<AuthForm onSuccess={(u) => { setUser(u); setView('instances') }} />
			</ThemeProvider>
		)
	}

	if (view === 'instances' || !currentInstance) {
		return (
			<ThemeProvider>
				<InstanceManager
					username={user?.username || ''}
					onSelectInstance={(instance) => { setCurrentInstance(instance); setView('torrents') }}
					onLogout={() => { setUser(null); setCurrentInstance(null); setView('auth') }}
				/>
			</ThemeProvider>
		)
	}

	return (
		<ThemeProvider>
			<QueryClientProvider client={queryClient}>
				<InstanceProvider instance={currentInstance}>
					<Layout
						instanceLabel={currentInstance.label}
						onBackToInstances={() => { setCurrentInstance(null); setView('instances') }}
					>
						<TorrentList />
					</Layout>
				</InstanceProvider>
			</QueryClientProvider>
		</ThemeProvider>
	)
}
