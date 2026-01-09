export function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
	return (
		<button
			type="button"
			onClick={() => onChange(!checked)}
			className="relative w-8 h-[18px] rounded-full transition-all duration-200 border shrink-0"
			style={{
				backgroundColor: checked ? 'var(--accent)' : 'var(--bg-primary)',
				borderColor: checked ? 'var(--accent)' : 'var(--border)',
			}}
		>
			<div
				className="absolute top-[2px] w-3 h-3 rounded-full transition-all duration-200"
				style={{
					left: checked ? '14px' : '2px',
					backgroundColor: checked ? 'white' : 'var(--text-muted)',
				}}
			/>
		</button>
	)
}
