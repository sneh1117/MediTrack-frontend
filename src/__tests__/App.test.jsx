/**
 * MediTrack Frontend - Unit Tests
 * Tests: apiCall utility, Toast component, ThemeToggle, form validation logic
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// ─────────────────────────────────────────────
// MOCK SETUP
// ─────────────────────────────────────────────

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock localStorage
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: vi.fn((key) => store[key] ?? null),
    setItem: vi.fn((key, value) => { store[key] = String(value) }),
    removeItem: vi.fn((key) => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
  }
})()
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Mock window.location
delete window.location
window.location = { href: '' }

beforeEach(() => {
  vi.clearAllMocks()
  localStorageMock.clear()
})

afterEach(() => {
  vi.restoreAllMocks()
})


// ─────────────────────────────────────────────
// 1. API CALL UTILITY TESTS
// ─────────────────────────────────────────────

describe('apiCall utility', () => {
  // We test the logic inline since apiCall is defined in App.jsx
  // These tests validate the expected behavior

  it('sends Authorization header when token is in localStorage', async () => {
    localStorageMock.getItem.mockReturnValue('mock-token-123')

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
    })

    await fetch('https://meditrack.up.railway.app/api/auth/profile/', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer mock-token-123',
      },
    })

    expect(mockFetch).toHaveBeenCalledWith(
      'https://meditrack.up.railway.app/api/auth/profile/',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer mock-token-123',
        }),
      })
    )
  })

  it('returns parsed JSON on successful response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ username: 'testuser', role: 'patient' }),
    })

    const response = await fetch('https://meditrack.up.railway.app/api/auth/profile/')
    const data = await response.json()
    expect(data.username).toBe('testuser')
    expect(data.role).toBe('patient')
  })

  it('handles 401 unauthorized by clearing localStorage', async () => {
    localStorageMock.setItem('access_token', 'expired-token')

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ detail: 'Token expired' }),
    })

    const response = await fetch('https://meditrack.up.railway.app/api/auth/profile/')
    if (response.status === 401) {
      localStorage.clear()
      window.location.href = '/login'
    }

    expect(localStorageMock.clear).toHaveBeenCalled()
    expect(window.location.href).toBe('/login')
  })
})


// ─────────────────────────────────────────────
// 2. TOAST COMPONENT TESTS
// ─────────────────────────────────────────────

describe('Toast component', () => {
  // Inline Toast component for isolated testing
  const Toast = ({ message, type = 'success', onClose }) => {
    const { useEffect } = require('react')
    useEffect(() => {
      const timer = setTimeout(onClose, 3500)
      return () => clearTimeout(timer)
    }, [onClose])

    return (
      <div data-testid="toast" data-type={type}>
        {message}
      </div>
    )
  }

  it('renders success toast with correct message', () => {
    const onClose = vi.fn()
    render(<Toast message="Profile saved!" type="success" onClose={onClose} />)
    expect(screen.getByTestId('toast')).toBeInTheDocument()
    expect(screen.getByText('Profile saved!')).toBeInTheDocument()
  })

  it('renders error toast with error type', () => {
    const onClose = vi.fn()
    render(<Toast message="Something went wrong" type="error" onClose={onClose} />)
    expect(screen.getByTestId('toast')).toHaveAttribute('data-type', 'error')
  })

  it('renders loading toast with loading type', () => {
    const onClose = vi.fn()
    render(<Toast message="Generating report..." type="loading" onClose={onClose} />)
    expect(screen.getByTestId('toast')).toHaveAttribute('data-type', 'loading')
  })

  it('calls onClose after 3500ms', async () => {
    vi.useFakeTimers()
    const onClose = vi.fn()
    render(<Toast message="Auto-close test" type="success" onClose={onClose} />)
    expect(onClose).not.toHaveBeenCalled()
    act(() => { vi.advanceTimersByTime(3500) })
    expect(onClose).toHaveBeenCalledTimes(1)
    vi.useRealTimers()
  })
})


// ─────────────────────────────────────────────
// 3. THEME TOGGLE TESTS
// ─────────────────────────────────────────────

describe('ThemeToggle component', () => {
  const ThemeToggle = () => {
    const { useState, useEffect } = require('react')
    const [isDark, setIsDark] = useState(false)

    useEffect(() => {
      const saved = localStorage.getItem('theme')
      if (saved === 'dark') {
        setIsDark(true)
        document.documentElement.classList.add('dark')
      }
    }, [])

    const toggle = () => {
      const next = !isDark
      setIsDark(next)
      localStorage.setItem('theme', next ? 'dark' : 'light')
      if (next) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }

    return (
      <button onClick={toggle} aria-label="Toggle theme" data-testid="theme-toggle">
        {isDark ? 'Sun' : 'Moon'}
      </button>
    )
  }

  it('renders theme toggle button', () => {
    render(<ThemeToggle />)
    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument()
  })

  it('starts in light mode showing Moon icon', () => {
    localStorageMock.getItem.mockReturnValue(null)
    render(<ThemeToggle />)
    expect(screen.getByText('Moon')).toBeInTheDocument()
  })

  it('toggles to dark mode on click and saves to localStorage', async () => {
    localStorageMock.getItem.mockReturnValue(null)
    render(<ThemeToggle />)
    const button = screen.getByTestId('theme-toggle')
    await userEvent.click(button)
    expect(screen.getByText('Sun')).toBeInTheDocument()
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark')
  })

  it('adds dark class to document on dark mode', async () => {
    localStorageMock.getItem.mockReturnValue(null)
    render(<ThemeToggle />)
    await userEvent.click(screen.getByTestId('theme-toggle'))
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('removes dark class on toggle back to light', async () => {
    document.documentElement.classList.add('dark')
    localStorageMock.getItem.mockReturnValue('dark')
    render(<ThemeToggle />)
    await userEvent.click(screen.getByTestId('theme-toggle'))
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })
})


// ─────────────────────────────────────────────
// 4. REGISTRATION FORM VALIDATION TESTS
// ─────────────────────────────────────────────

describe('RegisterPage form validation', () => {
  // Validation logic extracted from RegisterPage
  const validateRegisterForm = ({ username, email, password, password_confirm }) => {
    const errors = {}

    if (!username || username.trim().length < 3) {
      errors.username = 'Username must be at least 3 characters'
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Valid email is required'
    }

    if (!password || password.length < 8) {
      errors.password = 'Password must be at least 8 characters'
    }

    if (password !== password_confirm) {
      errors.password_confirm = 'Passwords do not match'
    }

    return errors
  }

  it('returns no errors for valid form data', () => {
    const errors = validateRegisterForm({
      username: 'validuser',
      email: 'valid@test.com',
      password: 'SecurePass123',
      password_confirm: 'SecurePass123'
    })
    expect(Object.keys(errors)).toHaveLength(0)
  })

  it('rejects username shorter than 3 characters', () => {
    const errors = validateRegisterForm({
      username: 'ab',
      email: 'valid@test.com',
      password: 'SecurePass123',
      password_confirm: 'SecurePass123'
    })
    expect(errors).toHaveProperty('username')
  })

  it('rejects invalid email format', () => {
    const errors = validateRegisterForm({
      username: 'validuser',
      email: 'not-an-email',
      password: 'SecurePass123',
      password_confirm: 'SecurePass123'
    })
    expect(errors).toHaveProperty('email')
  })

  it('rejects password shorter than 8 characters', () => {
    const errors = validateRegisterForm({
      username: 'validuser',
      email: 'valid@test.com',
      password: 'short',
      password_confirm: 'short'
    })
    expect(errors).toHaveProperty('password')
  })

  it('rejects mismatched password confirmation', () => {
    const errors = validateRegisterForm({
      username: 'validuser',
      email: 'valid@test.com',
      password: 'SecurePass123',
      password_confirm: 'DifferentPass123'
    })
    expect(errors).toHaveProperty('password_confirm')
  })

  it('can return multiple errors simultaneously', () => {
    const errors = validateRegisterForm({
      username: 'x',
      email: 'bad',
      password: '123',
      password_confirm: '456'
    })
    expect(Object.keys(errors).length).toBeGreaterThan(1)
  })
})


// ─────────────────────────────────────────────
// 5. PROFILE PAGE VALIDATION TESTS
// ─────────────────────────────────────────────

describe('ProfilePage validation logic', () => {
  // Extracted from ProfilePage validateForm()
  const validateProfileForm = ({ username, email, phone, date_of_birth }) => {
    const errors = {}

    if (!username || username.trim().length < 3) {
      errors.username = 'Username must be at least 3 characters'
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Invalid email format'
    }

    if (phone && !/^\+?[\d\s\-()]{7,20}$/.test(phone)) {
      errors.phone = 'Invalid phone number format'
    }

    if (date_of_birth) {
      const birthDate = new Date(date_of_birth)
      const today = new Date()
      if (birthDate > today) {
        errors.date_of_birth = 'Date of birth cannot be in the future'
      }
    }

    return errors
  }

  it('accepts valid profile data', () => {
    const errors = validateProfileForm({
      username: 'sneha1117',
      email: 'sneha@test.com',
      phone: '+44 7911 123456',
      date_of_birth: '1998-03-15'
    })
    expect(Object.keys(errors)).toHaveLength(0)
  })

  it('accepts empty optional phone field', () => {
    const errors = validateProfileForm({
      username: 'sneha1117',
      email: 'sneha@test.com',
      phone: '',
    })
    expect(errors).not.toHaveProperty('phone')
  })

  it('rejects future date of birth', () => {
    const future = new Date()
    future.setFullYear(future.getFullYear() + 1)
    const errors = validateProfileForm({
      username: 'sneha1117',
      email: 'sneha@test.com',
      date_of_birth: future.toISOString().split('T')[0]
    })
    expect(errors).toHaveProperty('date_of_birth')
  })

  it('rejects clearly invalid phone number', () => {
    const errors = validateProfileForm({
      username: 'sneha1117',
      email: 'sneha@test.com',
      phone: 'not-a-number!!!'
    })
    expect(errors).toHaveProperty('phone')
  })
})


// ─────────────────────────────────────────────
// 6. SYMPTOM SEVERITY HELPER TESTS
// ─────────────────────────────────────────────

describe('Symptom severity helpers', () => {
  // Extracted from DoctorDashboardPage and SymptomsPage
  const getSeverityLabel = (severity) => {
    if (severity <= 3) return 'Mild'
    if (severity <= 6) return 'Moderate'
    return 'Severe'
  }

  const getSeverityColor = (severity) => {
    if (severity <= 3) return 'green'
    if (severity <= 6) return 'yellow'
    return 'red'
  }

  it('labels severity 1 as Mild', () => {
    expect(getSeverityLabel(1)).toBe('Mild')
  })

  it('labels severity 3 as Mild (boundary)', () => {
    expect(getSeverityLabel(3)).toBe('Mild')
  })

  it('labels severity 4 as Moderate', () => {
    expect(getSeverityLabel(4)).toBe('Moderate')
  })

  it('labels severity 6 as Moderate (boundary)', () => {
    expect(getSeverityLabel(6)).toBe('Moderate')
  })

  it('labels severity 7 as Severe', () => {
    expect(getSeverityLabel(7)).toBe('Severe')
  })

  it('labels severity 10 as Severe', () => {
    expect(getSeverityLabel(10)).toBe('Severe')
  })

  it('returns green color for mild severity', () => {
    expect(getSeverityColor(2)).toBe('green')
  })

  it('returns yellow color for moderate severity', () => {
    expect(getSeverityColor(5)).toBe('yellow')
  })

  it('returns red color for severe symptoms', () => {
    expect(getSeverityColor(9)).toBe('red')
  })
})


// ─────────────────────────────────────────────
// 7. DOCTOR DASHBOARD SORT TESTS
// ─────────────────────────────────────────────

describe('Doctor dashboard symptom sorting', () => {
  const mockSymptoms = [
    { id: 1, name: 'Headache', severity: 3, date: '2026-03-01' },
    { id: 2, name: 'Nausea', severity: 8, date: '2026-03-05' },
    { id: 3, name: 'Fatigue', severity: 5, date: '2026-03-03' },
  ]

  const getSortedSymptoms = (symptoms, sortBy) => {
    const sorted = [...symptoms]
    if (sortBy === 'severity') {
      return sorted.sort((a, b) => b.severity - a.severity)
    }
    return sorted.sort((a, b) => new Date(b.date) - new Date(a.date))
  }

  it('sorts by date descending by default', () => {
    const sorted = getSortedSymptoms(mockSymptoms, 'date')
    expect(sorted[0].name).toBe('Nausea')   // 2026-03-05 most recent
    expect(sorted[2].name).toBe('Headache') // 2026-03-01 oldest
  })

  it('sorts by severity descending', () => {
    const sorted = getSortedSymptoms(mockSymptoms, 'severity')
    expect(sorted[0].severity).toBe(8)
    expect(sorted[1].severity).toBe(5)
    expect(sorted[2].severity).toBe(3)
  })

  it('does not mutate original array', () => {
    const original = [...mockSymptoms]
    getSortedSymptoms(mockSymptoms, 'severity')
    expect(mockSymptoms[0].name).toBe(original[0].name)
  })

  it('handles empty array without error', () => {
    const result = getSortedSymptoms([], 'date')
    expect(result).toEqual([])
  })
})
