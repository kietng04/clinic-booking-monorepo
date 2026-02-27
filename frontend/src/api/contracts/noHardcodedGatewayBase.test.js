import fs from 'node:fs'
import path from 'node:path'
import { describe, it, expect } from 'vitest'

const REAL_APIS_DIR = path.resolve(process.cwd(), 'src/api/realApis')

function listJsFiles(dir) {
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith('.js'))
    .map((file) => path.join(dir, file))
}

describe('realApis gateway base contract', () => {
  it('does not hardcode localhost:8080 base URL inside realApis modules', () => {
    const offenders = []

    for (const filePath of listJsFiles(REAL_APIS_DIR)) {
      const content = fs.readFileSync(filePath, 'utf8')
      if (content.includes('http://localhost:8080')) {
        offenders.push(path.relative(process.cwd(), filePath))
      }
    }

    expect(offenders).toEqual([])
  })
})
