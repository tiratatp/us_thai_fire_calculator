/// <reference lib="webworker" />
import type {
  SimResult,
  UserInputs,
  Assumption,
} from '../types.js';
import {
  runMonteCarlo,
  runBothRegulatoryScenarios,
  type MonteCarloInputs,
} from '../engine/monte-carlo.js';

declare const self: DedicatedWorkerGlobalScope;

// Inbound (main → worker)
export type WorkerRequest =
  | { cmd: 'run'; inputs: MonteCarloInputs; runBothScenarios?: boolean }
  | {
      cmd: 'runBoth';
      userInputs: UserInputs;
      assumption: Assumption;
      seed: number;
      trials?: number;
    };

// Outbound (worker → main)
export type WorkerResponse =
  | { cmd: 'progress'; trialsDone: number; trialsTotal: number }
  | { cmd: 'done'; result: SimResult }
  | { cmd: 'doneBoth'; optimistic: SimResult; pessimistic: SimResult }
  | { cmd: 'error'; message: string };

/**
 * Pure handler function for Monte Carlo requests.
 * Exported so the test harness can call it without a real Worker environment.
 */
export function handleMessage(data: WorkerRequest): WorkerResponse {
  try {
    if (data.cmd === 'run') {
      const result = runMonteCarlo(data.inputs);
      return { cmd: 'done', result };
    }
    if (data.cmd === 'runBoth') {
      const { optimistic, pessimistic } = runBothRegulatoryScenarios(
        data.userInputs,
        data.assumption,
        data.seed,
        data.trials,
      );
      return { cmd: 'doneBoth', optimistic, pessimistic };
    }
    return { cmd: 'error', message: `Unknown cmd: ${(data as any).cmd}` };
  } catch (err) {
    return {
      cmd: 'error',
      message: err instanceof Error ? err.message : String(err),
    };
  }
}

// Wire up onmessage to postMessage.
// V1 skips intermediate progress messages as runMonteCarlo is synchronous.
// TODO (v2): Add progress callback to runMonteCarlo for real-time updates.
// We emit progress at 0% and then the final result.
if (typeof self !== 'undefined' && typeof self.postMessage === 'function') {
  self.onmessage = (e: MessageEvent<WorkerRequest>) => {
    self.postMessage({ cmd: 'progress', trialsDone: 0, trialsTotal: 1 });
    const response = handleMessage(e.data);
    self.postMessage(response);
  };
}
