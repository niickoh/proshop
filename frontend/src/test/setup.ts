import '@testing-library/jest-dom/vitest'

// jsdom no implementa matchMedia: se evalúan min-width/max-width contra window.innerWidth.
window.matchMedia = (query: string): MediaQueryList => {
  const min = /min-width:\s*(\d+)px/.exec(query)
  const max = /max-width:\s*(\d+)px/.exec(query)
  const width = window.innerWidth
  const matches = (!min || width >= Number(min[1])) && (!max || width <= Number(max[1]))
  return {
    matches,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }
}

window.scrollTo = () => {}
