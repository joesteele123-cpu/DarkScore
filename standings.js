
import { kv } from '@vercel/kv'

const KEY = 'fairway-points:season-standings'

export default async function handler(req, res) {
  // Allow CORS for debugging
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  try {
    if (req.method === 'GET') {
      const data = await kv.get(KEY)
      console.log('GET standings:', data)
      return res.status(200).json(data || {})
    }
    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
      if (!body || typeof body.standings !== 'object') {
        return res.status(400).json({ error: 'Missing standings', received: body })
      }
      await kv.set(KEY, body.standings)
      console.log('SAVED standings:', body.standings)
      return res.status(200).json({ ok: true, standings: body.standings, savedAt: new Date().toISOString() })
    }
    if (req.method === 'DELETE') {
      await kv.del(KEY)
      return res.status(200).json({ ok: true, cleared: true })
    }
    return res.status(405).json({ error: 'Method not allowed' })
  } catch (e) {
    console.error('KV Error:', e)
    // This is the error you'll see if KV env vars are missing
    return res.status(500).json({ 
      error: e.message, 
      hint: 'Did you create Redis storage and connect it? Vercel Dashboard > Storage > Create > Redis > Connect to project > Redeploy',
      envCheck: {
        has_KV_URL: !!process.env.KV_URL,
        has_KV_REST_API_URL: !!process.env.KV_REST_API_URL,
        has_UPSTASH_REDIS_REST_URL: !!process.env.UPSTASH_REDIS_REST_URL,
      }
    })
  }
}
