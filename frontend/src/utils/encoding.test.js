import { describe, expect, it } from 'vitest'
import { repairMojibakeDeep, repairMojibakeString } from './encoding'

describe('repairMojibakeString', () => {
  it('repairs common UTF-8 decoded as Latin-1 artifacts', () => {
    expect(repairMojibakeString('TÄƒng huyáº¿t Ã¡p Ä‘á»™ 1')).toBe('Tăng huyết áp độ 1')
    expect(repairMojibakeString('ViÃªm há»ng cáº¥p')).toBe('Viêm họng cấp')
  })

  it('keeps clean text unchanged', () => {
    expect(repairMojibakeString('Bệnh nhân')).toBe('Bệnh nhân')
  })
})

describe('repairMojibakeDeep', () => {
  it('repairs nested objects and arrays', () => {
    const value = {
      title: 'Há»“ sÆ¡ bá»‡nh Ã¡n',
      records: [{ diagnosis: 'TÄƒng huyáº¿t Ã¡p Ä‘á»™ 1' }],
    }

    expect(repairMojibakeDeep(value)).toEqual({
      title: 'Hồ sơ bệnh án',
      records: [{ diagnosis: 'Tăng huyết áp độ 1' }],
    })
  })
})

