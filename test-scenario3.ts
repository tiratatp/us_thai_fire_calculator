import { runMonteCarlo } from './src/engine/monte-carlo.js';
import { DEFAULT_ASSUMPTION, DEFAULT_REGULATORY_SCENARIO_OPTIMISTIC } from './src/data/defaults.js';
import { UserInputs } from './src/types.js';

const expenseThbYr = 83576 * 33; 
const expenseThbMo = expenseThbYr / 12;

// What if the portfolio is all Traditional IRA (pre-tax)?
const userInputs: UserInputs = {
  currentAge: 40,
  birthYear: 1986,
  lifeExpectancy: 90, 
  accounts: [
    { id: '1', type: 'TraditionalIRA', currency: 'USD', balance: 3762879 }
  ],
  expenses: {
    housingThbMo: expenseThbMo,
    foodThbMo: 0,
    transportThbMo: 0,
    otherThbMo: 0,
    healthcareThbYr: 0,
    legalTaxThbYr: 0,
    travelUsdYr: 0,
  },
  currentFxUsdThb: 33,
  monteCarloTrials: 100,
  thaiResidencyByYear: {},
  taxStatus: 'single',
};

const res = runMonteCarlo({
  userInputs,
  assumption: DEFAULT_ASSUMPTION,
  regScenario: DEFAULT_REGULATORY_SCENARIO_OPTIMISTIC,
  seed: 42
});

console.log(`Success Rate with Trad IRA: ${res.successRate}`);
