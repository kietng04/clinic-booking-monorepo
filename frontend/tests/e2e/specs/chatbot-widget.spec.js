import { test, expect } from '@playwright/test'
import { createChatbotJwt, seedAuthenticatedSession, stubNonChatbotApis } from '../helpers/chatbot-e2e.js'

test.describe('Chatbot Widget', () => {
  test('renders chatbot answer and RAG source metadata for an authenticated patient', async ({ page }) => {
    await stubNonChatbotApis(page)
    await seedAuthenticatedSession(page, { token: createChatbotJwt() })

    await page.goto('/dashboard', { waitUntil: 'networkidle' })

    const openChatbotButton = page.getByLabel('Open chatbot')
    await expect(openChatbotButton).toBeVisible()

    await openChatbotButton.click()
    await expect(page.getByText('Hybrid classify + RAG')).toBeVisible()

    const chatRequest = page.waitForResponse((response) => {
      return response.url().includes('/api/chatbot/chat') && response.request().method() === 'POST'
    })

    await page.getByPlaceholder('Nhap cau hoi ve lich kham, gia dich vu, gio mo cua...').fill('Phong kham o dau?')
    await page.getByLabel('Send message').click()

    const response = await chatRequest
    expect(response.status()).toBe(200)

    await expect(page.getByText(/120 (Nguyen Trai|Nguyễn Trãi), Qu[aâ]n 1, TP HCM/i)).toBeVisible()
    const sourceLine = page.locator('p').filter({ hasText: /^Nguon:/ })
    await expect(sourceLine).toBeVisible()
    await expect(sourceLine).toContainText('Chi nhanh trung tam')
  })
})
