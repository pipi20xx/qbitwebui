import { Database } from 'bun:sqlite'

const dbPath = process.env.DATABASE_PATH || './data/qbitwebui.db'

import { mkdirSync } from 'fs'
import { dirname } from 'path'

mkdirSync(dirname(dbPath), { recursive: true })

export const db = new Database(dbPath)
db.exec('PRAGMA journal_mode = WAL')
db.exec('PRAGMA foreign_keys = ON')

db.exec(`
	CREATE TABLE IF NOT EXISTS users (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		username TEXT UNIQUE NOT NULL,
		password_hash TEXT NOT NULL,
		created_at INTEGER DEFAULT (unixepoch())
	)
`)

db.exec(`
	CREATE TABLE IF NOT EXISTS instances (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		label TEXT NOT NULL,
		url TEXT NOT NULL,
		qbt_username TEXT NOT NULL,
		qbt_password_encrypted TEXT NOT NULL,
		created_at INTEGER DEFAULT (unixepoch()),
		UNIQUE(user_id, label)
	)
`)

db.exec(`
	CREATE TABLE IF NOT EXISTS sessions (
		id TEXT PRIMARY KEY,
		user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		expires_at INTEGER NOT NULL
	)
`)

db.exec(`
	CREATE TABLE IF NOT EXISTS integrations (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		type TEXT NOT NULL,
		label TEXT NOT NULL,
		url TEXT NOT NULL,
		api_key_encrypted TEXT NOT NULL,
		created_at INTEGER DEFAULT (unixepoch()),
		UNIQUE(user_id, label)
	)
`)

export interface User {
	id: number
	username: string
	password_hash: string
	created_at: number
}

export interface Instance {
	id: number
	user_id: number
	label: string
	url: string
	qbt_username: string
	qbt_password_encrypted: string
	created_at: number
}

export interface Integration {
	id: number
	user_id: number
	type: string
	label: string
	url: string
	api_key_encrypted: string
	created_at: number
}

function cleanupExpiredSessions() {
	const now = Math.floor(Date.now() / 1000)
	db.run('DELETE FROM sessions WHERE expires_at < ?', [now])
}

cleanupExpiredSessions()
setInterval(cleanupExpiredSessions, 60 * 60 * 1000)
