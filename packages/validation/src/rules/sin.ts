// packages/validation/src/rules/sin.ts
import { Diagnostic } from "../index";

const luhn = (digits: string) => {
  let sum = 0, alt = false as unknown as boolean;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = Number(digits[i]);
    if (alt) { n *= 2; if (n > 9) n -= 9; }
    sum += n; alt = !alt;
  }
  return sum % 10 === 0;
};

export function epsSIN(taxpayer: any): Diagnostic[] {
  const diags: Diagnostic[] = [];
  const sin = (taxpayer?.sin ?? "").replace(/\s|-/g, "");
  if (!/^\d{9}$/.test(sin)) {
    diags.push({
      code: "EPS-SIN-001",
      severity: "ERROR",
      message: "SIN must be exactly 9 digits (no spaces or dashes).",
      fixHint: "Enter a 9-digit SIN like 123456789."
    });
    return diags;
  }
  if (!luhn(sin)) {
    diags.push({
      code: "EPS-SIN-002",
      severity: "ERROR",
      message: "SIN checksum invalid.",
      fixHint: "Verify the SIN digits."
    });
  }
  return diags;
}
