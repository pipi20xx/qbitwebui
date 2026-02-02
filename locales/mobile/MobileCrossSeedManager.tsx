import { type Instance } from '../api/instances'
import { formatSize, formatCountdown } from '../utils/format'
import { Toggle, Select, MultiSelect } from '../components/ui'
import { useCrossSeed, formatTimestamp, LOG_LEVEL_COLORS } from '../hooks/useCrossSeed'
import { ChevronLeft, AlertTriangle } from 'lucide-react'

interface Props {
	instances: Instance[]
	onBack: () => void
}

export function MobileCrossSeedManager({ instances, onBack }: Props) {
	const {
		selectedInstance,
		setSelectedInstance,
		config,
		setConfig,
		status,
		cacheStats,
		availableIndexers,
		logs,
		loading,
		error,
		success,
		saving,
		autoScroll,
		setAutoScroll,
		logsContainerRef,
		prowlarrIntegrations,
		isRunning,
		stopping,
		handleSave,
		handleScan,
		handleStop,
		handleClearCache,
	} = useCrossSeed(instances)

	if (instances.length === 0) {
		return (
			<div className="p-4">
				<div className="flex items-center gap-3 mb-6">
					<button onClick={onBack} className="p-2 -ml-2 rounded-xl active:bg-[var(--bg-tertiary)]">
						<ChevronLeft className="w-5 h-5" style={{ color: 'var(--text-primary)' }} strokeWidth={2} />
					</button>
					<h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
						辅种管理 (Cross-Seed)
					</h2>
				</div>
				<div
					className="text-center py-12 rounded-2xl border"
					style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
				>
					<p className="text-sm" style={{ color: 'var(--text-muted)' }}>
						未配置实例
					</p>
				</div>
			</div>
		)
	}

	if (loading) {
		return (
			<div className="flex items-center justify-center py-12">
				<div
					className="w-8 h-8 border-2 rounded-full animate-spin"
					style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }}
				/>
			</div>
		)
	}

	if (!config) return null

	return (
		<div className="flex flex-col h-full">
			<div className="p-4 space-y-4">
				<div className="flex items-center gap-3">
					<button onClick={onBack} className="p-2 -ml-2 rounded-xl active:bg-[var(--bg-tertiary)]">
						<ChevronLeft className="w-5 h-5" style={{ color: 'var(--text-primary)' }} strokeWidth={2} />
					</button>
					<h2 className="text-lg font-semibold flex-1" style={{ color: 'var(--text-primary)' }}>
						辅种管理
					</h2>
					<span className="text-[10px] font-bold px-1.5 py-0.5 rounded border border-error text-error">实验性</span>
				</div>

				{instances.length > 1 && (
					<Select
						value={String(selectedInstance ?? '')}
						onChange={(v) => setSelectedInstance(Number(v))}
						options={instances.map((i) => ({ value: String(i.id), label: i.label }))}
					/>
				)}

				{(error || success) && (
					<div
						className="px-4 py-3 rounded-xl text-sm"
						style={{
							backgroundColor: error
								? 'color-mix(in srgb, var(--error) 15%, transparent)'
								: 'color-mix(in srgb, #a6e3a1 15%, transparent)',
							color: error ? 'var(--error)' : '#a6e3a1',
						}}
					>
						{error || success}
					</div>
				)}

				<div
					className="grid grid-cols-2 gap-2 p-4 rounded-2xl border"
					style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
				>
					<div className="space-y-1">
						<div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">调度器</div>
						<div className="text-sm font-semibold" style={{ color: status?.enabled ? '#a6e3a1' : 'var(--text-muted)' }}>
							{status?.enabled ? '已开启' : '已关闭'}
						</div>
					</div>
					<div className="space-y-1">
						<div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">当前状态</div>
						<div
							className="text-sm font-semibold flex items-center gap-1.5"
							style={{ color: stopping ? 'var(--warning)' : isRunning ? 'var(--accent)' : 'var(--text-secondary)' }}
						>
							{(isRunning || stopping) && (
								<span
									className="w-1.5 h-1.5 rounded-full animate-pulse"
									style={{ backgroundColor: stopping ? 'var(--warning)' : 'var(--accent)' }}
								/>
							)}
							{stopping ? '停止中' : isRunning ? '正在运行' : '空闲'}
						</div>
					</div>
					<div className="space-y-1 pt-2">
						<div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">上次运行</div>
						<div className="text-xs text-[var(--text-secondary)]">{formatTimestamp(status?.lastRun ?? null)}</div>
					</div>
					<div className="space-y-1 pt-2">
						<div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">下次运行</div>
						<div className="text-xs text-[var(--text-secondary)]">
							{status?.enabled ? formatCountdown(status?.nextRun ?? null) : '—'}
						</div>
					</div>
					<div className="col-span-2 space-y-1 pt-2">
						<div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">缓存</div>
						<div className="text-xs text-[var(--text-secondary)]">
							{cacheStats ? `${cacheStats.cache.count} 个种子 (${formatSize(cacheStats.cache.totalSize)})` : '0'}
						</div>
					</div>
				</div>

				<div className="space-y-4">
					<div className="flex items-center justify-between px-1">
						<span className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider">任务配置</span>
						<Toggle checked={config.enabled} onChange={(v) => setConfig({ ...config, enabled: v })} />
					</div>

					<div className="space-y-3">
						<div>
							<label className="block text-xs font-medium mb-1.5 text-[var(--text-muted)] ml-1">Prowlarr 实例</label>
							<Select
								value={config.integration_id ? String(config.integration_id) : ''}
								onChange={(v) => setConfig({ ...config, integration_id: v ? Number(v) : null, indexer_ids: [] })}
								options={[
									{ value: '', label: '无' },
									...prowlarrIntegrations.map((i) => ({ value: String(i.id), label: i.label })),
								]}
							/>
						</div>

						<div className="grid grid-cols-2 gap-3">
							<div className="space-y-1.5">
								<label className="block text-xs font-medium text-[var(--text-muted)] ml-1">间隔 (小时)</label>
								<input
									type="number"
									value={config.interval_hours}
									onChange={(e) => setConfig({ ...config, interval_hours: parseInt(e.target.value) || 24 })}
									className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl text-sm"
								/>
							</div>
							<div className="space-y-1.5">
								<label className="block text-xs font-medium text-[var(--text-muted)] ml-1">延迟 (秒)</label>
								<input
									type="number"
									value={config.delay_seconds}
									onChange={(e) =>
										setConfig({ ...config, delay_seconds: Math.max(30, parseInt(e.target.value) || 30) })
									}
									className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl text-sm"
								/>
							</div>
						</div>

						{availableIndexers.length > 0 && (
							<div>
								<label className="block text-xs font-medium mb-1.5 text-[var(--text-muted)] ml-1">
									索引器 ({config.indexer_ids.length}/{availableIndexers.length})
								</label>
								<MultiSelect
									options={availableIndexers.map((idx) => ({ value: idx.id, label: idx.name }))}
									selected={config.indexer_ids}
									onChange={(ids) => setConfig({ ...config, indexer_ids: ids })}
									placeholder="选择索引器..."
								/>
							</div>
						)}

						<div>
							<label className="block text-xs font-medium mb-1.5 text-[var(--text-muted)] ml-1">匹配模式</label>
							<Select
								value={config.match_mode}
								onChange={(v) => setConfig({ ...config, match_mode: v as 'strict' | 'flexible' })}
								options={[
									{ value: 'strict', label: '严格匹配 (名称一致)' },
									{ value: 'flexible', label: '灵活匹配 (大小一致)' },
								]}
							/>
						</div>

						<div className="grid grid-cols-2 gap-3">
							<div className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)]">
								<span className="text-xs font-medium text-[var(--text-primary)]">包含单集</span>
								<Toggle
									checked={config.include_single_episodes}
									onChange={(v) => setConfig({ ...config, include_single_episodes: v })}
								/>
							</div>
							<div className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)]">
								<span className="text-xs font-medium text-[var(--text-primary)]">空跑模式</span>
								<Toggle checked={config.dry_run} onChange={(v) => setConfig({ ...config, dry_run: v })} />
							</div>
						</div>

						<button
							onClick={handleSave}
							disabled={saving}
							className="w-full py-3.5 rounded-xl text-sm font-bold active:scale-[0.98] transition-all disabled:opacity-50"
							style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-contrast)' }}
						>
							{saving ? '正在保存...' : '保存配置'}
						</button>
					</div>

					<div className="pt-4 space-y-3">
						<div className="text-xs font-medium px-1 uppercase tracking-wider text-[var(--text-muted)]">操作</div>
						<div className="grid grid-cols-2 gap-2">
							<button
								onClick={() => handleScan(false)}
								disabled={isRunning || !config.integration_id}
								className="py-3 rounded-xl text-sm font-medium border border-[var(--border)] active:bg-[var(--bg-tertiary)] disabled:opacity-40"
								style={{ color: 'var(--text-primary)' }}
							>
								立即扫描
							</button>
							<button
								onClick={() => handleScan(true)}
								disabled={isRunning || !config.integration_id}
								className="py-3 rounded-xl text-sm font-medium border border-[var(--border)] active:bg-[var(--bg-tertiary)] disabled:opacity-40"
								style={{ color: 'var(--text-primary)' }}
							>
								强制扫描
							</button>
							<button
								onClick={handleStop}
								disabled={!isRunning || stopping}
								className="py-3 rounded-xl text-sm font-medium border border-[var(--error)] text-[var(--error)] active:bg-[var(--error)] active:text-white disabled:opacity-40"
							>
								{stopping ? '停止中...' : '停止运行'}
							</button>
							<button
								onClick={handleClearCache}
								className="py-3 rounded-xl text-sm font-medium border border-[var(--border)] active:bg-[var(--bg-tertiary)]"
								style={{ color: 'var(--text-secondary)' }}
							>
								清空缓存
							</button>
						</div>
					</div>

					<div className="pt-4 flex flex-col min-h-[300px]">
						<div className="flex items-center justify-between px-1 mb-2">
							<span className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">运行日志</span>
							<label className="flex items-center gap-2">
								<span className="text-[10px] text-[var(--text-muted)]">自动滚动</span>
								<Toggle checked={autoScroll} onChange={setAutoScroll} />
							</label>
						</div>
						<div
							ref={logsContainerRef}
							className="flex-1 rounded-2xl p-3 font-mono text-[10px] leading-relaxed overflow-y-auto"
							style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
						>
							{logs.length === 0 ? (
								<div className="text-center py-12 text-[var(--text-muted)]">暂无日志内容</div>
							) : (
								logs.map((log, i) => {
									const isInjection = log.message.includes('MATCH:') || log.message.includes('Added torrent:')
									return (
										<div key={i} className="py-0.5">
											<span className="opacity-50">{log.timestamp.slice(11, 19)}</span>{' '}
											<span style={{ color: LOG_LEVEL_COLORS[log.level] }}>[{log.level}]</span>{' '}
											<span style={{ color: isInjection ? '#a6e3a1' : undefined }}>{log.message}</span>
										</div>
									)
								})
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}