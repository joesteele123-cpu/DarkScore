import { Redis } from '@upstash/redis';
const KEY = 'darkscore:season-v3-fancy';
function cors(res){res.setHeader('Access-Control-Allow-Origin','*');res.setHeader('Access-Control-Allow-Methods','GET, POST, DELETE, OPTIONS');res.setHeader('Access-Control-Allow-Headers','Content-Type');}
const redis=Redis.fromEnv();
export default async function handler(req,res){cors(res);if(req.method==='OPTIONS')return res.status(200).end();try{if(req.method==='GET'){const d=await redis.get(KEY);return res.status(200).json(d??{players:[],scores:{}});}if(req.method==='POST'){const b=typeof req.body==='string'?JSON.parse(req.body):req.body;if(!b)return res.status(400).json({error:'Missing body'});await redis.set(KEY,b);return res.status(200).json({ok:true});}if(req.method==='DELETE'){await redis.del(KEY);return res.status(200).json({ok:true,deleted:true});}return res.status(405).json({error:'Method not allowed'});}catch(e){return res.status(500).json({error:e.message||'Internal error'});}}
