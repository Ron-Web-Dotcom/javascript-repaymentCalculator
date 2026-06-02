# Loan Repayment Calculator

A client-side web application that generates a full amortisation schedule from four inputs: loan amount, installment amount, interest rate, and start date. No server or build step required — open the HTML file directly in any browser.

---

## Features

| Category | Feature |
|---|---|
| **Form** | Loan Amount, Installment Amount, Interest Rate (with % addon), Installment Interval (Daily / Weekly / Monthly), Date Picker |
| **Validation** | Real-time inline error messages for all five fields |
| **Business Logic** | Weekend-skipping payment dates, interest calculated per interval, final installment capped to remaining balance |
| **Results** | Summary stats card (Loan Amount, Total Paid, Total Interest, No. of Payments, Payoff Date) |
| **Chart** | Doughnut chart showing Principal vs Total Interest split |
| **Schedule** | Full repayment schedule table (Event, Date, Loan, Payment, Interest, Principal, Balance) |
| **Export** | Export schedule to CSV (client-side Blob download) |
| **Print** | Print-friendly layout (hides form and nav via `@media print`) |
| **Reset** | Clears all inputs and results in one click |
| **Responsive** | Mobile-first layout; table reflows to labelled rows on narrow screens |

---

## Tech Stack

| Library | Version | Purpose |
|---|---|---|
| Bootstrap | 4.5.2 | Grid layout, form controls, utility classes |
| jQuery | 3.5.1 | DOM manipulation, event handling, animation |
| Bootstrap Datepicker | 1.4.1 | Calendar widget for start date |
| Chart.js | 3.9.1 | Doughnut chart (Principal vs Interest) |
| Font Awesome | 4.7.0 | Icons on Print and Export buttons |

---

## File Structure

```
javascript-repaymentCalculator/
├── README.md
└── UplyftCaptial Assesement/
    ├── Loancalculator.html       # Main entry point
    ├── logo.png                  # Navbar brand image
    ├── background.png            # Page background image
    ├── css/
    │   └── layout.css            # Custom styles (layout, summary card, chart, print, responsive table)
    └── javascript/
        └── function.js           # All application logic (validation, calculation, rendering)
```

---

## How to Run

1. Clone or download this repository.
2. Open `UplyftCaptial Assesement/Loancalculator.html` in any modern browser.
3. All dependencies are loaded from CDN — an internet connection is required on first load.

---

## Usage Example

**Inputs**

| Field | Value |
|---|---|
| Loan Amount | $5,000.00 |
| Installment Amount | $500.00 |
| Interest Rate | 6% |
| Interval | Monthly |
| Start Date | 01/01/2024 |

**Summary Card (output)**

| Stat | Value |
|---|---|
| Loan Amount | $5,000.00 |
| Total Paid | $5,164.92 |
| Total Interest | $164.92 |
| No. of Payments | 11 |
| Payoff Date | November 4, 2024 |

**First three rows of schedule**

| Event | Date | $ Loan | $ Payment | $ Interest | $ Principal | $ Balance |
|---|---|---|---|---|---|---|
| Payment 1 | Monday, February 5, 2024 | 5000.00 | 500.00 | 25.00 | 475.00 | 4525.00 |
| Payment 2 | Monday, March 4, 2024 | 4525.00 | 500.00 | 22.63 | 477.38 | 4047.62 |
| Payment 3 | Monday, April 1, 2024 | 4047.62 | 500.00 | 20.24 | 479.76 | 3567.86 |

> Interest formula: `(loanBalance × annualRate) / 12` for Monthly, `/ 48` for Weekly, `/ 336` for Daily.

---

## Browser Support

Chrome, Firefox, Edge, Safari (any version released after 2019).

---

## Author

Ron Taylor — March 2021  
Maintained and extended 2024–2026.
