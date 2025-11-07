import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const DEFAULT_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1Kno-sxh8vPnm6ejzBKHHLx9uOtJn0MZ-kkDX2TS_Tes/edit?gid=0#gid=0'
const DEFAULT_AGENT_COUNT = 6

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const frontendRoot = path.resolve(scriptDir, '..')
const outputDir = path.join(frontendRoot, 'tests/e2e/specs/sheet-generated')
const outputManifest = path.join(outputDir, 'sheet-cases.json')

const parseArgs = () => {
  const args = process.argv.slice(2)
  const envLimit = process.env.SHEET_LIMIT
  const options = {
    sheetUrl: process.env.SHEET_URL || DEFAULT_SHEET_URL,
    limit: envLimit ? Number(envLimit) : null,
    agentCount: Number(process.env.SHEET_AGENT_COUNT || DEFAULT_AGENT_COUNT),
  }

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i]
    if (arg === '--sheet-url') {
      options.sheetUrl = args[i + 1]
      i += 1
    } else if (arg === '--limit') {
      const rawLimit = args[i + 1]
      options.limit = String(rawLimit).toLowerCase() === 'all' ? null : Number(rawLimit)
      i += 1
    } else if (arg === '--all') {
      options.limit = null
    } else if (arg === '--agents') {
      options.agentCount = Number(args[i + 1])
      i += 1
    }
  }

  if (options.limit !== null && (!Number.isFinite(options.limit) || options.limit <= 0)) {
    throw new Error(`Invalid --limit value: ${options.limit}`)
  }

  if (!Number.isInteger(options.agentCount) || options.agentCount <= 0) {
    throw new Error(`Invalid --agents value: ${options.agentCount}`)
  }

  return options
}

const toCsvExportUrl = (sheetUrl) => {
  if (sheetUrl.includes('/export?format=csv')) {
    return sheetUrl
  }

  const idMatch = sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/)
  if (!idMatch) {
    throw new Error(`Cannot extract spreadsheet id from URL: ${sheetUrl}`)
  }

  const gidMatch = sheetUrl.match(/[?#&]gid=(\d+)/)
  const gid = gidMatch ? gidMatch[1] : '0'

  return `https://docs.google.com/spreadsheets/d/${idMatch[1]}/export?format=csv&gid=${gid}`
}

const parseCsv = (text) => {
  const rows = []
  let row = []
  let field = ''
  let inQuotes = false

  const normalized = text.replace(/^\uFEFF/, '')

  for (let i = 0; i < normalized.length; i += 1) {
    const char = normalized[i]

    if (inQuotes) {
      if (char === '"') {
        if (normalized[i + 1] === '"') {
          field += '"'
          i += 1
        } else {
          inQuotes = false
        }
      } else {
        field += char
      }
      continue
    }

    if (char === '"') {
      inQuotes = true
      continue
    }

    if (char === ',') {
      row.push(field)
      field = ''
      continue
    }

    if (char === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
      continue
    }

    if (char === '\r') {
      continue
    }

    field += char
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }

  if (rows.length < 2) {
    return []
  }

  const headers = rows[0].map((header) => header.trim())
  return rows
    .slice(1)
    .filter((dataRow) => dataRow.some((value) => String(value || '').trim() !== ''))
    .map((dataRow) => {
      const objectRow = {}
      headers.forEach((header, index) => {
        objectRow[header] = (dataRow[index] || '').trim()
      })
      return objectRow
    })
}

const parseStep = (step) => {
  const match = String(step || '').match(/^\s*(GET|POST|PUT|PATCH|DELETE)\s+(\S+)(?:\s+(.*))?$/i)
  if (!match) {
    return null
  }
  return {
    method: match[1].toUpperCase(),
    path: match[2],
    qualifier: (match[3] || '').trim(),
  }
}

const parseExpectedStatus = (value) => {
  const match = String(value || '').match(/HTTP\s+(\d{3})/i)
  return match ? Number(match[1]) : null
}

const normalizeCases = (rows, limit) => {
  const normalized = rows
    .map((row) => {
      const step = parseStep(row['Test Step'])
      const expectedStatus = parseExpectedStatus(row['Expected Result'])
      if (!step || expectedStatus === null) {
        return null
      }

      return {
        id: row.ID,
        name: row.Name,
        module: row.Module,
        testStep: row['Test Step'],
        expectedResult: row['Expected Result'],
        expectedStatus,
        method: step.method,
        path: step.path,
        qualifier: step.qualifier,
      }
    })
    .filter(Boolean)

  if (limit === null) {
    return normalized
  }

  if (normalized.length < limit) {
    throw new Error(`Only ${normalized.length} valid cases parsed; cannot take first ${limit}`)
  }

  return normalized.slice(0, limit)
}

const buildAgentChunks = (cases, agentCount) => {
  const effectiveAgentCount = Math.max(1, Math.min(agentCount, cases.length))
  const casesPerAgent = Math.ceil(cases.length / effectiveAgentCount)
  return Array.from({ length: effectiveAgentCount }, (_, index) => {
    const start = index * casesPerAgent
    const end = start + casesPerAgent
    return cases.slice(start, end)
  }).filter((chunk) => chunk.length > 0)
}

const renderSpecFile = (agentName, cases) => {
  return `import { test, expect } from '@playwright/test'\nimport { executeSheetCase } from '../../helpers/sheet-generated-api.js'\n\nconst RUN_GENERATED = process.env.RUN_SHEET_GENERATED === 'true'\nconst AGENT_NAME = '${agentName}'\nconst CASES = ${JSON.stringify(cases, null, 2)}\n\ntest.describe(\`Sheet generated API suite | \${AGENT_NAME}\`, () => {\n  test.beforeEach(() => {\n    test.skip(!RUN_GENERATED, 'Set RUN_SHEET_GENERATED=true to execute generated sheet tests')\n  })\n\n  for (const testCase of CASES) {\n    test(\`\${testCase.id} | status contract | \${testCase.name}\`, async ({ request }) => {\n      const result = await executeSheetCase(request, testCase)\n      expect(result.status, result.debug).toBe(testCase.expectedStatus)\n    })\n\n    test(\`\${testCase.id} | latency budget | \${testCase.name}\`, async ({ request }) => {\n      const result = await executeSheetCase(request, testCase)\n      expect(result.durationMs, result.debug).toBeLessThanOrEqual(15_000)\n      expect(result.status, result.debug).toBeGreaterThanOrEqual(100)\n      expect(result.status, result.debug).toBeLessThan(600)\n    })\n  }\n})\n`
}

const writeOutputFiles = async (cases, agentCount) => {
  await fs.mkdir(outputDir, { recursive: true })

  const existingFiles = await fs.readdir(outputDir)
  const generatedFiles = existingFiles.filter((file) => /^agent-\d{2}\.spec\.js$/.test(file))
  await Promise.all(generatedFiles.map((file) => fs.unlink(path.join(outputDir, file))))

  const chunks = buildAgentChunks(cases, agentCount)

  await Promise.all(chunks.map(async (chunk, index) => {
    const agentIndex = String(index + 1).padStart(2, '0')
    const filePath = path.join(outputDir, `agent-${agentIndex}.spec.js`)
    const content = renderSpecFile(`agent-${agentIndex}`, chunk)
    await fs.writeFile(filePath, content, 'utf8')
  }))

  await fs.writeFile(outputManifest, `${JSON.stringify(cases, null, 2)}\n`, 'utf8')

  return chunks
}

const main = async () => {
  const options = parseArgs()
  const csvUrl = toCsvExportUrl(options.sheetUrl)

  const response = await fetch(csvUrl)
  if (!response.ok) {
    throw new Error(`Cannot fetch sheet CSV: ${response.status} ${response.statusText}`)
  }

  const csvText = await response.text()
  const rows = parseCsv(csvText)
  const selectedCases = normalizeCases(rows, options.limit)
  if (selectedCases.length === 0) {
    throw new Error('No valid test cases parsed from sheet')
  }
  const chunks = await writeOutputFiles(selectedCases, options.agentCount)

  const perAgent = chunks.map((chunk, index) => `agent-${String(index + 1).padStart(2, '0')}:${chunk.length}`).join(', ')
  console.log(`Generated ${selectedCases.length} cases into ${chunks.length} agent files (${perAgent})`)
  console.log(`Manifest: ${outputManifest}`)
}

main().catch((error) => {
  console.error(`Generator failed: ${error.message}`)
  process.exit(1)
})
