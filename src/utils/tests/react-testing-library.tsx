import type { ReactElement } from 'react'

import type { RenderOptions } from '@testing-library/react'
import { render } from '@testing-library/react'
import fs from 'node:fs'

/**
 * TODO emiliosheinz: Implement media query evaluation.
 *  Related Issue: https://stackoverflow.com/questions/64281467/react-testing-library-rtl-test-a-responsive-design
 */
const customRender = (ui: ReactElement, options?: RenderOptions) => {
  const view = render(ui, options)

  const style = document.createElement('style')
  style.innerHTML = fs.readFileSync('src/utils/tests/tailwind.css', 'utf8')
  document.head.append(style)

  return view
}

export * from '@testing-library/react'
export { customRender as render }
