import type { QBittorrentPreferences } from '../../types/preferences'
import { Toggle, Select, Checkbox } from '../ui'

interface Props {
	preferences: Partial<QBittorrentPreferences>
	onChange: (updates: Partial<QBittorrentPreferences>) => void
}

const CONTENT_LAYOUT_OPTIONS = [
	{ value: 'Original', label: 'Original' },
	{ value: 'Subfolder', label: 'Create subfolder' },
	{ value: 'NoSubfolder', label: 'Don\'t create subfolder' },
]

const STOP_CONDITION_OPTIONS = [
	{ value: 'None', label: 'None' },
	{ value: 'MetadataReceived', label: 'Metadata received' },
	{ value: 'FilesChecked', label: 'Files checked' },
]

export function DownloadsTab({ preferences, onChange }: Props) {
	return (
		<div className="space-y-4">
			<div>
				<div className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>When adding a torrent</div>
				<div className="space-y-2">
					<div className="flex items-center gap-3">
						<label className="text-xs" style={{ color: 'var(--text-muted)' }}>Content layout</label>
						<Select value={preferences.torrent_content_layout ?? 'Original'} onChange={(v) => onChange({ torrent_content_layout: v as 'Original' | 'Subfolder' | 'NoSubfolder' })} options={CONTENT_LAYOUT_OPTIONS} minWidth="160px" />
					</div>
					<div className="flex items-center gap-3">
						<label className="text-xs" style={{ color: 'var(--text-muted)' }}>Stop condition</label>
						<Select value={preferences.torrent_stop_condition ?? 'None'} onChange={(v) => onChange({ torrent_stop_condition: v as 'None' | 'MetadataReceived' | 'FilesChecked' })} options={STOP_CONDITION_OPTIONS} minWidth="160px" />
					</div>
					<div className="grid grid-cols-2 gap-2">
						<Checkbox label="Add to top of queue" checked={preferences.add_to_top_of_queue ?? false} onChange={(v) => onChange({ add_to_top_of_queue: v })} />
						<Checkbox label="Don't start automatically" checked={preferences.add_stopped_enabled ?? false} onChange={(v) => onChange({ add_stopped_enabled: v })} />
						<Checkbox label="Merge trackers on duplicate" checked={preferences.merge_trackers ?? false} onChange={(v) => onChange({ merge_trackers: v })} />
						<Checkbox label="Delete .torrent files" checked={(preferences.auto_delete_mode ?? 0) > 0} onChange={(v) => onChange({ auto_delete_mode: v ? 1 : 0 })} />
					</div>
				</div>
			</div>

			<div className="h-px" style={{ backgroundColor: 'var(--border)' }} />

			<div>
				<div className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Pre-allocation & Extensions</div>
				<div className="grid grid-cols-2 gap-2">
					<Checkbox label="Pre-allocate disk space" checked={preferences.preallocate_all ?? false} onChange={(v) => onChange({ preallocate_all: v })} />
					<Checkbox label="Append .!qB to incomplete" checked={preferences.incomplete_files_ext ?? false} onChange={(v) => onChange({ incomplete_files_ext: v })} />
					<Checkbox label='Keep unselected in ".unwanted"' checked={preferences.use_unwanted_folder ?? false} onChange={(v) => onChange({ use_unwanted_folder: v })} />
				</div>
			</div>

			<div className="h-px" style={{ backgroundColor: 'var(--border)' }} />

			<div>
				<div className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Saving Management</div>
				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<span className="text-xs" style={{ color: 'var(--text-muted)' }}>Default Torrent Management Mode</span>
						<div className="flex items-center gap-2">
							<span className="text-xs" style={{ color: preferences.auto_tmm_enabled ? 'var(--text-muted)' : 'var(--text-primary)' }}>Manual</span>
							<Toggle checked={preferences.auto_tmm_enabled ?? false} onChange={(v) => onChange({ auto_tmm_enabled: v })} />
							<span className="text-xs" style={{ color: preferences.auto_tmm_enabled ? 'var(--text-primary)' : 'var(--text-muted)' }}>Auto</span>
						</div>
					</div>
					<div className="grid grid-cols-2 gap-x-4 gap-y-1">
						<div className="flex items-center justify-between">
							<span className="text-xs" style={{ color: 'var(--text-muted)' }}>Relocate on category change</span>
							<Toggle checked={preferences.torrent_changed_tmm_enabled ?? false} onChange={(v) => onChange({ torrent_changed_tmm_enabled: v })} />
						</div>
						<div className="flex items-center justify-between">
							<span className="text-xs" style={{ color: 'var(--text-muted)' }}>Relocate on default path change</span>
							<Toggle checked={preferences.save_path_changed_tmm_enabled ?? false} onChange={(v) => onChange({ save_path_changed_tmm_enabled: v })} />
						</div>
						<div className="flex items-center justify-between">
							<span className="text-xs" style={{ color: 'var(--text-muted)' }}>Relocate on category path change</span>
							<Toggle checked={preferences.category_changed_tmm_enabled ?? false} onChange={(v) => onChange({ category_changed_tmm_enabled: v })} />
						</div>
					</div>
					<div className="grid grid-cols-2 gap-2">
						<Checkbox label="Use Subcategories" checked={preferences.use_subcategories ?? false} onChange={(v) => onChange({ use_subcategories: v })} />
						<Checkbox label="Category paths in Manual Mode" checked={preferences.use_category_paths_in_manual_mode ?? false} onChange={(v) => onChange({ use_category_paths_in_manual_mode: v })} />
					</div>
					<div>
						<label className="block text-[10px] mb-1" style={{ color: 'var(--text-muted)' }}>Default Save Path</label>
						<input type="text" value={preferences.save_path ?? ''} onChange={(e) => onChange({ save_path: e.target.value })} className="w-full px-2 py-1.5 rounded border text-xs" style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
					</div>
					<div className="flex items-center gap-2">
						<Checkbox label="Keep incomplete in:" checked={preferences.temp_path_enabled ?? false} onChange={(v) => onChange({ temp_path_enabled: v })} />
						{preferences.temp_path_enabled && (
							<input type="text" value={preferences.temp_path ?? ''} onChange={(e) => onChange({ temp_path: e.target.value })} className="flex-1 px-2 py-1.5 rounded border text-xs" style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
						)}
					</div>
					<div className="flex items-center gap-2">
						<Checkbox label="Copy .torrent to:" checked={preferences.export_dir !== undefined && preferences.export_dir !== ''} onChange={(v) => onChange({ export_dir: v ? preferences.export_dir || '' : '' })} />
						{preferences.export_dir !== undefined && preferences.export_dir !== '' && (
							<input type="text" value={preferences.export_dir} onChange={(e) => onChange({ export_dir: e.target.value })} className="flex-1 px-2 py-1.5 rounded border text-xs" style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
						)}
					</div>
					<div className="flex items-center gap-2">
						<Checkbox label="Copy finished .torrent to:" checked={preferences.export_dir_fin !== undefined && preferences.export_dir_fin !== ''} onChange={(v) => onChange({ export_dir_fin: v ? preferences.export_dir_fin || '' : '' })} />
						{preferences.export_dir_fin !== undefined && preferences.export_dir_fin !== '' && (
							<input type="text" value={preferences.export_dir_fin} onChange={(e) => onChange({ export_dir_fin: e.target.value })} className="flex-1 px-2 py-1.5 rounded border text-xs" style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
						)}
					</div>
				</div>
			</div>

			<div className="h-px" style={{ backgroundColor: 'var(--border)' }} />

			<div>
				<div className="flex items-center gap-2 mb-2">
					<Checkbox label="" checked={preferences.excluded_file_names_enabled ?? false} onChange={(v) => onChange({ excluded_file_names_enabled: v })} />
					<span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Excluded file names</span>
				</div>
				{preferences.excluded_file_names_enabled && (
					<textarea value={preferences.excluded_file_names ?? ''} onChange={(e) => onChange({ excluded_file_names: e.target.value })} rows={3} placeholder="*.exe&#10;*.scr" className="w-full px-2 py-1.5 rounded border text-xs font-mono resize-none" style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
				)}
			</div>

			<div className="h-px" style={{ backgroundColor: 'var(--border)' }} />

			<div>
				<div className="flex items-center gap-2 mb-2">
					<Checkbox label="" checked={preferences.mail_notification_enabled ?? false} onChange={(v) => onChange({ mail_notification_enabled: v })} />
					<span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Email notification</span>
				</div>
				{preferences.mail_notification_enabled && (
					<div className="space-y-2 pl-6">
						<div className="grid grid-cols-2 gap-2">
							<div>
								<label className="block text-[10px] mb-1" style={{ color: 'var(--text-muted)' }}>From</label>
								<input type="text" value={preferences.mail_notification_sender ?? ''} onChange={(e) => onChange({ mail_notification_sender: e.target.value })} className="w-full px-2 py-1.5 rounded border text-xs" style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
							</div>
							<div>
								<label className="block text-[10px] mb-1" style={{ color: 'var(--text-muted)' }}>To</label>
								<input type="email" value={preferences.mail_notification_email ?? ''} onChange={(e) => onChange({ mail_notification_email: e.target.value })} className="w-full px-2 py-1.5 rounded border text-xs" style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
							</div>
						</div>
						<div className="flex items-center gap-2">
							<div className="flex-1">
								<label className="block text-[10px] mb-1" style={{ color: 'var(--text-muted)' }}>SMTP server</label>
								<input type="text" value={preferences.mail_notification_smtp ?? ''} onChange={(e) => onChange({ mail_notification_smtp: e.target.value })} className="w-full px-2 py-1.5 rounded border text-xs" style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
							</div>
							<Checkbox label="SSL" checked={preferences.mail_notification_ssl_enabled ?? false} onChange={(v) => onChange({ mail_notification_ssl_enabled: v })} />
						</div>
						<div className="p-2 rounded space-y-2" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
							<Checkbox label="Authentication" checked={preferences.mail_notification_auth_enabled ?? false} onChange={(v) => onChange({ mail_notification_auth_enabled: v })} />
							{preferences.mail_notification_auth_enabled && (
								<div className="grid grid-cols-2 gap-2 pl-6">
									<input type="text" value={preferences.mail_notification_username ?? ''} onChange={(e) => onChange({ mail_notification_username: e.target.value })} placeholder="Username" className="px-2 py-1.5 rounded border text-xs" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
									<input type="password" value={preferences.mail_notification_password ?? ''} onChange={(e) => onChange({ mail_notification_password: e.target.value })} placeholder="Password" className="px-2 py-1.5 rounded border text-xs" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
								</div>
							)}
						</div>
					</div>
				)}
			</div>

			<div className="h-px" style={{ backgroundColor: 'var(--border)' }} />

			<div>
				<div className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Run external program</div>
				<div className="space-y-2">
					<div className="flex items-center gap-2">
						<Checkbox label="On torrent added:" checked={preferences.autorun_on_torrent_added_enabled ?? false} onChange={(v) => onChange({ autorun_on_torrent_added_enabled: v })} />
						{preferences.autorun_on_torrent_added_enabled && (
							<input type="text" value={preferences.autorun_on_torrent_added_program ?? ''} onChange={(e) => onChange({ autorun_on_torrent_added_program: e.target.value })} className="flex-1 px-2 py-1.5 rounded border text-xs" style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
						)}
					</div>
					<div className="flex items-center gap-2">
						<Checkbox label="On torrent finished:" checked={preferences.autorun_enabled ?? false} onChange={(v) => onChange({ autorun_enabled: v })} />
						{preferences.autorun_enabled && (
							<input type="text" value={preferences.autorun_program ?? ''} onChange={(e) => onChange({ autorun_program: e.target.value })} className="flex-1 px-2 py-1.5 rounded border text-xs" style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
						)}
					</div>
					<p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
						Params: %N (name), %L (category), %G (tags), %F (content path), %R (root path), %D (save path), %C (files), %Z (size), %T (tracker), %I (hash v1), %J (hash v2), %K (ID)
					</p>
				</div>
			</div>
		</div>
	)
}
