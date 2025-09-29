// packages/validation/src/rules/netfileEligibility.ts
import { Diagnostic } from "../index";

export function epsEligibility(ctx: any): Diagnostic[] {
  const diags: Diagnostic[] = [];

  if (ctx?.returnType === "BANKRUPTCY") {
    diags.push({ code: "EPS-ELIG-001", severity: "ERROR", message: "Bankruptcy returns are not eligible for NETFILE." });
  }
  if (ctx?.residency === "NON_RESIDENT") {
    diags.push({ code: "EPS-ELIG-002", severity: "ERROR", message: "Non-resident returns are not eligible for NETFILE." });
  }
  if (ctx?.disabilityFirstTimeClaim && !ctx?.t2201OnFile) {
    diags.push({
      code: "EPS-ELIG-003",
      severity: "ERROR",
      message: "First-time disability amount claim requires an approved T2201 on file or pending with CRA."
    });
  }
  return diags;
}
