import { useEffect, useRef } from 'react'

/** Llama a `onReachEnd` cuando el centinela se acerca al viewport. */
export function useInfiniteScroll<T extends HTMLElement>(enabled: boolean, onReachEnd: () => void) {
  const sentinelRef = useRef<T>(null)

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!enabled || !sentinel || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) onReachEnd()
      },
      { rootMargin: '600px 0px' },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [enabled, onReachEnd])

  return sentinelRef
}
