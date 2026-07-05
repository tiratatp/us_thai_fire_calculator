import './style.css';
import type { UserInputs, SimResult, Assumption, RegulatoryScenario } from './types.js';
import { mountForm } from './ui/form.js';
import { renderResults } from './ui/results.js';
import { renderYearTable } from './ui/year-table.js';
import { portfolioBandChart, withdrawalSourceChart } from './ui/charts.js';
import { mountMethodologyPage } from './ui/methodology-page.js';
import { mountDrawdownPage } from './ui/drawdown-page.js';
import { switchTab, deepLinkToMethodology, type TabId } from './ui/navigate.js';
import { DEFAULT_ASSUMPTION, DEFAULT_USER_INPUTS } from './data/defaults.js';
import { restore, save } from './storage.js';
import type { WorkerRequest, WorkerResponse } from './workers/monte-carlo.worker.js';

const LAST_RESULT_KEY = 'v1_last_result';

interface LastResult {
  readonly optimistic: SimResult;
  readonly pessimistic: SimResult;
  readonly successThreshold: number;
  readonly inputs?: UserInputs;
}

function setProgress(pct: number, text?: string): void {
  const bar = document.querySelector<HTMLElement>('#progress-bar');
  const progress = document.querySelector<HTMLProgressElement>('#progress-bar progress');
  const label = document.querySelector<HTMLElement>('#progress-text');
  if (bar && progress && label) {
    bar.classList.toggle('hidden', pct >= 100);
    progress.value = pct;
    label.textContent = text ?? `${pct}%`;
  }
}

function showError(msg: string): void {
  const el = document.querySelector<HTMLElement>('#results-error');
  if (el) {
    el.textContent = `Error: ${msg}`;
    el.classList.remove('hidden');
  }
}

function clearError(): void {
  const el = document.querySelector<HTMLElement>('#results-error');
  if (el) el.classList.add('hidden');
}

function renderAllResults(data: LastResult): void {
  const summary = document.querySelector<HTMLElement>('#results-summary');
  if (summary) {
    renderResults(summary, data);
  }
  const yt = document.querySelector<HTMLElement>('#year-table-container');
  if (yt) {
    const accounts = data.inputs?.accounts ?? DEFAULT_USER_INPUTS.accounts;
    renderYearTable(yt, { p50: data.pessimistic.p50, fxRateUsdThb: DEFAULT_ASSUMPTION.fxUsdThb.mean, accounts });
  }
  const portfolioCanvas = document.querySelector<HTMLCanvasElement>('#portfolio-chart');
  const withdrawalCanvas = document.querySelector<HTMLCanvasElement>('#withdrawal-chart');
  if (portfolioCanvas) portfolioBandChart(portfolioCanvas, data.pessimistic);
  if (withdrawalCanvas) withdrawalSourceChart(withdrawalCanvas, data.pessimistic.p50);
}

function runSimulation(inputs: UserInputs): void {
  clearError();
  history.pushState(null, '', '#results');
  switchTab('results');
  setProgress(0, 'Running Monte Carlo...');

  const worker = new Worker(
    new URL('./workers/monte-carlo.worker.ts', import.meta.url),
    { type: 'module' },
  );

  worker.onmessage = (e: MessageEvent<WorkerResponse>): void => {
    const msg = e.data;
    if (msg.cmd === 'progress') {
      const pct = msg.trialsTotal > 0 ? Math.round((msg.trialsDone / msg.trialsTotal) * 100) : 0;
      setProgress(pct, `Running trial ${msg.trialsDone}/${msg.trialsTotal}...`);
      return;
    }
    if (msg.cmd === 'doneBoth') {
      const data: LastResult = {
        optimistic: msg.optimistic,
        pessimistic: msg.pessimistic,
        successThreshold: inputs.successThreshold,
        inputs,
      };
      save(LAST_RESULT_KEY, data);
      renderAllResults(data);
      setProgress(100);
      worker.terminate();
      return;
    }
    if (msg.cmd === 'done') {
      const data: LastResult = {
        optimistic: msg.result,
        pessimistic: msg.result,
        successThreshold: inputs.successThreshold,
        inputs,
      };
      save(LAST_RESULT_KEY, data);
      renderAllResults(data);
      setProgress(100);
      worker.terminate();
      return;
    }
    if (msg.cmd === 'error') {
      showError(msg.message);
      setProgress(100);
      worker.terminate();
      return;
    }
  };

  worker.onerror = (err: ErrorEvent): void => {
    showError(err.message || 'Worker crashed');
    setProgress(100);
    worker.terminate();
  };

  const req: WorkerRequest = {
    cmd: 'runBoth',
    userInputs: inputs,
    assumption: DEFAULT_ASSUMPTION,
    seed: Math.floor(Math.random() * 1e9),
    trials: inputs.monteCarloTrials,
  };
  worker.postMessage(req);
}

export function bootstrap(): void {
  const inputsTab = document.querySelector<HTMLElement>('#inputs-tab');
  const drawdownTab = document.querySelector<HTMLElement>('#drawdown-tab');
  const referencesTab = document.querySelector<HTMLElement>('#references-tab');

  if (inputsTab) {
    mountForm(inputsTab, runSimulation);
  }
  if (drawdownTab) {
    mountDrawdownPage(drawdownTab);
  }
  if (referencesTab) {
    mountMethodologyPage(referencesTab);
  }

  function handleHash(): void {
    const methMatch = /^#references\/(.+)$/.exec(location.hash);
    if (methMatch && methMatch[1]) {
      switchTab('references');
      deepLinkToMethodology(methMatch[1]);
      return;
    }
    const tabMatch = /^#(inputs|results|drawdown|references)$/.exec(location.hash);
    if (tabMatch) {
      switchTab(tabMatch[1] as TabId);
    }
  }
  window.addEventListener('hashchange', handleHash);
  handleHash();

  document.querySelectorAll<HTMLElement>('.tab').forEach((el) => {
    el.addEventListener('click', () => {
      const target = el.dataset.tab as TabId;
      if (target) {
        history.pushState(null, '', '#' + target);
        switchTab(target);
      }
    });
  });

  const last = restore<LastResult | null>(LAST_RESULT_KEY, null);
  if (last) {
    renderAllResults(last);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
