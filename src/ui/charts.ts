import { Chart, type ChartConfiguration } from 'chart.js/auto';
import type { YearOutcome, SimResult } from '../types.js';

export function portfolioBandChart(
  ctx: HTMLCanvasElement,
  result: SimResult,
): Chart {
  const labels = result.p50.map(o => o.age);
  
  const p10Data = result.p10.map(o => Object.values(o.balancesByAccount).reduce((a, b) => a + b, 0));
  const p50Data = result.p50.map(o => Object.values(o.balancesByAccount).reduce((a, b) => a + b, 0));
  const p90Data = result.p90.map(o => Object.values(o.balancesByAccount).reduce((a, b) => a + b, 0));

  const config: ChartConfiguration = {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'P90',
          data: p90Data,
          borderColor: 'transparent',
          backgroundColor: 'transparent',
          fill: false,
          pointRadius: 0,
          pointHoverRadius: 0,
        },
        {
          label: 'P50',
          data: p50Data,
          borderColor: '#3b82f6',
          backgroundColor: 'transparent',
          fill: false,
          tension: 0.1,
        },
        {
          label: 'P10',
          data: p10Data,
          borderColor: 'transparent',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: '-2', // Fill to P90
          pointRadius: 0,
          pointHoverRadius: 0,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          display: true,
        },
        tooltip: {
          enabled: true,
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Age'
          }
        },
        y: {
          title: {
            display: true,
            text: 'Portfolio Value (USD)'
          },
          beginAtZero: true
        }
      }
    }
  };

  return new Chart(ctx, config);
}

export function withdrawalSourceChart(
  ctx: HTMLCanvasElement,
  p50: readonly YearOutcome[],
): Chart {
  const labels = p50.map(o => o.age);
  
  const sources = ['Cash', 'TaxableBasis', 'TaxableGain', 'TraditionalIRA', 'Roth', 'HSA'] as const;
  const colors: Record<typeof sources[number], string> = {
    Cash: '#94a3b8',
    TaxableBasis: '#3b82f6',
    TaxableGain: '#60a5fa',
    TraditionalIRA: '#f59e0b',
    Roth: '#10b981',
    HSA: '#8b5cf6'
  };

  const datasets = sources.map(source => {
    return {
      label: source,
      data: p50.map(o => {
        let sum = 0;
        for (const rem of o.remittances) {
          if (rem.sourceType === source) {
            sum += rem.amountUsd;
          }
        }
        return sum;
      }),
      backgroundColor: colors[source],
    };
  });

  const config: ChartConfiguration = {
    type: 'bar',
    data: {
      labels,
      datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
        },
        tooltip: {
          mode: 'index',
          intersect: false,
        }
      },
      scales: {
        x: {
          stacked: true,
          title: {
            display: true,
            text: 'Age'
          }
        },
        y: {
          stacked: true,
          title: {
            display: true,
            text: 'Withdrawal Amount (USD)'
          },
          beginAtZero: true
        }
      }
    }
  };

  return new Chart(ctx, config);
}
