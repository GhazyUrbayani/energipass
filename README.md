# EnergiPass MVP

Dependency-free frontend MVP for **EnergiPass — Green Vendor Passport for Indonesia’s Energy Supply Chain**.

## Run

From this directory:

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

No npm install or backend is required.

## Included

- Beranda with active tender, readiness summary, action list, and recent evidence activity
- Tender Gap Checker with searchable/filterable requirement table
- Evidence Library with search, category/status/validity filters, and evidence detail drawer
- Tender Pack with readiness by category and simulated Generate Tender Pack interaction
- Tender switching between two fictional tender examples
- Traceability fields: source, version, effective date, expiry, last updated
- Accessibility basics: labels, keyboard-focus states, status text plus color, skip link, semantic tables, responsive layout
- Explicit positioning that EnergiPass does not replace CIVD, buyer VMS, or official procurement systems

## Data

All companies/tenders are fictional demonstration data. References such as “Buyer VMS” are mock evidence-source labels and do not imply integrations or endorsements.

## Framework note

The brief preferred Next.js + TypeScript + Tailwind. This delivered build is deliberately dependency-free because the current execution environment cannot reach the npm registry. The app is structured as a small SPA and can be migrated to Next.js components later without changing the product model.
