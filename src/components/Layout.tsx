import type { ReactNode } from 'react'
import { StatusBar } from './StatusBar'
import { ThemeSwitcher } from './ThemeSwitcher'

interface Props {
	children: ReactNode
	instanceLabel?: string
	onLogoClick?: () => void
}

export function Layout({ children, instanceLabel, onLogoClick }: Props) {

	return (
		<div className="flex flex-col h-screen scanlines" style={{ backgroundColor: 'var(--bg-primary)' }}>
			<header className="relative z-50 flex items-center justify-between px-6 py-4 backdrop-blur-md" style={{ backgroundColor: 'color-mix(in srgb, var(--bg-secondary) 80%, transparent)' }}>
				<div className="absolute inset-0" style={{ background: 'linear-gradient(to right, color-mix(in srgb, var(--accent) 2%, transparent), transparent)' }} />
				<div className="relative flex items-center gap-3">
					<button
						onClick={onLogoClick}
						className="flex items-center gap-3 transition-opacity hover:opacity-80"
						title="Back to instances"
					>
						<img src="/logo.png" alt="qbitwebui" className="w-8 h-8" />
						<h1 className="text-base font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
							{instanceLabel || 'qbitwebui'}
						</h1>
					</button>
				</div>
				<div className="relative flex items-center gap-3">
					<ThemeSwitcher />
				</div>
			</header>
			<main className="flex-1 overflow-hidden flex flex-col">{children}</main>
			<StatusBar />
		</div>
	)
}
