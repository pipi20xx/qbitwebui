import { useState, useEffect } from 'react'
import { getStats, type PeriodStats } from '../api/stats'

export const PERIODS = [
	{ value: '15m', label: '15 分钟' },
	{ value: '30m', label: '30 分钟' },
	{ value: '1h', label: '1 小时' },
	{ value: '4h', label: '4 小时' },
	{ value: '12h', label: '12 小时' },
	{ value: '1d', label: '1 天' },
	{ value: '1w', label: '1 周' },
	{ value: '1mo', label: '1 个月' },
	{ value: '6mo', label: '6 个月' },
	{ value: '1y', label: '1 年' },
	{ value: 'all', label: '累计总量' },
] as const

export interface PeriodData {
	period: string
	label: string
	uploaded: number
	downloaded: number
	hasData: boolean
}

export interface InstanceOption {
	id: number
	label: string
}

interface UseStatsResult {
	periodData: PeriodData[] | null
	instances: InstanceOption[]
	selectedInstance: string
	setSelectedInstance: (value: string) => void
	isLoading: boolean
	hasAnyData: boolean
}

export function useStats(): UseStatsResult {
	const [periodData, setPeriodData] = useState<PeriodData[] | null>(null)
	const [instances, setInstances] = useState<InstanceOption[]>([])
	const [selectedInstance, setSelectedInstance] = useState<string>('all')

	useEffect(() => {
		let cancelled = false

		async function fetchAllPeriods(): Promise<void> {
			const results = await Promise.all(
				PERIODS.map(async (p) => {
					try {
						return { period: p.value, stats: await getStats(p.value) }
					} catch {
						return { period: p.value, stats: [] as PeriodStats[] }
					}
				})
			)

			if (cancelled) return

			const firstWithData = results.find((r) => r.stats.length > 0)
			if (firstWithData) {
				const uniqueInstances: InstanceOption[] = []
				for (const s of firstWithData.stats) {
					if (!uniqueInstances.some((i) => i.id === s.instanceId)) {
						uniqueInstances.push({ id: s.instanceId, label: s.instanceLabel })
					}
				}
				setInstances(uniqueInstances)
			}

			const processed = results.map(({ period, stats }) => {
				const periodConfig = PERIODS.find((p) => p.value === period)!
				const filtered =
					selectedInstance === 'all' ? stats : stats.filter((s) => s.instanceId === Number(selectedInstance))
				return {
					period,
					label: periodConfig.label,
					uploaded: filtered.reduce((sum, s) => sum + s.uploaded, 0),
					downloaded: filtered.reduce((sum, s) => sum + s.downloaded, 0),
					hasData: filtered.some((s) => s.hasData) || period === 'all',
				}
			})
			setPeriodData(processed)
		}

		fetchAllPeriods()
		return () => {
			cancelled = true
		}
	}, [selectedInstance])

	return {
		periodData,
		instances,
		selectedInstance,
		setSelectedInstance,
		isLoading: periodData === null,
		hasAnyData: periodData?.some((p) => p.hasData) ?? false,
	}
}
