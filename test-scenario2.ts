import { runMonteCarlo } from './src/engine/monte-carlo.js';
import { DEFAULT_ASSUMPTION, DEFAULT_REGULATORY_SCENARIO_OPTIMISTIC } from './src/data/defaults.js';
import { UserInputs } from './src/types.js';

// Try with all expenses in THB to see if remittance tax is the killer
const expenseThbYr = 83576 * 33; 
const expenseThbMo = expenseThbYr / 12;

const userInputs: UserInputs = {
  currentAge: 40,
  birthYear: 1986,
  lifeExpectancy: 90, 
  accounts: [
    { id: '1', type: 'TaxableBrokerage', currency: 'USD', balance: 3762879, basis: 3762879 * 0.5, pre2024: 0 } // Assume 50% basis
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

console.log(`Success Rate with THB expenses & 50% basis: ${res.successRate}`);
