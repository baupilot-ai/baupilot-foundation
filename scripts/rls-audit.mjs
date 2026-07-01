import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const migrationDir = join(process.cwd(), 'supabase', 'migrations')
const sql = readdirSync(migrationDir).filter(f => f.endsWith('.sql')).sort().map(f => readFileSync(join(migrationDir, f), 'utf8')).join('\n')
const tables = [...sql.matchAll(/create\s+table\s+(?:if\s+not\s+exists\s+)?(?:public\.)?([a-z0-9_]+)/gi)].map(m => m[1])
let failed = false
for (const table of tables) {
  const enable = new RegExp(`alter\\s+table\\s+(?:public\\.)?${table}\\s+enable\\s+row\\s+level\\s+security`, 'i').test(sql)
  const concretePolicy = new RegExp(`create\\s+policy[\\s\\S]{0,300}on\\s+(?:public\\.)?${table}\\b`, 'i').test(sql)
  const dynamicPolicy = new RegExp(`['\"]${table}['\"]`).test(sql) && /CREATE\s+POLICY/i.test(sql)
  const policy = concretePolicy || dynamicPolicy
  if (!enable || !policy) {
    console.error(`${table}: RLS=${enable ? 'yes' : 'NO'} policy=${policy ? 'yes' : 'NO'}`)
    failed = true
  }
}
if (failed) process.exit(1)
console.log(`RLS audit passed for ${tables.length} tables`)
