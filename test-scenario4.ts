import { runMonteCarlo } from './src/engine/monte-carlo.js';
import { DEFAULT_ASSUMPTION, DEFAULT_REGULATORY_SCENARIO_OPTIMISTIC } from './src/data/defaults.js';
import { UserInputs } from './src/types.js';

const expenseThbYr = 83576 * 33; 
const expenseThbMo = expenseThbYr / 12;

// What if the portfolio is all Roth IRA (post-tax, but optimistic scenario means Thai pension deduction might apply? Wait, optimistic means treaty re-sources it maybe, let's see)
const userInputs: UserInputs = {
  currentAge: 40,
  birthYear: 1986,
  lifeExpectancy: 90, 
  accounts: [
    { id: '1', type: 'RothIRA', currency: 'USD', balance: 3762879 }
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

console.log(`Success Rate with Roth IRA: ${res.successRate}`);
