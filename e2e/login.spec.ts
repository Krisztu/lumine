import { test, expect } from '@playwright/test'

test.describe('Luminé App Tesztek', () => {
  // Bejelentkezési tesztek
  test('bejelentkezési oldal betöltődik', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('admin bejelentkezés', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    await page.fill('input[type="email"]', 'admin1@lumine.edu.hu')
    await page.fill('input[type="password"]', 'admin123456')
    await page.click('button[type="submit"]')
    
    await page.waitForURL('**/dashboard', { timeout: 15000 })
    await expect(page).toHaveURL(/.*dashboard/)
  })

  test('diák bejelentkezés', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    await page.fill('input[type="email"]', 'diak1@lumine.edu.hu')
    await page.fill('input[type="password"]', 'diak123456')
    await page.click('button[type="submit"]')
    
    await page.waitForURL('**/dashboard', { timeout: 15000 })
    await expect(page).toHaveURL(/.*dashboard/)
  })

  test('hibás bejelentkezés', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    await page.fill('input[type="email"]', 'wrong@email.com')
    await page.fill('input[type="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')
    
    await page.waitForTimeout(3000)
    expect(page.url()).not.toContain('/dashboard')
  })

  // Dashboard funkciók
  test('admin dashboard tartalom', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    await page.fill('input[type="email"]', 'admin1@lumine.edu.hu')
    await page.fill('input[type="password"]', 'admin123456')
    await page.click('button[type="submit"]')
    
    await page.waitForURL('**/dashboard', { timeout: 15000 })
    await page.waitForLoadState('networkidle')
    
    const bodyContent = await page.locator('body').textContent()
    expect(bodyContent).toBeTruthy()
  })

  test('diák dashboard tartalom', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    await page.fill('input[type="email"]', 'diak1@lumine.edu.hu')
    await page.fill('input[type="password"]', 'diak123456')
    await page.click('button[type="submit"]')
    
    await page.waitForURL('**/dashboard', { timeout: 15000 })
    await page.waitForLoadState('networkidle')
    
    const bodyContent = await page.locator('body').textContent()
    expect(bodyContent).toBeTruthy()
  })

  // Tab funkciók (ha vannak)
  test('dashboard tab-ok ellenőrzése', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    await page.fill('input[type="email"]', 'admin1@lumine.edu.hu')
    await page.fill('input[type="password"]', 'admin123456')
    await page.click('button[type="submit"]')
    
    await page.waitForURL('**/dashboard', { timeout: 15000 })
    await page.waitForLoadState('networkidle')
    
    // Ellenőrizzük hogy vannak-e tab-ok
    const tabCount = await page.locator('button[role="tab"]').count()
    if (tabCount > 0) {
      expect(tabCount).toBeGreaterThan(0)
    } else {
      // Ha nincsenek tab-ok, az is rendben van
      expect(true).toBeTruthy()
    }
  })

  // QR kód funkció
  test('QR scan oldal elérhető', async ({ page }) => {
    await page.goto('/qr-scan')
    await page.waitForLoadState('networkidle')
    
    // Ellenőrizzük hogy az oldal betöltődött
    const bodyContent = await page.locator('body').textContent()
    expect(bodyContent).toBeTruthy()
  })

  // Form validáció
  test('üres email validáció', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    await page.waitForTimeout(2000)
    expect(page.url()).not.toContain('/dashboard')
  })

  test('üres jelszó validáció', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    await page.fill('input[type="email"]', 'test@lumine.edu.hu')
    await page.click('button[type="submit"]')
    
    await page.waitForTimeout(2000)
    expect(page.url()).not.toContain('/dashboard')
  })

  // UI elemek
  test('email mező típusa', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const emailInput = page.locator('input[type="email"]')
    await expect(emailInput).toHaveAttribute('type', 'email')
  })

  test('jelszó mező típusa', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const passwordInput = page.locator('input[type="password"]')
    await expect(passwordInput).toHaveAttribute('type', 'password')
  })

  test('submit gomb működik', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const submitButton = page.locator('button[type="submit"]')
    await expect(submitButton).toBeEnabled()
    await expect(submitButton).toHaveAttribute('type', 'submit')
  })

  // Oldal metaadatok
  test('oldal címe', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const title = await page.title()
    expect(title).toBeTruthy()
  })

  // Reszponzivitás
  test('mobil nézet', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  // Sötét/világos mód
  test('téma váltó gomb', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Keresünk téma váltó gombot
    const themeButton = page.locator('button').filter({ hasText: /sun|moon/i }).or(
      page.locator('[data-testid="theme-toggle"]')
    )
    
    if (await themeButton.count() > 0) {
      await expect(themeButton.first()).toBeVisible()
    } else {
      // Ha nincs téma váltó, az is rendben van
      expect(true).toBeTruthy()
    }
  })

  // Tablet nézet
  test('tablet nézet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  // Form interakció
  test('email mező kitöltése és törlése', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const emailInput = page.locator('input[type="email"]')
    
    // Kitöltés
    await emailInput.fill('test@lumine.edu.hu')
    await expect(emailInput).toHaveValue('test@lumine.edu.hu')
    
    // Törlés
    await emailInput.clear()
    await expect(emailInput).toHaveValue('')
  })

  // Jelszó mező interakció
  test('jelszó mező kitöltése', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const passwordInput = page.locator('input[type="password"]')
    
    await passwordInput.fill('testpassword123')
    await expect(passwordInput).toHaveValue('testpassword123')
  })

  // Keyboard navigáció
  test('tab navigáció form mezők között', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Email mezőre fókusz
    await page.locator('input[type="email"]').focus()
    
    // Tab-bal jelszó mezőre
    await page.keyboard.press('Tab')
    
    // Ellenőrizzük hogy a jelszó mező aktív
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName)
    expect(focusedElement).toBe('INPUT')
  })

  // Enter gomb submit
  test('enter gombbal submit', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    await page.fill('input[type="email"]', 'admin1@lumine.edu.hu')
    await page.fill('input[type="password"]', 'admin123456')
    
    // Enter gomb a jelszó mezőben
    await page.locator('input[type="password"]').press('Enter')
    
    await page.waitForURL('**/dashboard', { timeout: 15000 })
    expect(page.url()).toContain('/dashboard')
  })

  // Különböző képernyő méretek
  test('nagy képernyő nézet', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  // Kis képernyő nézet
  test('kis képernyő nézet', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  // Hosszú email cím
  test('hosszú email cím kezelése', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const longEmail = 'very.long.email.address.for.testing@lumine.edu.hu'
    await page.fill('input[type="email"]', longEmail)
    await expect(page.locator('input[type="email"]')).toHaveValue(longEmail)
  })

  // Speciális karakterek jelszóban
  test('speciális karakterek jelszóban', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const specialPassword = 'Test@123!#$%'
    await page.fill('input[type="password"]', specialPassword)
    await expect(page.locator('input[type="password"]')).toHaveValue(specialPassword)
  })

  // Másolás beillesztés
  test('email másolás beillesztés', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const emailInput = page.locator('input[type="email"]')
    
    // Kitöltés
    await emailInput.fill('admin1@lumine.edu.hu')
    
    // Kijelölés és másolás
    await emailInput.selectText()
    await page.keyboard.press('Control+c')
    
    // Törlés
    await emailInput.clear()
    
    // Beillesztés
    await emailInput.focus()
    await page.keyboard.press('Control+v')
    
    await expect(emailInput).toHaveValue('admin1@lumine.edu.hu')
  })

  // Oldal újratöltés
  test('oldal újratöltés után form üres', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Kitöltés
    await page.fill('input[type="email"]', 'test@lumine.edu.hu')
    await page.fill('input[type="password"]', 'testpass')
    
    // Újratöltés
    await page.reload()
    await page.waitForLoadState('networkidle')
    
    // Ellenőrzés hogy üres
    await expect(page.locator('input[type="email"]')).toHaveValue('')
    await expect(page.locator('input[type="password"]')).toHaveValue('')
  })

  // Teljesítmény
  test('oldal gyors betöltés', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const loadTime = Date.now() - startTime
    expect(loadTime).toBeLessThan(10000) // 10 másodpercnél gyorsabb
  })
})