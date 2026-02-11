import { expect } from '@playwright/test'

const isApiRequest = (url) => {
  try {
    return new URL(url).pathname.startsWith('/api/')
  } catch {
    return false
  }
}

export function createNetworkObserver(page) {
  const events = []

  const onPageError = (error) => {
    events.push({ type: 'pageerror', message: error.message })
  }

  const onConsole = (message) => {
    if (message.type() === 'error') {
      events.push({ type: 'console-error', message: message.text() })
    }
  }

  const onResponse = (response) => {
    if (!isApiRequest(response.url())) return
    if (response.status() >= 500) {
      events.push({
        type: 'api-5xx',
        status: response.status(),
        method: response.request().method(),
        url: response.url(),
      })
    }
  }

  const onRequestFailed = (request) => {
    if (!isApiRequest(request.url())) return
    const errorText = request.failure()?.errorText || 'unknown'
    if (errorText.includes('ERR_ABORTED')) return
    events.push({
      type: 'request-failed',
      method: request.method(),
      url: request.url(),
      error: errorText,
    })
  }

  page.on('pageerror', onPageError)
  page.on('console', onConsole)
  page.on('response', onResponse)
  page.on('requestfailed', onRequestFailed)

  const getBlockingEvents = () => events

  const expectNoBlockingEvents = async () => {
    expect(getBlockingEvents()).toEqual([])
  }

  const stop = () => {
    page.off('pageerror', onPageError)
    page.off('console', onConsole)
    page.off('response', onResponse)
    page.off('requestfailed', onRequestFailed)
  }

  return {
    events,
    getBlockingEvents,
    expectNoBlockingEvents,
    stop,
  }
}
