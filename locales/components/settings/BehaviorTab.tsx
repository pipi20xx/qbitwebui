import { FileText } from 'lucide-react'
import type { QBittorrentPreferences } from '../../types/preferences'
import { Toggle, Select, Checkbox } from '../ui'

interface Props {
	preferences: Partial<QBittorrentPreferences>
	onChange: (updates: Partial<QBittorrentPreferences>) => void
}

const LOCALES = [
	{ value: 'en', label: 'English' },
	{ value: 'en_AU', label: 'English (Australia)' },
	{ value: 'en_GB', label: 'English (United Kingdom)' },
	{ value: 'de', label: 'Deutsch' },
	{ value: 'es', label: 'Español' },
	{ value: 'fr', label: 'Français' },
	{ value: 'it', label: 'Italiano' },
	{ value: 'ja', label: '日本語' },
	{ value: 'ko', label: '한국어' },
	{ value: 'nl', label: 'Nederlands' },
	{ value: 'pl', label: 'Polski' },
	{ value: 'pt_BR', label: 'Português (Brasil)' },
	{ value: 'pt_PT', label: 'Português (Portugal)' },
	{ value: 'ru', label: 'Русский' },
	{ value: 'tr', label: 'Türkçe' },
	{ value: 'uk', label: 'Українська' },
	{ value: 'zh', label: '中文 (简体)' },
	{ value: 'zh_TW', label: '中文 (繁體)' },
]

const FILE_LOG_AGE_TYPES = [
	{ value: 0, label: '天' },
	{ value: 1, label: '月' },
	{ value: 2, label: '年' },
]

export function BehaviorTab({ preferences, onChange }: Props) {
	return (
		<div className="space-y-4">
			<div className="flex items-center gap-3">
				<label className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
					语言
				</label>
				<Select
					value={preferences.locale ?? 'zh'}
					onChange={(v) => onChange({ locale: v })}
					options={LOCALES}
					minWidth="180px"
				/>
			</div>

			<div className="h-px" style={{ backgroundColor: 'var(--border)' }} />

			<div>
				<div className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
					传输列表
				</div>
				<Checkbox
					label="删除种子时确认"
					checked={preferences.confirm_torrent_deletion ?? true}
					onChange={(v) => onChange({ confirm_torrent_deletion: v })}
				/>
			</div>

			<div className="h-px" style={{ backgroundColor: 'var(--border)' }} />

			<div>
				<div className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
					界面设置
				</div>
				<div className="grid grid-cols-2 gap-x-4 gap-y-1">
					<div className="flex items-center justify-between">
						<span className="text-xs" style={{ color: 'var(--text-muted)' }}>
							在状态栏显示外部 IP
						</span>
						<Toggle
							checked={preferences.status_bar_external_ip ?? false}
							onChange={(v) => onChange({ status_bar_external_ip: v })}
						/>
					</div>
					<div className="flex items-center justify-between">
						<span className="text-xs" style={{ color: 'var(--text-muted)' }}>
							性能警告
						</span>
						<Toggle
							checked={preferences.performance_warning ?? true}
							onChange={(v) => onChange({ performance_warning: v })}
						/>
					</div>
				</div>
			</div>

			<div className="h-px" style={{ backgroundColor: 'var(--border)' }} />

			<div>
				<div className="flex items-center justify-between mb-2">
					<div className="flex items-center gap-2">
						<FileText
							className="w-4 h-4"
							style={{ color: preferences.file_log_enabled ? 'var(--accent)' : 'var(--text-muted)' }}
							strokeWidth={1.5}
						/>
						<span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
							文件日志
						</span>
					</div>
					<Toggle checked={preferences.file_log_enabled ?? false} onChange={(v) => onChange({ file_log_enabled: v })} />
				</div>

				{preferences.file_log_enabled && (
					<div className="space-y-2 pl-6">
						<div>
							<label className="block text-[10px] mb-1" style={{ color: 'var(--text-muted)' }}>
								日志路径
							</label>
							<input
								type="text"
								value={preferences.file_log_path ?? ''}
								onChange={(e) => onChange({ file_log_path: e.target.value })}
								className="w-full px-2 py-1.5 rounded border text-xs"
								style={{
									backgroundColor: 'var(--bg-tertiary)',
									borderColor: 'var(--border)',
									color: 'var(--text-primary)',
								}}
							/>
						</div>
						<div className="grid grid-cols-3 gap-2">
							<div>
								<label className="block text-[10px] mb-1" style={{ color: 'var(--text-muted)' }}>
									最大限制 (KiB)
								</label>
								<input
									type="number"
									value={preferences.file_log_max_size ?? 65}
									onChange={(e) => onChange({ file_log_max_size: parseInt(e.target.value) || 65 })}
									className="w-full px-2 py-1.5 rounded border text-xs font-mono"
									style={{
										backgroundColor: 'var(--bg-tertiary)',
										borderColor: 'var(--border)',
										color: 'var(--text-primary)',
									}}
								/>
							</div>
							<div>
								<label className="block text-[10px] mb-1" style={{ color: 'var(--text-muted)' }}>
									保存时长
								</label>
								<input
									type="number"
									value={preferences.file_log_age ?? 1}
									onChange={(e) => onChange({ file_log_age: parseInt(e.target.value) || 1 })}
									className="w-full px-2 py-1.5 rounded border text-xs font-mono"
									style={{
										backgroundColor: 'var(--bg-tertiary)',
										borderColor: 'var(--border)',
										color: 'var(--text-primary)',
									}}
								/>
							</div>
							<div>
								<label className="block text-[10px] mb-1" style={{ color: 'var(--text-muted)' }}>
									&nbsp;
								</label>
								<Select
									value={preferences.file_log_age_type ?? 1}
									onChange={(v) => onChange({ file_log_age_type: v })}
									options={FILE_LOG_AGE_TYPES}
								/>
							</div>
						</div>
						<div className="grid grid-cols-2 gap-x-4 gap-y-1">
							<div className="flex items-center justify-between">
								<span className="text-xs" style={{ color: 'var(--text-muted)' }}>
									备份日志文件
								</span>
								<Toggle
									checked={preferences.file_log_backup_enabled ?? true}
									onChange={(v) => onChange({ file_log_backup_enabled: v })}
								/>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-xs" style={{ color: 'var(--text-muted)' }}>
									删除旧日志
								</span>
								<Toggle
									checked={preferences.file_log_delete_old ?? true}
									onChange={(v) => onChange({ file_log_delete_old: v })}
								/>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}
