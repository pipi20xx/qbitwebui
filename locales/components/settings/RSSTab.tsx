import type { QBittorrentPreferences } from '../../types/preferences'
import { Checkbox } from '../ui'

interface Props {
	preferences: Partial<QBittorrentPreferences>
	onChange: (updates: Partial<QBittorrentPreferences>) => void
}

export function RSSTab({ preferences, onChange }: Props) {
	return (
		<div className="space-y-4">
			<div>
				<div className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
					RSS 阅读器
				</div>
				<div className="space-y-2">
					<Checkbox
						label="启用获取 RSS 订阅"
						checked={preferences.rss_processing_enabled ?? false}
						onChange={(v) => onChange({ rss_processing_enabled: v })}
					/>
					<div className="grid grid-cols-3 gap-2">
						<div className="flex items-center gap-2">
							<label className="text-xs" style={{ color: 'var(--text-muted)' }}>
								刷新间隔
							</label>
							<input
								type="number"
								value={preferences.rss_refresh_interval ?? 30}
								onChange={(e) => onChange({ rss_refresh_interval: parseInt(e.target.value) || 30 })}
								min={1}
								className="w-14 px-2 py-1.5 rounded border text-xs font-mono"
								style={{
									backgroundColor: 'var(--bg-tertiary)',
									borderColor: 'var(--border)',
									color: 'var(--text-primary)',
								}}
							/>
							<span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
								分钟
							</span>
						</div>
						<div className="flex items-center gap-2">
							<label className="text-xs" style={{ color: 'var(--text-muted)' }}>
								获取延迟
							</label>
							<input
								type="number"
								value={preferences.rss_fetch_delay ?? 2}
								onChange={(e) => onChange({ rss_fetch_delay: parseInt(e.target.value) || 2 })}
								min={0}
								className="w-14 px-2 py-1.5 rounded border text-xs font-mono"
								style={{
									backgroundColor: 'var(--bg-tertiary)',
									borderColor: 'var(--border)',
									color: 'var(--text-primary)',
								}}
							/>
							<span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
								秒
							</span>
						</div>
						<div className="flex items-center gap-2">
							<label className="text-xs" style={{ color: 'var(--text-muted)' }}>
								最大条数
							</label>
							<input
								type="number"
								value={preferences.rss_max_articles_per_feed ?? 50}
								onChange={(e) => onChange({ rss_max_articles_per_feed: parseInt(e.target.value) || 50 })}
								min={1}
								className="w-14 px-2 py-1.5 rounded border text-xs font-mono"
								style={{
									backgroundColor: 'var(--bg-tertiary)',
									borderColor: 'var(--border)',
									color: 'var(--text-primary)',
								}}
							/>
						</div>
					</div>
				</div>
			</div>

			<div className="h-px" style={{ backgroundColor: 'var(--border)' }} />

			<div>
				<div className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
					RSS 自动下载器
				</div>
				<Checkbox
					label="启用 RSS 种子自动下载"
					checked={preferences.rss_auto_downloading_enabled ?? false}
					onChange={(v) => onChange({ rss_auto_downloading_enabled: v })}
				/>
			</div>

			<div className="h-px" style={{ backgroundColor: 'var(--border)' }} />

			<div>
				<div className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
					RSS 智能剧集过滤器
				</div>
				<div className="space-y-2">
					<Checkbox
						label="下载 REPACK/PROPER 剧集"
						checked={preferences.rss_download_repack_proper_episodes ?? true}
						onChange={(v) => onChange({ rss_download_repack_proper_episodes: v })}
					/>
					<div>
						<label className="block text-[10px] mb-1" style={{ color: 'var(--text-muted)' }}>
							过滤器列表 (正则)
						</label>
						<textarea
							value={preferences.rss_smart_episode_filters ?? ''}
							onChange={(e) => onChange({ rss_smart_episode_filters: e.target.value })}
							placeholder="例如: s(\d+)e(\d+)&#10;(\d+)x(\d+)"
							rows={4}
							className="w-full px-2 py-1.5 rounded border text-xs font-mono resize-none"
							style={{
								backgroundColor: 'var(--bg-tertiary)',
								borderColor: 'var(--border)',
								color: 'var(--text-primary)',
							}}
						/>
					</div>
				</div>
			</div>
		</div>
	)
}
