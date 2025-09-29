// packages/validation/src/rules/returnLimit.ts
import { Diagnostic } from "../index";

export function epsReturnLimit(env: { returnsFiledOnThisDevice: number }): Diagnostic[] {
  const diags: Diagnostic[] = [];
  if ((env?.returnsFiledOnThisDevice ?? 0) >= 20) {
    diags.push({
      code: "EPS-LIMIT-020",
      severity: "ERROR",
      message: "Return limit reached: You can file a maximum of 20 returns per device/account.",
      fixHint: "Use a professional EFILE product or another account as permitted."
    });
  }
  return diags;
}
