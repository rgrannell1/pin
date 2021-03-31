
import { Theory } from 'atypical'

import storeHypotheses from '../src/store.test.js'

const theory = new Theory({ description: 'all hypotheses are valid' })

theory
  .expectAll({
    ...storeHypotheses
  })
  .test({
    seconds: 30
  })
  .catch(err => {
    throw err
  })
