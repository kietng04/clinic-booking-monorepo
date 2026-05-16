const PRAVATAR_PATTERN = /(^https?:\/\/)?i\.pravatar\.cc\//i

const portraitPools = {
  professional: [
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=320&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=320&q=80',
    'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=320&q=80',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=320&q=80',
  ],
  female: [
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=320&q=80',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=320&q=80',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=320&q=80',
    'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=320&q=80',
  ],
  male: [
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=320&q=80',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=320&q=80',
    'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=320&q=80',
    'https://images.unsplash.com/photo-1504257432389-52343af06ae3?auto=format&fit=crop&w=320&q=80',
  ],
  child: [
    'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&w=320&q=80',
    'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=320&q=80',
    'https://images.unsplash.com/photo-1503919005314-30d93d07d823?auto=format&fit=crop&w=320&q=80',
    'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=320&q=80',
  ],
}

const femaleHints = [
  'anh', 'chi', 'co', 'thao', 'trang', 'linh', 'mai', 'lan', 'huong', 'ngoc',
  'dung', 'ly', 'hoa', 'phuong', 'ha', 'yen', 'nhi', 'vy', 'quynh', 'trinh',
  'sarah', 'emily', 'mary', 'emma', 'linda',
]

const maleHints = [
  'anh ', 'bac', 'van', 'minh', 'duc', 'huy', 'nam', 'khoa', 'phuc', 'son',
  'tuan', 'long', 'khang', 'thanh', 'james', 'michael', 'john', 'david', 'robert',
]

const childHints = ['be ', 'tre ', 'kid', 'child', 'con ', 'daughter', 'son', 'emma']

function hashSeed(seed) {
  let hash = 0
  const normalized = String(seed || 'healthflow-avatar')

  for (let i = 0; i < normalized.length; i += 1) {
    hash = ((hash << 5) - hash + normalized.charCodeAt(i)) | 0
  }

  return Math.abs(hash)
}

function includesHint(value, hints) {
  return hints.some((hint) => value.includes(hint))
}

function pickPool({ name = '', role = '', relationship = '', gender = '' } = {}) {
  const normalizedName = String(name || '').trim().toLowerCase()
  const normalizedRole = String(role || '').trim().toUpperCase()
  const normalizedRelationship = String(relationship || '').trim().toLowerCase()
  const normalizedGender = String(gender || '').trim().toUpperCase()

  if (
    normalizedRole === 'DOCTOR' ||
    normalizedRole === 'ADMIN' ||
    normalizedName.startsWith('dr.') ||
    normalizedName.startsWith('bs.') ||
    normalizedName.startsWith('bac si')
  ) {
    return portraitPools.professional
  }

  if (includesHint(normalizedName, childHints)) {
    return portraitPools.child
  }

  if (
    normalizedGender === 'FEMALE' ||
    includesHint(normalizedName, femaleHints) ||
    normalizedRelationship === 'wife' ||
    normalizedRelationship === 'daughter' ||
    normalizedRelationship === 'mother' ||
    normalizedRelationship === 'sister'
  ) {
    return portraitPools.female
  }

  if (
    normalizedGender === 'MALE' ||
    includesHint(normalizedName, maleHints) ||
    normalizedRelationship === 'husband' ||
    normalizedRelationship === 'son' ||
    normalizedRelationship === 'father' ||
    normalizedRelationship === 'brother'
  ) {
    return portraitPools.male
  }

  return portraitPools.professional
}

export function isPlaceholderAvatar(src) {
  if (!src) return true
  return PRAVATAR_PATTERN.test(String(src))
}

export function getVietnameseAvatar(seed, options = {}) {
  const pool = pickPool(options)
  return pool[hashSeed(seed) % pool.length]
}

export function resolveAvatarSrc(src, seed, options = {}) {
  if (src && !isPlaceholderAvatar(src)) {
    return src
  }

  return getVietnameseAvatar(seed || options.name || options.role || 'healthflow-avatar', options)
}
