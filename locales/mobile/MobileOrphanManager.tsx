import { useState } from 'react'
import { Check, CheckCircle, ChevronLeft, HardDrive, Search } from 'lucide-react'
import { type Instance } from '../api/instances'
import { deleteTorrents } from '../api/qbittorrent'
import { formatSize } from '../utils/format'

interface OrphanTorrent {
	instanceId: number
	instanceLabel: string
	hash: string
	name: string
	size: number
	reason: 'missingFiles' | 'unregistered'
	trackerMessage?: string
}

interface Props {
	instances: Instance[]
	onBack: () => void
}

export function MobileOrphanManager({ instances, onBack }: Props) {
	const [scanning, setScanning] = useState(false)
	const [orphans, setOrphans] = useState<OrphanTorrent[]>([])
	const [selected, setSelected] = useState<Set<string>>(new Set())
	const [scanned, setScanned] = useState(false)
	const [error, setError] = useState('')
	const [deleteFiles, setDeleteFiles] = useState(false)
	const [deleting, setDeleting] = useState(false)
	const [showConfirm, setShowConfirm] = useState(false)

	async function scan() {
		setScanning(true)
		setOrphans([])
		setSelected(new Set())
		setScanned(false)
		setError('')
		try {
			const res = await fetch('/api/tools/orphans/scan', {
				method: 'POST',
				credentials: 'include',
			})
			if (!res.ok) throw new Error('扫描失败')
			const data = await res.json()
			setOrphans(data.orphans)
			setScanned(true)
		} catch (e) {
			setError(e instanceof Error ? e.message : '扫描失败')
		} finally {
			setScanning(false)
		}
	}

	function toggleSelect(key: string) {
		setSelected((prev) => {
			const next = new Set(prev)
			if (next.has(key)) next.delete(key)
			else next.add(key)
			return next
		})
	}

	function selectAll() {
		if (selected.size === orphans.length) {
			setSelected(new Set())
		} else {
			setSelected(new Set(orphans.map((o) => `${o.instanceId}:${o.hash}`)))
		}
	}

	async function handleDelete() {
		setDeleting(true)
		try {
			const byInstance = new Map<number, string[]>()
			for (const key of selected) {
				const [instanceId, hash] = key.split(':')
				const id = parseInt(instanceId, 10)
				if (!byInstance.has(id)) byInstance.set(id, [])
				byInstance.get(id)!.push(hash)
			}
			for (const [instanceId, hashes] of byInstance) {
				await deleteTorrents(instanceId, hashes, deleteFiles)
			}
			setOrphans((prev) => prev.filter((o) => !selected.has(`${o.instanceId}:${o.hash}`)))
			setSelected(new Set())
			setShowConfirm(false)
		} finally {
			setDeleting(false)
		}
	}

	const groupedByInstance = orphans.reduce(
		(acc, o) => {
			if (!acc[o.instanceLabel]) acc[o.instanceLabel] = []
			acc[o.instanceLabel].push(o)
			return acc
		},
		{} as Record<string, OrphanTorrent[]>
	)

	return (
		<div className="flex flex-col h-full">
			<div className="p-4 space-y-3">
				<div className="flex items-center gap-3">
					<button onClick={onBack} className="p-2 -ml-2 rounded-xl active:bg-[var(--bg-tertiary)]">
						<ChevronLeft className="w-5 h-5" style={{ color: 'var(--text-primary)' }} strokeWidth={2} />
					</button>
					<div className="flex-1">
						<h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
							孤儿文件管理
						</h2>
						<p className="text-xs" style={{ color: 'var(--text-muted)' }}>
							查找并清理文件丢失的冗余种子
						</p>
					</div>
				</div>

				<button
					onClick={scan}
					disabled={scanning || instances.length === 0}
					className="w-full py-3 rounded-xl text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
					style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-contrast)' }}
				>
					{scanning ? (
						<>
							<div
								className="w-4 h-4 border-2 rounded-full animate-spin"
								style={{ borderColor: 'var(--accent-contrast)', borderTopColor: 'transparent' }}
							/>
							正在扫描...
						</>
					) : (
						<>
							<Search className="w-5 h-5" strokeWidth={2} />
							扫描所有实例
						</>
					)}
				</button>

				{error && (
					<div
						className="px-4 py-3 rounded-xl text-sm"
						style={{ backgroundColor: 'color-mix(in srgb, var(--error) 15%, transparent)', color: 'var(--error)' }}
					>
						{error}
					</div>
				)}
			</div>

			<div className="flex-1 overflow-y-auto px-4 pb-4">
				{scanning && (
					<div
						className="p-4 rounded-xl border flex items-center gap-3"
						style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
					>
						<div
							className="w-5 h-5 border-2 rounded-full animate-spin"
							style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }}
						/>
						<span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
							正在扫描实例...
						</span>
					</div>
				)}

				{instances.length === 0 && (
					<div
						className="text-center py-12 rounded-2xl border"
						style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
					>
						<div
							className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
							style={{ backgroundColor: 'var(--bg-tertiary)' }}
						>
							<HardDrive className="w-8 h-8" style={{ color: 'var(--text-muted)' }} strokeWidth={1.5} />
						</div>
						<p className="text-sm" style={{ color: 'var(--text-muted)' }}>
							未配置实例
						</p>
					</div>
				)}

				{scanned && orphans.length === 0 && (
					<div
						className="text-center py-12 rounded-2xl border"
						style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
					>
						<div
							className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
							style={{ backgroundColor: 'color-mix(in srgb, #a6e3a1 15%, transparent)' }}
						>
							<CheckCircle className="w-8 h-8" style={{ color: '#a6e3a1' }} strokeWidth={1.5} />
						</div>
						<p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
							扫描完成！
						</p>
						<p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
							未发现孤儿文件
						</p>
					</div>
				)}

				{orphans.length > 0 && (
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<button onClick={selectAll} className="text-sm" style={{ color: 'var(--accent)' }}>
								{selected.size === orphans.length ? '取消全选' : '全选'}
							</button>
							<span className="text-xs" style={{ color: 'var(--text-muted)' }}>
								已选择 {selected.size} / {orphans.length}
							</span>
						</div>

						{Object.entries(groupedByInstance).map(([instanceLabel, items]) => (
							<div key={instanceLabel}>
								<div className="flex items-center gap-2 px-1 py-2">
									<HardDrive className="w-4 h-4" style={{ color: 'var(--text-muted)' }} strokeWidth={1.5} />
									<span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
										{instanceLabel}
									</span>
									<span className="text-xs" style={{ color: 'var(--text-muted)' }}>
										({items.length})
									</span>
								</div>
								<div className="space-y-1">
									{items.map((item) => {
										const key = `${item.instanceId}:${item.hash}`
										return (
											<div
												key={key}
												onClick={() => toggleSelect(key)}
												className="flex items-start gap-3 p-3 rounded-xl active:scale-[0.99] transition-transform cursor-pointer"
												style={{ backgroundColor: selected.has(key) ? 'var(--bg-tertiary)' : 'var(--bg-secondary)' }}
											>
												<div
													className="w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5 border"
													style={{
														backgroundColor: selected.has(key) ? 'var(--accent)' : 'transparent',
														borderColor: selected.has(key) ? 'var(--accent)' : 'var(--text-muted)',
													}}
												>
													{selected.has(key) && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
												</div>
												<div className="flex-1 min-w-0">
													<div
														className="text-sm font-medium leading-snug line-clamp-2"
														style={{ color: 'var(--text-primary)' }}
													>
														{item.name}
													</div>
													<div
														className="flex items-center gap-2 mt-1.5 text-xs"
														style={{ color: 'var(--text-muted)' }}
													>
														<span>{formatSize(item.size)}</span>
														<span>•</span>
														{item.reason === 'missingFiles' ? (
															<span style={{ color: 'var(--warning)' }}>文件丢失</span>
														) : (
															<span style={{ color: 'var(--error)' }} title={item.trackerMessage}>
																未在 Tracker 注册
															</span>
														)}
													</div>
												</div>
											</div>
										)
									})}
								</div>
							</div>
						))}
					</div>
				)}
			</div>

			{selected.size > 0 && (
				<div
					className="sticky bottom-0 p-4 border-t"
					style={{
						backgroundColor: 'var(--bg-primary)',
						borderColor: 'var(--border)',
						paddingBottom: 'calc(70px + env(safe-area-inset-bottom, 1rem))',
					}}
				>
					<button
						onClick={() => setShowConfirm(true)}
						className="w-full py-3 rounded-xl text-sm font-medium"
						style={{ backgroundColor: 'var(--error)', color: 'var(--accent-contrast)' }}
					>
						删除 {selected.size} 个种子
					</button>
				</div>
			)}

			{showConfirm && (
				<>
					<div
						className="fixed inset-0 z-50"
						style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
						onClick={() => setShowConfirm(false)}
					/>
					<div
						className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 rounded-2xl border p-5"
						style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
					>
						<h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
							确认删除
						</h3>
						<p className="text-sm" style={{ color: 'var(--text-muted)' }}>
							确定要删除这 <strong style={{ color: 'var(--text-primary)' }}>{selected.size}</strong> 个种子吗？
						</p>
						<label className="flex items-center gap-3 mt-4 cursor-pointer">
							<div
								onClick={(e) => {
									e.stopPropagation()
									setDeleteFiles(!deleteFiles)
								}}
								className="w-5 h-5 rounded flex items-center justify-center border shrink-0"
								style={{
									backgroundColor: deleteFiles ? 'var(--error)' : 'transparent',
									borderColor: deleteFiles ? 'var(--error)' : 'var(--text-muted)',
								}}
							>
								{deleteFiles && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
							</div>
							<span className="text-sm" style={{ color: 'var(--text-primary)' }}>
								同时删除本地已下载的文件
							</span>
						</label>
						<div className="flex gap-3 mt-5">
							<button
								onClick={() => setShowConfirm(false)}
								disabled={deleting}
								className="flex-1 py-3 rounded-xl text-sm font-medium disabled:opacity-50"
								style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
							>
								取消
							</button>
							<button
								onClick={handleDelete}
								disabled={deleting}
								className="flex-1 py-3 rounded-xl text-sm font-medium disabled:opacity-50"
								style={{ backgroundColor: 'var(--error)', color: 'var(--accent-contrast)' }}
							>
								{deleting ? '正在删除...' : '确认删除'}
							</button>
						</div>
					</div>
				</>
			)}
		</div>
	)
}
