import { useId, useState } from 'react'
import { useNavigate } from 'react-router'
import { useCartStore } from '../../carrito/store/cartStore'
import type { BuyNowState, CartItem } from '../../carrito/types'
import type { Product } from '../../catalogo/types'

type SizeChoice = { productId: string; size: string }

/** Talla elegida y acciones "Agregar al carrito" / "Comprar ahora" del detalle. */
export function usePurchase(product: Product | undefined) {
  const addItem = useCartStore((s) => s.addItem)
  const openDrawer = useCartStore((s) => s.openDrawer)
  const navigate = useNavigate()
  const sizeErrorId = useId()
  const [choice, setChoice] = useState<SizeChoice | null>(null)
  const [missingSizeFor, setMissingSizeFor] = useState<string | null>(null)

  // La elección se asocia al producto: al cambiar de producto vuelve al valor por defecto.
  const defaultSize = product?.sizes.length === 1 ? product.sizes[0] : undefined
  const selectedSize = choice && choice.productId === product?.id ? choice.size : defaultSize
  const showSizeError = !!product && missingSizeFor === product.id && !selectedSize

  const selectSize = (size: string) => {
    if (product) setChoice({ productId: product.id, size })
  }

  const toCartItem = (): Omit<CartItem, 'quantity'> | undefined => {
    if (!product) return undefined
    if (!selectedSize) {
      setMissingSizeFor(product.id)
      return undefined
    }
    return {
      productId: product.id,
      size: selectedSize,
      name: product.name,
      brand: product.brand,
      image: product.images[0],
      price: product.price,
      compareAtPrice: product.compareAtPrice,
    }
  }

  const addToCart = () => {
    const item = toCartItem()
    if (!item) return
    addItem(item)
    openDrawer()
  }

  // No toca el carrito: el producto viaja solo en el estado de la ruta.
  const buyNow = () => {
    const item = toCartItem()
    if (!item) return
    const state: BuyNowState = { buyNow: { ...item, quantity: 1 } }
    navigate('/checkout', { state })
  }

  return { selectedSize, selectSize, showSizeError, sizeErrorId, addToCart, buyNow }
}
