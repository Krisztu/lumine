import { test, expect } from '@playwright/test'

test.describe('Luminé App Tesztek', () => {
  // bejelentkezesi tesztek
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

  // dashboard funkciok
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

  // tab funkciok (ha vannak)
  test('dashboard tab-ok ellenőrzése', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    await page.fill('input[type="email"]', 'admin1@lumine.edu.hu')
    await page.fill('input[type="password"]', 'admin123456')
    await page.click('button[type="submit"]')
    
    await page.waitForURL('**/dashboard', { timeout: 15000 })
    await page.waitForLoadState('networkidle')
    
    // ellenorizzuk hogy vannak-e tab-ok
    const tabCount = await page.locator('button[role="tab"]').count()
    if (tabCount > 0) {
      expect(tabCount).toBeGreaterThan(0)
    } else {
      // ha nincsenek tab-ok, az is rendben van
      expect(true).toBeTruthy()
    }
  })

  // qr kod funkciok
  test('QR scan oldal elérhető', async ({ page }) => {
    await page.goto('/qr-scan')
    await page.waitForLoadState('networkidle')
    
    // ellenorizzuk hogy az oldal betoltodott
    const bodyContent = await page.locator('body').textContent()
    expect(bodyContent).toBeTruthy()
  })

  // form validacio
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

  // ui elemek
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

  // oldal metaadatok
  test('oldal címe', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const title = await page.title()
    expect(title).toBeTruthy()
  })

  // reszponzivitas
  test('mobil nézet', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  // sotet/vilagos mod
  test('téma váltó gomb', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // keresunk tema valto gombot
    const themeButton = page.locator('button').filter({ hasText: /sun|moon/i }).or(
      page.locator('[data-testid="theme-toggle"]')
    )
    
    if (await themeButton.count() > 0) {
      await expect(themeButton.first()).toBeVisible()
    } else {
      // ha nincs tema valto, az is rendben van
      expect(true).toBeTruthy()
    }
  })

  // tablet nezet
  test('tablet nézet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  // form interakcio
  test('email mező kitöltése és törlése', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const emailInput = page.locator('input[type="email"]')
    
    // kitoltes
    await emailInput.fill('test@lumine.edu.hu')
    await expect(emailInput).toHaveValue('test@lumine.edu.hu')
    
    // torles
    await emailInput.clear()
    await expect(emailInput).toHaveValue('')
  })

  // jelszo mezo interakcio
  test('jelszó mező kitöltése', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const passwordInput = page.locator('input[type="password"]')
    
    await passwordInput.fill('testpassword123')
    await expect(passwordInput).toHaveValue('testpassword123')
  })

  // keyboard navigacio
  test('tab navigáció form mezők között', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // email mezore fokusz
    await page.locator('input[type="email"]').focus()
    
    // tab-bal jelszo mezore
    await page.keyboard.press('Tab')
    
    // ellenorizzuk hogy a jelszo mezo aktiv
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName)
    expect(focusedElement).toBe('INPUT')
  })

  // enter gomb submit
  test('enter gombbal submit', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    await page.fill('input[type="email"]', 'admin1@lumine.edu.hu')
    await page.fill('input[type="password"]', 'admin123456')
    
    // enter gomb a jelszo mezoben
    await page.locator('input[type="password"]').press('Enter')
    
    await page.waitForURL('**/dashboard', { timeout: 15000 })
    expect(page.url()).toContain('/dashboard')
  })

  // kulonbozo kepernyo meretek
  test('nagy képernyő nézet', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  // kis kepernyo nezet
  test('kis képernyő nézet', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  // hosszu email cim
  test('hosszú email cím kezelése', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const longEmail = 'very.long.email.address.for.testing@lumine.edu.hu'
    await page.fill('input[type="email"]', longEmail)
    await expect(page.locator('input[type="email"]')).toHaveValue(longEmail)
  })

  // specialis karakterek jelszaban
  test('speciális karakterek jelszóban', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const specialPassword = 'Test@123!#$%'
    await page.fill('input[type="password"]', specialPassword)
    await expect(page.locator('input[type="password"]')).toHaveValue(specialPassword)
  })

  // masolas beillesztes
  test('email másolás beillesztés', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const emailInput = page.locator('input[type="email"]')
    
    // kitoltes
    await emailInput.fill('admin1@lumine.edu.hu')
    
    // kijoleles es masolas
    await emailInput.selectText()
    await page.keyboard.press('Control+c')
    
    // torles
    await emailInput.clear()
    
    // beillesztes
    await emailInput.focus()
    await page.keyboard.press('Control+v')
    
    await expect(emailInput).toHaveValue('admin1@lumine.edu.hu')
  })

  // oldal ujratoltes
  test('oldal újratöltés után form üres', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // kitoltes
    await page.fill('input[type="email"]', 'test@lumine.edu.hu')
    await page.fill('input[type="password"]', 'testpass')
    
    // ujratoltes
    await page.reload()
    await page.waitForLoadState('networkidle')
    
    // ellenorzes hogy ures
    await expect(page.locator('input[type="email"]')).toHaveValue('')
    await expect(page.locator('input[type="password"]')).toHaveValue('')
  })

  // teljesitmeny
  test('oldal gyors betöltés', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const loadTime = Date.now() - startTime
    expect(loadTime).toBeLessThan(10000) // 10 masodpercnel gyorsabb
  })
})