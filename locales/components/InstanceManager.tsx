import { useState, useEffect, useCallback } from 'react'
import {
	Search,
	FolderOpen,
	Trash2,
	Rss,
	FileText,
	ArrowLeftRight,
	AlertTriangle,
	ChevronLeft,
	ChevronRight,
	ArrowDown,
	ArrowUp,
	Server,
	Settings,
	Pencil,
	BarChart3,
	Globe,
} from 'lucide-react'
import {
	getInstances,
	createInstance,
	updateInstance,
	deleteInstance,
	type Instance,
	type CreateInstanceData,
} from '../api/instances'
import { logout, changePassword } from '../api/auth'
import { Header } from './Header'
import { SettingsPanel } from './SettingsPanel'
import { SearchPanel } from './SearchPanel'
import { FileBrowser } from './FileBrowser'
import { OrphanManager } from './OrphanManager'
import { RSSManager } from './RSSManager'
import { LogViewer } from './LogViewer'
import { CrossSeedManager } from './CrossSeedManager'
import { Statistics } from './Statistics'
import { NetworkTools } from './NetworkTools'
import { Checkbox } from './ui'
import { formatSpeed, formatSize } from '../utils/format'

type Tab = 'dashboard' | 'tools'
type Tool = 'indexers' | 'files' | 'orphans' | 'rss' | 'logs' | 'cross-seed' | 'statistics' | 'network' | null

interface InstanceStats {
	id: number
	label: string
	online: boolean
	total: number
	downloading: number
	seeding: number
	paused: number
	error: number
	dlSpeed: number
	upSpeed: number
	allTimeDownload: number
	allTimeUpload: number
	freeSpaceOnDisk: number
}

function SpeedGraph({ history, color }: { history: number[]; color: string }) {
	const h = 32
	const w = 80
	const values = history.length >= 5 ? history.slice(-5) : [...Array(5 - history.length).fill(0), ...history]
	const max = Math.max(...values, 1)
	const points = values.map((v, i) => `${(i / 4) * w},${h - 2 - (v / max) * (h - 4)}`).join(' ')

	return (
		<svg width={w} height={h} className="opacity-60">
			<polyline
				points={points}
				fill="none"
				stroke={color}
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	)
}

interface Props {
	username: string
	onSelectInstance: (instance: Instance) => void
	onLogout: () => void
	authDisabled?: boolean
	initialTab?: Tab
	initialTool?: Tool
	onTabChange: (tab: Tab) => void
	onToolChange: (tool: Tool) => void
}

export function InstanceManager({
	username,
	onSelectInstance,
	onLogout,
	authDisabled,
	initialTab = 'dashboard',
	initialTool = null,
	onTabChange,
	onToolChange,
}: Props) {
	const tab = initialTab
	const [instances, setInstances] = useState<Instance[]>([])
	const [stats, setStats] = useState<InstanceStats[]>([])
	const [loading, setLoading] = useState(true)
	const [showForm, setShowForm] = useState(false)
	const [editingId, setEditingId] = useState<number | null>(null)
	const [formData, setFormData] = useState<CreateInstanceData>({
		label: '',
		url: '',
		qbt_username: '',
		qbt_password: '',
		skip_auth: false,
		agent_enabled: false,
		agent_url: '',
	})
	const [error, setError] = useState('')
	const [submitting, setSubmitting] = useState(false)
	const [deleteConfirm, setDeleteConfirm] = useState<Instance | null>(null)
	const [testing, setTesting] = useState(false)
	const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
	const [agentTesting, setAgentTesting] = useState(false)
	const [showPasswordModal, setShowPasswordModal] = useState(false)
	const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' })
	const [passwordError, setPasswordError] = useState('')
	const [changingPassword, setChangingPassword] = useState(false)
	const [dlHistory, setDlHistory] = useState<number[]>([])
	const [upHistory, setUpHistory] = useState<number[]>([])
	const [settingsInstance, setSettingsInstance] = useState<Instance | null>(null)
	const [filesEnabled, setFilesEnabled] = useState(false)
	const [autoSelectSingle, setAutoSelectSingle] = useState(
		() => localStorage.getItem('autoSelectSingleInstance') === 'true'
	)
	const [showQuickSettings, setShowQuickSettings] = useState(
		() => localStorage.getItem('showQuickSettings') !== 'false'
	)

	useEffect(() => {
		fetch('/api/config')
			.then((r) => r.json())
			.then((c) => setFilesEnabled(c.filesEnabled))
			.catch(() => {})
	}, [])

	const loadInstances = useCallback(async () => {
		try {
			const data = await getInstances()
			setInstances(data)
		} catch {
			setError('无法加载实例')
		} finally {
			setLoading(false)
		}
	}, [])

	const loadStats = useCallback(async () => {
		const res = await fetch('/api/instances/stats', { credentials: 'include' }).catch(() => null)
		if (res?.ok) {
			setStats(await res.json())
		}
	}, [])

	useEffect(() => {
		loadInstances()
	}, [loadInstances])

	useEffect(() => {
		if (instances.length > 0) {
			loadStats()
			const interval = setInterval(loadStats, 2000)
			return () => clearInterval(interval)
		}
	}, [instances.length, loadStats])

	useEffect(() => {
		if (stats.length > 0) {
			const totalDl = stats.reduce((a, s) => a + s.dlSpeed, 0)
			const totalUp = stats.reduce((a, s) => a + s.upSpeed, 0)
			setDlHistory((prev) => [...prev.slice(-4), totalDl])
			setUpHistory((prev) => [...prev.slice(-4), totalUp])
		}
	}, [stats])

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault()
		setError('')
		setSubmitting(true)
		try {
			const submitData = { ...formData }
			if (editingId && !submitData.qbt_password) {
				delete (submitData as { qbt_password?: string }).qbt_password
			}
			if (editingId) {
				await updateInstance(editingId, submitData)
			} else {
				await createInstance(submitData)
			}
			setShowForm(false)
			setEditingId(null)
			setFormData({
				label: '',
				url: '',
				qbt_username: '',
				qbt_password: '',
				skip_auth: false,
				agent_enabled: false,
				agent_url: '',
			})
			setTestResult(null)
			await loadInstances()
		} catch (err) {
			setError(err instanceof Error ? err.message : '操作失败')
		} finally {
			setSubmitting(false)
		}
	}

	async function handleDelete() {
		if (!deleteConfirm) return
		try {
			await deleteInstance(deleteConfirm.id)
			setDeleteConfirm(null)
			await loadInstances()
		} catch {
			setError('删除实例失败')
		}
	}

	async function testConnection() {
		setTesting(true)
		setTestResult(null)
		try {
			let res: Response
			if (editingId && !formData.qbt_password && !formData.skip_auth) {
				res = await fetch(`/api/instances/${editingId}/test`, {
					method: 'POST',
					credentials: 'include',
				})
			} else {
				res = await fetch('/api/instances/test', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					credentials: 'include',
					body: JSON.stringify({
						url: formData.url,
						username: formData.qbt_username,
						password: formData.qbt_password,
						skip_auth: formData.skip_auth,
					}),
				})
			}
			const data = await res.json()
			if (res.ok) {
				setTestResult({ success: true, message: `连接成功！qBittorrent 版本：${data.version}` })
			} else {
				setTestResult({ success: false, message: data.error || '连接失败' })
			}
		} catch (err) {
			setTestResult({ success: false, message: err instanceof Error ? err.message : '连接失败' })
		} finally {
			setTesting(false)
		}
	}

	const [useCustomAgentUrl, setUseCustomAgentUrl] = useState(false)

	async function handleAgentToggle(enabled: boolean) {
		setFormData({ ...formData, agent_enabled: enabled, agent_url: enabled ? formData.agent_url : '' })
		setUseCustomAgentUrl(false)
		if (!enabled) return
		if (!formData.url) return setTestResult({ success: false, message: '请先输入 qBittorrent URL' })

		setAgentTesting(true)
		setTestResult(null)
		try {
			const res = await fetch('/api/instances/test-agent', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({ url: formData.url }),
			})
			const data = await res.json()
			setTestResult(
				res.ok
					? { success: true, message: 'Agent 连接正常' }
					: { success: false, message: data.error || 'Agent 无法访问 - 请尝试自定义 URL' }
			)
		} catch {
			setTestResult({ success: false, message: '测试 Agent 连接失败' })
		} finally {
			setAgentTesting(false)
		}
	}

	async function testAgentConnection() {
		const url = formData.agent_url || formData.url
		if (!url) return setTestResult({ success: false, message: '请先输入 URL' })

		setAgentTesting(true)
		setTestResult(null)
		try {
			const res = await fetch('/api/instances/test-agent', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({ url: formData.url, agent_url: formData.agent_url || undefined }),
			})
			const data = await res.json()
			setTestResult(
				res.ok
					? { success: true, message: 'Agent 连接正常' }
					: { success: false, message: data.error || 'Agent 无法访问' }
			)
		} catch {
			setTestResult({ success: false, message: '测试 Agent 连接失败' })
		} finally {
			setAgentTesting(false)
		}
	}

	function openEdit(instance: Instance) {
		setEditingId(instance.id)
		setFormData({
			label: instance.label,
			url: instance.url,
			qbt_username: instance.qbt_username || '',
			qbt_password: '',
			skip_auth: instance.skip_auth,
			agent_enabled: instance.agent_enabled,
			agent_url: instance.agent_url || '',
		})
		setUseCustomAgentUrl(!!instance.agent_url)
		setTestResult(null)
		setShowForm(true)
	}

	function closeForm() {
		setShowForm(false)
		setEditingId(null)
		setTestResult(null)
	}

	const testButtonLabel = testing
		? '正在测试...'
		: editingId && !formData.qbt_password && !formData.skip_auth
			? '测试已保存配置'
			: '测试连接'

	async function handleLogout() {
		await logout()
		onLogout()
	}

	function toggleAutoSelect(value: boolean) {
		setAutoSelectSingle(value)
		localStorage.setItem('autoSelectSingleInstance', String(value))
	}

	function toggleQuickSettings() {
		const next = !showQuickSettings
		setShowQuickSettings(next)
		localStorage.setItem('showQuickSettings', String(next))
	}

	async function handlePasswordChange(e: React.FormEvent) {
		e.preventDefault()
		setPasswordError('')
		if (passwordData.new !== passwordData.confirm) {
			setPasswordError('两次输入的新密码不一致')
			return
		}
		if (passwordData.new.length < 8) {
			setPasswordError('密码长度至少为 8 位')
			return
		}
		setChangingPassword(true)
		try {
			await changePassword(passwordData.current, passwordData.new)
			setShowPasswordModal(false)
			setPasswordData({ current: '', new: '', confirm: '' })
		} catch (err) {
			setPasswordError(err instanceof Error ? err.message : '修改密码失败')
		} finally {
			setChangingPassword(false)
		}
	}

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
				<div className="text-sm" style={{ color: 'var(--text-muted)' }}>
					正在加载...
				</div>
			</div>
		)
	}

	const displayInstances = instances.filter((i) => i.id !== editingId && i.id !== settingsInstance?.id)
	const showingPanel = showForm || settingsInstance

	return (
		<div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
			<Header
				activeTab={tab}
				onTabChange={onTabChange}
				username={username}
				authDisabled={authDisabled}
				onLogout={handleLogout}
				onPasswordChange={() => setShowPasswordModal(true)}
			/>

			<main className="max-w-6xl mx-auto p-6">
				{tab === 'tools' ? (
					initialTool ? (
						<>
							<button
								onClick={() => onToolChange(null)}
								className="flex items-center gap-2 mb-6 text-sm hover:underline"
								style={{ color: 'var(--text-muted)' }}
							>
								<ChevronLeft className="w-4 h-4" strokeWidth={2} />
								返回工具箱
							</button>
							{initialTool === 'indexers' && <SearchPanel />}
							{initialTool === 'files' && <FileBrowser enabled={filesEnabled} />}
							{initialTool === 'orphans' && <OrphanManager instances={instances} />}
							{initialTool === 'rss' && <RSSManager instances={instances} />}
							{initialTool === 'logs' && <LogViewer instances={instances} />}
							{initialTool === 'cross-seed' && <CrossSeedManager instances={instances} />}
							{initialTool === 'statistics' && <Statistics />}
							{initialTool === 'network' && <NetworkTools instances={instances} />}
						</>
					) : (
						<>
							<h1 className="text-xl font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>
								工具箱
							</h1>
							<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
								<button
									onClick={() => onToolChange('indexers')}
									className="p-6 rounded-xl border text-left transition-all hover:border-[var(--accent)]"
									style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
								>
									<Search className="w-8 h-8 mb-3" style={{ color: 'var(--accent)' }} strokeWidth={1.5} />
									<div className="font-medium" style={{ color: 'var(--text-primary)' }}>
										Prowlarr 搜索
									</div>
									<div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
										搜索索引器
									</div>
								</button>
								<button
									onClick={() => onToolChange('files')}
									className="p-6 rounded-xl border text-left transition-all hover:border-[var(--accent)]"
									style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
								>
									<FolderOpen className="w-8 h-8 mb-3" style={{ color: 'var(--accent)' }} strokeWidth={1.5} />
									<div className="font-medium" style={{ color: 'var(--text-primary)' }}>
										文件浏览器
									</div>
									<div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
										浏览下载文件
									</div>
								</button>
								<button
									onClick={() => onToolChange('orphans')}
									className="p-6 rounded-xl border text-left transition-all hover:border-[var(--accent)]"
									style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
								>
									<Trash2 className="w-8 h-8 mb-3" style={{ color: 'var(--accent)' }} strokeWidth={1.5} />
									<div className="font-medium" style={{ color: 'var(--text-primary)' }}>
										孤儿文件管理
									</div>
									<div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
										清理冗余种子
									</div>
								</button>
								<button
									onClick={() => onToolChange('rss')}
									className="p-6 rounded-xl border text-left transition-all hover:border-[var(--accent)]"
									style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
								>
									<Rss className="w-8 h-8 mb-3" style={{ color: 'var(--accent)' }} strokeWidth={1.5} />
									<div className="font-medium" style={{ color: 'var(--text-primary)' }}>
										RSS 管理器
									</div>
									<div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
										订阅源与自动下载
									</div>
								</button>
								<button
									onClick={() => onToolChange('logs')}
									className="p-6 rounded-xl border text-left transition-all hover:border-[var(--accent)]"
									style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
								>
									<FileText className="w-8 h-8 mb-3" style={{ color: 'var(--accent)' }} strokeWidth={1.5} />
									<div className="font-medium" style={{ color: 'var(--text-primary)' }}>
										日志查看器
									</div>
									<div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
										应用程序日志
									</div>
								</button>
								<button
									onClick={() => onToolChange('cross-seed')}
									className="p-6 rounded-xl border text-left transition-all hover:border-[var(--accent)] relative"
									style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
								>
									<span className="absolute top-3 right-3 cursor-help" title="实验性功能">
										<AlertTriangle className="w-6 h-6" style={{ color: 'var(--error)' }} />
									</span>
									<ArrowLeftRight className="w-8 h-8 mb-3" style={{ color: 'var(--accent)' }} strokeWidth={1.5} />
									<div className="font-medium" style={{ color: 'var(--text-primary)' }}>
										辅种管理
									</div>
									<div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
										跨站寻找匹配种子
									</div>
								</button>
								<button
									onClick={() => onToolChange('statistics')}
									className="p-6 rounded-xl border text-left transition-all hover:border-[var(--accent)]"
									style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
								>
									<BarChart3 className="w-8 h-8 mb-3" style={{ color: 'var(--accent)' }} strokeWidth={1.5} />
									<div className="font-medium" style={{ color: 'var(--text-primary)' }}>
										传输统计
									</div>
									<div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
										传输历史记录
									</div>
								</button>
								<button
									onClick={() => onToolChange('network')}
									className="p-6 rounded-xl border text-left transition-all hover:border-[var(--accent)]"
									style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
								>
									<Globe className="w-8 h-8 mb-3" style={{ color: 'var(--accent)' }} strokeWidth={1.5} />
									<div className="font-medium" style={{ color: 'var(--text-primary)' }}>
										网络工具
									</div>
									<div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
										IP 信息, 测速, DNS
									</div>
								</button>
							</div>
						</>
					)
				) : (
					<>
						{stats.length > 0 && !showingPanel && (
							<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
								{[
									{ label: '总计', value: stats.reduce((a, s) => a + s.total, 0), color: 'var(--text-primary)' },
									{ label: '下载中', value: stats.reduce((a, s) => a + s.downloading, 0), color: 'var(--accent)' },
									{ label: '做种中', value: stats.reduce((a, s) => a + s.seeding, 0), color: '#a6e3a1' },
									{ label: '已停止', value: stats.reduce((a, s) => a + s.paused, 0), color: 'var(--text-muted)' },
								].map((item) => (
									<div
										key={item.label}
										className="p-4 rounded-xl border"
										style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
									>
										<div className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
											{item.label}
										</div>
										<div className="text-2xl font-semibold" style={{ color: item.color }}>
											{item.value}
										</div>
									</div>
								))}
							</div>
						)}

						{stats.length > 0 && !showingPanel && (
							<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
								<div
									className="p-4 rounded-xl border flex items-center justify-between"
									style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
								>
									<div className="flex items-center gap-3">
										<ArrowDown className="w-5 h-5" style={{ color: 'var(--accent)' }} strokeWidth={2} />
										<div>
											<div className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
												下载速度
											</div>
											<div className="text-lg font-medium tabular-nums" style={{ color: 'var(--text-primary)' }}>
												{formatSpeed(stats.reduce((a, s) => a + s.dlSpeed, 0))}
											</div>
										</div>
									</div>
									<SpeedGraph history={dlHistory} color="var(--accent)" />
								</div>
								<div
									className="p-4 rounded-xl border flex items-center justify-between"
									style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
								>
									<div className="flex items-center gap-3">
										<ArrowUp className="w-5 h-5" style={{ color: '#a6e3a1' }} strokeWidth={2} />
										<div>
											<div className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
												上传速度
											</div>
											<div className="text-lg font-medium tabular-nums" style={{ color: 'var(--text-primary)' }}>
												{formatSpeed(stats.reduce((a, s) => a + s.upSpeed, 0))}
											</div>
										</div>
									</div>
									<SpeedGraph history={upHistory} color="#a6e3a1" />
								</div>
								<div
									className="p-4 rounded-xl border"
									style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
								>
									<div className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
										累计下载
									</div>
									<div className="text-lg font-medium tabular-nums" style={{ color: 'var(--accent)' }}>
										{formatSize(stats.reduce((a, s) => a + s.allTimeDownload, 0))}
									</div>
								</div>
								<div
									className="p-4 rounded-xl border"
									style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
								>
									<div className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
										累计上传
									</div>
									<div className="text-lg font-medium tabular-nums" style={{ color: '#a6e3a1' }}>
										{formatSize(stats.reduce((a, s) => a + s.allTimeUpload, 0))}
									</div>
								</div>
							</div>
						)}

						<div className="flex items-center justify-between mb-6">
							<h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
								实例列表
							</h1>
							{!showingPanel && (
								<button
									onClick={() => {
										setShowForm(true)
										setEditingId(null)
										setFormData({
											label: '',
											url: '',
											qbt_username: '',
											qbt_password: '',
											skip_auth: false,
											agent_enabled: false,
											agent_url: '',
										})
									}}
									className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
									style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-contrast)' }}
								>
									添加实例
								</button>
							)}
						</div>

						{error && (
							<div
								className="mb-6 px-4 py-3 rounded-lg text-sm"
								style={{ backgroundColor: 'color-mix(in srgb, var(--error) 10%, transparent)', color: 'var(--error)' }}
							>
								{error}
							</div>
						)}

						{showForm && (
							<div
								className="mb-6 p-6 rounded-xl border"
								style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
							>
								<h2 className="text-lg font-medium mb-4" style={{ color: 'var(--text-primary)' }}>
									{editingId ? '编辑实例' : '添加实例'}
								</h2>
								<form onSubmit={handleSubmit} className="space-y-4">
									<div className="grid grid-cols-2 gap-4">
										<div>
											<label
												className="block text-xs font-medium mb-2 uppercase tracking-wider"
												style={{ color: 'var(--text-muted)' }}
											>
												实例别名
											</label>
											<input
												type="text"
												value={formData.label}
												onChange={(e) => setFormData({ ...formData, label: e.target.value })}
												className="w-full px-4 py-2.5 rounded-lg border text-sm"
												style={{
													backgroundColor: 'var(--bg-tertiary)',
													borderColor: 'var(--border)',
													color: 'var(--text-primary)',
												}}
												placeholder="例如: 我的服务器"
												required
											/>
										</div>
										<div>
											<label
												className="block text-xs font-medium mb-2 uppercase tracking-wider"
												style={{ color: 'var(--text-muted)' }}
											>
												URL 地址
											</label>
											<input
												type="url"
												value={formData.url}
												onChange={(e) => setFormData({ ...formData, url: e.target.value })}
												className="w-full px-4 py-2.5 rounded-lg border text-sm"
												style={{
													backgroundColor: 'var(--bg-tertiary)',
													borderColor: 'var(--border)',
													color: 'var(--text-primary)',
												}}
												placeholder="http://192.168.1.100:8080"
												required
											/>
										</div>
										<div>
											<label
												className="block text-xs font-medium mb-2 uppercase tracking-wider"
												style={{ color: 'var(--text-muted)' }}
											>
												qBittorrent 用户名
											</label>
											<input
												type="text"
												value={formData.qbt_username}
												onChange={(e) => setFormData({ ...formData, qbt_username: e.target.value })}
												className="w-full px-4 py-2.5 rounded-lg border text-sm"
												style={{
													backgroundColor: 'var(--bg-tertiary)',
													borderColor: 'var(--border)',
													color: 'var(--text-primary)',
													opacity: formData.skip_auth ? 0.5 : 1,
												}}
												placeholder="admin"
												required={!formData.skip_auth}
												disabled={formData.skip_auth}
											/>
										</div>
										<div>
											<label
												className="block text-xs font-medium mb-2 uppercase tracking-wider"
												style={{ color: 'var(--text-muted)' }}
											>
												qBittorrent 密码
											</label>
											<input
												type="password"
												value={formData.qbt_password}
												onChange={(e) => setFormData({ ...formData, qbt_password: e.target.value })}
												className="w-full px-4 py-2.5 rounded-lg border text-sm"
												style={{
													backgroundColor: 'var(--bg-tertiary)',
													borderColor: 'var(--border)',
													color: 'var(--text-primary)',
													opacity: formData.skip_auth ? 0.5 : 1,
												}}
												placeholder={editingId ? '••••••••  (保持不变)' : '••••••••'}
												required={!formData.skip_auth && !editingId}
												disabled={formData.skip_auth}
											/>
										</div>
									</div>

									<Checkbox
										checked={formData.skip_auth ?? false}
										onChange={(v) => setFormData({ ...formData, skip_auth: v })}
										label="跳过身份验证 (如果 qBittorrent 已开启 IP 绕过验证请勾选此项)"
									/>

									<Checkbox
										checked={formData.agent_enabled ?? false}
										onChange={handleAgentToggle}
										label={
											<>
												启用网络 Agent (支持 IP 信息、测速、网络诊断等功能){' '}
												<a
													href="https://maciejonos.github.io/qbitwebui/guide/network-agent/"
													target="_blank"
													rel="noopener noreferrer"
													className="underline"
													style={{ color: 'var(--accent)' }}
													onClick={(e) => e.stopPropagation()}
												>
													如何设置
												</a>
											</>
										}
									/>

									{formData.agent_enabled && (
										<div className="ml-6 space-y-2">
											<Checkbox
												checked={useCustomAgentUrl}
												onChange={(v) => {
													setUseCustomAgentUrl(v)
													if (!v) setFormData({ ...formData, agent_url: '' })
												}}
												label="使用自定义 Agent URL"
											/>
											{useCustomAgentUrl && (
												<div className="flex items-center gap-2 max-w-md">
													<input
														type="url"
														value={formData.agent_url || ''}
														onChange={(e) => setFormData({ ...formData, agent_url: e.target.value })}
														className="flex-1 min-w-0 px-2 py-1 rounded border text-xs"
														style={{
															backgroundColor: 'var(--bg-tertiary)',
															borderColor: 'var(--border)',
															color: 'var(--text-primary)',
														}}
														placeholder="https://agent.mydomain.com"
													/>
													<button
														type="button"
														onClick={testAgentConnection}
														disabled={agentTesting || !formData.agent_url}
														className="px-2 py-1 rounded text-xs border disabled:opacity-50 shrink-0"
														style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
													>
														{agentTesting ? '...' : '测试'}
													</button>
												</div>
											)}
										</div>
									)}

									{testResult && (
										<div
											className="px-4 py-3 rounded-lg text-sm"
											style={{
												backgroundColor: testResult.success
													? 'color-mix(in srgb, #a6e3a1 10%, transparent)'
													: 'color-mix(in srgb, var(--error) 10%, transparent)',
												color: testResult.success ? '#a6e3a1' : 'var(--error)',
											}}
										>
											{testResult.message}
										</div>
									)}

									<div className="flex gap-3">
										<button
											type="submit"
											disabled={submitting}
											className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
											style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-contrast)' }}
										>
											{submitting ? '正在保存...' : editingId ? '更新' : '添加'}
										</button>
										<button
											type="button"
											onClick={testConnection}
											disabled={
												testing ||
												!formData.url ||
												(!formData.skip_auth && (!formData.qbt_username || (!editingId && !formData.qbt_password)))
											}
											className="px-4 py-2 rounded-lg text-sm border disabled:opacity-50"
											style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
										>
											{testButtonLabel}
										</button>
										<button
											type="button"
											onClick={closeForm}
											className="px-4 py-2 rounded-lg text-sm border"
											style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
										>
											取消
										</button>
									</div>
								</form>
							</div>
						)}

						{settingsInstance && (
							<SettingsPanel instance={settingsInstance} onClose={() => setSettingsInstance(null)} />
						)}

						{displayInstances.length === 0 && !showingPanel ? (
							<div
								className="text-center py-12 rounded-xl border"
								style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
							>
								<p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>
									未配置实例
								</p>
								<p className="text-xs" style={{ color: 'var(--text-muted)' }}>
									请先添加第一个 qBittorrent 实例以开始使用
								</p>
							</div>
						) : (
							displayInstances.length > 0 && (
								<>
									<div className="grid gap-4">
										{displayInstances.map((instance) => {
											const instanceStats = stats.find((s) => s.id === instance.id)
											return (
												<div
													key={instance.id}
													className="p-4 rounded-xl border group cursor-pointer transition-colors hover:border-[var(--accent)]"
													style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
													onClick={() => onSelectInstance(instance)}
												>
													<div className="flex items-center justify-between">
														<div className="flex items-center gap-4">
															<div
																className="w-10 h-10 rounded-lg flex items-center justify-center relative"
																style={{ backgroundColor: 'var(--bg-tertiary)' }}
															>
																<Server className="w-5 h-5" style={{ color: 'var(--text-muted)' }} strokeWidth={1.5} />
																{instanceStats && (
																	<div
																		className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2"
																		style={{
																			backgroundColor: instanceStats.online ? '#a6e3a1' : 'var(--error)',
																			borderColor: 'var(--bg-secondary)',
																		}}
																	/>
																)}
															</div>
															<div>
																<span className="font-medium" style={{ color: 'var(--text-primary)' }}>
																	{instance.label}
																</span>
																<div className="text-sm" style={{ color: 'var(--text-muted)' }}>
																	{instance.url}
																</div>
															</div>
														</div>
														<div className="flex items-center gap-2">
															<button
																onClick={(e) => {
																	e.stopPropagation()
																	setSettingsInstance(instance)
																}}
																className="p-2 rounded-lg transition-colors hover:bg-[var(--bg-tertiary)]"
																style={{ color: 'var(--text-muted)' }}
																title="设置"
															>
																<Settings className="w-4 h-4" strokeWidth={1.5} />
															</button>
															<button
																onClick={(e) => {
																	e.stopPropagation()
																	openEdit(instance)
																}}
																className="p-2 rounded-lg transition-colors hover:bg-[var(--bg-tertiary)]"
																style={{ color: 'var(--text-muted)' }}
																title="编辑"
															>
																<Pencil className="w-4 h-4" strokeWidth={1.5} />
															</button>
															<button
																onClick={(e) => {
																	e.stopPropagation()
																	setDeleteConfirm(instance)
																}}
																className="p-2 rounded-lg transition-colors hover:bg-[var(--bg-tertiary)]"
																style={{ color: 'var(--error)' }}
																title="删除"
															>
																<Trash2 className="w-4 h-4" strokeWidth={1.5} />
															</button>
														</div>
													</div>
													{instanceStats?.online && (
														<div
															className="mt-3 pt-3 border-t grid grid-cols-3 items-center text-xs"
															style={{ borderColor: 'var(--border)' }}
														>
															<div className="flex items-center gap-4">
																<span style={{ color: 'var(--text-muted)' }}>
																	<span style={{ color: 'var(--text-secondary)' }}>{instanceStats.total}</span> 个种子
																</span>
																<span style={{ color: 'var(--text-muted)' }}>
																	<span style={{ color: 'var(--accent)' }}>{instanceStats.downloading}</span> 下载
																</span>
																<span style={{ color: 'var(--text-muted)' }}>
																	<span style={{ color: '#a6e3a1' }}>{instanceStats.seeding}</span> 做种
																</span>
															</div>
															<span className="text-center" style={{ color: 'var(--text-muted)' }}>
																剩余空间: {formatSize(instanceStats.freeSpaceOnDisk)}
															</span>
															<div className="flex items-center gap-3 justify-end">
																<span style={{ color: 'var(--accent)' }}>↓ {formatSpeed(instanceStats.dlSpeed)}</span>
																<span style={{ color: '#a6e3a1' }}>↑ {formatSpeed(instanceStats.upSpeed)}</span>
															</div>
														</div>
													)}
												</div>
											)
										})}
									</div>
									{instances.length === 1 && !showingPanel && (
										<div className="mt-4">
											<button
												onClick={toggleQuickSettings}
												className="flex items-center gap-1 text-xs"
												style={{ color: 'var(--text-muted)' }}
											>
												<ChevronRight
													className="w-3 h-3 transition-transform"
													style={{ transform: showQuickSettings ? 'rotate(90deg)' : 'rotate(0deg)' }}
													strokeWidth={2}
												/>
												默认行为设置
											</button>
											{showQuickSettings && (
												<div className="mt-2 ml-4">
													<Checkbox
														checked={autoSelectSingle}
														onChange={toggleAutoSelect}
														label="单实例时跳过仪表盘，默认直接进入种子列表视图"
													/>
												</div>
											)}
										</div>
									)}
								</>
							)
						)}
					</>
				)}
			</main>

			{deleteConfirm && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center p-4"
					style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
				>
					<div
						className="w-full max-w-sm rounded-xl border p-6"
						style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
					>
						<h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
							删除实例
						</h3>
						<p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
							确定要删除 <strong style={{ color: 'var(--text-primary)' }}>{deleteConfirm.label}</strong> 吗？此操作无法撤销。
						</p>
						<div className="flex gap-3 justify-end">
							<button
								onClick={() => setDeleteConfirm(null)}
								className="px-4 py-2 rounded-lg text-sm border"
								style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
							>
								取消
							</button>
							<button
								onClick={handleDelete}
								className="px-4 py-2 rounded-lg text-sm font-medium"
								style={{ backgroundColor: 'var(--error)', color: 'var(--accent-contrast)' }}
							>
								确认删除
							</button>
						</div>
					</div>
				</div>
			)}

			{showPasswordModal && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center p-4"
					style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
				>
					<div
						className="w-full max-w-sm rounded-xl border p-6"
						style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
					>
						<h3 className="text-lg font-medium mb-4" style={{ color: 'var(--text-primary)' }}>
							修改登录密码
						</h3>
						<form onSubmit={handlePasswordChange} className="space-y-4">
							<div>
								<label
									className="block text-xs font-medium mb-2 uppercase tracking-wider"
									style={{ color: 'var(--text-muted)' }}
								>
									当前密码
								</label>
								<input
									type="password"
									value={passwordData.current}
									onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
									className="w-full px-4 py-2.5 rounded-lg border text-sm"
									style={{
										backgroundColor: 'var(--bg-tertiary)',
										borderColor: 'var(--border)',
										color: 'var(--text-primary)',
									}}
									required
								/>
							</div>
							<div>
								<label
									className="block text-xs font-medium mb-2 uppercase tracking-wider"
									style={{ color: 'var(--text-muted)' }}
								>
									新密码
								</label>
								<input
									type="password"
									value={passwordData.new}
									onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
									className="w-full px-4 py-2.5 rounded-lg border text-sm"
									style={{
										backgroundColor: 'var(--bg-tertiary)',
										borderColor: 'var(--border)',
										color: 'var(--text-primary)',
									}}
									required
								/>
							</div>
							<div>
								<label
									className="block text-xs font-medium mb-2 uppercase tracking-wider"
									style={{ color: 'var(--text-muted)' }}
								>
									确认新密码
								</label>
								<input
									type="password"
									value={passwordData.confirm}
									onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
									className="w-full px-4 py-2.5 rounded-lg border text-sm"
									style={{
										backgroundColor: 'var(--bg-tertiary)',
										borderColor: 'var(--border)',
										color: 'var(--text-primary)',
									}}
									required
								/>
							</div>
							{passwordError && (
								<div
									className="px-4 py-3 rounded-lg text-sm"
									style={{
										backgroundColor: 'color-mix(in srgb, var(--error) 10%, transparent)',
										color: 'var(--error)',
									}}
								>
									{passwordError}
								</div>
							)}
							<div className="flex gap-3 justify-end pt-2">
								<button
									type="button"
									onClick={() => {
										setShowPasswordModal(false)
										setPasswordData({ current: '', new: '', confirm: '' })
										setPasswordError('')
									}}
									className="px-4 py-2 rounded-lg text-sm border"
									style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
								>
									取消
								</button>
								<button
									type="submit"
									disabled={changingPassword}
									className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
									style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-contrast)' }}
								>
									{changingPassword ? '正在修改...' : '确认修改'}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	)
}