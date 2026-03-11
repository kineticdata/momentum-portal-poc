/**
 * Create all Commercial Lending forms via the Kinetic Core API.
 *
 * Usage:  node scripts/create-lending-forms.mjs
 *
 * Reads REACT_APP_PROXY_HOST from portal/.env.development.local
 * Prompts for credentials (or set KINETIC_USER / KINETIC_PASS env vars).
 */

import { createApiClient } from './lib/api-client.mjs';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const server = process.env.KINETIC_SERVER_URL;
const user = process.env.KINETIC_USERNAME;
const pass = process.env.KINETIC_PASSWORD;
const kappSlug = 'commercial-lending';

if (!server || !user || !pass) {
  console.error('Required env vars: KINETIC_SERVER_URL, KINETIC_USERNAME, KINETIC_PASSWORD');
  process.exit(1);
}

let client;
if (server) {
  client = createApiClient({
    baseUrl: `${server}/app/api/v1`,
    username: user,
    password: pass,
  });
}

function makeApi(apiClient) {
  return async function api(method, urlPath, body) {
    const res = await apiClient[method.toLowerCase()](urlPath, { body });
    if (!res.ok) {
      console.error(`${method} ${urlPath} → ${res.status}`);
      console.error(typeof res.data === 'string' ? res.data : JSON.stringify(res.data, null, 2));
      return null;
    }
    return res.data;
  };
}


// ---------------------------------------------------------------------------
// Field helpers
// ---------------------------------------------------------------------------

function textField(name, key, { required = false, enabled = true, visible = true, defaultValue = null, rows = 1, omitWhenHidden = null, label = null } = {}) {
  return {
    type: 'field', name, key, label: label || name, dataType: 'string', renderType: 'text',
    required, visible, enabled, defaultValue, defaultDataSource: 'none', rows,
    omitWhenHidden, pattern: null, renderAttributes: {}, defaultResourceName: null,
    requiredMessage: null, constraints: [], events: [],
  };
}

function textareaField(name, key, { required = false, rows = 3, enabled = true, visible = true, defaultValue = null, omitWhenHidden = null, label = null } = {}) {
  return {
    type: 'field', name, key, label: label || name, dataType: 'string', renderType: 'text',
    required, visible, enabled, defaultValue, defaultDataSource: 'none', rows,
    omitWhenHidden, pattern: null, renderAttributes: {}, defaultResourceName: null,
    requiredMessage: null, constraints: [], events: [],
  };
}

function dropdownField(name, key, choices, { required = false, enabled = true, visible = true, defaultValue = null, omitWhenHidden = null, label = null } = {}) {
  return {
    type: 'field', name, key, label: label || name, dataType: 'string', renderType: 'dropdown',
    required, visible, enabled, defaultValue, defaultDataSource: 'none',
    choices: choices.map(c => ({ label: c, value: c })),
    choicesDataSource: 'none', choicesResourceName: null, choicesRunIf: null, choicesResourceProperty: null,
    omitWhenHidden, pattern: null, renderAttributes: {}, defaultResourceName: null,
    requiredMessage: null, constraints: [], events: [],
  };
}

function attachmentField(name, key, { required = false, visible = true, enabled = true, omitWhenHidden = null, label = null, allowMultiple = false } = {}) {
  return {
    type: 'field', name, key, label: label || name, dataType: 'file', renderType: 'attachment',
    required, visible, enabled, defaultValue: null, defaultDataSource: 'none',
    omitWhenHidden, pattern: null, renderAttributes: {}, defaultResourceName: null,
    requiredMessage: null, constraints: [], events: [], allowMultiple,
  };
}

function section(name, title, elements, { visible = true, omitWhenHidden = null, cols = null } = {}) {
  const renderAttributes = cols ? { class: `cols-${cols}` } : {};
  return { type: 'section', renderType: null, name, title, visible, omitWhenHidden, renderAttributes, elements };
}

function page(name, elements, { renderType = 'submittable', advanceCondition = null } = {}) {
  return { name, type: 'page', renderType, advanceCondition, displayCondition: null, displayPage: null, events: [], elements };
}

// Standard system fields used across task/review/approval forms
function systemFields(prefix = 'f9', extras = []) {
  let i = parseInt(prefix.replace('f', ''));
  const fields = [
    textField('Status', `f${i++}0`, { defaultValue: 'Open' }),
    textField('Assigned Individual', `f${i++}0`),
    textField('Assigned Team', `f${i++}0`),
    textField('Deferral Token', `f${i++}0`),
    ...extras,
  ];
  return section('System Fields', null, fields, { visible: false, omitWhenHidden: false });
}

// Common index definitions for task-like forms
function taskIndexes() {
  return [
    { name: 'values[Loan Application ID]', parts: ['values[Loan Application ID]'], unique: false },
    { name: 'values[Assigned Individual]', parts: ['values[Assigned Individual]'], unique: false },
    { name: 'values[Assigned Team]', parts: ['values[Assigned Team]'], unique: false },
    { name: 'values[Status]', parts: ['values[Status]'], unique: false },
  ];
}

// ---------------------------------------------------------------------------
// Form definitions
// ---------------------------------------------------------------------------

const forms = [
  // 1. Loan Application
  {
    name: 'Loan Application', slug: 'loan-application',
    description: 'Commercial loan origination form for term loans and working capital',
    status: 'Active', type: 'Service',
    submissionLabelExpression: "${values('Loan Type')} - ${values('Borrower Name')} - ${values('Loan Amount')}",
    attributes: [{ name: 'Icon', values: ['building-bank'] }, { name: 'Assigned Team', values: ['Commercial Lending::Relationship Managers'] }],
    indexDefinitions: [
      { name: 'createdBy', parts: ['createdBy'], unique: false },
      { name: 'submittedBy', parts: ['submittedBy'], unique: false },
      { name: 'values[Status]', parts: ['values[Status]'], unique: false },
      { name: 'values[Stage]', parts: ['values[Stage]'], unique: false },
      { name: 'values[Loan Type]', parts: ['values[Loan Type]'], unique: false },
      { name: 'values[Risk Level]', parts: ['values[Risk Level]'], unique: false },
      { name: 'values[Assigned Individual]', parts: ['values[Assigned Individual]'], unique: false },
      { name: 'values[Assigned Team]', parts: ['values[Assigned Team]'], unique: false },
      { name: 'values[Borrower Name]', parts: ['values[Borrower Name]'], unique: false },
    ],
    pages: [page('Borrower Information', [
      section('Borrower Details', 'Borrower Details', [
        textField('Borrower Name', 'f1', { required: true }),
        textField('Business Registration Number', 'f2', { required: true }),
        dropdownField('Business Type', 'f3', ['Private Limited', 'Public Limited', 'Partnership', 'Sole Proprietorship', 'LLP'], { required: true }),
        dropdownField('Industry Sector', 'f4', ['Manufacturing', 'Technology', 'Healthcare', 'Real Estate', 'Agriculture', 'Retail', 'Infrastructure', 'Other'], { required: true }),
        textField('Years in Business', 'f5', { required: true }),
        textField('Annual Revenue', 'f6', { required: true }),
        textField('Contact Email', 'f7', { required: true }),
        textField('Contact Phone', 'f8', { required: true }),
      ], { cols: 2 }),
      section('Loan Details', 'Loan Details', [
        dropdownField('Loan Type', 'f9', ['Term Loan', 'Working Capital'], { required: true }),
        textField('Loan Amount', 'f10', { required: true, label: 'Loan Amount ($)' }),
        textareaField('Loan Purpose', 'f11', { required: true }),
        textField('Requested Tenure Months', 'f12', { required: true, label: 'Requested Tenure (Months)' }),
        dropdownField('Collateral Type', 'f13', ['Property', 'Machinery', 'Inventory', 'Receivables', 'Fixed Deposits', 'None']),
        textField('Collateral Value', 'f14', { label: 'Collateral Value ($)' }),
      ], { cols: 2 }),
      section('System Fields', null, [
        textField('Status', 'f20', { defaultValue: 'Open' }),
        textField('Stage', 'f21', { defaultValue: 'Application Intake' }),
        textField('Risk Level', 'f22'),
        textField('Risk Score', 'f23'),
        textField('STP Eligible', 'f24'),
        textField('Fraud Flags', 'f25'),
        textField('AI Confidence Score', 'f26'),
        textField('Assigned Individual', 'f27'),
        textField('Assigned Individual Display Name', 'f28'),
        textField('Assigned Team', 'f29'),
        textField('Assigned Team Display Name', 'f30'),
        textField('Decision', 'f31'),
        textField('Decision Notes', 'f32'),
        textField('Conditions', 'f33'),
      ], { visible: false, omitWhenHidden: false }),
    ])],
  },

  // 2. Document Upload
  {
    name: 'Document Upload', slug: 'document-upload',
    description: 'Collect required documents for loan application',
    status: 'Active', type: 'Task',
    submissionLabelExpression: "Documents - ${values('Borrower Name')}",
    attributes: [{ name: 'Icon', values: ['file-upload'] }, { name: 'Assigned Team', values: ['Commercial Lending::Relationship Managers'] }, { name: 'SLA Hours', values: ['48'] }],
    indexDefinitions: taskIndexes(),
    pages: [page('Document Collection', [
      section('Application Reference', 'Application Reference', [
        textField('Loan Application ID', 'f1', { enabled: false }),
        textField('Borrower Name', 'f2', { enabled: false }),
      ]),
      section('Required Documents', 'Required Documents', [
        attachmentField('PAN Card', 'f3', { required: true }),
        attachmentField('GST Certificate', 'f4', { required: true }),
        attachmentField('Financial Statements', 'f5', { required: true }),
        attachmentField('Bank Statements', 'f6', { required: true }),
        attachmentField('Business Registration', 'f7', { required: true }),
        attachmentField('Collateral Documents', 'f8'),
        attachmentField('Additional Documents', 'f9'),
      ]),
      systemFields('f2'),
    ])],
  },

  // 3. Pre-Screening Review
  {
    name: 'Pre-Screening Review', slug: 'pre-screening-review',
    description: 'Relationship Manager reviews eligibility and compliance',
    status: 'Active', type: 'Review',
    submissionLabelExpression: "Pre-Screening - ${values('Borrower Name')}",
    attributes: [{ name: 'Icon', values: ['checklist'] }, { name: 'Assigned Team', values: ['Commercial Lending::Relationship Managers'] }, { name: 'SLA Hours', values: ['8'] }],
    indexDefinitions: taskIndexes(),
    pages: [page('Pre-Screening', [
      section('Application Summary', 'Application Summary', [
        textField('Loan Application ID', 'f1', { enabled: false }),
        textField('Borrower Name', 'f2', { enabled: false }),
        textField('Loan Amount', 'f3', { enabled: false }),
        textField('Loan Type', 'f4', { enabled: false }),
      ], { cols: 2 }),
      section('Eligibility Check', 'Eligibility Check', [
        dropdownField('Business Age Eligible', 'f5', ['Yes', 'No'], { required: true }),
        dropdownField('Revenue Threshold Met', 'f6', ['Yes', 'No'], { required: true }),
        dropdownField('Compliance Check Passed', 'f7', ['Yes', 'No'], { required: true }),
        dropdownField('Decision', 'f8', ['Pass', 'Fail', 'Refer'], { required: true }),
        textareaField('Notes', 'f9'),
      ]),
      systemFields('f2'),
    ])],
  },

  // 4. Document Verification
  {
    name: 'Document Verification', slug: 'document-verification',
    description: 'Review AI processing results and verify document accuracy',
    status: 'Active', type: 'Task',
    submissionLabelExpression: "Doc Verification - ${values('Borrower Name')}",
    attributes: [{ name: 'Icon', values: ['file-check'] }, { name: 'Assigned Team', values: ['Commercial Lending::Compliance Officers'] }, { name: 'SLA Hours', values: ['12'] }],
    indexDefinitions: taskIndexes(),
    pages: [page('Document Verification', [
      section('AI Processing Results', 'AI Processing Results', [
        textField('Loan Application ID', 'f1', { enabled: false }),
        textField('Borrower Name', 'f2', { enabled: false }),
        textField('AI Confidence Score', 'f3', { enabled: false }),
        textareaField('Extraction Summary', 'f4', { enabled: false, rows: 4 }),
      ], { cols: 2 }),
      section('Manual Verification', 'Manual Verification', [
        dropdownField('PAN Verified', 'f5', ['Verified', 'Discrepancy Found', 'Not Available'], { required: true }),
        dropdownField('GST Verified', 'f6', ['Verified', 'Discrepancy Found', 'Not Available'], { required: true }),
        dropdownField('Financials Verified', 'f7', ['Verified', 'Discrepancy Found', 'Not Available'], { required: true }),
        dropdownField('Identity Verified', 'f8', ['Verified', 'Discrepancy Found', 'Not Available'], { required: true }),
        dropdownField('Overall Decision', 'f9', ['All Verified', 'Exceptions Found', 'Rejected'], { required: true }),
        textareaField('Verification Notes', 'f10'),
      ], { cols: 2 }),
      systemFields('f2'),
    ])],
  },

  // 5. Fraud Review
  {
    name: 'Fraud Review', slug: 'fraud-review',
    description: 'Fraud analyst investigates flagged items',
    status: 'Active', type: 'Review',
    submissionLabelExpression: "Fraud Review - ${values('Borrower Name')}",
    attributes: [{ name: 'Icon', values: ['shield-search'] }, { name: 'Assigned Team', values: ['Commercial Lending::Fraud Analysts'] }, { name: 'SLA Hours', values: ['24'] }],
    indexDefinitions: taskIndexes(),
    pages: [page('Fraud Investigation', [
      section('Fraud Flags Detected', 'Fraud Flags Detected', [
        textField('Loan Application ID', 'f1', { enabled: false }),
        textField('Borrower Name', 'f2', { enabled: false }),
        textareaField('Flag Details', 'f3', { enabled: false, rows: 4 }),
        textField('Flag Severity', 'f4', { enabled: false }),
      ]),
      section('Investigation', 'Investigation', [
        textareaField('Investigation Findings', 'f5', { required: true, rows: 4 }),
        dropdownField('Decision', 'f6', ['Cleared', 'Escalate', 'Reject'], { required: true }),
        textareaField('Decision Rationale', 'f7', { required: true }),
      ]),
      systemFields('f2'),
    ])],
  },

  // 6. Credit Assessment
  {
    name: 'Credit Assessment', slug: 'credit-assessment',
    description: 'Credit officer reviews risk score, financials, and bureau data',
    status: 'Active', type: 'Review',
    submissionLabelExpression: "Credit Assessment - ${values('Borrower Name')}",
    attributes: [{ name: 'Icon', values: ['report-analytics'] }, { name: 'Assigned Team', values: ['Commercial Lending::Credit Officers'] }, { name: 'SLA Hours', values: ['24'] }],
    indexDefinitions: taskIndexes(),
    pages: [page('Credit Assessment', [
      section('Risk Profile', 'Risk Profile', [
        textField('Loan Application ID', 'f1', { enabled: false }),
        textField('Borrower Name', 'f2', { enabled: false }),
        textField('Loan Amount', 'f3', { enabled: false }),
        textField('Internal Credit Score', 'f4', { enabled: false }),
        textField('Bureau Credit Score', 'f5', { enabled: false }),
        textField('Debt Service Coverage Ratio', 'f6', { enabled: false }),
      ], { cols: 2 }),
      section('Credit Officer Assessment', 'Credit Officer Assessment', [
        dropdownField('Risk Rating', 'f7', ['Low', 'Medium', 'High', 'Critical'], { required: true }),
        textField('Recommended Amount', 'f8', { required: true }),
        textField('Recommended Tenure', 'f9', { required: true }),
        textField('Recommended Interest Rate', 'f10', { required: true }),
        textareaField('Conditions', 'f11'),
        dropdownField('Decision', 'f12', ['Recommend Approval', 'Recommend with Conditions', 'Decline'], { required: true }),
        textareaField('Assessment Notes', 'f13'),
      ], { cols: 2 }),
      systemFields('f2'),
    ])],
  },

  // 7. Loan Approval
  {
    name: 'Loan Approval', slug: 'loan-approval',
    description: 'Credit committee or auto-STP approval decision',
    status: 'Active', type: 'Approval',
    submissionLabelExpression: "Approval - ${values('Borrower Name')} - ${values('Loan Amount')}",
    attributes: [{ name: 'Icon', values: ['certificate'] }, { name: 'Assigned Team', values: ['Commercial Lending::Credit Officers'] }, { name: 'SLA Hours', values: ['48'] }],
    indexDefinitions: [
      ...taskIndexes(),
      { name: 'values[Decision]', parts: ['values[Decision]'], unique: false },
    ],
    pages: [page('Loan Approval', [
      section('Loan Approval Summary', 'Loan Approval Summary', [
        textField('Loan Application ID', 'f1', { enabled: false }),
        textField('Borrower Name', 'f2', { enabled: false }),
        textField('Loan Amount', 'f3', { enabled: false }),
        textField('Loan Type', 'f4', { enabled: false }),
        textField('Risk Rating', 'f5', { enabled: false }),
        textField('Credit Officer Recommendation', 'f6', { enabled: false }),
        textareaField('Summary', 'f7', { enabled: false, rows: 4 }),
      ]),
      section('Approval Decision', 'Approval Decision', [
        dropdownField('Decision', 'f8', ['Approved', 'Denied', 'Pending'], { required: true }),
        textField('Approved Amount', 'f9'),
        textField('Approved Interest Rate', 'f10'),
        textareaField('Conditions', 'f11'),
        textareaField('Reason', 'f12'),
      ], { cols: 2 }),
      section('System Fields', null, [
        textField('Status', 'f20', { defaultValue: 'Open' }),
        textField('Assigned Individual', 'f21'),
        textField('Assigned Individual Display Name', 'f22'),
        textField('Assigned Team', 'f23'),
        textField('Assigned Team Display Name', 'f24'),
        textField('Deferral Token', 'f25'),
        textField('Due Date', 'f26'),
      ], { visible: false, omitWhenHidden: false }),
    ])],
  },

  // 8. Disbursement Checklist
  {
    name: 'Disbursement Checklist', slug: 'disbursement-checklist',
    description: 'Evidence-based checklist before funds release',
    status: 'Active', type: 'Task',
    submissionLabelExpression: "Disbursement - ${values('Borrower Name')}",
    attributes: [{ name: 'Icon', values: ['cash'] }, { name: 'Assigned Team', values: ['Commercial Lending::Loan Operations'] }, { name: 'SLA Hours', values: ['24'] }],
    indexDefinitions: taskIndexes(),
    pages: [page('Disbursement', [
      section('Approved Loan Details', 'Approved Loan Details', [
        textField('Loan Application ID', 'f1', { enabled: false }),
        textField('Borrower Name', 'f2', { enabled: false }),
        textField('Approved Amount', 'f3', { enabled: false }),
        textField('Approved Interest Rate', 'f4', { enabled: false }),
      ], { cols: 2 }),
      section('Pre-Disbursement Checklist', 'Pre-Disbursement Checklist', [
        dropdownField('Sanction Letter Issued', 'f5', ['Yes', 'No'], { required: true }),
        dropdownField('Loan Agreement Signed', 'f6', ['Yes', 'No'], { required: true }),
        dropdownField('Collateral Registered', 'f7', ['Yes', 'No', 'N/A'], { required: true }),
        dropdownField('Insurance Obtained', 'f8', ['Yes', 'No', 'N/A'], { required: true }),
        dropdownField('KYC Complete', 'f9', ['Yes', 'No'], { required: true }),
        dropdownField('Disbursement Account Verified', 'f10', ['Yes', 'No'], { required: true }),
        textareaField('Disbursement Notes', 'f11'),
      ], { cols: 2 }),
      systemFields('f2'),
    ])],
  },

  // 9. Post-Disbursement Monitor
  {
    name: 'Post-Disbursement Monitor', slug: 'post-disbursement-monitor',
    description: 'Ongoing monitoring tasks for active loans',
    status: 'Active', type: 'Task',
    submissionLabelExpression: "Monitoring - ${values('Borrower Name')}",
    attributes: [{ name: 'Icon', values: ['activity'] }, { name: 'Assigned Team', values: ['Commercial Lending::Loan Operations'] }, { name: 'SLA Hours', values: ['168'] }],
    indexDefinitions: taskIndexes(),
    pages: [page('Monitoring', [
      section('Active Loan Information', 'Active Loan Information', [
        textField('Loan Application ID', 'f1', { enabled: false }),
        textField('Borrower Name', 'f2', { enabled: false }),
        textField('Loan Amount', 'f3', { enabled: false }),
        textField('Outstanding Balance', 'f4', { enabled: false }),
      ], { cols: 2 }),
      section('Monitoring Checks', 'Monitoring Checks', [
        dropdownField('Repayment Status', 'f5', ['On Track', 'Late Payment', 'Default Risk', 'Defaulted'], { required: true }),
        dropdownField('Covenant Compliance', 'f6', ['Compliant', 'Minor Breach', 'Major Breach'], { required: true }),
        dropdownField('Collateral Valuation Current', 'f7', ['Yes', 'No', 'N/A'], { required: true }),
        dropdownField('Insurance Current', 'f8', ['Yes', 'No', 'N/A'], { required: true }),
        textareaField('Monitoring Notes', 'f9'),
        dropdownField('Action Required', 'f10', ['None', 'Follow Up', 'Escalate', 'Restructure'], { required: true }),
      ], { cols: 2 }),
      systemFields('f2'),
    ])],
  },
];

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

export async function createLendingForms(apiClient, slug = kappSlug) {
  const apiFn = makeApi(apiClient);
  console.log(`Creating ${forms.length} forms in kapp "${slug}"...`);
  for (const form of forms) {
    const result = await apiFn('POST', `/kapps/${slug}/forms`, form);
    if (result) {
      console.log(`✓ Created: ${form.name} (${form.slug})`);
    } else {
      console.log(`✗ Failed: ${form.name} (${form.slug})`);
    }
  }
  console.log('\nDone.');
}

// Standalone runner
if (import.meta.url === `file://${process.argv[1]}`) {
  createLendingForms(client).catch(console.error);
}
