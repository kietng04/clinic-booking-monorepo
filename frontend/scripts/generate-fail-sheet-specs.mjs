import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const DEFAULT_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1Kno-sxh8vPnm6ejzBKHHLx9uOtJn0MZ-kkDX2TS_Tes/edit?gid=0#gid=0'
const DEFAULT_AGENT_COUNT = 6

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const frontendRoot = path.resolve(scriptDir, '..')
const legacyManifestPath = path.join(frontendRoot, 'tests/e2e/specs/sheet-generated/first-50-cases.json')
const outputDir = path.join(frontendRoot, 'tests/e2e/specs/sheet-fail-generated')
const outputManifest = path.join(outputDir, 'fail-58-cases.json')

const parseArgs = () => {
  const args = process.argv.slice(2)
  const options = {
    sheetUrl: process.env.SHEET_URL || DEFAULT_SHEET_URL,
    agentCount: Number(process.env.SHEET_AGENT_COUNT || DEFAULT_AGENT_COUNT),
  }

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i]
    if (arg === '--sheet-url') {
      options.sheetUrl = args[i + 1]
      i += 1
    } else if (arg === '--agents') {
      options.agentCount = Number(args[i + 1])
      i += 1
    }
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

  return rows
}

const parseExpectedStatus = (value) => {
  const match = String(value || '').match(/HTTP\s+(\d{3})/i)
  return match ? Number(match[1]) : null
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

const readLegacyCases = async () => {
  try {
    const content = await fs.readFile(legacyManifestPath, 'utf8')
    const parsed = JSON.parse(content)
    const map = new Map()

    for (const entry of parsed) {
      if (!entry?.id || !entry?.testStep) {
        continue
      }
      const parsedStep = parseStep(entry.testStep)
      if (!parsedStep) {
        continue
      }
      map.set(entry.id, {
        testStep: entry.testStep,
        expectedStatus: Number(entry.expectedStatus) || null,
        method: parsedStep.method,
        path: parsedStep.path,
        qualifier: parsedStep.qualifier,
      })
    }

    return map
  } catch {
    return new Map()
  }
}

const findCaseId = (cells) => {
  for (const rawCell of cells) {
    const cell = String(rawCell || '').trim()
    if (/^[A-Z]+-\d+$/i.test(cell)) {
      return cell.toUpperCase()
    }
  }
  return ''
}

const firstIndexByPattern = (cells, regex) => {
  for (let i = 0; i < cells.length; i += 1) {
    if (regex.test(cells[i])) {
      return i
    }
  }
  return -1
}

const normalizeCaseName = (caseId, cells) => {
  if (caseId.startsWith('TC-')) {
    return cells[1] || caseId
  }

  if (caseId.startsWith('PF-')) {
    return cells[1] || caseId
  }

  if (caseId.startsWith('D-')) {
    const merged = [cells[1], cells[2], cells[3]].filter(Boolean).join(' ').trim()
    return merged || caseId
  }

  const candidate = cells.find((cell) => {
    const normalized = String(cell || '').trim()
    if (!normalized) return false
    if (/^[A-Z]+-\d+$/i.test(normalized)) return false
    if (/^fail$/i.test(normalized)) return false
    if (/^HTTP\s+\d{3}/i.test(normalized)) return false
    if (/^(GET|POST|PUT|PATCH|DELETE)\s+\//i.test(normalized)) return false
    return true
  })

  return candidate || caseId || 'Unnamed fail case'
}

const normalizeModule = (caseId, failIndex, cells) => {
  if (caseId.startsWith('TC-')) {
    return cells[5] || cells[failIndex + 1] || ''
  }
  if (caseId.startsWith('PF-')) {
    return cells[6] || cells[failIndex + 1] || ''
  }
  if (caseId.startsWith('D-')) {
    return cells[2] || cells[failIndex + 1] || ''
  }
  return cells[failIndex + 1] || ''
}

const extractExpectedStatus = (cells, stepIndex, failIndex) => {
  if (stepIndex >= 0) {
    for (let i = stepIndex + 1; i < cells.length; i += 1) {
      const status = parseExpectedStatus(cells[i])
      if (status !== null) {
        return status
      }
    }
  }

  const cutoff = failIndex >= 0 ? failIndex : cells.length
  for (let i = 0; i < cutoff; i += 1) {
    const status = parseExpectedStatus(cells[i])
    if (status !== null) {
      return status
    }
  }

  for (const cell of cells) {
    const status = parseExpectedStatus(cell)
    if (status !== null) {
      return status
    }
  }

  return null
}

const normalizeCases = async (rows) => {
  const methodRegex = /^(GET|POST|PUT|PATCH|DELETE)\s+\//i
  const legacyCases = await readLegacyCases()

  const failCases = rows
    .map((row, rowIndex) => {
      const cells = row.map((cell) => String(cell || '').trim())
      const id = findCaseId(cells)
      const failIndex = firstIndexByPattern(cells, /^fail$/i)
      if (failIndex === -1 && !id) {
        return null
      }

      const stepIndex = firstIndexByPattern(cells, methodRegex)
      const explicitStep = stepIndex >= 0 ? cells[stepIndex] : ''
      const legacy = id ? legacyCases.get(id) : null
      const testStep = explicitStep || legacy?.testStep || ''
      const parsedStep = parseStep(testStep)
      const expectedStatus = extractExpectedStatus(cells, stepIndex, failIndex) ?? legacy?.expectedStatus ?? null
      const module = normalizeModule(id, failIndex, cells)

      return {
        rowNumber: rowIndex + 1,
        id: id || `ROW-${String(rowIndex + 1).padStart(3, '0')}`,
        name: normalizeCaseName(id, cells),
        module,
        expectedResult: expectedStatus ? `HTTP ${expectedStatus}` : '',
        expectedStatus,
        testStep: testStep || '',
        method: parsedStep?.method || '',
        path: parsedStep?.path || '',
        qualifier: parsedStep?.qualifier || '',
        source: explicitStep ? 'sheet-step' : (legacy ? 'legacy-map' : 'sheet-summary-only'),
        rawCells: cells,
      }
    })
    .filter(Boolean)

  return failCases
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
  return `import { test, expect } from '@playwright/test'\nimport { executeSheetCase } from '../../helpers/sheet-generated-api.js'\n\nconst RUN_SHEET_FAIL_GENERATED = process.env.RUN_SHEET_FAIL_GENERATED === 'true'\nconst SKIP_PAYMENT = process.env.SHEET_SKIP_PAYMENT === 'true'\nconst AGENT_NAME = '${agentName}'\nconst CASES = ${JSON.stringify(cases, null, 2)}\n\ntest.describe(\`Sheet fail verification | \${AGENT_NAME}\`, () => {\n  test.beforeEach(() => {\n    test.skip(!RUN_SHEET_FAIL_GENERATED, 'Set RUN_SHEET_FAIL_GENERATED=true to execute fail verification tests')\n  })\n\n  for (const testCase of CASES) {\n    test(\`\${testCase.id} | verify expected status | \${testCase.name}\`, async ({ request }) => {\n      const moduleName = String(testCase.module || '').toLowerCase()\n      const pathName = String(testCase.path || '').toLowerCase()\n\n      test.skip(SKIP_PAYMENT && (moduleName.includes('payment') || pathName.includes('/payment')), 'Payment cases disabled by SHEET_SKIP_PAYMENT=true')\n      test.skip(!testCase.testStep, 'Sheet row has no HTTP method/path; manual mapping required')\n      test.skip(!testCase.expectedStatus, 'Sheet row has no expected HTTP status')\n\n      const result = await executeSheetCase(request, testCase)\n      expect(result.status, result.debug).toBe(testCase.expectedStatus)\n    })\n  }\n})\n`
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
  const failCases = await normalizeCases(rows)

  if (failCases.length === 0) {
    throw new Error('No fail rows parsed from sheet')
  }

  const chunks = await writeOutputFiles(failCases, options.agentCount)
  const withSteps = failCases.filter((entry) => entry.testStep).length
  const perAgent = chunks.map((chunk, index) => `agent-${String(index + 1).padStart(2, '0')}:${chunk.length}`).join(', ')

  console.log(`Generated ${failCases.length} fail cases (${withSteps} with HTTP steps) into ${chunks.length} agent files (${perAgent})`)
  console.log(`Manifest: ${outputManifest}`)
}

main().catch((error) => {
  console.error(`Generator failed: ${error.message}`)
  process.exit(1)
})
