import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Input } from '@/shared/components/ui/input'

describe('Input komponens', () => {
  it('rendereli az input mezőt', () => {
    render(<Input placeholder="Teszt input" />)
    
    const input = screen.getByPlaceholderText('Teszt input')
    expect(input).toBeInTheDocument()
  })

  it('különböző típusokkal működik', () => {
    const { rerender } = render(<Input type="email" data-testid="input" />)
    
    let input = screen.getByTestId('input')
    expect(input).toHaveAttribute('type', 'email')
    
    rerender(<Input type="password" data-testid="input" />)
    input = screen.getByTestId('input')
    expect(input).toHaveAttribute('type', 'password')
  })

  it('kezeli az értékváltozást', () => {
    const handleChange = vi.fn()
    render(<Input onChange={handleChange} data-testid="input" />)
    
    const input = screen.getByTestId('input')
    fireEvent.change(input, { target: { value: 'teszt érték' } })
    
    expect(handleChange).toHaveBeenCalledTimes(1)
  })

  it('kezeli a disabled állapotot', () => {
    render(<Input disabled data-testid="input" />)
    
    const input = screen.getByTestId('input')
    expect(input).toBeDisabled()
  })

  it('támogatja a required attribútumot', () => {
    render(<Input required data-testid="input" />)
    
    const input = screen.getByTestId('input')
    expect(input).toBeRequired()
  })
})
