import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Input } from '@/shared/components/ui/input'

describe('Input komponens', () => {
  it('rendereli az input mezőt', () => {
    render(<Input placeholder="Teszt input" />)
    
    const input = screen.getByPlaceholderText('Teszt input')
    expect(input).toBeInTheDocument()
  })

  it('alkalmazza a reszponzív magasságot', () => {
    render(<Input data-testid="input" />)
    
    const input = screen.getByTestId('input')
    expect(input).toHaveClass('h-10', 'sm:h-12')
    expect(input).toHaveClass('touch-manipulation')
  })

  it('különböző típusokkal működik', () => {
    const { rerender } = render(<Input type="email" data-testid="input" />)
    
    let input = screen.getByTestId('input')
    expect(input).toHaveAttribute('type', 'email')
    
    rerender(<Input type="password" data-testid="input" />)
    input = screen.getByTestId('input')
    expect(input).toHaveAttribute('type', 'password')
    
    rerender(<Input type="number" data-testid="input" />)
    input = screen.getByTestId('input')
    expect(input).toHaveAttribute('type', 'number')
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
    expect(input).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50')
  })

  it('alkalmazza a focus stílusokat', () => {
    render(<Input data-testid="input" />)
    
    const input = screen.getByTestId('input')
    expect(input).toHaveClass('focus-visible:outline-none', 'focus-visible:ring-2')
  })

  it('alkalmazza a custom className-t', () => {
    render(<Input className="custom-input" data-testid="input" />)
    
    const input = screen.getByTestId('input')
    expect(input).toHaveClass('custom-input')
  })

  it('támogatja a required attribútumot', () => {
    render(<Input required data-testid="input" />)
    
    const input = screen.getByTestId('input')
    expect(input).toBeRequired()
  })

  it('támogatja a minLength és maxLength attribútumokat', () => {
    render(<Input minLength={3} maxLength={10} data-testid="input" />)
    
    const input = screen.getByTestId('input')
    expect(input).toHaveAttribute('minLength', '3')
    expect(input).toHaveAttribute('maxLength', '10')
  })

  it('alkalmazza a placeholder stílust', () => {
    render(<Input placeholder="Placeholder szöveg" data-testid="input" />)
    
    const input = screen.getByTestId('input')
    expect(input).toHaveClass('placeholder:text-muted-foreground')
  })
})