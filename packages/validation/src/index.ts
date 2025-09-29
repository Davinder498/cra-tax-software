export type Severity = 'ERROR'|'WARN'|'INFO';
export interface Diagnostic { code:string; severity:Severity; message:string; fixHint?:string; path?:string; }

import { epsSIN } from "./rules/sin";
import { epsPostalProvince } from "./rules/postalProvince";
import { epsAgeAmount } from "./rules/ageAmount";
import { epsRRSP } from "./rules/rrspRoom";
import { epsEligibility } from "./rules/netfileEligibility";
import { epsReturnLimit } from "./rules/returnLimit";

export function validateEPS(ctx: any): Diagnostic[] {
  const diags: Diagnostic[] = [];
  diags.push(...epsSIN(ctx?.taxpayer));
  diags.push(...epsPostalProvince(ctx?.taxpayer));
  diags.push(...epsAgeAmount(ctx));
  diags.push(...epsRRSP(ctx));
  diags.push(...epsEligibility(ctx));
  diags.push(...epsReturnLimit(ctx?.env ?? {}));
  return diags;
}
