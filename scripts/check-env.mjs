import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const bannedFiles = ['.env', '.env.local', '.env.production']
const secretPatterns = [
  /SUPABASE_SERVICE_ROLE_KEY\s*=/i,
  /sb_secret_[A-Za-z0-9_\-.]+/,
]
const allowed = new Set(['.env.example', 'src/integrations/supabase/client.server.ts'])
let failed = false

for (const file of bannedFiles) {
  try { statSync(join(root, file)); console.error(`Forbidden committed secret file: ${file}`); failed = true } catch {}
}

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    if (['node_modules', '.git', 'dist', '.output', '.vinxi', '.tanstack'].includes(entry)) continue
    const full = join(dir, entry)
    const rel = full.slice(root.length + 1)
    const st = statSync(full)
    if (st.isDirectory()) walk(full)
    else if (st.isFile() && /\.(ts|tsx|js|mjs|json|env|ya?ml)$/.test(entry) && !allowed.has(rel)) {
      const text = readFileSync(full, 'utf8')
      for (const pattern of secretPatterns) {
        if (pattern.test(text)) {
          console.error(`Potential secret/server key reference in ${rel}: ${pattern}`)
          failed = true
        }
      }
    }
  }
}
walk(root)
if (failed) process.exit(1)
console.log('Secret scan passed')
