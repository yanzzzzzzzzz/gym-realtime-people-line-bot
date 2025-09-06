import { describe, it, expect } from 'vitest'
import { GymInfo, Source } from '../src/types.js'

describe('Types', () => {
  describe('GymInfo', () => {
    it('should accept valid gym info object', () => {
      const gymInfo: GymInfo = {
        name: 'Test Gym',
        gymCurrent: 25,
        gymMax: 100
      }

      expect(gymInfo.name).toBe('Test Gym')
      expect(gymInfo.gymCurrent).toBe(25)
      expect(gymInfo.gymMax).toBe(100)
    })

    it('should accept zero values', () => {
      const gymInfo: GymInfo = {
        name: 'Empty Gym',
        gymCurrent: 0,
        gymMax: 0
      }

      expect(gymInfo.gymCurrent).toBe(0)
      expect(gymInfo.gymMax).toBe(0)
    })
  })

  describe('Source', () => {
    it('should accept valid source object', () => {
      const source: Source = {
        name: 'Test Source',
        url: 'https://test.com/api',
        parse: (data: any) => [{
          name: 'Test Gym',
          gymCurrent: 10,
          gymMax: 50
        }]
      }

      expect(source.name).toBe('Test Source')
      expect(source.url).toBe('https://test.com/api')
      expect(typeof source.parse).toBe('function')
    })

    it('should work with parse function returning empty array', () => {
      const source: Source = {
        name: 'Empty Source',
        url: 'https://empty.com/api',
        parse: () => []
      }

      const result = source.parse({})
      expect(result).toEqual([])
    })
  })
})
