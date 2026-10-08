/** Primera, última y las vecinas de la actual; el resto se resume con "…". */
export function getPageItems(page: number, totalPages: number): (number | 'gap')[] {
  const items: (number | 'gap')[] = []
  for (let n = 1; n <= totalPages; n++) {
    if (n === 1 || n === totalPages || Math.abs(n - page) <= 1) items.push(n)
    else if (items[items.length - 1] !== 'gap') items.push('gap')
  }
  return items
}
