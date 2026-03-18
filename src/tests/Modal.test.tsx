import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Modal } from '@/shared/components/ui/modal'

describe('Modal komponens', () => {
  it('nem rendereli, ha nincs megnyitva', () => {
    render(
      <Modal isOpen={false} onClose={() => {}} title="Teszt modal">
        Modal tartalom
      </Modal>
    )
    
    expect(screen.queryByText('Teszt modal')).not.toBeInTheDocument()
    expect(screen.queryByText('Modal tartalom')).not.toBeInTheDocument()
  })

  it('rendereli, ha meg van nyitva', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Teszt modal">
        Modal tartalom
      </Modal>
    )
    
    expect(screen.getByText('Teszt modal')).toBeInTheDocument()
    expect(screen.getByText('Modal tartalom')).toBeInTheDocument()
  })

  it('megjeleníti a bezáró gombot', () => {
    const onClose = vi.fn()
    render(
      <Modal isOpen={true} onClose={onClose} title="Teszt modal">
        Tartalom
      </Modal>
    )
    
    const closeButton = screen.getByRole('button')
    expect(closeButton).toBeInTheDocument()
    expect(closeButton).toHaveClass('w-8', 'h-8', 'sm:w-10', 'sm:h-10')
  })

  it('meghívja az onClose függvényt a bezáró gomb kattintásakor', () => {
    const onClose = vi.fn()
    render(
      <Modal isOpen={true} onClose={onClose} title="Teszt modal">
        Tartalom
      </Modal>
    )
    
    const closeButton = screen.getByRole('button')
    fireEvent.click(closeButton)
    
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('megjeleníti a subtitle-t, ha van', () => {
    render(
      <Modal 
        isOpen={true} 
        onClose={() => {}} 
        title="Teszt modal"
        subtitle="Teszt alcím"
      >
        Tartalom
      </Modal>
    )
    
    expect(screen.getByText('Teszt modal')).toBeInTheDocument()
    expect(screen.getByText('Teszt alcím')).toBeInTheDocument()
  })

  it('alkalmazza a reszponzív osztályokat', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Teszt modal">
        <div data-testid="content">Tartalom</div>
      </Modal>
    )
    
    const content = screen.getByTestId('content')
    expect(content.parentElement).toHaveClass('text-sm', 'sm:text-base')
  })

  it('alkalmazza a backdrop blur effektet', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Teszt modal">
        Tartalom
      </Modal>
    )
    
    const backdrop = screen.getByText('Teszt modal').closest('.fixed')
    expect(backdrop).toHaveClass('backdrop-blur-sm')
  })

  it('alkalmazza a glass-panel stílust', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Teszt modal">
        Tartalom
      </Modal>
    )
    
    const panel = screen.getByText('Teszt modal').closest('.glass-panel')
    expect(panel).toHaveClass('glass-panel')
  })

  it('alkalmazza a custom maxWidth-et', () => {
    render(
      <Modal 
        isOpen={true} 
        onClose={() => {}} 
        title="Teszt modal"
        maxWidth="max-w-4xl"
      >
        Tartalom
      </Modal>
    )
    
    const panel = screen.getByText('Teszt modal').closest('.max-w-4xl')
    expect(panel).toHaveClass('max-w-4xl')
  })

  it('alapértelmezett maxWidth-et használ', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Teszt modal">
        Tartalom
      </Modal>
    )
    
    const panel = screen.getByText('Teszt modal').closest('.max-w-2xl')
    expect(panel).toHaveClass('max-w-2xl')
  })

  it('alkalmazza az animációs osztályokat', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Teszt modal">
        Tartalom
      </Modal>
    )
    
    const panel = screen.getByText('Teszt modal').closest('.animate-in')
    expect(panel).toHaveClass('animate-in', 'fade-in', 'zoom-in', 'duration-200')
  })

  it('kezeli a hosszú címeket', () => {
    const longTitle = 'Ez egy nagyon hosszú cím, amely több sorba kellene, hogy törjön mobil eszközökön'
    
    render(
      <Modal isOpen={true} onClose={() => {}} title={longTitle}>
        Tartalom
      </Modal>
    )
    
    const titleElement = screen.getByText(longTitle)
    expect(titleElement).toHaveClass('break-words')
  })

  it('kezeli a hosszú subtitle-okat', () => {
    const longSubtitle = 'Ez egy nagyon hosszú alcím, amely szintén több sorba kellene, hogy törjön'
    
    render(
      <Modal 
        isOpen={true} 
        onClose={() => {}} 
        title="Cím"
        subtitle={longSubtitle}
      >
        Tartalom
      </Modal>
    )
    
    const subtitleElement = screen.getByText(longSubtitle)
    expect(subtitleElement).toHaveClass('break-words')
  })

  it('responsive header layout működik', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Teszt modal">
        Tartalom
      </Modal>
    )
    
    const titleContainer = screen.getByText('Teszt modal').parentElement
    expect(titleContainer).toHaveClass('flex-1', 'pr-4')
    
    const closeButton = screen.getByRole('button')
    expect(closeButton).toHaveClass('flex-shrink-0')
  })
})