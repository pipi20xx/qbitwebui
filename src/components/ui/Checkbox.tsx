export function Checkbox({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
	return (
		<button type="button" onClick={() => onChange(!checked)} className="flex items-center gap-2 text-left">
			<div
				className="w-4 h-4 rounded flex items-center justify-center border transition-colors shrink-0"
				style={{
					backgroundColor: checked ? 'var(--accent)' : 'transparent',
					borderColor: checked ? 'var(--accent)' : 'var(--border)',
				}}
			>
				{checked && (
					<svg className="w-2.5 h-2.5" style={{ color: 'white' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
						<path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
					</svg>
				)}
			</div>
			{label && <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{label}</span>}
		</button>
	)
}
