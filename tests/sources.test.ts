import { describe, it, expect, vi, beforeEach } from 'vitest'
import { sources, fetchGymInfo } from '../src/sources.js'
import { GymInfo } from '../src/types.js'

// Mock fetch globally
global.fetch = vi.fn()

describe('sources', () => {
  it('should have two sources configured', () => {
    expect(sources).toHaveLength(2)
    expect(sources[0].name).toBe('台北運動中心')
    expect(sources[1].name).toBe('南港運動中心')
  })

  it('should have correct URLs', () => {
    expect(sources[0].url).toContain('booking-tpsc.sporetrofit.com')
    expect(sources[1].url).toContain('ngsc.cyc.org.tw')
  })
})

describe('fetchGymInfo', () => {
  const mockSource = {
    name: 'Test Gym',
    url: 'https://test.com/api',
    parse: (data: any) => [{
      name: 'Test Gym Center',
      gymCurrent: 10,
      gymMax: 100
    }]
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return parsed data on successful fetch', async () => {
    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue({ test: 'data' })
    }

    ;(global.fetch as any).mockResolvedValue(mockResponse)

    const result = await fetchGymInfo(mockSource)

    expect(global.fetch).toHaveBeenCalledWith(mockSource.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}'
    })
    expect(result).toEqual([{
      name: 'Test Gym Center',
      gymCurrent: 10,
      gymMax: 100
    }])
  })

  it('should return empty array on fetch failure', async () => {
    const mockResponse = {
      ok: false
    }

    ;(global.fetch as any).mockResolvedValue(mockResponse)

    const result = await fetchGymInfo(mockSource)

    expect(result).toEqual([])
  })

  it('should return empty array on network error', async () => {
    ;(global.fetch as any).mockRejectedValue(new Error('Network error'))

    const result = await fetchGymInfo(mockSource)

    expect(result).toEqual([])
  })
})

describe('Taipei source parsing', () => {
  it('should parse Taipei gym data correctly', () => {
    const mockData = {
      locationPeopleNums: [
        {
          lidName: '松山',
          gymPeopleNum: '25',
          gymMaxPeopleNum: '200'
        },
        {
          lidName: '信義',
          gymPeopleNum: null,
          gymMaxPeopleNum: '150'
        }
      ]
    }

    const result = sources[0].parse(mockData)

    expect(result).toEqual([
      {
        name: '松山運動中心',
        gymCurrent: 25,
        gymMax: 200
      },
      {
        name: '信義運動中心',
        gymCurrent: 0,
        gymMax: 150
      }
    ])
  })

  it('should handle empty locationPeopleNums', () => {
    const mockData = { locationPeopleNums: null }

    const result = sources[0].parse(mockData)

    expect(result).toEqual([])
  })
})

describe('Nangang source parsing', () => {
  it('should parse Nangang gym data correctly', () => {
    const mockData = {
      gym: [30, 120]
    }

    const result = sources[1].parse(mockData)

    expect(result).toEqual([
      {
        name: '南港運動中心',
        gymCurrent: 30,
        gymMax: 120
      }
    ])
  })

  it('should handle missing gym data', () => {
    const mockData = { gym: null }

    const result = sources[1].parse(mockData)

    expect(result).toEqual([
      {
        name: '南港運動中心',
        gymCurrent: 0,
        gymMax: 0
      }
    ])
  })
})
