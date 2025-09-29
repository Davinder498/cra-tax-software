// packages/validation/src/rules/postalProvince.ts
import { Diagnostic } from "../index";

const PROV_FSA: Record<string, RegExp> = {
  "AB": /^[T]/i,
  "BC": /^[V]/i,
  "MB": /^[R]/i,
  "NB": /^[E]/i,
  "NL": /^[A]/i,
  "NS": /^[B]/i,
  "NT": /^[X]/i,
  "NU": /^[X]/i,
  "ON": /^[KLMNP]/i,
  "PE": /^[C]/i,
  "QC": /^[GHJ]/i,
  "SK": /^[S]/i,
  "YT": /^[Y]/i
};

export function epsPostalProvince(taxpayer: any): Diagnostic[] {
  const diags: Diagnostic[] = [];
  const prov = taxpayer?.province;
  const pc = (taxpayer?.address?.postalCode ?? "").replace(/\s/g, "");
  if (!prov || !pc) return diags;
  const fsa = pc[0] ?? "";
  const re = PROV_FSA[prov];
  if (re && !re.test(fsa)) {
    diags.push({
      code: "EPS-ADDR-002",
      severity: "WARN",
      message: `Postal code does not appear to match province ${prov}.`,
      fixHint: "Confirm province of residence on Dec 31 and postal code (A1A 1A1).",
      path: "taxpayer.address.postalCode"
    });
  }
  return diags;
}
