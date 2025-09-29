export type Money = number;
export interface TaxTables {
  federal: { brackets: {upTo:number|null, rate:number}[], basicPersonalAmount:number };
  provincial: Record<string,{ brackets:{upTo:number|null, rate:number}[], basicPersonalAmount:number }>;
  year: number;
}
export interface Inputs {
  province: string;
  employmentIncome: Money;
  otherIncome?: Money;
  rrspDeduction?: Money;
  nonRefundableCredits?: Money; // placeholder
}
export interface Computed {
  netIncome: Money;
  taxableIncome: Money;
  federalTax: Money;
  provincialTax: Money;
  totalPayable: Money;
}
import tables from './taxTables/2025.json' assert { type: 'json' };
const T = tables as unknown as TaxTables;

function taxFromBrackets(amount: Money, brackets: {upTo:number|null, rate:number}[]): Money {
  let remaining = amount;
  let lastCap = 0;
  let tax = 0;
  for (const b of brackets) {
    const cap = b.upTo ?? Number.POSITIVE_INFINITY;
    const span = Math.max(0, Math.min(remaining, cap - lastCap));
    if (span > 0) {
      tax += span * b.rate;
      remaining -= span;
      lastCap = cap;
    }
    if (remaining <= 0) break;
  }
  return Math.max(0, Math.round(tax*100)/100);
}

export function compute(inputs: Inputs): Computed {
  const gross = (inputs.employmentIncome ?? 0) + (inputs.otherIncome ?? 0);
  const rrsp = Math.min(inputs.rrspDeduction ?? 0, gross);
  const netIncome = gross; // refine with allowable adjustments
  const taxableIncome = Math.max(0, netIncome - rrsp);

  const federalBase = Math.max(0, taxableIncome - T.federal.basicPersonalAmount);
  const provincial = T.provincial[inputs.province] ?? T.provincial['AB'];
  const provincialBase = Math.max(0, taxableIncome - provincial.basicPersonalAmount);

  const federalTax = taxFromBrackets(federalBase, T.federal.brackets);
  const provincialTax = taxFromBrackets(provincialBase, provincial.brackets);

  const totalPayable = Math.max(0, Math.round((federalTax + provincialTax)*100)/100);
  return { netIncome, taxableIncome, federalTax, provincialTax, totalPayable };
}
