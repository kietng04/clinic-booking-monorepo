import { test, expect } from '../fixtures/test-fixtures.js'
import { assertOnRoute } from '../helpers/ui-assertions.js'

test.describe.serial('Patient Payment History Continue Flow', () => {
  test('redirects patient to MoMo payment page from pending history item', async ({ patientPage }) => {
    const orderId = `ORDER_CONTINUE_${Date.now()}`
    const momoPayUrl = `https://test-payment.momo.vn/e2e-pay?orderId=${orderId}`

    await patientPage.route('**/api/payments/my-payments**', async (route) => {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          content: [
            {
              orderId,
              invoiceNumber: orderId,
              appointmentId: 123456,
              amount: 200000,
              finalAmount: 200000,
              currency: 'VND',
              status: 'PENDING',
              paymentMethod: 'MOMO_WALLET',
              description: 'Pending MoMo payment',
              createdAt: new Date().toISOString(),
            },
          ],
        }),
      })
    })

    await patientPage.route(`**/api/payments/${orderId}`, async (route) => {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          orderId,
          appointmentId: 123456,
          amount: 200000,
          finalAmount: 200000,
          currency: 'VND',
          status: 'PENDING',
          paymentMethod: 'MOMO_WALLET',
          payUrl: momoPayUrl,
          redirectUrl: momoPayUrl,
          createdAt: new Date().toISOString(),
        }),
      })
    })

    await patientPage.goto('/payments')
    await assertOnRoute(patientPage, '/payments')
    await expect(patientPage.getByText(/Lịch sử thanh toán/i).first()).toBeVisible()

    const continueButton = patientPage.getByRole('button', { name: 'Tiếp tục thanh toán' })
    await expect(continueButton).toBeVisible()

    const redirectPromise = patientPage.waitForURL((url) => url.toString().startsWith('https://test-payment.momo.vn'), {
      timeout: 30_000,
    })
    await continueButton.click()
    await redirectPromise

    await expect(patientPage).toHaveURL(new RegExp(`^https://test-payment\\.momo\\.vn/e2e-pay\\?orderId=${orderId}$`))
  })
})
