import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { spawn } from 'node:child_process'
const root = process.cwd()
const temporary = await mkdtemp(path.join(tmpdir(), 'maengel-office-test-'))
const server = spawn(process.execPath, [path.join(root, 'node_modules/tsx/dist/cli.mjs'), path.join(root, 'backend/server.ts')], { cwd: temporary, env: { ...process.env, PORT: '3107' }, stdio: 'pipe' })
const base = 'http://localhost:3107/api/issues'
const a = 'st-gallen-durrenmattstrasse-9', b = 'zurich-binzring-15-17'
try {
  await new Promise((resolve, reject) => { const timeout = setTimeout(() => reject(Error('Server timeout')), 15000); server.stdout.on('data', () => { clearTimeout(timeout); resolve() }); server.on('error', reject) })
  assert.equal((await fetch(base)).status, 400)
  assert.equal((await fetch(base+'?officeId=invalid')).status, 400)
  const input = { officeId:a, title:'Test', description:'Test description', location:'Raum 2', category:'Infrastruktur', priority:'Normal', reporter:'Test' }
  const missing = { ...input }; delete missing.officeId
  assert.equal((await fetch(base, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(missing)})).status,400)
  const createdResponse = await fetch(base, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(input)})
  assert.equal(createdResponse.status,201)
  const created = await createdResponse.json()
  assert.equal(created.officeId,a)
  assert.equal((await (await fetch(base+'?officeId='+a)).json()).length,1)
  assert.equal((await (await fetch(base+'?officeId='+b)).json()).length,0)
  const change = officeId => fetch(base+'/'+created.id+'/status',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({officeId,status:'Erledigt'})})
  assert.equal((await change(b)).status,404)
  assert.equal((await change(a)).status,200)
  assert.equal((await (await fetch(base+'?officeId='+a)).json())[0].status,'Erledigt')
  console.log('PASS: required office, invalid office, creation, isolation, scoped status updates, persisted status')
} finally {
  server.kill()
  await new Promise(resolve => server.once('exit', resolve))
  if (path.dirname(temporary) !== tmpdir() || !path.basename(temporary).startsWith('maengel-office-test-')) throw Error('Unexpected temporary path')
  await rm(temporary,{recursive:true,force:true})
}
