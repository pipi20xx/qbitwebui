import { AlertTriangle } from 'lucide-react'
import type { QBittorrentPreferences } from '../../types/preferences'
import { Toggle, Select } from '../ui'

interface Props {
	preferences: Partial<QBittorrentPreferences>
	onChange: (updates: Partial<QBittorrentPreferences>) => void
}

const RESUME_DATA_STORAGE_TYPES = [
	{ value: 'Legacy', label: 'Fastresume 文件 (旧版)' },
	{ value: 'SQLite', label: 'SQLite 数据库' },
]

const TORRENT_CONTENT_REMOVE_OPTIONS = [
	{ value: 'Delete', label: '永久删除' },
	{ value: 'MoveToTrash', label: '移至回收站' },
]

const DISK_IO_TYPES = [
	{ value: 0, label: '默认' },
	{ value: 1, label: '内存映射' },
	{ value: 2, label: 'POSIX 兼容' },
]

const DISK_IO_MODES = [
	{ value: 0, label: '禁用系统缓存' },
	{ value: 1, label: '启用系统缓存' },
]

const UTP_TCP_MIXED_MODES = [
	{ value: 0, label: '优先 TCP' },
	{ value: 1, label: '基于用户比例' },
]

const UPLOAD_SLOTS_BEHAVIORS = [
	{ value: 0, label: '固定上传槽' },
	{ value: 1, label: '基于上传速度' },
]

const UPLOAD_CHOKING_ALGORITHMS = [
	{ value: 0, label: '轮询' },
	{ value: 1, label: '最快上传' },
	{ value: 2, label: '反吸血' },
]

export function AdvancedTab({ preferences, onChange }: Props) {
	return (
		<div className="space-y-4">
			<div
				className="px-3 py-2 rounded flex items-start gap-2"
				style={{
					backgroundColor: 'color-mix(in srgb, var(--warning) 15%, transparent)',
					border: '1px solid var(--warning)',
				}}
			>
				<AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--warning)' }} strokeWidth={1.5} />
				<p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
					警告：错误的值可能会影响性能或导致系统不稳定。
				</p>
			</div>

			<div>
				<div className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
					qBittorrent 核心设置
				</div>
				<div className="space-y-2">
					<div className="grid grid-cols-2 gap-2">
						<div>
							<label className="block text-[10px] mb-1" style={{ color: 'var(--text-muted)' }}>
								恢复数据存储方式
							</label>
							<Select
								value={preferences.resume_data_storage_type ?? 'SQLite'}
								onChange={(v) => onChange({ resume_data_storage_type: v })}
								options={RESUME_DATA_STORAGE_TYPES}
							/>
						</div>
						<div>
							<label className="block text-[10px] mb-1" style={{ color: 'var(--text-muted)' }}>
								文件删除模式
							</label>
							<Select
								value={preferences.torrent_content_remove_option ?? 'Delete'}
								onChange={(v) => onChange({ torrent_content_remove_option: v })}
								options={TORRENT_CONTENT_REMOVE_OPTIONS}
							/>
						</div>
					</div>
					<div className="grid grid-cols-3 gap-2">
						<div>
							<label className="block text-[10px] mb-1" style={{ color: 'var(--text-muted)' }}>
								内存限制 (MiB)
							</label>
							<input
								type="number"
								value={preferences.memory_working_set_limit ?? 512}
								onChange={(e) => onChange({ memory_working_set_limit: parseInt(e.target.value) || 512 })}
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
								网卡接口
							</label>
							<input
								type="text"
								value={preferences.current_network_interface ?? ''}
								onChange={(e) => onChange({ current_network_interface: e.target.value })}
								placeholder="全部"
								className="w-full px-2 py-1.5 rounded border text-xs"
								style={{
									backgroundColor: 'var(--bg-tertiary)',
									borderColor: 'var(--border)',
									color: 'var(--text-primary)',
								}}
							/>
						</div>
						<div>
							<label className="block text-[10px] mb-1" style={{ color: 'var(--text-muted)' }}>
								绑定 IP 地址
							</label>
							<input
								type="text"
								value={preferences.current_interface_address ?? ''}
								onChange={(e) => onChange({ current_interface_address: e.target.value })}
								placeholder="全部"
								className="w-full px-2 py-1.5 rounded border text-xs"
								style={{
									backgroundColor: 'var(--bg-tertiary)',
									borderColor: 'var(--border)',
									color: 'var(--text-primary)',
								}}
							/>
						</div>
					</div>
					<div className="grid grid-cols-4 gap-2">
						<div>
							<label className="block text-[10px] mb-1" style={{ color: 'var(--text-muted)' }}>
								恢复间隔 (分钟)
							</label>
							<input
								type="number"
								value={preferences.save_resume_data_interval ?? 60}
								onChange={(e) => onChange({ save_resume_data_interval: parseInt(e.target.value) || 60 })}
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
								统计间隔 (分钟)
							</label>
							<input
								type="number"
								value={preferences.save_statistics_interval ?? 15}
								onChange={(e) => onChange({ save_statistics_interval: parseInt(e.target.value) || 15 })}
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
								种子大小限制 (MiB)
							</label>
							<input
								type="number"
								value={Math.round((preferences.torrent_file_size_limit ?? 104857600) / 1024 / 1024)}
								onChange={(e) => onChange({ torrent_file_size_limit: (parseInt(e.target.value) || 100) * 1024 * 1024 })}
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
								刷新间隔 (ms)
							</label>
							<input
								type="number"
								value={preferences.refresh_interval ?? 1500}
								onChange={(e) => onChange({ refresh_interval: parseInt(e.target.value) || 1500 })}
								className="w-full px-2 py-1.5 rounded border text-xs font-mono"
								style={{
									backgroundColor: 'var(--bg-tertiary)',
									borderColor: 'var(--border)',
									color: 'var(--text-primary)',
								}}
							/>
						</div>
					</div>
					<div>
						<label className="block text-[10px] mb-1" style={{ color: 'var(--text-muted)' }}>
							实例名称
						</label>
						<input
							type="text"
							value={preferences.app_instance_name ?? ''}
							onChange={(e) => onChange({ app_instance_name: e.target.value })}
							placeholder="qBittorrent"
							className="w-full px-2 py-1.5 rounded border text-xs"
							style={{
								backgroundColor: 'var(--bg-tertiary)',
								borderColor: 'var(--border)',
								color: 'var(--text-primary)',
							}}
						/>
					</div>
					<div className="grid grid-cols-2 gap-x-4 gap-y-1">
						<div className="flex items-center justify-between">
							<span className="text-xs" style={{ color: 'var(--text-muted)' }}>
								校验前确认
							</span>
							<Toggle
								checked={preferences.confirm_torrent_recheck ?? true}
								onChange={(v) => onChange({ confirm_torrent_recheck: v })}
							/>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-xs" style={{ color: 'var(--text-muted)' }}>
								完成后校验
							</span>
							<Toggle
								checked={preferences.recheck_completed_torrents ?? false}
								onChange={(v) => onChange({ recheck_completed_torrents: v })}
							/>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-xs" style={{ color: 'var(--text-muted)' }}>
								解析用户所在国家
							</span>
							<Toggle
								checked={preferences.resolve_peer_countries ?? true}
								onChange={(v) => onChange({ resolve_peer_countries: v })}
							/>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-xs" style={{ color: 'var(--text-muted)' }}>
								IP 变更时重新汇报
							</span>
							<Toggle
								checked={preferences.reannounce_when_address_changed ?? false}
								onChange={(v) => onChange({ reannounce_when_address_changed: v })}
							/>
						</div>
					</div>
					<div className="p-2 rounded space-y-2" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
						<div className="flex items-center justify-between">
							<span className="text-xs" style={{ color: 'var(--text-muted)' }}>
								内置 Tracker
							</span>
							<Toggle
								checked={preferences.enable_embedded_tracker ?? false}
								onChange={(v) => onChange({ enable_embedded_tracker: v })}
							/>
						</div>
						{preferences.enable_embedded_tracker && (
							<div className="flex items-center gap-4 pl-4">
								<div className="flex items-center gap-2">
									<label className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
										端口
									</label>
									<input
										type="number"
										value={preferences.embedded_tracker_port ?? 9000}
										onChange={(e) => onChange({ embedded_tracker_port: parseInt(e.target.value) || 9000 })}
										className="w-16 px-2 py-1 rounded border text-xs font-mono"
										style={{
											backgroundColor: 'var(--bg-secondary)',
											borderColor: 'var(--border)',
											color: 'var(--text-primary)',
										}}
									/>
								</div>
								<div className="flex items-center justify-between flex-1">
									<span className="text-xs" style={{ color: 'var(--text-muted)' }}>
										端口转发
									</span>
									<Toggle
										checked={preferences.embedded_tracker_port_forwarding ?? false}
										onChange={(v) => onChange({ embedded_tracker_port_forwarding: v })}
									/>
								</div>
							</div>
						)}
					</div>
					<div className="flex items-center justify-between">
						<span className="text-xs" style={{ color: 'var(--text-muted)' }}>
							忽略 SSL 错误
						</span>
						<Toggle
							checked={preferences.ignore_ssl_errors ?? false}
							onChange={(v) => onChange({ ignore_ssl_errors: v })}
						/>
					</div>
					<div>
						<label className="block text-[10px] mb-1" style={{ color: 'var(--text-muted)' }}>
							Python 执行路径
						</label>
						<input
							type="text"
							value={preferences.python_executable_path ?? ''}
							onChange={(e) => onChange({ python_executable_path: e.target.value })}
							placeholder="自动检测"
							className="w-full px-2 py-1.5 rounded border text-xs"
							style={{
								backgroundColor: 'var(--bg-tertiary)',
								borderColor: 'var(--border)',
								color: 'var(--text-primary)',
							}}
						/>
					</div>
				</div>
			</div>

			<div className="h-px" style={{ backgroundColor: 'var(--border)' }} />

			<div>
				<div className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
					libtorrent 库设置
				</div>
				<div className="space-y-2">
					<div className="grid grid-cols-4 gap-2">
						<div>
							<label className="block text-[10px] mb-1" style={{ color: 'var(--text-muted)' }}>
								Bdecode 深度
							</label>
							<input
								type="number"
								value={preferences.bdecode_depth_limit ?? 100}
								onChange={(e) => onChange({ bdecode_depth_limit: parseInt(e.target.value) || 100 })}
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
								Bdecode 令牌
							</label>
							<input
								type="number"
								value={preferences.bdecode_token_limit ?? 10000000}
								onChange={(e) => onChange({ bdecode_token_limit: parseInt(e.target.value) || 10000000 })}
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
								异步 I/O 线程
							</label>
							<input
								type="number"
								value={preferences.async_io_threads ?? 10}
								onChange={(e) => onChange({ async_io_threads: parseInt(e.target.value) || 10 })}
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
								Hash 线程
							</label>
							<input
								type="number"
								value={preferences.hashing_threads ?? 1}
								onChange={(e) => onChange({ hashing_threads: parseInt(e.target.value) || 1 })}
								className="w-full px-2 py-1.5 rounded border text-xs font-mono"
								style={{
									backgroundColor: 'var(--bg-tertiary)',
									borderColor: 'var(--border)',
									color: 'var(--text-primary)',
								}}
							/>
						</div>
					</div>
					<div className="grid grid-cols-4 gap-2">
						<div>
							<label className="block text-[10px] mb-1" style={{ color: 'var(--text-muted)' }}>
								文件池大小
							</label>
							<input
								type="number"
								value={preferences.file_pool_size ?? 100}
								onChange={(e) => onChange({ file_pool_size: parseInt(e.target.value) || 100 })}
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
								校验内存 (MiB)
							</label>
							<input
								type="number"
								value={preferences.checking_memory_use ?? 32}
								onChange={(e) => onChange({ checking_memory_use: parseInt(e.target.value) || 32 })}
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
								磁盘队列 (KiB)
							</label>
							<input
								type="number"
								value={preferences.disk_queue_size ?? 1024}
								onChange={(e) => onChange({ disk_queue_size: parseInt(e.target.value) || 1024 })}
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
								磁盘 I/O 类型
							</label>
							<Select
								value={preferences.disk_io_type ?? 0}
								onChange={(v) => onChange({ disk_io_type: v })}
								options={DISK_IO_TYPES}
							/>
						</div>
					</div>
					<div className="grid grid-cols-2 gap-2">
						<div>
							<label className="block text-[10px] mb-1" style={{ color: 'var(--text-muted)' }}>
								磁盘读取模式
							</label>
							<Select
								value={preferences.disk_io_read_mode ?? 0}
								onChange={(v) => onChange({ disk_io_read_mode: v })}
								options={DISK_IO_MODES}
							/>
						</div>
						<div>
							<label className="block text-[10px] mb-1" style={{ color: 'var(--text-muted)' }}>
								磁盘写入模式
							</label>
							<Select
								value={preferences.disk_io_write_mode ?? 0}
								onChange={(v) => onChange({ disk_io_write_mode: v })}
								options={DISK_IO_MODES}
							/>
						</div>
					</div>
					<div className="grid grid-cols-2 gap-x-4 gap-y-1">
						<div className="flex items-center justify-between">
							<span className="text-xs" style={{ color: 'var(--text-muted)' }}>
								分块亲和性
							</span>
							<Toggle
								checked={preferences.enable_piece_extent_affinity ?? false}
								onChange={(v) => onChange({ enable_piece_extent_affinity: v })}
							/>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-xs" style={{ color: 'var(--text-muted)' }}>
								上传分块建议
							</span>
							<Toggle
								checked={preferences.enable_upload_suggestions ?? false}
								onChange={(v) => onChange({ enable_upload_suggestions: v })}
							/>
						</div>
					</div>
					<div className="grid grid-cols-3 gap-2">
						<div>
							<label className="block text-[10px] mb-1" style={{ color: 'var(--text-muted)' }}>
								发送缓冲区 (KiB)
							</label>
							<input
								type="number"
								value={preferences.send_buffer_watermark ?? 500}
								onChange={(e) => onChange({ send_buffer_watermark: parseInt(e.target.value) || 500 })}
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
								低水位线 (KiB)
							</label>
							<input
								type="number"
								value={preferences.send_buffer_low_watermark ?? 10}
								onChange={(e) => onChange({ send_buffer_low_watermark: parseInt(e.target.value) || 10 })}
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
								水位线系数 (%)
							</label>
							<input
								type="number"
								value={preferences.send_buffer_watermark_factor ?? 50}
								onChange={(e) => onChange({ send_buffer_watermark_factor: parseInt(e.target.value) || 50 })}
								className="w-full px-2 py-1.5 rounded border text-xs font-mono"
								style={{
									backgroundColor: 'var(--bg-tertiary)',
									borderColor: 'var(--border)',
									color: 'var(--text-primary)',
								}}
							/>
						</div>
					</div>
					<div className="grid grid-cols-3 gap-2">
						<div>
							<label className="block text-[10px] mb-1" style={{ color: 'var(--text-muted)' }}>
								每秒连接数
							</label>
							<input
								type="number"
								value={preferences.connection_speed ?? 30}
								onChange={(e) => onChange({ connection_speed: parseInt(e.target.value) || 30 })}
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
								Socket 发送缓存
							</label>
							<input
								type="number"
								value={preferences.socket_send_buffer_size ?? 0}
								onChange={(e) => onChange({ socket_send_buffer_size: parseInt(e.target.value) || 0 })}
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
								Socket 接收缓存
							</label>
							<input
								type="number"
								value={preferences.socket_receive_buffer_size ?? 0}
								onChange={(e) => onChange({ socket_receive_buffer_size: parseInt(e.target.value) || 0 })}
								className="w-full px-2 py-1.5 rounded border text-xs font-mono"
								style={{
									backgroundColor: 'var(--bg-tertiary)',
									borderColor: 'var(--border)',
									color: 'var(--text-primary)',
								}}
							/>
						</div>
					</div>
					<div className="grid grid-cols-4 gap-2">
						<div>
							<label className="block text-[10px] mb-1" style={{ color: 'var(--text-muted)' }}>
								Socket 积压数
							</label>
							<input
								type="number"
								value={preferences.socket_backlog_size ?? 30}
								onChange={(e) => onChange({ socket_backlog_size: parseInt(e.target.value) || 30 })}
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
								UPnP 租约
							</label>
							<input
								type="number"
								value={preferences.upnp_lease_duration ?? 0}
								onChange={(e) => onChange({ upnp_lease_duration: parseInt(e.target.value) || 0 })}
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
								传出端口 (最小)
							</label>
							<input
								type="number"
								value={preferences.outgoing_ports_min ?? 0}
								onChange={(e) => onChange({ outgoing_ports_min: parseInt(e.target.value) || 0 })}
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
								传出端口 (最大)
							</label>
							<input
								type="number"
								value={preferences.outgoing_ports_max ?? 0}
								onChange={(e) => onChange({ outgoing_ports_max: parseInt(e.target.value) || 0 })}
								className="w-full px-2 py-1.5 rounded border text-xs font-mono"
								style={{
									backgroundColor: 'var(--bg-tertiary)',
									borderColor: 'var(--border)',
									color: 'var(--text-primary)',
								}}
							/>
						</div>
					</div>
					<div className="grid grid-cols-2 gap-2">
						<div>
							<label className="block text-[10px] mb-1" style={{ color: 'var(--text-muted)' }}>
								用户连接 ToS
							</label>
							<input
								type="number"
								value={preferences.peer_tos ?? 4}
								onChange={(e) => onChange({ peer_tos: parseInt(e.target.value) || 0 })}
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
								µTP-TCP 混合模式
							</label>
							<Select
								value={preferences.utp_tcp_mixed_mode ?? 0}
								onChange={(v) => onChange({ utp_tcp_mixed_mode: v })}
								options={UTP_TCP_MIXED_MODES}
							/>
						</div>
					</div>
					<div className="grid grid-cols-2 gap-x-4 gap-y-1">
						<div className="flex items-center justify-between">
							<span className="text-xs" style={{ color: 'var(--text-muted)' }}>
								IDN 支持
							</span>
							<Toggle
								checked={preferences.idn_support_enabled ?? false}
								onChange={(v) => onChange({ idn_support_enabled: v })}
							/>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-xs" style={{ color: 'var(--text-muted)' }}>
								允许同 IP 多重连接
							</span>
							<Toggle
								checked={preferences.enable_multi_connections_from_same_ip ?? false}
								onChange={(v) => onChange({ enable_multi_connections_from_same_ip: v })}
							/>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-xs" style={{ color: 'var(--text-muted)' }}>
								验证 HTTPS Tracker 证书
							</span>
							<Toggle
								checked={preferences.validate_https_tracker_certificate ?? true}
								onChange={(v) => onChange({ validate_https_tracker_certificate: v })}
							/>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-xs" style={{ color: 'var(--text-muted)' }}>
								SSRF 防护
							</span>
							<Toggle
								checked={preferences.ssrf_mitigation ?? true}
								onChange={(v) => onChange({ ssrf_mitigation: v })}
							/>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-xs" style={{ color: 'var(--text-muted)' }}>
								禁止特权端口上的连接
							</span>
							<Toggle
								checked={preferences.block_peers_on_privileged_ports ?? false}
								onChange={(v) => onChange({ block_peers_on_privileged_ports: v })}
							/>
						</div>
					</div>
					<div className="grid grid-cols-2 gap-2">
						<div>
							<label className="block text-[10px] mb-1" style={{ color: 'var(--text-muted)' }}>
								上传槽策略
							</label>
							<Select
								value={preferences.upload_slots_behavior ?? 0}
								onChange={(v) => onChange({ upload_slots_behavior: v })}
								options={UPLOAD_SLOTS_BEHAVIORS}
							/>
						</div>
						<div>
							<label className="block text-[10px] mb-1" style={{ color: 'var(--text-muted)' }}>
								上传阻塞算法
							</label>
							<Select
								value={preferences.upload_choking_algorithm ?? 1}
								onChange={(v) => onChange({ upload_choking_algorithm: v })}
								options={UPLOAD_CHOKING_ALGORITHMS}
							/>
						</div>
					</div>
					<div className="grid grid-cols-2 gap-x-4 gap-y-1">
						<div className="flex items-center justify-between">
							<span className="text-xs" style={{ color: 'var(--text-muted)' }}>
								向同一层级的所有 Tracker 汇报
							</span>
							<Toggle
								checked={preferences.announce_to_all_tiers ?? true}
								onChange={(v) => onChange({ announce_to_all_tiers: v })}
							/>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-xs" style={{ color: 'var(--text-muted)' }}>
								向所有 Tracker 汇报
							</span>
							<Toggle
								checked={preferences.announce_to_all_trackers ?? false}
								onChange={(v) => onChange({ announce_to_all_trackers: v })}
							/>
						</div>
					</div>
					<div className="grid grid-cols-2 gap-2">
						<div>
							<label className="block text-[10px] mb-1" style={{ color: 'var(--text-muted)' }}>
								汇报 IP 地址
							</label>
							<input
								type="text"
								value={preferences.announce_ip ?? ''}
								onChange={(e) => onChange({ announce_ip: e.target.value })}
								placeholder="(需重启)"
								className="w-full px-2 py-1.5 rounded border text-xs"
								style={{
									backgroundColor: 'var(--bg-tertiary)',
									borderColor: 'var(--border)',
									color: 'var(--text-primary)',
								}}
							/>
						</div>
						<div>
							<label className="block text-[10px] mb-1" style={{ color: 'var(--text-muted)' }}>
								汇报端口 (0=监听端口)
							</label>
							<input
								type="number"
								value={preferences.announce_port ?? 0}
								onChange={(e) => onChange({ announce_port: parseInt(e.target.value) || 0 })}
								className="w-full px-2 py-1.5 rounded border text-xs font-mono"
								style={{
									backgroundColor: 'var(--bg-tertiary)',
									borderColor: 'var(--border)',
									color: 'var(--text-primary)',
								}}
							/>
						</div>
					</div>
					<div className="grid grid-cols-3 gap-2">
						<div>
							<label className="block text-[10px] mb-1" style={{ color: 'var(--text-muted)' }}>
								最大并发 HTTP 汇报
							</label>
							<input
								type="number"
								value={preferences.max_concurrent_http_announces ?? 50}
								onChange={(e) => onChange({ max_concurrent_http_announces: parseInt(e.target.value) || 50 })}
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
								停止 Tracker 超时
							</label>
							<input
								type="number"
								value={preferences.stop_tracker_timeout ?? 2}
								onChange={(e) => onChange({ stop_tracker_timeout: parseInt(e.target.value) || 0 })}
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
								请求队列大小
							</label>
							<input
								type="number"
								value={preferences.request_queue_size ?? 500}
								onChange={(e) => onChange({ request_queue_size: parseInt(e.target.value) || 500 })}
								className="w-full px-2 py-1.5 rounded border text-xs font-mono"
								style={{
									backgroundColor: 'var(--bg-tertiary)',
									borderColor: 'var(--border)',
									color: 'var(--text-primary)',
								}}
							/>
						</div>
					</div>
					<div className="grid grid-cols-3 gap-2">
						<div>
							<label className="block text-[10px] mb-1" style={{ color: 'var(--text-muted)' }}>
								用户更替率 (%)
							</label>
							<input
								type="number"
								value={preferences.peer_turnover ?? 4}
								onChange={(e) => onChange({ peer_turnover: parseInt(e.target.value) || 4 })}
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
								更替截止阈值 (%)
							</label>
							<input
								type="number"
								value={preferences.peer_turnover_cutoff ?? 90}
								onChange={(e) => onChange({ peer_turnover_cutoff: parseInt(e.target.value) || 90 })}
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
								更替间隔 (秒)
							</label>
							<input
								type="number"
								value={preferences.peer_turnover_interval ?? 300}
								onChange={(e) => onChange({ peer_turnover_interval: parseInt(e.target.value) || 300 })}
								className="w-full px-2 py-1.5 rounded border text-xs font-mono"
								style={{
									backgroundColor: 'var(--bg-tertiary)',
									borderColor: 'var(--border)',
									color: 'var(--text-primary)',
								}}
							/>
						</div>
					</div>
					<div>
						<label className="block text-[10px] mb-1" style={{ color: 'var(--text-muted)' }}>
							DHT 引导节点 (Bootstrap nodes)
						</label>
						<input
							type="text"
							value={
								preferences.dht_bootstrap_nodes ??
								'dht.libtorrent.org:25401, dht.transmissionbt.com:6881, router.bittorrent.com:6881'
							}
							onChange={(e) => onChange({ dht_bootstrap_nodes: e.target.value })}
							className="w-full px-2 py-1.5 rounded border text-xs"
							style={{
								backgroundColor: 'var(--bg-tertiary)',
								borderColor: 'var(--border)',
								color: 'var(--text-primary)',
							}}
						/>
					</div>
				</div>
			</div>

			<div className="h-px" style={{ backgroundColor: 'var(--border)' }} />

			<div>
				<div className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
					I2P 网络设置
				</div>
				<div className="grid grid-cols-4 gap-2">
					<div>
						<label className="block text-[10px] mb-1" style={{ color: 'var(--text-muted)' }}>
							入站数量
						</label>
						<input
							type="number"
							value={preferences.i2p_inbound_quantity ?? 3}
							onChange={(e) => onChange({ i2p_inbound_quantity: parseInt(e.target.value) || 3 })}
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
							出站数量
						</label>
						<input
							type="number"
							value={preferences.i2p_outbound_quantity ?? 3}
							onChange={(e) => onChange({ i2p_outbound_quantity: parseInt(e.target.value) || 3 })}
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
							入站长度
						</label>
						<input
							type="number"
							value={preferences.i2p_inbound_length ?? 3}
							onChange={(e) => onChange({ i2p_inbound_length: parseInt(e.target.value) || 3 })}
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
							出站长度
						</label>
						<input
							type="number"
							value={preferences.i2p_outbound_length ?? 3}
							onChange={(e) => onChange({ i2p_outbound_length: parseInt(e.target.value) || 3 })}
							className="w-full px-2 py-1.5 rounded border text-xs font-mono"
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
