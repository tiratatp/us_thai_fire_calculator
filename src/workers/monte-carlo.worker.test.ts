import { describe, it, expect } from 'vitest';
import { handleMessage } from './monte-carlo.worker.js';
import {
  DEFAULT_ASSUMPTION,
  DEFAULT_USER_INPUTS,
  DEFAULT_REGULATORY_SCENARIO_OPTIMISTIC,
} from '../data/defaults.js';

describe('monte-carlo.worker', () => {
  const minimalInputs = {
    ...DEFAULT_USER_INPUTS,
    accounts: [
      {
        id: 'usd-cash',
        type: 'Cash' as const,
        currency: 'USD' as const,
        balance: 1000000,
      },
      {
        id: 'thb-cash',
        type: 'Cash' as const,
        currency: 'THB' as const,
        balance: 50000000,
      },
    ],
    expenses: {
      ...DEFAULT_USER_INPUTS.expenses,
      housingThbMo: 50000,
    },
  };

  it('handles cmd: "run"', () => {
    const response = handleMessage({
      cmd: 'run',
      inputs: {
        userInputs: minimalInputs,
        assumption: DEFAULT_ASSUMPTION,
        regScenario: DEFAULT_REGULATORY_SCENARIO_OPTIMISTIC,
        seed: 42,
        trials: 5,
      },
    });

    expect(response.cmd).toBe('done');
    if (response.cmd === 'done') {
      expect(response.result.trialsRun).toBe(5);
      expect(response.result.successRate).toBeDefined();
      expect(response.result.p50.length).toBeGreaterThan(0);
      expect(response.result.p50.length).toBeLessThanOrEqual(
        minimalInputs.lifeExpectancy - minimalInputs.currentAge,
      );
    }
  });

  it('handles cmd: "runBoth"', () => {
    const response = handleMessage({
      cmd: 'runBoth',
      userInputs: minimalInputs,
      assumption: DEFAULT_ASSUMPTION,
      seed: 42,
      trials: 5,
    });

    expect(response.cmd).toBe('doneBoth');
    if (response.cmd === 'doneBoth') {
      expect(response.optimistic.trialsRun).toBe(5);
      expect(response.pessimistic.trialsRun).toBe(5);
    }
  });

  it('returns error for unknown cmd', () => {
    const response = handleMessage({
      cmd: 'nonsense' as any,
    } as any);

    expect(response.cmd).toBe('error');
    if (response.cmd === 'error') {
      expect(response.message).toContain('Unknown cmd');
    }
  });

  it('propagates errors from engine', () => {
    // Pass malformed inputs (missing userInputs)
    const response = handleMessage({
      cmd: 'run',
      inputs: {
        // @ts-expect-error - testing error propagation
        userInputs: undefined,
        assumption: DEFAULT_ASSUMPTION,
        regScenario: DEFAULT_REGULATORY_SCENARIO_OPTIMISTIC,
        seed: 42,
      },
    });

    expect(response.cmd).toBe('error');
    if (response.cmd === 'error') {
      expect(response.message).toBeDefined();
    }
  });

  it('is deterministic', () => {
    const req = {
      cmd: 'run',
      inputs: {
        userInputs: minimalInputs,
        assumption: DEFAULT_ASSUMPTION,
        regScenario: DEFAULT_REGULATORY_SCENARIO_OPTIMISTIC,
        seed: 42,
        trials: 10,
      },
    } as const;

    const res1 = handleMessage(req);
    const res2 = handleMessage(req);

    expect(res1).toEqual(res2);
  });
});
