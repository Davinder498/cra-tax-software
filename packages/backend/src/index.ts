import express from 'express';
import helmet from 'helmet';
import { z } from 'zod';

// Import from source during dev (tsx). If you later run compiled code, switch to package roots.
import { compute } from '@app/calc-engine/src/index';
import { validateEPS, type Diagnostic } from '@app/validation/src/index';
import { buildNetfilePayload } from '@app/payload-netfile/src/builder';

const app = express();
app.use(helmet());
app.use(express.json({ limit: '1mb' }));

// Health check
app.get('/health', (_req, res) => res.json({ ok: true }));

// Minimal homepage to exercise /compute from the browser
app.get('/', (_req, res) => {
  res.type('html').send(`
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>CRA EPS Demo</title>
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <style>
      :root { color-scheme: light dark; }
      body { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; margin: 24px; max-width: 960px; }
      h1 { margin: 0 0 8px; }
      label { font-size: 14px; opacity: .8; margin-bottom: 4px; }
      input, button { font: inherit; padding: 10px 12px; }
      input { width: 100%; border: 1px solid #8883; border-radius: 8px; background: #3334; }
      .grid { display: grid; gap: 12px; grid-template-columns: repeat(2, 1fr); }
      .row { display:flex; flex-direction:column; }
      button { border-radius: 10px; border: 1px solid #8883; cursor: pointer; margin-right: 8px; }
      pre { background: #0b1020; color: #dfe6ff; padding: 12px; overflow:auto; border-radius: 10px; }
      code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
    </style>
  </head>
  <body>
    <h1>CRA EPS Demo</h1>
    <p>This page calls <code>/compute</code> and shows diagnostics + computed tax.</p>

    <div class="grid">
      <div class="row"><label>SIN</label><input id="sin" value="046454286" /></div>
      <div class="row"><label>Province</label><input id="prov" value="AB" /></div>
      <div class="row"><label>Postal Code</label><input id="pc" value="T2P1A1" /></div>
      <div class="row"><label>Address line 1</label><input id="line1" value="1 Main St" /></div>
      <div class="row"><label>City</label><input id="city" value="Calgary" /></div>
      <div class="row"><label>Employment income</label><input id="inc" type="number" value="65000" /></div>
      <div class="row"><label>RRSP deduction</label><input id="rrsp" type="number" value="3000" /></div>
      <div class="row"><label>RRSP room</label><input id="room" type="number" value="5000" /></div>
    </div>

    <p style="margin-top:16px;">
      <button id="run">Run EPS + compute</button>
      <button id="bad">Trigger EPS error (RRSP > room)</button>
    </p>

    <h3>Response</h3>
    <pre id="out">{}</pre>

    <script>
      function buildBody(rrspOver=false){
        const prov = document.getElementById('prov').value;
        return {
          year: 2025,
          taxpayer: {
            sin: document.getElementById('sin').value,
            firstName: "Alex",
            lastName: "Doe",
            dob: "1990-07-15",
            province: prov,
            address: {
              line1: document.getElementById('line1').value,
              city: document.getElementById('city').value,
              province: prov,
              postalCode: document.getElementById('pc').value
            }
          },
          income: { employmentIncome: Number(document.getElementById('inc').value) },
          rrsp: {
            deduction: Number(document.getElementById('rrsp').value) + (rrspOver ? 10000 : 0),
            availableRoom: Number(document.getElementById('room').value)
          },
          credits: {},
          env: { returnsFiledOnThisDevice: 0 },
          returnType: "STANDARD",
          residency: "RESIDENT"
        };
      }

      async function callCompute(body){
        const resp = await fetch('/compute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        const text = await resp.text();
        document.getElementById('out').textContent =
          (resp.status + ' ' + resp.statusText + '\\n\\n') + text;
      }

      document.getElementById('run').addEventListener('click', ()=>callCompute(buildBody(false)));
      document.getElementById('bad').addEventListener('click', ()=>callCompute(buildBody(true)));
    </script>
  </body>
</html>`);
});

// ===== Zod schema for /compute =====
const inputSchema = z.object({
  year: z.number().optional(),
  taxpayer: z.object({
    sin: z.string().min(1),
    firstName: z.string(),
    lastName: z.string(),
    dob: z.string().optional(),
    province: z.string(),
    address: z.object({
      line1: z.string(),
      city: z.string(),
      province: z.string(),
      postalCode: z.string()
    })
  }),
  income: z.object({
    employmentIncome: z.number(),
    otherIncome: z.number().optional()
  }),
  credits: z.record(z.any()).optional(),
  rrsp: z.object({
    deduction: z.number().optional(),
    availableRoom: z.number().optional()
  }).optional(),
  env: z.object({
    returnsFiledOnThisDevice: z.number().optional()
  }).optional(),
  returnType: z.string().optional(),
  residency: z.string().optional(),
  disabilityFirstTimeClaim: z.boolean().optional()
});

// ===== Routes =====
app.post('/compute', (req, res) => {
  const parsed = inputSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const diags = validateEPS(req.body);
  if (diags.some((d: Diagnostic) => d.severity === 'ERROR')) {
    return res.status(422).json({ diagnostics: diags });
  }

  const computed = compute({
    province: req.body.taxpayer.province,
    employmentIncome: req.body.income.employmentIncome,
    otherIncome: req.body.income.otherIncome,
    rrspDeduction: req.body.rrsp?.deduction
  });

  return res.json({ computed, diagnostics: diags });
});

app.post('/netfile/prepare', (req, res) => {
  const meta = { softwareVendor: 'YourCo', softwareVersion: '0.1.1', environment: 'test' as const };
  const payload = buildNetfilePayload(req.body, meta);
  res.json({ payload });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(\`Backend listening on :\${PORT}\`);
});

