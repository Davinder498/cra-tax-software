// packages/validation/src/rules/ageAmount.ts
import { Diagnostic } from "../index";

function ageOnDec31(dobISO: string, year: number): number {
  const d = new Date(dobISO); const y = year;
  const dec31 = new Date(`${y}-12-31T00:00:00Z`);
  let age = dec31.getUTCFullYear() - d.getUTCFullYear();
  const m = dec31.getUTCMonth() - d.getUTCMonth();
  if (m < 0 || (m === 0 && dec31.getUTCDate() < d.getUTCDate())) age--;
  return age;
}

export function epsAgeAmount(ctx: any): Diagnostic[] {
  const diags: Diagnostic[] = [];
  const year = ctx?.year;
  const dob = ctx?.taxpayer?.dob;
  const claimingAgeAmount = !!ctx?.credits?.ageAmount;

  if (!claimingAgeAmount) return diags;
  if (!dob || !year) {
    diags.push({ code: "EPS-AGE-000", severity: "ERROR", message: "Age credit claimed but DOB/year missing." });
    return diags;
  }
  if (ageOnDec31(dob, year) < 65) {
    diags.push({
      code: "EPS-AGE-001",
      severity: "ERROR",
      message: "Age Amount can only be claimed if the taxpayer is 65 or older on Dec 31.",
      fixHint: "Remove the claim or verify date of birth."
    });
  }
  return diags;
}
