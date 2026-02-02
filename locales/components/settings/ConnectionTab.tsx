import type { QBittorrentPreferences } from '../../types/preferences'
import { Select, Checkbox } from '../ui'

interface Props {
	preferences: Partial<QBittorrentPreferences>
	onChange: (updates: Partial<QBittorrentPreferences>) => void
}

const PROTOCOL_OPTIONS = [
	{ value: 0, label: 'TCP 和 µTP' },
	{ value: 1, label: 'TCP' },
	{ value: 2, label: 'µTP' },
]

const PROXY_TYPES = [
	{ value: 0, label: '(无)' },
	{ value: 1, label: 'HTTP' },
	{ value: 2, label: 'SOCKS5' },
	{ value: 3, label: 'HTTP (含验证)' },
	{ value: 4, label: 'SOCKS5 (含验证)' },
	{ value: 5, label: 'SOCKS4' },
]

export function ConnectionTab({ preferences, onChange }: Props) {
	const proxyEnabled = (preferences.proxy_type ?? 0) > 0

	return (
		<div className="space-y-4">
			<div className="flex items-center gap-4">
				<label className="text-xs w-36 shrink-0" style={{ color: 'var(--text-muted)' }}>
					用户连接协议
				</label>
				<Select
					value={preferences.bittorrent_protocol ?? 0}
					onChange={(v) => onChange({ bittorrent_protocol: v as number })}
					options={PROTOCOL_OPTIONS}
				/>
			</div>

			<div className="h-px" style={{ backgroundColor: 'var(--border)' }} />

			<div>
				<div className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
					监听端口
				</div>
				<div className="grid grid-cols-2 gap-3">
					<div className="flex items-center gap-2">
						<label className="text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>
							端口
						</label>
						<input
							type="number"
							value={preferences.listen_port ?? 6881}
							onChange={(e) => onChange({ listen_port: parseInt(e.target.value) || 6881 })}
							className="w-24 px-2 py-1.5 rounded border text-xs font-mono"
							style={{
								backgroundColor: 'var(--bg-tertiary)',
								borderColor: 'var(--border)',
								color: 'var(--text-primary)',
							}}
						/>
						<button
							type="button"
							onClick={() =>
								onChange({ random_port: true, listen_port: Math.floor(Math.random() * (65535 - 49152) + 49152) })
							}
							className="px-2 py-1.5 rounded border text-xs"
							style={{
								backgroundColor: 'var(--bg-tertiary)',
								borderColor: 'var(--border)',
								color: 'var(--text-muted)',
							}}
						>
							随机
						</button>
					</div>
					<Checkbox
						label="使用 UPnP / NAT-PMP 转发"
						checked={preferences.upnp ?? true}
						onChange={(v) => onChange({ upnp: v })}
					/>
				</div>
			</div>

			<div className="h-px" style={{ backgroundColor: 'var(--border)' }} />

			<div>
				<div className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
					连接限制
				</div>
				<div className="grid grid-cols-2 gap-x-6 gap-y-2">
					<div className="flex items-center gap-2">
						<Checkbox
							label="全局最大连接数"
							checked={(preferences.max_connec ?? 500) > 0}
							onChange={(v) => onChange({ max_connec: v ? 500 : 0 })}
						/>
						<input
							type="number"
							value={preferences.max_connec ?? 500}
							onChange={(e) => onChange({ max_connec: parseInt(e.target.value) || 0 })}
							className="w-16 px-2 py-1 rounded border text-xs font-mono"
							style={{
								backgroundColor: 'var(--bg-tertiary)',
								borderColor: 'var(--border)',
								color: 'var(--text-primary)',
							}}
						/>
					</div>
					<div className="flex items-center gap-2">
						<Checkbox
							label="每个种子最大连接数"
							checked={(preferences.max_connec_per_torrent ?? 100) > 0}
							onChange={(v) => onChange({ max_connec_per_torrent: v ? 100 : 0 })}
						/>
						<input
							type="number"
							value={preferences.max_connec_per_torrent ?? 100}
							onChange={(e) => onChange({ max_connec_per_torrent: parseInt(e.target.value) || 0 })}
							className="w-16 px-2 py-1 rounded border text-xs font-mono"
							style={{
								backgroundColor: 'var(--bg-tertiary)',
								borderColor: 'var(--border)',
								color: 'var(--text-primary)',
							}}
						/>
					</div>
					<div className="flex items-center gap-2">
						<Checkbox
							label="全局上传槽限制"
							checked={(preferences.max_uploads ?? 8) > 0}
							onChange={(v) => onChange({ max_uploads: v ? 8 : 0 })}
						/>
						<input
							type="number"
							value={preferences.max_uploads ?? 8}
							onChange={(e) => onChange({ max_uploads: parseInt(e.target.value) || 0 })}
							className="w-16 px-2 py-1 rounded border text-xs font-mono"
							style={{
								backgroundColor: 'var(--bg-tertiary)',
								borderColor: 'var(--border)',
								color: 'var(--text-primary)',
							}}
						/>
					</div>
					<div className="flex items-center gap-2">
						<Checkbox
							label="每个种子上传槽限制"
							checked={(preferences.max_uploads_per_torrent ?? 4) > 0}
							onChange={(v) => onChange({ max_uploads_per_torrent: v ? 4 : 0 })}
						/>
						<input
							type="number"
							value={preferences.max_uploads_per_torrent ?? 4}
							onChange={(e) => onChange({ max_uploads_per_torrent: parseInt(e.target.value) || 0 })}
							className="w-16 px-2 py-1 rounded border text-xs font-mono"
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
				<div className="flex items-center gap-2 mb-2">
					<Checkbox
						label=""
						checked={preferences.i2p_enabled ?? false}
						onChange={(v) => onChange({ i2p_enabled: v })}
					/>
					<span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
						I2P (实验性)
					</span>
				</div>
				{preferences.i2p_enabled && (
					<div className="flex items-center gap-4 pl-6">
						<div className="flex items-center gap-2">
							<label className="text-xs" style={{ color: 'var(--text-muted)' }}>
								主机
							</label>
							<input
								type="text"
								value={preferences.i2p_address ?? '127.0.0.1'}
								onChange={(e) => onChange({ i2p_address: e.target.value })}
								className="w-28 px-2 py-1.5 rounded border text-xs"
								style={{
									backgroundColor: 'var(--bg-tertiary)',
									borderColor: 'var(--border)',
									color: 'var(--text-primary)',
								}}
							/>
						</div>
						<div className="flex items-center gap-2">
							<label className="text-xs" style={{ color: 'var(--text-muted)' }}>
								端口
							</label>
							<input
								type="number"
								value={preferences.i2p_port ?? 7656}
								onChange={(e) => onChange({ i2p_port: parseInt(e.target.value) || 7656 })}
								className="w-20 px-2 py-1.5 rounded border text-xs font-mono"
								style={{
									backgroundColor: 'var(--bg-tertiary)',
									borderColor: 'var(--border)',
									color: 'var(--text-primary)',
								}}
							/>
						</div>
						<Checkbox
							label="混合模式"
							checked={preferences.i2p_mixed_mode ?? false}
							onChange={(v) => onChange({ i2p_mixed_mode: v })}
						/>
					</div>
				)}
			</div>

			<div className="h-px" style={{ backgroundColor: 'var(--border)' }} />

			<div>
				<div className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
					代理服务器
				</div>
				<div className="flex items-center gap-3 mb-3">
					<Select
						value={preferences.proxy_type ?? 0}
						onChange={(v) => onChange({ proxy_type: v as number })}
						options={PROXY_TYPES}
						minWidth="140px"
					/>
					{proxyEnabled && (
						<>
							<input
								type="text"
								value={preferences.proxy_ip ?? ''}
								onChange={(e) => onChange({ proxy_ip: e.target.value })}
								placeholder="主机地址"
								className="flex-1 px-2 py-1.5 rounded border text-xs"
								style={{
									backgroundColor: 'var(--bg-tertiary)',
									borderColor: 'var(--border)',
									color: 'var(--text-primary)',
								}}
							/>
							<input
								type="number"
								value={preferences.proxy_port ?? 8080}
								onChange={(e) => onChange({ proxy_port: parseInt(e.target.value) || 8080 })}
								placeholder="端口"
								className="w-20 px-2 py-1.5 rounded border text-xs font-mono"
								style={{
									backgroundColor: 'var(--bg-tertiary)',
									borderColor: 'var(--border)',
									color: 'var(--text-primary)',
								}}
							/>
						</>
					)}
				</div>

				{proxyEnabled && (
					<div className="space-y-2 pl-2">
						<Checkbox
							label="通过代理进行主机名查找"
							checked={preferences.proxy_hostname_lookup ?? false}
							onChange={(v) => onChange({ proxy_hostname_lookup: v })}
						/>
						<div className="p-2 rounded space-y-2" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
							<Checkbox
								label="需要身份验证"
								checked={preferences.proxy_auth_enabled ?? false}
								onChange={(v) => onChange({ proxy_auth_enabled: v })}
							/>
							{preferences.proxy_auth_enabled && (
								<div className="flex items-center gap-3 pl-6">
									<input
										type="text"
										value={preferences.proxy_username ?? ''}
										onChange={(e) => onChange({ proxy_username: e.target.value })}
										placeholder="用户名"
										className="w-32 px-2 py-1.5 rounded border text-xs"
										style={{
											backgroundColor: 'var(--bg-secondary)',
											borderColor: 'var(--border)',
											color: 'var(--text-primary)',
										}}
									/>
									<input
										type="password"
										value={preferences.proxy_password ?? ''}
										onChange={(e) => onChange({ proxy_password: e.target.value })}
										placeholder="密码"
										className="w-32 px-2 py-1.5 rounded border text-xs"
										style={{
											backgroundColor: 'var(--bg-secondary)',
											borderColor: 'var(--border)',
											color: 'var(--text-primary)',
										}}
									/>
								</div>
							)}
						</div>
						<div className="grid grid-cols-2 gap-2">
							<Checkbox
								label="用于 BitTorrent"
								checked={preferences.proxy_bittorrent ?? true}
								onChange={(v) => onChange({ proxy_bittorrent: v })}
							/>
							{preferences.proxy_bittorrent && (
								<Checkbox
									label="用于用户连接"
									checked={preferences.proxy_peer_connections ?? false}
									onChange={(v) => onChange({ proxy_peer_connections: v })}
								/>
							)}
							<Checkbox
								label="用于 RSS"
								checked={preferences.proxy_rss ?? true}
								onChange={(v) => onChange({ proxy_rss: v })}
							/>
							<Checkbox
								label="用于其他常规连接"
								checked={preferences.proxy_misc ?? true}
								onChange={(v) => onChange({ proxy_misc: v })}
							/>
						</div>
					</div>
				)}
			</div>

			<div className="h-px" style={{ backgroundColor: 'var(--border)' }} />

			<div>
				<div className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
					IP 过滤
				</div>
				<div className="space-y-2">
					<div className="flex items-center gap-2">
						<Checkbox
							label="过滤路径"
							checked={preferences.ip_filter_enabled ?? false}
							onChange={(v) => onChange({ ip_filter_enabled: v })}
						/>
						<input
							type="text"
							value={preferences.ip_filter_path ?? ''}
							onChange={(e) => onChange({ ip_filter_path: e.target.value })}
							disabled={!preferences.ip_filter_enabled}
							placeholder=".dat, .p2p, .p2b"
							className="flex-1 px-2 py-1.5 rounded border text-xs disabled:opacity-50"
							style={{
								backgroundColor: 'var(--bg-tertiary)',
								borderColor: 'var(--border)',
								color: 'var(--text-primary)',
							}}
						/>
					</div>
					<Checkbox
						label="应用于 Tracker"
						checked={preferences.ip_filter_trackers ?? false}
						onChange={(v) => onChange({ ip_filter_trackers: v })}
					/>
					<div>
						<label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>
							禁用的 IP 列表
						</label>
						<textarea
							value={preferences.banned_IPs ?? ''}
							onChange={(e) => onChange({ banned_IPs: e.target.value })}
							rows={3}
							placeholder="每行一个 IP"
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
