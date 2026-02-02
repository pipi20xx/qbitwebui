import { useState, useMemo } from 'react'
import { Check, Server } from 'lucide-react'
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
}

export function OrphanManager({ instances }: Props) {
	const [scanning, setScanning] = useState(false)
	const [orphans, setOrphans] = useState<OrphanTorrent[]>([])
	const [selected, setSelected] = useState<Set<string>>(new Set())
	const [scanned, setScanned] = useState(false)
	const [deleteFiles, setDeleteFiles] = useState(false)
	const [deleting, setDeleting] = useState(false)
	const [showConfirm, setShowConfirm] = useState(false)

	async function scan() {
		setScanning(true)
		setOrphans([])
		setSelected(new Set())
		setScanned(false)
		try {
			const res = await fetch('/api/tools/orphans/scan', {
				method: 'POST',
				credentials: 'include',
			})
			if (!res.ok) throw new Error('扫描失败')
			const data = await res.json()
			setOrphans(data.orphans)
			setScanned(true)
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

	const groupedByInstance = useMemo(() => {
		const acc: Record<string, OrphanTorrent[]> = {}
		for (const o of orphans) {
			if (!acc[o.instanceLabel]) acc[o.instanceLabel] = []
			acc[o.instanceLabel].push(o)
		}
		return acc
	}, [orphans])

	return (
		<div>
			<div className="flex items-center justify-between mb-6">
				<div>
					<h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
						孤儿文件管理 (Orphan Manager)
					</h1>
					<p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
						查找文件丢失或 Tracker 未注册的冗余种子
					</p>
				</div>
				<button
					onClick={scan}
					disabled={scanning || instances.length === 0}
					className="px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
					style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-contrast)' }}
				>
					{scanning ? '扫描中...' : '扫描所有实例'}
				</button>
			</div>

			{scanning && (
				<div
					className="mb-6 p-4 rounded-xl border flex items-center gap-3"
					style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
				>
					<div
						className="w-5 h-5 border-2 rounded-full animate-spin"
						style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }}
					/>
					<span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
						正在扫描实例... (详情请查看服务器日志)
					</span>
				</div>
			)}

			{instances.length === 0 && (
				<div
					className="text-center py-12 rounded-xl border"
					style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
				>
					<p className="text-sm" style={{ color: 'var(--text-muted)' }}>
						未配置实例
					</p>
				</div>
			)}

			{scanned && orphans.length === 0 && (
				<div
					className="text-center py-12 rounded-xl border"
					style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
				>
					<Check className="w-12 h-12 mx-auto mb-3" style={{ color: '#a6e3a1' }} strokeWidth={1.5} />
					<p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
						扫描完成！
					</p>
					<p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
						未发现孤儿文件
					</p>
				</div>
			)}

			{orphans.length > 0 && (
				<>
					<div className="flex items-center justify-between mb-4">
						<div className="flex items-center gap-4">
							<button onClick={selectAll} className="text-sm hover:underline" style={{ color: 'var(--accent)' }}>
								{selected.size === orphans.length ? '取消全选' : '全选'}
							</button>
							<span className="text-sm" style={{ color: 'var(--text-muted)' }}>
								已选择 {selected.size} / {orphans.length}
							</span>
						</div>
						{selected.size > 0 && (
							<button
								onClick={() => setShowConfirm(true)}
								className="px-4 py-2 rounded-lg text-sm font-medium"
								style={{ backgroundColor: 'var(--error)', color: 'var(--accent-contrast)' }}
							>
								删除选中项
							</button>
						)}
					</div>

					{Object.entries(groupedByInstance).map(([instanceLabel, items]) => (
						<div key={instanceLabel} className="mb-6">
							<h2 className="text-sm font-medium mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
								<Server className="w-4 h-4" style={{ color: 'var(--text-muted)' }} strokeWidth={1.5} />
								{instanceLabel}
								<span className="font-normal" style={{ color: 'var(--text-muted)' }}>
									({items.length})
								</span>
							</h2>
							<div
								className="rounded-xl border overflow-hidden"
								style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
							>
								{items.map((item, idx) => {
									const key = `${item.instanceId}:${item.hash}`
									return (
										<div
											key={key}
											className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[var(--bg-tertiary)] transition-colors"
											style={{ borderTop: idx > 0 ? '1px solid var(--border)' : undefined }}
											onClick={() => toggleSelect(key)}
										>
											<div
												className="w-5 h-5 rounded flex items-center justify-center border shrink-0 transition-colors"
												style={{
													backgroundColor: selected.has(key) ? 'var(--accent)' : 'transparent',
													borderColor: selected.has(key) ? 'var(--accent)' : 'var(--border)',
												}}
											>
												{selected.has(key) && <Check className="w-3 h-3" style={{ color: 'white' }} strokeWidth={3} />}
											</div>
											<div className="flex-1 min-w-0">
												<div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
													{item.name}
												</div>
												<div className="text-xs mt-0.5 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
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
				</>
			)}

			{showConfirm && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center p-4"
					style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
				>
					<div
						className="w-full max-w-md rounded-xl border p-6"
						style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
					>
						<h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
							删除种子
						</h3>
						<p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
							确定要删除这 <strong style={{ color: 'var(--text-primary)' }}>{selected.size}</strong> 个种子吗？
						</p>
						<label className="flex items-center gap-3 mb-6 cursor-pointer">
							<div
								className="w-5 h-5 rounded flex items-center justify-center border shrink-0 transition-colors"
								style={{
									backgroundColor: deleteFiles ? 'var(--error)' : 'transparent',
									borderColor: deleteFiles ? 'var(--error)' : 'var(--border)',
								}}
								onClick={() => setDeleteFiles(!deleteFiles)}
							>
								{deleteFiles && <Check className="w-3 h-3" style={{ color: 'white' }} strokeWidth={3} />}
							</div>
							<span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
								同时删除本地已下载的文件
							</span>
						</label>
						<div className="flex gap-3 justify-end">
							<button
								onClick={() => setShowConfirm(false)}
								disabled={deleting}
								className="px-4 py-2 rounded-lg text-sm border disabled:opacity-50"
								style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
							>
								取消
							</button>
							<button
								onClick={handleDelete}
								disabled={deleting}
								className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
								style={{ backgroundColor: 'var(--error)', color: 'var(--accent-contrast)' }}
							>
								{deleting ? '正在删除...' : '确认删除'}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}
