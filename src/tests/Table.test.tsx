import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table'

describe('Table komponens', () => {
  it('rendereli az alapvető táblázatot', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fejléc 1</TableHead>
            <TableHead>Fejléc 2</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Cella 1</TableCell>
            <TableCell>Cella 2</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )
    
    expect(screen.getByText('Fejléc 1')).toBeInTheDocument()
    expect(screen.getByText('Fejléc 2')).toBeInTheDocument()
    expect(screen.getByText('Cella 1')).toBeInTheDocument()
    expect(screen.getByText('Cella 2')).toBeInTheDocument()
  })

  it('Table wrapper alkalmazza a scrollozható osztályokat', () => {
    render(
      <Table data-testid="table">
        <TableBody>
          <TableRow>
            <TableCell>Teszt</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )
    
    const wrapper = screen.getByTestId('table').parentElement
    expect(wrapper).toHaveClass('relative', 'w-full', 'overflow-x-auto', 'scrollbar-hide')
  })

  it('Table alkalmazza a reszponzív szövegméretet', () => {
    render(
      <Table data-testid="table">
        <TableBody>
          <TableRow>
            <TableCell>Teszt</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )
    
    const table = screen.getByTestId('table')
    expect(table).toHaveClass('text-xs', 'sm:text-sm', 'min-w-full')
  })

  it('TableHeader alkalmazza a megfelelő stílusokat', () => {
    render(
      <TableHeader data-testid="header">
        <TableRow>
          <TableHead>Fejléc</TableHead>
        </TableRow>
      </TableHeader>
    )
    
    const header = screen.getByTestId('header')
    expect(header).toHaveClass('[&_tr]:border-b', 'border-white/10')
  })

  it('TableHead alkalmazza a reszponzív padding-et', () => {
    render(
      <TableHead data-testid="head">Fejléc</TableHead>
    )
    
    const head = screen.getByTestId('head')
    expect(head).toHaveClass('h-10', 'sm:h-12', 'px-2', 'sm:px-4', 'whitespace-nowrap')
    expect(head.tagName).toBe('TH')
  })

  it('TableCell alkalmazza a reszponzív padding-et', () => {
    render(
      <TableCell data-testid="cell">Cella</TableCell>
    )
    
    const cell = screen.getByTestId('cell')
    expect(cell).toHaveClass('p-2', 'sm:p-4', 'whitespace-nowrap')
    expect(cell.tagName).toBe('TD')
  })

  it('TableRow alkalmazza a hover effekteket', () => {
    render(
      <TableRow data-testid="row">
        <TableCell>Teszt</TableCell>
      </TableRow>
    )
    
    const row = screen.getByTestId('row')
    expect(row).toHaveClass('border-b', 'border-white/5', 'transition-colors', 'hover:bg-muted/50')
    expect(row.tagName).toBe('TR')
  })

  it('TableBody rendereli a sorok tartalmát', () => {
    render(
      <TableBody data-testid="body">
        <TableRow>
          <TableCell>Sor 1</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Sor 2</TableCell>
        </TableRow>
      </TableBody>
    )
    
    const body = screen.getByTestId('body')
    expect(body).toBeInTheDocument()
    expect(body.tagName).toBe('TBODY')
    expect(screen.getByText('Sor 1')).toBeInTheDocument()
    expect(screen.getByText('Sor 2')).toBeInTheDocument()
  })

  it('komplex táblázat struktúra működik', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Név</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Szerepkör</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>John Doe</TableCell>
            <TableCell>john@example.com</TableCell>
            <TableCell>Admin</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Jane Smith</TableCell>
            <TableCell>jane@example.com</TableCell>
            <TableCell>User</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )
    
    // Fejlécek ellenőrzése
    expect(screen.getByText('Név')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Szerepkör')).toBeInTheDocument()
    
    // Adatok ellenőrzése
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
    expect(screen.getByText('Admin')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('jane@example.com')).toBeInTheDocument()
    expect(screen.getByText('User')).toBeInTheDocument()
  })

  it('alkalmazza a custom className-eket', () => {
    render(
      <Table className="custom-table" data-testid="table">
        <TableHeader className="custom-header" data-testid="header">
          <TableRow className="custom-row" data-testid="row">
            <TableHead className="custom-head" data-testid="head">Fejléc</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="custom-body" data-testid="body">
          <TableRow>
            <TableCell className="custom-cell" data-testid="cell">Cella</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )
    
    expect(screen.getByTestId('table')).toHaveClass('custom-table')
    expect(screen.getByTestId('header')).toHaveClass('custom-header')
    expect(screen.getByTestId('row')).toHaveClass('custom-row')
    expect(screen.getByTestId('head')).toHaveClass('custom-head')
    expect(screen.getByTestId('body')).toHaveClass('custom-body')
    expect(screen.getByTestId('cell')).toHaveClass('custom-cell')
  })
})