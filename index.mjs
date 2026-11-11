// doxt-stock — DeepSeek Harness (DSH) plugin
// Verifiable US-stock judgment data from doxt.com's public, append-only ledger.
// Public data only: no user data, no credentials, no trading. MIT.
// Ledger: https://doxt.com/ledger — every response carries its verify URL.
import { defineTool } from '@deepseek-ai/dsh-tools';

const BASE = process.env.DOXT_STOCK_API || 'https://doxt.com';

async function getJson(exec, urlPath) {
  const r = await fetch(BASE + urlPath, { signal: exec.signal });
  const j = await r.json().catch(() => null);
  return j && j.ok === true ? j.data : null;
}

const DISCLAIMER =
  '\nProbabilistic research record — not investment advice. Verify every claim: doxt.com/ledger';

export const name = 'doxt-stock-tools';
export const inject = ['tools'];

export function apply(ctx) {
  ctx.tools.register(defineTool({
    name: 'doxt_judgments',
    description:
      'Recent public AI judgments for a covered US ticker from the doxt.com append-only ledger: ' +
      'direction (bullish/bearish/neutral), confidence, thesis head, entry/exit dates and settlement status. ' +
      'Use whenever the user asks what the model says about a stock or wants the ledger citation. ' +
      'Always keep the ledger URL from the response in your answer so readers can verify.',
    parameters: {
      ticker: { type: 'string', required: true, description: 'US ticker, e.g. AAPL' },
      limit: { type: 'number', description: '1-10 judgments (default 3)' },
    },
    output: { schema: { type: 'string' }, render: (_a, v) => [{ type: 'text', text: v }] },
    async execute(args, exec) {
      const t = String(args.ticker || '').trim().toUpperCase().replace(/[^A-Z.]/g, '');
      if (!/^[A-Z.]{1,6}$/.test(t)) return 'Invalid ticker';
      const limit = Math.min(Math.max(Number(args.limit) || 3, 1), 10);
      const d = await getJson(exec, `/api/predictions?instrument=us_${t.toLowerCase()}&model_version=llm-v1&limit=${limit}`);
      if (!d) return `No public ledger data for ${t} yet.`;
      const rows = Array.isArray(d) ? d : [];
      if (!rows.length) return `No public judgments for ${t} yet. Ledger: https://doxt.com/${t}`;
      return 'Ledger URL: https://doxt.com/' + t + '\n' +
        rows.map((p) => `${(p.decided_date || '').slice(0, 10)} ${String(p.direction).toUpperCase()} ${p.confidence}% ` +
          `[${p.entry_date} → ${p.exit_date}] ${String(p.thesis || '').slice(0, 200)}`).join('\n');
    },
  }));

  ctx.tools.register(defineTool({
    name: 'doxt_track_record',
    description:
      'The model\'s REAL settled track record for one ticker (or whole ledger): hit rate, coverage, ' +
      'confidence buckets — insufficient samples are labeled honestly instead of showing fake percentages. ' +
      'Use for "how accurate is the model on AAPL" / 模型战绩 questions.',
    parameters: { ticker: { type: 'string', description: 'Optional US ticker; omit for whole-ledger stats' } },
    output: { schema: { type: 'string' }, render: (_a, v) => [{ type: 'text', text: v }] },
    async execute(args, exec) {
      const q = args.ticker ? '&ticker=' + encodeURIComponent(String(args.ticker).toUpperCase()) : '';
      const d = await getJson(exec, '/api/track-record?scope=public' + q);
      if (!d) return 'Track record lookup failed.';
      const s = d.sample || {};
      const hr = d.hitRate || {};
      return [
        d.disclaimer || 'Simulated results. Past performance does not guarantee future results.',
        `sample: settled ${s.settled} (hit ${s.hit} / miss ${s.miss} / flat ${s.flat} / voided ${s.voided ?? 0} / invalidated ${s.invalidated ?? 0}) · pending ${s.pending ?? 'n/a'}`,
        `hit rate: ${hr.value == null ? hr.label || 'insufficient sample' : (hr.value * 100).toFixed(1) + '%'} · coverage: ${d.coverage == null ? '—' : (d.coverage * 100).toFixed(1) + '%'}`,
        'Ledger: https://doxt.com/ledger',
      ].join('\n');
    },
  }));

  ctx.tools.register(defineTool({
    name: 'doxt_verify',
    description:
      'Verify the integrity of the doxt.com public judgment ledger: hash-chain verification proving ' +
      'no published judgment was ever edited or deleted. Use when the user asks whether the record can be trusted, ' +
      'or wants to cite the ledger as evidence.',
    parameters: {},
    output: { schema: { type: 'string' }, render: (_a, v) => [{ type: 'text', text: v }] },
    async execute(args, exec) {
      const d = await getJson(exec, '/api/ledger/public-verify');
      if (!d) return 'Verification lookup failed.';
      return JSON.stringify(d).slice(0, 400) + '\nVerify yourself: https://doxt.com/api/ledger/public-verify';
    },
  }));
}
