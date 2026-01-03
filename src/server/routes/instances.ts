import { Hono } from 'hono'
import { db, type Instance } from '../db'
import { encrypt } from '../utils/crypto'
import { validateUrl } from '../utils/url'
import { loginToQbt, testQbtConnection, testStoredQbtInstance } from '../utils/qbt'
import { authMiddleware } from '../middleware/auth'
import { clearQbtSession } from './proxy'

const instances = new Hono()

instances.use('*', authMiddleware)

interface InstanceResponse {
	id: number
	label: string
	url: string
	qbt_username: string
	created_at: number
}

function toResponse(i: Instance): InstanceResponse {
	return {
		id: i.id,
		label: i.label,
		url: i.url,
		qbt_username: i.qbt_username,
		created_at: i.created_at,
	}
}

instances.get('/', (c) => {
	const user = c.get('user')
	const list = db.query<Instance, [number]>(
		'SELECT * FROM instances WHERE user_id = ? ORDER BY created_at'
	).all(user.id)
	return c.json(list.map(toResponse))
})

interface TorrentInfo {
	state: string
}

interface TransferInfo {
	dl_info_speed: number
	up_info_speed: number
}

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
}

async function fetchInstanceStats(instance: Instance): Promise<InstanceStats> {
	const base: InstanceStats = {
		id: instance.id,
		label: instance.label,
		online: false,
		total: 0,
		downloading: 0,
		seeding: 0,
		paused: 0,
		error: 0,
		dlSpeed: 0,
		upSpeed: 0,
	}

	try {
		const loginResult = await loginToQbt(instance)
		if (!loginResult.success) {
			return base
		}

		const [torrentsRes, transferRes] = await Promise.all([
			fetch(`${instance.url}/api/v2/torrents/info`, { headers: { Cookie: loginResult.cookie } }),
			fetch(`${instance.url}/api/v2/transfer/info`, { headers: { Cookie: loginResult.cookie } }),
		])

		if (!torrentsRes.ok || !transferRes.ok) {
			return base
		}

		const torrents = await torrentsRes.json() as TorrentInfo[]
		const transfer = await transferRes.json() as TransferInfo

		base.online = true
		base.total = torrents.length
		base.dlSpeed = transfer.dl_info_speed
		base.upSpeed = transfer.up_info_speed

		for (const t of torrents) {
			if (t.state === 'pausedUP' || t.state === 'pausedDL' || t.state === 'stoppedUP' || t.state === 'stoppedDL') {
				base.paused++
			} else if (t.state === 'error' || t.state === 'missingFiles') {
				base.error++
			} else if (t.state.includes('UP') || t.state === 'uploading') {
				base.seeding++
			} else if (t.state.includes('DL') || t.state === 'downloading' || t.state === 'metaDL') {
				base.downloading++
			}
		}

		return base
	} catch {
		return base
	}
}

instances.get('/stats', async (c) => {
	const user = c.get('user')
	const list = db.query<Instance, [number]>(
		'SELECT * FROM instances WHERE user_id = ? ORDER BY created_at'
	).all(user.id)

	const stats = await Promise.all(list.map(fetchInstanceStats))
	return c.json(stats)
})

instances.post('/', async (c) => {
	const user = c.get('user')
	const body = await c.req.json<{
		label: string
		url: string
		qbt_username: string
		qbt_password: string
	}>()

	if (!body.label || !body.url || !body.qbt_username || !body.qbt_password) {
		return c.json({ error: 'Missing required fields' }, 400)
	}

	try {
		validateUrl(body.url)
	} catch (e) {
		return c.json({ error: e instanceof Error ? e.message : 'Invalid URL' }, 400)
	}

	const encrypted = encrypt(body.qbt_password)

	try {
		const result = db.run(
			`INSERT INTO instances (user_id, label, url, qbt_username, qbt_password_encrypted)
			 VALUES (?, ?, ?, ?, ?)`,
			[user.id, body.label, body.url, body.qbt_username, encrypted]
		)

		const instance = db.query<Instance, [number]>(
			'SELECT * FROM instances WHERE id = ?'
		).get(Number(result.lastInsertRowid))

		if (!instance) {
			return c.json({ error: 'Failed to create instance' }, 500)
		}

		return c.json(toResponse(instance), 201)
	} catch (e: unknown) {
		if (e instanceof Error && e.message.includes('UNIQUE')) {
			return c.json({ error: 'Instance with this label already exists' }, 400)
		}
		throw e
	}
})

instances.put('/:id', async (c) => {
	const user = c.get('user')
	const id = Number(c.req.param('id'))
	const body = await c.req.json<{
		label?: string
		url?: string
		qbt_username?: string
		qbt_password?: string
	}>()

	const existing = db.query<Instance, [number, number]>(
		'SELECT * FROM instances WHERE id = ? AND user_id = ?'
	).get(id, user.id)

	if (!existing) {
		return c.json({ error: 'Instance not found' }, 404)
	}

	const updates: string[] = []
	const values: (string | number)[] = []

	if (body.label !== undefined) {
		updates.push('label = ?')
		values.push(body.label)
	}
	if (body.url !== undefined) {
		try {
			validateUrl(body.url)
		} catch (e) {
			return c.json({ error: e instanceof Error ? e.message : 'Invalid URL' }, 400)
		}
		updates.push('url = ?')
		values.push(body.url)
	}
	if (body.qbt_username !== undefined) {
		updates.push('qbt_username = ?')
		values.push(body.qbt_username)
	}
	if (body.qbt_password !== undefined) {
		updates.push('qbt_password_encrypted = ?')
		values.push(encrypt(body.qbt_password))
	}

	if (updates.length > 0) {
		values.push(id)
		db.run(`UPDATE instances SET ${updates.join(', ')} WHERE id = ?`, values)
	}

	const updated = db.query<Instance, [number]>(
		'SELECT * FROM instances WHERE id = ?'
	).get(id)

	if (!updated) {
		return c.json({ error: 'Failed to update instance' }, 500)
	}

	return c.json(toResponse(updated))
})

instances.post('/:id/test', async (c) => {
	const user = c.get('user')
	const id = Number(c.req.param('id'))

	const instance = db.query<Instance, [number, number]>(
		'SELECT * FROM instances WHERE id = ? AND user_id = ?'
	).get(id, user.id)

	if (!instance) {
		return c.json({ error: 'Instance not found' }, 404)
	}

	const result = await testStoredQbtInstance(instance)
	if (!result.success) {
		const status = result.error === 'Invalid credentials' ? 401 : 400
		return c.json({ error: result.error }, status)
	}

	return c.json({ success: true, version: result.version })
})

instances.post('/test', async (c) => {
	const body = await c.req.json<{
		url: string
		username: string
		password: string
	}>()

	if (!body.url || !body.username || !body.password) {
		return c.json({ error: 'Missing required fields' }, 400)
	}

	try {
		validateUrl(body.url)
	} catch (e) {
		return c.json({ error: e instanceof Error ? e.message : 'Invalid URL' }, 400)
	}

	const result = await testQbtConnection(body.url, body.username, body.password)
	if (!result.success) {
		const status = result.error === 'Invalid credentials' ? 401 : 400
		return c.json({ error: result.error }, status)
	}

	return c.json({ success: true, version: result.version })
})

instances.delete('/:id', (c) => {
	const user = c.get('user')
	const id = Number(c.req.param('id'))

	const existing = db.query<Instance, [number, number]>(
		'SELECT * FROM instances WHERE id = ? AND user_id = ?'
	).get(id, user.id)

	if (!existing) {
		return c.json({ error: 'Instance not found' }, 404)
	}

	db.run('DELETE FROM instances WHERE id = ?', [id])
	clearQbtSession(id)
	return c.json({ success: true })
})

export default instances
