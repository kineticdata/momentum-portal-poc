/**
 * Seed demo data for the Commercial Lending POC.
 * Uses PATCH (import) to avoid triggering workflows.
 *
 * Usage: node scripts/seed-demo-data.mjs
 */

import { createApiClient } from './lib/api-client.mjs';

const server = process.env.KINETIC_SERVER_URL || 'https://publicis-dev.kinops.io';
const user = process.env.KINETIC_USERNAME || '';
const pass = process.env.KINETIC_PASSWORD || '';
const kappSlug = 'commercial-lending';

const client = createApiClient({
  baseUrl: `${server}/app/api/v1`,
  username: user,
  password: pass,
});

const now = new Date();
const daysAgo = (n) => new Date(now - n * 86400000).toISOString();

// Demo loan applications at various stages
const loanApplications = [
  {
    values: {
      'Borrower Name': 'Meridian Technologies Pvt Ltd',
      'Business Registration Number': 'U72200MH2018PTC123456',
      'Business Type': 'Private Limited',
      'Industry Sector': 'Technology',
      'Years in Business': '8',
      'Annual Revenue': '45,000,000',
      'Contact Email': 'cfo@meridiantech.com',
      'Contact Phone': '+91 98765 43210',
      'Loan Type': 'Term Loan',
      'Loan Amount': '5,000,000',
      'Loan Purpose': 'Expansion of data center infrastructure and hiring of engineering talent for new AI product line.',
      'Requested Tenure Months': '60',
      'Collateral Type': 'Property',
      'Collateral Value': '8,000,000',
      'Status': 'Open',
      'Stage': 'Approval',
      'Risk Level': 'Low',
      'Risk Score': '82',
      'STP Eligible': 'No',
      'AI Confidence Score': '94',
      'Assigned Team': 'Commercial Lending::Credit Officers',
    },
    coreState: 'Draft',
    createdAt: daysAgo(12),
    submittedAt: daysAgo(12),
  },
  {
    values: {
      'Borrower Name': 'Greenfield Agro Industries',
      'Business Registration Number': 'U01100KA2015PTC234567',
      'Business Type': 'Public Limited',
      'Industry Sector': 'Agriculture',
      'Years in Business': '11',
      'Annual Revenue': '120,000,000',
      'Contact Email': 'finance@greenfieldagro.in',
      'Contact Phone': '+91 87654 32109',
      'Loan Type': 'Working Capital',
      'Loan Amount': '15,000,000',
      'Loan Purpose': 'Seasonal working capital for procurement of raw materials during harvest season.',
      'Requested Tenure Months': '12',
      'Collateral Type': 'Inventory',
      'Collateral Value': '20,000,000',
      'Status': 'Open',
      'Stage': 'Credit Assessment',
      'Risk Level': 'Medium',
      'Risk Score': '68',
      'STP Eligible': 'No',
      'AI Confidence Score': '87',
      'Assigned Team': 'Commercial Lending::Credit Officers',
    },
    coreState: 'Draft',
    createdAt: daysAgo(8),
    submittedAt: daysAgo(8),
  },
  {
    values: {
      'Borrower Name': 'Horizon Healthcare Solutions',
      'Business Registration Number': 'U85110DL2020PTC345678',
      'Business Type': 'Private Limited',
      'Industry Sector': 'Healthcare',
      'Years in Business': '6',
      'Annual Revenue': '28,000,000',
      'Contact Email': 'admin@horizonhealth.com',
      'Contact Phone': '+91 76543 21098',
      'Loan Type': 'Term Loan',
      'Loan Amount': '8,500,000',
      'Loan Purpose': 'Purchase of advanced diagnostic imaging equipment for new hospital wing.',
      'Requested Tenure Months': '48',
      'Collateral Type': 'Machinery',
      'Collateral Value': '10,000,000',
      'Status': 'Open',
      'Stage': 'Document Verification',
      'Risk Level': 'Low',
      'Risk Score': '79',
      'STP Eligible': 'No',
      'AI Confidence Score': '72',
      'Assigned Team': 'Commercial Lending::Compliance Officers',
    },
    coreState: 'Draft',
    createdAt: daysAgo(5),
    submittedAt: daysAgo(5),
  },
  {
    values: {
      'Borrower Name': 'Pinnacle Constructions Ltd',
      'Business Registration Number': 'U45200TN2012PLC456789',
      'Business Type': 'Public Limited',
      'Industry Sector': 'Infrastructure',
      'Years in Business': '14',
      'Annual Revenue': '250,000,000',
      'Contact Email': 'treasury@pinnacleconst.com',
      'Contact Phone': '+91 65432 10987',
      'Loan Type': 'Term Loan',
      'Loan Amount': '50,000,000',
      'Loan Purpose': 'Bridge financing for government highway construction project Phase III.',
      'Requested Tenure Months': '36',
      'Collateral Type': 'Receivables',
      'Collateral Value': '65,000,000',
      'Status': 'Open',
      'Stage': 'Fraud Check',
      'Risk Level': 'High',
      'Risk Score': '45',
      'Fraud Flags': 'Multiple directorship overlap detected; Revenue spike inconsistency',
      'STP Eligible': 'No',
      'AI Confidence Score': '61',
      'Assigned Team': 'Commercial Lending::Fraud Analysts',
    },
    coreState: 'Draft',
    createdAt: daysAgo(6),
    submittedAt: daysAgo(6),
  },
  {
    values: {
      'Borrower Name': 'Nova Retail Group',
      'Business Registration Number': 'U52100GJ2019PTC567890',
      'Business Type': 'Private Limited',
      'Industry Sector': 'Retail',
      'Years in Business': '7',
      'Annual Revenue': '18,000,000',
      'Contact Email': 'accounts@novaretail.in',
      'Contact Phone': '+91 54321 09876',
      'Loan Type': 'Working Capital',
      'Loan Amount': '3,000,000',
      'Loan Purpose': 'Inventory stocking for festive season and new store launch.',
      'Requested Tenure Months': '6',
      'Collateral Type': 'Fixed Deposits',
      'Collateral Value': '3,500,000',
      'Status': 'Open',
      'Stage': 'Pre-Screening',
      'Risk Level': 'Low',
      'Risk Score': '85',
      'STP Eligible': 'Yes',
      'AI Confidence Score': '96',
      'Assigned Team': 'Commercial Lending::Relationship Managers',
    },
    coreState: 'Draft',
    createdAt: daysAgo(2),
    submittedAt: daysAgo(2),
  },
  {
    values: {
      'Borrower Name': 'Atlas Manufacturing Co',
      'Business Registration Number': 'U28100MH2016PTC678901',
      'Business Type': 'Partnership',
      'Industry Sector': 'Manufacturing',
      'Years in Business': '10',
      'Annual Revenue': '75,000,000',
      'Contact Email': 'director@atlasmfg.com',
      'Contact Phone': '+91 43210 98765',
      'Loan Type': 'Term Loan',
      'Loan Amount': '25,000,000',
      'Loan Purpose': 'Modernization of production line with automated CNC machinery.',
      'Requested Tenure Months': '72',
      'Collateral Type': 'Machinery',
      'Collateral Value': '30,000,000',
      'Status': 'Open',
      'Stage': 'Disbursement',
      'Risk Level': 'Low',
      'Risk Score': '88',
      'STP Eligible': 'No',
      'AI Confidence Score': '97',
      'Decision': 'Approved',
      'Conditions': 'Subject to quarterly financial reporting',
      'Assigned Team': 'Commercial Lending::Loan Operations',
    },
    coreState: 'Draft',
    createdAt: daysAgo(20),
    submittedAt: daysAgo(20),
  },
  {
    values: {
      'Borrower Name': 'Vanguard Real Estate Developers',
      'Business Registration Number': 'U70100KA2014PTC789012',
      'Business Type': 'LLP',
      'Industry Sector': 'Real Estate',
      'Years in Business': '12',
      'Annual Revenue': '180,000,000',
      'Contact Email': 'cfo@vanguardrealty.com',
      'Contact Phone': '+91 32109 87654',
      'Loan Type': 'Term Loan',
      'Loan Amount': '100,000,000',
      'Loan Purpose': 'Construction financing for mixed-use commercial complex in Bangalore.',
      'Requested Tenure Months': '84',
      'Collateral Type': 'Property',
      'Collateral Value': '150,000,000',
      'Status': 'Closed',
      'Stage': 'Active',
      'Risk Level': 'Medium',
      'Risk Score': '72',
      'STP Eligible': 'No',
      'AI Confidence Score': '91',
      'Decision': 'Approved',
      'Assigned Team': 'Commercial Lending::Loan Operations',
    },
    coreState: 'Submitted',
    createdAt: daysAgo(45),
    submittedAt: daysAgo(45),
  },
  {
    values: {
      'Borrower Name': 'Quantum Biotech Ltd',
      'Business Registration Number': 'U24100AP2021PTC890123',
      'Business Type': 'Private Limited',
      'Industry Sector': 'Healthcare',
      'Years in Business': '5',
      'Annual Revenue': '8,000,000',
      'Contact Email': 'finance@quantumbio.in',
      'Contact Phone': '+91 21098 76543',
      'Loan Type': 'Term Loan',
      'Loan Amount': '12,000,000',
      'Loan Purpose': 'R&D facility expansion and clinical trial funding for novel drug compound.',
      'Requested Tenure Months': '60',
      'Collateral Type': 'None',
      'Collateral Value': '',
      'Status': 'Closed',
      'Stage': 'Declined',
      'Risk Level': 'Critical',
      'Risk Score': '32',
      'STP Eligible': 'No',
      'AI Confidence Score': '54',
      'Decision': 'Denied',
      'Decision Notes': 'Insufficient collateral and early-stage revenue profile does not meet minimum thresholds.',
      'Assigned Team': 'Commercial Lending::Credit Officers',
    },
    coreState: 'Submitted',
    createdAt: daysAgo(30),
    submittedAt: daysAgo(30),
  },
];

async function main() {
  console.log(`Seeding ${loanApplications.length} demo loan applications...`);

  for (const app of loanApplications) {
    const body = {
      values: app.values,
      coreState: app.coreState,
      createdAt: app.createdAt,
      createdBy: user,
      updatedAt: app.createdAt,
      updatedBy: user,
    };
    if (app.coreState === 'Submitted') {
      body.submittedAt = app.submittedAt;
      body.submittedBy = user;
    }

    const res = await client.patch(`/kapps/${kappSlug}/forms/loan-application/submissions`, { body });
    if (res.ok) {
      console.log(`  ✓ ${app.values['Borrower Name']} — Stage: ${app.values['Stage']}`);
    } else {
      console.error(`  ✗ ${app.values['Borrower Name']}: ${res.status}`);
      console.error(typeof res.data === 'string' ? res.data : JSON.stringify(res.data, null, 2));
    }
  }

  console.log('\nDone.');
}

main().catch(console.error);
