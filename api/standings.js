
import { kv } from '@vercel/kv'
const KEY = 'darkscore:season-v2'
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  try {
    if (req.method === 'GET') {
      const data = await kv.get(KEY)
      return res.status(200).json(data || {})
    }
    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
      if (!body?.standings) return res.status(400).json({error:'Missing standings'})
      await kv.set(KEY, body.standings)
      return res.status(200).json({ok:true, standings: body.standings})
    }
    if (req.method === 'DELETE') {
      await kv.del(KEY)
      return res.status(200).json({ok:true})
    }
    return res.status(405).json({error:'Method not allowed'})
  } catch(e) {
    return res.status(500).json({error:e.message, env: {hasKV: !!process.env.KV_REST_API_URL, hasUpstash: !!process.env.UPSTASH_REDIS_REST_URL}})
  }
}
