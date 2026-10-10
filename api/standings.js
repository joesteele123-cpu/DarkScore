import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export default async function handler(req, res) {
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
if (req.method === 'OPTIONS') return res.status(200).end();

try {
if (req.method === 'GET') {
const standings = (await redis.get('darkscore:standings')) || {};
const rounds = (await redis.get('darkscore:rounds')) || [];
return res.status(200).json({ standings, rounds });
}

if (req.method === 'POST') {
const { standings, rounds } = req.body || {};
if (standings) await redis.set('darkscore:standings', standings);
if (rounds) await redis.set('darkscore:rounds', rounds.slice(0, 50));
return res.status(200).json({ success: true });
}

return res.status(405).json({ error: 'Method not allowed' });
} catch (e) {
console.error('Upstash error:', e);
return res.status(500).json({ error: e.message });
}
}
