// packages/validation/src/rules/rrspRoom.ts
import { Diagnostic } from "../index";

export function epsRRSP(ctx: any): Diagnostic[] {
  const diags: Diagnostic[] = [];
  const claimed = Number(ctx?.rrsp?.deduction ?? 0);
  const room = Number(ctx?.rrsp?.availableRoom ?? 0);
  if (claimed > room) {
    diags.push({
      code: "EPS-RRSP-001",
      severity: "ERROR",
      message: `RRSP deduction (${claimed.toFixed(2)}) exceeds available room (${room.toFixed(2)}).`,
      fixHint: "Lower the deduction to your RRSP room shown on your CRA notice."
    });
  }
  return diags;
}
