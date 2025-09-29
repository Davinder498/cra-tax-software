import express from 'express';
import helmet from 'helmet';
import { z } from 'zod';
import { compute } from '@app/calc-engine/src/index';
import { validateEPS } from '@app/validation/src/index';
import { buildNetfilePayload } from '@app/payload-netfile/src/builder';

const app = express();
app.use(helmet());
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => res.json({ ok:true }));

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

app.post('/compute', (req, res) => {
  const parsed = inputSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const diags = validateEPS(req.body);
  if (diags.some(d=>d.severity==='ERROR')) return res.status(422).json({ diagnostics: diags });
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
  console.log(`Backend listening on :${PORT}`);
});
