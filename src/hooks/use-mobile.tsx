
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false)
  const [isClient, setIsClient] = React.useState<boolean>(false)

  React.useEffect(() => {
    setIsClient(true)
    
    const checkMobile = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT
      setIsMobile(mobile)
    }

    // Verificação inicial
    checkMobile()

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      checkMobile()
    }

    // Usar addEventListener para navegadores modernos
    mql.addEventListener("change", onChange)

    // Cleanup
    return () => {
      mql.removeEventListener("change", onChange)
    }
  }, [])
  
  // Retorna false durante SSR e o valor correto após hidratação
  return isClient ? isMobile : false
}
