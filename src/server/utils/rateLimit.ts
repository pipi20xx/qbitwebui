interface RateLimitEntry {
	count: number
	resetAt: number
}

const limits = new Map<string, RateLimitEntry>()

const WINDOW_MS = 60 * 1000
const MAX_ATTEMPTS = 5

export function checkRateLimit(key: string): { allowed: boolean; retryAfter?: number } {
	const now = Date.now()
	const entry = limits.get(key)

	if (!entry || entry.resetAt < now) {
		limits.set(key, { count: 1, resetAt: now + WINDOW_MS })
		return { allowed: true }
	}

	if (entry.count >= MAX_ATTEMPTS) {
		return { allowed: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) }
	}

	entry.count++
	return { allowed: true }
}

export function resetRateLimit(key: string): void {
	limits.delete(key)
}

setInterval(() => {
	const now = Date.now()
	for (const [key, entry] of limits) {
		if (entry.resetAt < now) {
			limits.delete(key)
		}
	}
}, 60 * 1000)
