const CLOUD_METADATA = [
	'169.254.169.254',
	'metadata.google.internal',
	'metadata.aws.internal',
	'169.254.170.2',
]

export function isUrlAllowed(urlString: string): { allowed: boolean; reason?: string } {
	let url: URL
	try {
		url = new URL(urlString)
	} catch {
		return { allowed: false, reason: 'Invalid URL format' }
	}

	if (url.protocol !== 'http:' && url.protocol !== 'https:') {
		return { allowed: false, reason: 'Only HTTP/HTTPS protocols allowed' }
	}

	const hostname = url.hostname.toLowerCase()

	if (CLOUD_METADATA.includes(hostname) || hostname.startsWith('169.254.')) {
		return { allowed: false, reason: 'Cloud metadata endpoints not allowed' }
	}

	return { allowed: true }
}

export function validateUrl(urlString: string): void {
	const result = isUrlAllowed(urlString)
	if (!result.allowed) {
		throw new Error(result.reason)
	}
}
