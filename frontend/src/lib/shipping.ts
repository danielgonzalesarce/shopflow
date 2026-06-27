export const FREE_SHIPPING_THRESHOLD = 50
export const SHIPPING_COST = 10

export function calcShipping(subtotal: number) {
  return subtotal > FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST
}

export function calcOrderTotal(subtotal: number) {
  return subtotal + calcShipping(subtotal)
}
