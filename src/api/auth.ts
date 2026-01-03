export interface User {
	id: number
	username: string
}

export async function register(username: string, password: string): Promise<User> {
	const res = await fetch('/api/auth/register', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
		body: JSON.stringify({ username, password }),
	})
	if (!res.ok) {
		const data = await res.json()
		throw new Error(data.error || 'Registration failed')
	}
	return res.json()
}

export async function login(username: string, password: string): Promise<User> {
	const res = await fetch('/api/auth/login', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
		body: JSON.stringify({ username, password }),
	})
	if (!res.ok) {
		const data = await res.json()
		throw new Error(data.error || 'Login failed')
	}
	return res.json()
}

export async function logout(): Promise<void> {
	await fetch('/api/auth/logout', {
		method: 'POST',
		credentials: 'include',
	})
}

export async function getMe(): Promise<User | null> {
	const res = await fetch('/api/auth/me', {
		credentials: 'include',
	})
	if (!res.ok) return null
	return res.json()
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
	const res = await fetch('/api/auth/password', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
		body: JSON.stringify({ currentPassword, newPassword }),
	})
	if (!res.ok) {
		const data = await res.json()
		throw new Error(data.error || 'Failed to change password')
	}
}
