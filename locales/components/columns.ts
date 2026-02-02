export type SortKey =
	| 'name'
	| 'size'
	| 'progress'
	| 'downloaded'
	| 'uploaded'
	| 'dlspeed'
	| 'upspeed'
	| 'ratio'
	| 'state'
	| 'category'
	| 'tags'
	| 'num_seeds'
	| 'num_leechs'
	| 'last_activity'
	| 'save_path'
	| 'tracker'
	| 'seeding_time'
	| 'added_on'
	| 'completion_on'
	| 'eta'

export interface ColumnDef {
	id: string
	label: string
	sortKey: SortKey | null
}

export const COLUMNS: ColumnDef[] = [
	{ id: 'progress', label: '进度', sortKey: 'progress' },
	{ id: 'eta', label: '预计剩余时间', sortKey: 'eta' },
	{ id: 'status', label: '状态', sortKey: null },
	{ id: 'size', label: '大小', sortKey: 'size' },
	{ id: 'downloaded', label: '已下载', sortKey: 'downloaded' },
	{ id: 'uploaded', label: '已上传', sortKey: 'uploaded' },
	{ id: 'dlspeed', label: '下载速度', sortKey: 'dlspeed' },
	{ id: 'upspeed', label: '上传速度', sortKey: 'upspeed' },
	{ id: 'ratio', label: '分享率', sortKey: 'ratio' },
	{ id: 'seeding_time', label: '做种时间', sortKey: 'seeding_time' },
	{ id: 'added_on', label: '添加时间', sortKey: 'added_on' },
	{ id: 'completion_on', label: '完成时间', sortKey: 'completion_on' },
	{ id: 'category', label: '分类', sortKey: 'category' },
	{ id: 'tags', label: '标签', sortKey: 'tags' },
	{ id: 'num_seeds', label: '做种', sortKey: 'num_seeds' },
	{ id: 'num_leechs', label: '吸血', sortKey: 'num_leechs' },
	{ id: 'last_activity', label: '最后活动', sortKey: 'last_activity' },
	{ id: 'save_path', label: '保存路径', sortKey: 'save_path' },
	{ id: 'tracker_name', label: 'Tracker', sortKey: 'tracker' },
	{ id: 'tracker', label: 'Tracker (URL)', sortKey: 'tracker' },
]

export const DEFAULT_VISIBLE_COLUMNS = new Set([
	'progress',
	'status',
	'downloaded',
	'uploaded',
	'dlspeed',
	'upspeed',
	'ratio',
	'seeding_time',
	'added_on',
])

export const DEFAULT_COLUMN_ORDER = COLUMNS.map((c) => c.id)
