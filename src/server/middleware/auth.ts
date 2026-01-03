import { createMiddleware } from 'hono/factory'
import { getCookie } from 'hono/cookie'
import { db, type User } from '../db'

export interface AuthUser {
	id: number
	username: string
}

declare module 'hono' {
	interface ContextVariableMap {
		user: AuthUser
	}
}

export const authMiddleware = createMiddleware(async (c, next) => {
	const sessionId = getCookie(c, 'session')
	if (!sessionId) {
		return c.json({ error: 'Unauthorized' }, 401)
	}

	const now = Math.floor(Date.now() / 1000)
	const session = db.query<{ user_id: number; expires_at: number }, [string]>(
		'SELECT user_id, expires_at FROM sessions WHERE id = ?'
	).get(sessionId)

	if (!session || session.expires_at < now) {
		if (session) {
			db.run('DELETE FROM sessions WHERE id = ?', [sessionId])
		}
		return c.json({ error: 'Unauthorized' }, 401)
	}

	const user = db.query<User, [number]>(
		'SELECT id, username FROM users WHERE id = ?'
	).get(session.user_id)

	if (!user) {
		return c.json({ error: 'Unauthorized' }, 401)
	}

	c.set('user', { id: user.id, username: user.username })
	await next()
})
