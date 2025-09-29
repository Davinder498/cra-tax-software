import { compute } from '@app/calc-engine/src/index';
import { validateEPS } from '@app/validation/src/index';
import { buildNetfilePayload } from '@app/payload-netfile/src/builder';

const sample = {
  year: 2025,
  taxpayer: {
    sin: '046454286',
    firstName: 'Alex',
    lastName: 'Doe',
    dob: '1990-07-15',
    province: 'AB',
    address: { line1: '1 Main St', city: 'Calgary', province: 'AB', postalCode: 'M5V 2T6' }
  },
  credits: { ageAmount: true },
  rrsp: { deduction: 5000, availableRoom: 3000 },
  returnType: 'STANDARD',
  residency: 'RESIDENT',
  disabilityFirstTimeClaim: false,
  env: { returnsFiledOnThisDevice: 19 },
  income: { employmentIncome: 65000 }
};

// EPS diagnostics (includes some expected ERRORS/WARNINGS for demo)
const diagnostics = validateEPS(sample);

// Compute taxes using placeholder tables
const computed = compute({
  province: sample.taxpayer.province,
  employmentIncome: sample.income.employmentIncome,
  otherIncome: 0,
  rrspDeduction: sample.rrsp.deduction
});

// Build placeholder NETFILE payload
const payload = buildNetfilePayload({ taxpayer: sample.taxpayer, computed }, {
  softwareVendor: 'YourCo',
  softwareVersion: '0.1.1',
  environment: 'test'
});

console.log('Diagnostics:', diagnostics);
console.log('Computed:', computed);
console.log('Payload (placeholder):', payload);
