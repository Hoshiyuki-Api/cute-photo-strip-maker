
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    // Check if it's a mobile device based on user agent as a fallback
    const checkIfMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase())
      return window.innerWidth < MOBILE_BREAKPOINT || isMobileDevice
    }

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(checkIfMobile())
    }
    mql.addEventListener("change", onChange)
    setIsMobile(checkIfMobile())
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
