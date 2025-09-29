/**
 * NETFILE payload builder (placeholder).
 * Replace with CRA-provided field names and record/XML layouts after NDA.
 */
export interface NetfileMeta {
  softwareVendor: string;
  softwareVersion: string;
  environment: 'test'|'prod';
}
export function buildNetfilePayload(input: any, meta: NetfileMeta) {
  const payload = {
    transmittal: {
      vendor: meta.softwareVendor,
      version: meta.softwareVersion,
      environment: meta.environment,
      timestamp: new Date().toISOString()
    },
    taxpayer: {
      sinMasked: (input?.taxpayer?.sin ?? '').replace(/(\d{3})(\d{3})(\d{3})/, '***-***-$3'),
      name: `${input?.taxpayer?.firstName ?? ''} ${input?.taxpayer?.lastName ?? ''}`.trim(),
      province: input?.taxpayer?.province,
    },
    figures: {
      netIncome: input?.computed?.netIncome ?? 0,
      taxableIncome: input?.computed?.taxableIncome ?? 0,
      federalTax: input?.computed?.federalTax ?? 0,
      provincialTax: input?.computed?.provincialTax ?? 0,
      totalPayable: input?.computed?.totalPayable ?? 0
    }
  };
  return payload;
}
