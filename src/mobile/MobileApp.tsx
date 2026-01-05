import { useState, useEffect, useCallback } from 'react'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { getInstances, type Instance } from '../api/instances'
import { logout } from '../api/auth'
import { MobileInstancePicker } from './MobileInstancePicker'
import { MobileStats } from './MobileStats'
import { MobileTorrentList } from './MobileTorrentList'
import { MobileTorrentDetail } from './MobileTorrentDetail'

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: 1,
			staleTime: 1000,
		},
	},
})

interface Props {
	username: string
	onLogout: () => void
}

export function MobileApp({ username, onLogout }: Props) {
	const [instances, setInstances] = useState<Instance[]>([])
	const [selectedInstance, setSelectedInstance] = useState<Instance | 'all'>('all')
	const [loading, setLoading] = useState(true)
	const [selectedTorrentHash, setSelectedTorrentHash] = useState<string | null>(null)
	const [selectedTorrentInstanceId, setSelectedTorrentInstanceId] = useState<number | null>(null)
	const [showUserMenu, setShowUserMenu] = useState(false)

	const loadInstances = useCallback(async () => {
		try {
			const data = await getInstances()
			setInstances(data)
		} finally {
			setLoading(false)
		}
	}, [])

	useEffect(() => {
		loadInstances()
	}, [loadInstances])

	async function handleLogout() {
		await logout()
		onLogout()
	}

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
				<div className="flex flex-col items-center gap-3">
					<div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 60%, black))' }}>
						<svg className="w-5 h-5 animate-pulse" style={{ color: 'var(--accent-contrast)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
							<path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
						</svg>
					</div>
					<span className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading...</span>
				</div>
			</div>
		)
	}

	if (instances.length === 0) {
		return (
			<div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
				<div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: 'var(--bg-secondary)' }}>
					<svg className="w-8 h-8" style={{ color: 'var(--text-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
						<path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z" />
					</svg>
				</div>
				<h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>No Instances</h2>
				<p className="text-sm text-center mb-6" style={{ color: 'var(--text-muted)' }}>
					Add a qBittorrent instance using the desktop version to get started.
				</p>
				<button
					onClick={handleLogout}
					className="px-6 py-3 rounded-xl text-sm font-medium"
					style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
				>
					Logout
				</button>
			</div>
		)
	}

	return (
		<QueryClientProvider client={queryClient}>
			<div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-primary)' }}>
				<header
					className="sticky top-0 z-40 px-4 py-3 border-b backdrop-blur-xl"
					style={{
						backgroundColor: 'color-mix(in srgb, var(--bg-primary) 85%, transparent)',
						borderColor: 'var(--border)',
					}}
				>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<img src="/logo.png" alt="qbitwebui" className="w-8 h-8" />
							<MobileInstancePicker
								instances={instances}
								current={selectedInstance}
								onChange={setSelectedInstance}
							/>
						</div>
						<div className="relative">
							<button
								onClick={() => setShowUserMenu(!showUserMenu)}
								className="w-9 h-9 rounded-full flex items-center justify-center active:scale-95 transition-transform"
								style={{ backgroundColor: 'var(--bg-secondary)' }}
							>
								<svg className="w-5 h-5" style={{ color: 'var(--text-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
									<path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
								</svg>
							</button>
							{showUserMenu && (
								<>
									<div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
									<div
										className="absolute right-0 top-full mt-2 z-50 min-w-[160px] rounded-xl border shadow-xl overflow-hidden"
										style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
									>
										<div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
											<span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{username}</span>
										</div>
										<button
											onClick={() => { setShowUserMenu(false); handleLogout() }}
											className="w-full text-left px-4 py-3 text-sm active:bg-[var(--bg-tertiary)] flex items-center gap-3"
											style={{ color: 'var(--error)' }}
										>
											<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
												<path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
											</svg>
											Logout
										</button>
									</div>
								</>
							)}
						</div>
					</div>
				</header>

				<main className="flex-1 overflow-y-auto">
					<div className="p-4 space-y-4">
						<MobileStats
							instances={selectedInstance === 'all' ? instances : [selectedInstance]}
						/>
						<MobileTorrentList
							instances={selectedInstance === 'all' ? instances : [selectedInstance]}
							onSelectTorrent={(hash, instanceId) => {
								setSelectedTorrentHash(hash)
								setSelectedTorrentInstanceId(instanceId)
							}}
						/>
					</div>
				</main>

				{selectedTorrentHash && selectedTorrentInstanceId && (
					<MobileTorrentDetail
						torrentHash={selectedTorrentHash}
						instanceId={selectedTorrentInstanceId}
						onClose={() => {
							setSelectedTorrentHash(null)
							setSelectedTorrentInstanceId(null)
						}}
					/>
				)}
			</div>
		</QueryClientProvider>
	)
}
