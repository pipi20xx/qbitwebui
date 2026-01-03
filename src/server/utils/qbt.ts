import { decrypt } from './crypto'

interface QbtInstance {
	url: string
	qbt_username: string
	qbt_password_encrypted: string
}

export type QbtLoginResult = {
	success: true
	cookie: string
	version?: string
} | {
	success: false
	error: string
	status?: number
}

export async function loginToQbt(instance: QbtInstance): Promise<QbtLoginResult> {
	try {
		const password = decrypt(instance.qbt_password_encrypted)
		const res = await fetch(`${instance.url}/api/v2/auth/login`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: new URLSearchParams({
				username: instance.qbt_username,
				password,
			}),
		})

		if (!res.ok) {
			return { success: false, error: `Login failed: HTTP ${res.status}`, status: res.status }
		}

		const text = await res.text()
		if (text !== 'Ok.') {
			return { success: false, error: 'Invalid credentials', status: 401 }
		}

		const cookie = res.headers.get('set-cookie')?.split(';')[0]
		if (!cookie) {
			return { success: false, error: 'No session cookie received' }
		}

		return { success: true, cookie }
	} catch {
		return { success: false, error: 'Connection failed' }
	}
}

export async function testQbtConnection(url: string, username: string, password: string): Promise<QbtLoginResult> {
	try {
		const loginRes = await fetch(`${url}/api/v2/auth/login`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: new URLSearchParams({ username, password }),
		})

		if (!loginRes.ok) {
			return { success: false, error: `Login failed: HTTP ${loginRes.status}`, status: loginRes.status }
		}

		const loginText = await loginRes.text()
		if (loginText !== 'Ok.') {
			return { success: false, error: 'Invalid credentials', status: 401 }
		}

		const cookie = loginRes.headers.get('set-cookie')?.split(';')[0]
		if (!cookie) {
			return { success: false, error: 'No session cookie received' }
		}

		const versionRes = await fetch(`${url}/api/v2/app/version`, {
			headers: { Cookie: cookie },
		})

		if (!versionRes.ok) {
			return { success: false, error: 'Failed to get version' }
		}

		const version = await versionRes.text()
		return { success: true, cookie, version }
	} catch {
		return { success: false, error: 'Connection failed' }
	}
}

export async function testStoredQbtInstance(instance: QbtInstance): Promise<QbtLoginResult> {
	const loginResult = await loginToQbt(instance)
	if (!loginResult.success) {
		return loginResult
	}

	try {
		const versionRes = await fetch(`${instance.url}/api/v2/app/version`, {
			headers: { Cookie: loginResult.cookie },
		})

		if (!versionRes.ok) {
			return { success: false, error: 'Failed to get version' }
		}

		const version = await versionRes.text()
		return { success: true, cookie: loginResult.cookie, version }
	} catch {
		return { success: false, error: 'Connection failed' }
	}
}
