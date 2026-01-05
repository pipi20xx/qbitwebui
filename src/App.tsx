import { useState, useEffect, lazy, Suspense } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from './contexts/ThemeProvider'
import { InstanceProvider } from './contexts/InstanceContext'
import { PaginationProvider } from './contexts/PaginationContext'
import { Layout } from './components/Layout'
import { AuthForm } from './components/AuthForm'
import { InstanceManager } from './components/InstanceManager'
import { TorrentList } from './components/TorrentList'
import { getMe, type User } from './api/auth'
import type { Instance } from './api/instances'

const MobileApp = lazy(() => import('./mobile/MobileApp').then(m => ({ default: m.MobileApp })))

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: 1,
			staleTime: 1000,
		},
	},
})

const isMobile = () => window.innerWidth < 768

type View = 'loading' | 'auth' | 'instances' | 'torrents' | 'mobile'

export default function App() {
	const [view, setView] = useState<View>('loading')
	const [user, setUser] = useState<User | null>(null)
	const [currentInstance, setCurrentInstance] = useState<Instance | null>(null)

	useEffect(() => {
		getMe()
			.then((u) => {
				if (u) {
					setUser(u)
					setView(isMobile() ? 'mobile' : 'instances')
				} else {
					setView('auth')
				}
			})
			.catch(() => setView('auth'))
	}, [])

	useEffect(() => {
		function handlePopState() {
			if (currentInstance) {
				setCurrentInstance(null)
				setView('instances')
			}
		}
		window.addEventListener('popstate', handlePopState)
		return () => window.removeEventListener('popstate', handlePopState)
	}, [currentInstance])

	function selectInstance(instance: Instance) {
		setCurrentInstance(instance)
		setView('torrents')
		history.pushState({ instance: instance.id }, '', `#${instance.id}`)
	}

	function goBackToInstances() {
		setCurrentInstance(null)
		setView('instances')
		history.back()
	}

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
				<AuthForm onSuccess={(u) => { setUser(u); setView(isMobile() ? 'mobile' : 'instances') }} />
			</ThemeProvider>
		)
	}

	if (view === 'mobile') {
		return (
			<ThemeProvider>
				<Suspense fallback={
					<div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
						<div className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading...</div>
					</div>
				}>
					<MobileApp
						username={user?.username || ''}
						onLogout={() => { setUser(null); setView('auth') }}
					/>
				</Suspense>
			</ThemeProvider>
		)
	}

	if (view === 'instances' || !currentInstance) {
		return (
			<ThemeProvider>
				<QueryClientProvider client={queryClient}>
					<InstanceManager
						username={user?.username || ''}
						onSelectInstance={selectInstance}
						onLogout={() => { setUser(null); setCurrentInstance(null); setView('auth') }}
					/>
				</QueryClientProvider>
			</ThemeProvider>
		)
	}

	return (
		<ThemeProvider>
			<QueryClientProvider client={queryClient}>
				<InstanceProvider instance={currentInstance}>
					<PaginationProvider>
						<Layout
							instanceLabel={currentInstance.label}
							onLogoClick={goBackToInstances}
						>
							<TorrentList />
						</Layout>
					</PaginationProvider>
				</InstanceProvider>
			</QueryClientProvider>
		</ThemeProvider>
	)
}
