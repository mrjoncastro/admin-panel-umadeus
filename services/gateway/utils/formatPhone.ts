export function maskPhone(digits: string) {
  if (!digits) return ''
  const d = digits.slice(0, 2)
  const n = digits.slice(2)
  let p1 = ''
  let p2 = ''
  if (n.length <= 4) p1 = n
  else if (n.length <= 8) {
    p1 = n.slice(0, 4)
    p2 = n.slice(4)
  } else {
    p1 = n.slice(0, 5)
    p2 = n.slice(5)
  }
  return `(${d}) ${p1}${p2 ? '-' + p2 : ''}`
}
