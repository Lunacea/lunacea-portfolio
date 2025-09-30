'use client'

import { useEffect } from 'react'

type ExtraMeta = Record<string, string | number | boolean | null | undefined>;

export default function AnalyticsTracker() {
  useEffect(() => {
    const controller = new AbortController()
    const t0 = performance.now()
    const send = (type: string, extra?: ExtraMeta) => {
      fetch('/api/v1/analytics', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          eventType: type,
          path: location.pathname,
          referrer: document.referrer || undefined,
          durationMs: Math.round(performance.now() - t0),
          meta: extra || undefined,
        }),
        signal: controller.signal,
        keepalive: true,
      }).catch(() => { /* ignore network error */ })
    }

    send('page_view')

    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const id = (target as HTMLElement & { id?: string }).id
      send('click', { tag: target?.tagName, id, cls: target?.className?.toString()?.slice(0,128) })
    }
    window.addEventListener('click', onClick)

    const onBeforeUnload = () => { send('page_leave') }
    window.addEventListener('beforeunload', onBeforeUnload)

    return () => {
      controller.abort()
      window.removeEventListener('click', onClick)
      window.removeEventListener('beforeunload', onBeforeUnload)
    }
  }, [])
  return null
}


