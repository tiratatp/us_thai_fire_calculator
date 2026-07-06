import { runMonteCarlo } from './src/engine/monte-carlo.js';
import { DEFAULT_ASSUMPTION, DEFAULT_REGULATORY_SCENARIO_OPTIMISTIC } from './src/data/defaults.js';
import { UserInputs } from './src/types.js';

const userInputs: UserInputs = {
  currentAge: 40,
  birthYear: 1986,
  lifeExpectancy: 90, // 50 year horizon (triggers 33x multiplier)
  accounts: [
    { id: '1', type: 'TaxableBrokerage', currency: 'USD', balance: 3762879, basis: 3762879, pre2024: 0 }
  ],
  expenses: {
    housingThbMo: 0,
    foodThbMo: 0,
    transportThbMo: 0,
    otherThbMo: 0,
    healthcareThbYr: 0,
    legalTaxThbYr: 0,
    travelUsdYr: 83576,
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

console.log(`Success Rate: ${res.successRate}`);
