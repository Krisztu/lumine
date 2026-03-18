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

  it('alkalmazza a reszponzív osztályokat', () => {
    render(<Button size="default">Gomb</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('h-10', 'sm:h-12')
    expect(button).toHaveClass('touch-manipulation')
  })

  it('különböző méretekkel működik', () => {
    const { rerender } = render(<Button size="sm">Kis gomb</Button>)
    
    let button = screen.getByRole('button')
    expect(button).toHaveClass('h-8', 'sm:h-9')
    
    rerender(<Button size="lg">Nagy gomb</Button>)
    button = screen.getByRole('button')
    expect(button).toHaveClass('h-12', 'sm:h-14')
    
    rerender(<Button size="icon">Ikon</Button>)
    button = screen.getByRole('button')
    expect(button).toHaveClass('h-10', 'w-10', 'sm:h-12', 'sm:w-12')
  })

  it('különböző variánsokkal működik', () => {
    const { rerender } = render(<Button variant="destructive">Törlés</Button>)
    
    let button = screen.getByRole('button')
    expect(button).toHaveClass('bg-gradient-to-r', 'from-red-600')
    
    rerender(<Button variant="outline">Körvonal</Button>)
    button = screen.getByRole('button')
    expect(button).toHaveClass('border', 'border-input')
    
    rerender(<Button variant="ghost">Szellem</Button>)
    button = screen.getByRole('button')
    expect(button).toHaveClass('hover:bg-accent/50')
    
    rerender(<Button variant="secondary">Másodlagos</Button>)
    button = screen.getByRole('button')
    expect(button).toHaveClass('bg-secondary')
  })

  it('kezeli a disabled állapotot', () => {
    render(<Button disabled>Letiltott gomb</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-50')
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

  it('támogatja az asChild prop-ot', () => {
    render(
      <Button asChild>
        <a href="/test">Link gomb</a>
      </Button>
    )
    
    const link = screen.getByRole('link')
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/test')
  })
})