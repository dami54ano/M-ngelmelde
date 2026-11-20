import { cpSync, existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const source = join(process.cwd(), 'node_modules', '@swisscom', 'sdx', 'dist', 'js', 'webcomponents', 'webcomponents', 'assets')
const destination = join(process.cwd(), 'public', 'assets')
if (!existsSync(source)) {
  console.error('SDX assets not found. Check the installed @swisscom/sdx package structure.')
  process.exitCode = 1
} else {
  mkdirSync(destination, { recursive: true })
  cpSync(source, destination, { recursive: true, force: true })
  console.log('SDX assets copied to public/assets')
}
