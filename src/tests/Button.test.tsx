import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/shared/components/ui/button'

describe('Button komponens', () => {
  it('rendereli az alapértelmezett gombot', () => {
    render(<Button>Teszt gomb</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent('Teszt gomb')
  })

  it('különböző méretekkel működik', () => {
    const { rerender } = render(<Button size="sm">Kis gomb</Button>)
    
    let button = screen.getByRole('button')
    expect(button).toHaveClass('h-8', 'sm:h-9')
    
    rerender(<Button size="lg">Nagy gomb</Button>)
    button = screen.getByRole('button')
    expect(button).toHaveClass('h-12', 'sm:h-14')
  })

  it('kezeli a disabled állapotot', () => {
    render(<Button disabled>Letiltott gomb</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  it('kezeli a kattintás eseményt', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Kattintható gomb</Button>)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('alkalmazza a custom className-t', () => {
    render(<Button className="custom-class">Custom gomb</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('custom-class')
  })
})
