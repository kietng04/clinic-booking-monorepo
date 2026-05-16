const MOJIBAKE_HINT = /(Ã|Â|Ä|Å|Æ|áº|á»|â€|â€“|â€”|â€¦|ðŸ|�)/
const VIETNAMESE_CHAR = /[À-ỹĐđ]/
const CP1252_EXTRA_BYTE_BY_CHAR = {
  '€': 0x80,
  '‚': 0x82,
  'ƒ': 0x83,
  '„': 0x84,
  '…': 0x85,
  '†': 0x86,
  '‡': 0x87,
  'ˆ': 0x88,
  '‰': 0x89,
  'Š': 0x8a,
  '‹': 0x8b,
  'Œ': 0x8c,
  'Ž': 0x8e,
  '‘': 0x91,
  '’': 0x92,
  '“': 0x93,
  '”': 0x94,
  '•': 0x95,
  '–': 0x96,
  '—': 0x97,
  '˜': 0x98,
  '™': 0x99,
  'š': 0x9a,
  '›': 0x9b,
  'œ': 0x9c,
  'ž': 0x9e,
  'Ÿ': 0x9f,
}

const countMatches = (value, pattern) => {
  const matches = value.match(new RegExp(pattern.source, 'g'))
  return matches ? matches.length : 0
}

const scoreText = (value) => {
  const mojibakePenalty = countMatches(value, MOJIBAKE_HINT) * 3
  const vietnameseBonus = countMatches(value, VIETNAMESE_CHAR)
  return vietnameseBonus - mojibakePenalty
}

const decodeUtf8FromLatin1 = (value) => {
  const bytes = Uint8Array.from(value, (char) => {
    const code = char.charCodeAt(0)
    if (code <= 0xff) return code

    const cp1252Byte = CP1252_EXTRA_BYTE_BY_CHAR[char]
    if (cp1252Byte !== undefined) return cp1252Byte

    throw new Error('Unsupported non-Latin1 character')
  })
  return new TextDecoder('utf-8', { fatal: false }).decode(bytes)
}

export const repairMojibakeString = (value) => {
  if (typeof value !== 'string' || !value) return value
  if (!MOJIBAKE_HINT.test(value)) return value

  let current = value

  for (let i = 0; i < 6; i += 1) {
    let decoded = current
    try {
      decoded = decodeUtf8FromLatin1(current)
    } catch {
      return current
    }

    if (decoded === current) {
      return current
    }

    if (scoreText(decoded) <= scoreText(current)) {
      return current
    }

    current = decoded
    if (!MOJIBAKE_HINT.test(current)) {
      return current
    }
  }

  return current
}

export const repairMojibakeDeep = (value) => {
  if (typeof value === 'string') return repairMojibakeString(value)

  if (Array.isArray(value)) {
    return value.map((item) => repairMojibakeDeep(item))
  }

  if (!value || typeof value !== 'object') return value
  if (value instanceof Date) return value
  if (typeof Blob !== 'undefined' && value instanceof Blob) return value
  if (typeof File !== 'undefined' && value instanceof File) return value

  return Object.fromEntries(
    Object.entries(value).map(([key, nestedValue]) => [key, repairMojibakeDeep(nestedValue)])
  )
}
