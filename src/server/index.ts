import { Hono } from 'hono'
import { serveStatic } from 'hono/bun'
import { cors } from 'hono/cors'
import auth from './routes/auth'
import instances from './routes/instances'
import proxy from './routes/proxy'
import integrations from './routes/integrations'

const app = new Hono()

app.use('*', cors({
	origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
	credentials: true,
}))

app.route('/api/auth', auth)
app.route('/api/instances', instances)
app.route('/api/instances', proxy)
app.route('/api/integrations', integrations)

if (process.env.NODE_ENV === 'production') {
	app.use('/*', serveStatic({ root: './dist' }))
	app.get('*', serveStatic({ path: './dist/index.html' }))
}

const port = Number(process.env.PORT) || 3000
console.log(`Server running on http://localhost:${port}`)

export default {
	port,
	fetch: app.fetch,
}
