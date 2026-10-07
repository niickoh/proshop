import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { isFromCatalog } from '../../../shared/utils/navigationState'

/** Desde el catálogo vuelve atrás (conserva filtros y scroll); si se entró directo, va a /comprar. */
export function useBackToCatalog() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const fromCatalog = isFromCatalog(state)

  return useCallback(() => {
    if (fromCatalog) navigate(-1)
    else navigate('/comprar')
  }, [fromCatalog, navigate])
}
