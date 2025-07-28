import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useCalculator } from '../useCalculator'
import * as api from '../../services/api'

// Mock the API module
vi.mock('../../services/api', () => ({
  calculatorApi: {
    getPortfolios: vi.fn().mockResolvedValue([]),
    calculateMonteCarlo: vi.fn(),
    generatePdf: vi.fn(),
  },
  default: {
    create: vi.fn(() => ({
      get: vi.fn(),
      post: vi.fn(),
    })),
  },
}))

describe('useCalculator', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('initializes with default values', async () => {
    const { result } = renderHook(() => useCalculator())
    
    // Wait for initial portfolio load
    await waitFor(() => {
      expect(result.current.inputs).toEqual({
        startingBalance: 1000000,
        withdrawalRate: 4,
        withdrawalAmount: 40000,
        withdrawalMethod: 'percentage',
        years: 30,
        inflationRate: 3,
        managementFee: 1,
        adjustForInflation: true,
        portfolioId: 'balanced',
      })
      
      expect(result.current.results).toBeNull()
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })
  })

  it('updates inputs correctly', () => {
    const { result } = renderHook(() => useCalculator())
    
    act(() => {
      result.current.updateInputs({ startingBalance: 2000000 })
    })
    
    expect(result.current.inputs.startingBalance).toBe(2000000)
    expect(result.current.inputs.withdrawalRate).toBe(4) // Others unchanged
  })

  it('updates withdrawal amount when switching to percentage method', () => {
    const { result } = renderHook(() => useCalculator())
    
    // Start with fixed amount
    act(() => {
      result.current.updateInputs({ 
        withdrawalMethod: 'fixed',
        withdrawalAmount: 50000 
      })
    })
    
    // Switch to percentage
    act(() => {
      result.current.updateInputs({ 
        withdrawalMethod: 'percentage',
        withdrawalRate: 5 
      })
    })
    
    expect(result.current.inputs.withdrawalAmount).toBe(50000) // 5% of 1M
  })

  it('calls API and updates results on calculate', async () => {
    const mockResults = {
      portfolios: {
        conservative: { success_rate: 0.7 },
        balanced: { success_rate: 0.8 },
        aggressive: { success_rate: 0.85 },
      },
    }
    
    vi.mocked(api.calculatorApi.calculateMonteCarlo).mockResolvedValue(mockResults)
    
    const { result } = renderHook(() => useCalculator())
    
    act(() => {
      result.current.calculate()
    })
    
    expect(result.current.loading).toBe(true)
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
      expect(result.current.results).toEqual(mockResults)
      expect(result.current.error).toBeNull()
    })
    
    expect(api.calculatorApi.calculateMonteCarlo).toHaveBeenCalledWith({
      startingBalance: 1000000,
      withdrawalRate: 4,
      withdrawalAmount: 40000,
      withdrawalMethod: 'percentage',
      years: 30,
      inflationRate: 3,
      managementFee: 1,
      adjustForInflation: true,
      portfolioId: 'balanced',
    })
  })

  it('handles API errors gracefully', async () => {
    const errorMessage = 'API Error'
    vi.mocked(api.calculatorApi.calculateMonteCarlo).mockRejectedValue(new Error(errorMessage))
    
    const { result } = renderHook(() => useCalculator())
    
    act(() => {
      result.current.calculate()
    })
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe(errorMessage)
      expect(result.current.results).toBeNull()
    })
  })

  it('generates PDF when results exist', async () => {
    const mockResults = { portfolios: {} }
    const mockBlob = new Blob(['pdf content'], { type: 'application/pdf' })
    
    vi.mocked(api.calculatorApi.generatePdf).mockResolvedValue(mockBlob)
    
    // Mock URL.createObjectURL and document.createElement
    const mockUrl = 'blob:mock-url'
    global.URL.createObjectURL = vi.fn(() => mockUrl)
    global.URL.revokeObjectURL = vi.fn()
    
    const mockAnchor = {
      href: '',
      download: '',
      click: vi.fn(),
    }
    document.createElement = vi.fn().mockReturnValue(mockAnchor)
    document.body.appendChild = vi.fn()
    document.body.removeChild = vi.fn()
    
    const { result } = renderHook(() => useCalculator())
    
    // Set results first
    act(() => {
      result.current.updateInputs({})
      result.current.results = mockResults
    })
    
    // Generate PDF
    await act(async () => {
      await result.current.generatePdf()
    })
    
    expect(api.calculatorApi.generatePdf).toHaveBeenCalledWith(result.current.inputs, mockResults)
    expect(mockAnchor.href).toBe(mockUrl)
    expect(mockAnchor.download).toBe('endowment-analysis.pdf')
    expect(mockAnchor.click).toHaveBeenCalled()
    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith(mockUrl)
  })

  it('clears results', () => {
    const { result } = renderHook(() => useCalculator())
    
    // Set some results
    act(() => {
      result.current.results = { portfolios: {} }
      result.current.error = 'Some error'
    })
    
    // Clear results
    act(() => {
      result.current.clearResults()
    })
    
    expect(result.current.results).toBeNull()
    expect(result.current.error).toBeNull()
  })
})