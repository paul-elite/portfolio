import BasicsType from './type'
import BasicsColour from './colour'
import BasicsAi from './ai'
import BasicsProduct from './product'

// The demos in the four "basics" articles (typography, colour, AI, building a product), by the ids
// their `interactive` blocks use.
export const BASICS_DEMOS = {
  'basics-type': BasicsType,
  'basics-colour': BasicsColour,
  'basics-ai': BasicsAi,
  'basics-product': BasicsProduct,
} as const
