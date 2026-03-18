import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/shared/components/ui/card'

describe('Card komponens', () => {
  it('rendereli az alapvető card komponenst', () => {
    render(
      <Card data-testid="card">
        <CardHeader>
          <CardTitle>Teszt cím</CardTitle>
        </CardHeader>
        <CardContent>
          Teszt tartalom
        </CardContent>
      </Card>
    )
    
    expect(screen.getByTestId('card')).toBeInTheDocument()
    expect(screen.getByText('Teszt cím')).toBeInTheDocument()
    expect(screen.getByText('Teszt tartalom')).toBeInTheDocument()
  })

  it('alkalmazza a glass-card osztályt', () => {
    render(<Card data-testid="card">Tartalom</Card>)
    
    const card = screen.getByTestId('card')
    expect(card).toHaveClass('glass-card')
  })

  it('CardHeader alkalmazza a reszponzív padding-et', () => {
    render(
      <CardHeader data-testid="header">
        <CardTitle>Cím</CardTitle>
      </CardHeader>
    )
    
    const header = screen.getByTestId('header')
    expect(header).toHaveClass('p-3', 'sm:p-6')
  })

  it('CardContent alkalmazza a reszponzív padding-et', () => {
    render(
      <CardContent data-testid="content">
        Tartalom
      </CardContent>
    )
    
    const content = screen.getByTestId('content')
    expect(content).toHaveClass('p-3', 'sm:p-6')
  })

  it('CardTitle alkalmazza a reszponzív címméretet', () => {
    render(<CardTitle data-testid="title">Teszt cím</CardTitle>)
    
    const title = screen.getByTestId('title')
    expect(title).toHaveClass('text-lg', 'sm:text-2xl')
    expect(title.tagName).toBe('H3')
  })

  it('CardDescription rendereli a leírást', () => {
    render(<CardDescription data-testid="description">Teszt leírás</CardDescription>)
    
    const description = screen.getByTestId('description')
    expect(description).toBeInTheDocument()
    expect(description).toHaveClass('text-sm', 'text-muted-foreground')
    expect(description.tagName).toBe('P')
  })

  it('CardFooter rendereli a láblécet', () => {
    render(
      <CardFooter data-testid="footer">
        <button>Akció</button>
      </CardFooter>
    )
    
    const footer = screen.getByTestId('footer')
    expect(footer).toBeInTheDocument()
    expect(footer).toHaveClass('flex', 'items-center', 'p-3', 'sm:p-6')
  })

  it('teljes card struktúra működik együtt', () => {
    render(
      <Card data-testid="full-card">
        <CardHeader>
          <CardTitle>Fő cím</CardTitle>
          <CardDescription>Kártya leírása</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Kártya tartalma itt található.</p>
        </CardContent>
        <CardFooter>
          <button>Mentés</button>
          <button>Mégse</button>
        </CardFooter>
      </Card>
    )
    
    expect(screen.getByTestId('full-card')).toBeInTheDocument()
    expect(screen.getByText('Fő cím')).toBeInTheDocument()
    expect(screen.getByText('Kártya leírása')).toBeInTheDocument()
    expect(screen.getByText('Kártya tartalma itt található.')).toBeInTheDocument()
    expect(screen.getByText('Mentés')).toBeInTheDocument()
    expect(screen.getByText('Mégse')).toBeInTheDocument()
  })

  it('alkalmazza a custom className-eket', () => {
    render(
      <Card className="custom-card" data-testid="card">
        <CardHeader className="custom-header" data-testid="header">
          <CardTitle className="custom-title" data-testid="title">Cím</CardTitle>
        </CardHeader>
        <CardContent className="custom-content" data-testid="content">
          Tartalom
        </CardContent>
      </Card>
    )
    
    expect(screen.getByTestId('card')).toHaveClass('custom-card')
    expect(screen.getByTestId('header')).toHaveClass('custom-header')
    expect(screen.getByTestId('title')).toHaveClass('custom-title')
    expect(screen.getByTestId('content')).toHaveClass('custom-content')
  })
})