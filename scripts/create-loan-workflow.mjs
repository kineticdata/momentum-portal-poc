/**
 * Creates the Loan Application Submitted workflow for the commercial-lending kapp.
 *
 * Workflow stages:
 *   Pre-Screening Review (Task)
 *   → Document Verification (Task)
 *   → Credit Assessment (Approval)
 *   → Loan Approval (Approval)
 *   → Close
 *
 * Run:  node scripts/create-loan-workflow.mjs
 */

import { randomUUID } from 'crypto';
import { createApiClient } from './lib/api-client.mjs';

const server = process.env.KINETIC_SERVER_URL;
const user = process.env.KINETIC_USERNAME;
const pass = process.env.KINETIC_PASSWORD;

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

// ---------------------------------------------------------------------------
// Workflow definition (treeJson format)
// ---------------------------------------------------------------------------
const loanWorkflow = {
  builderVersion: '',
  schemaVersion: '1.0',
  version: '',
  processOwnerEmail: '',
  lastId: 30,
  name: 'Loan Application Submitted',
  notes:
    'Orchestrates the end-to-end commercial loan review pipeline:\n' +
    'Pre-Screening → Document Verification → Credit Assessment → Loan Approval',
  connectors: [
    // Start → echo (get submission details)
    { from: 'start', to: 'utilities_echo_v1_1', label: '', value: '', type: 'Complete' },
    // Echo → Pre-Screening task
    { from: 'utilities_echo_v1_1', to: 'routine_task_2', label: '', value: '', type: 'Complete' },
    // Pre-Screening complete → Document Verification task
    {
      from: 'routine_task_2',
      to: 'routine_task_3',
      label: 'Pre-Screening Complete',
      value: "@results['Pre-Screening Review']['Status'] != \"Canceled\"",
      type: 'Complete',
    },
    // Pre-Screening canceled → return early
    {
      from: 'routine_task_2',
      to: 'system_tree_return_v1_30',
      label: 'Canceled',
      value: "@results['Pre-Screening Review']['Status'] == \"Canceled\"",
      type: 'Complete',
    },
    // Document Verification complete → Credit Assessment approval
    {
      from: 'routine_task_3',
      to: 'routine_approval_4',
      label: 'Verification Complete',
      value: "@results['Document Verification']['Status'] != \"Canceled\"",
      type: 'Complete',
    },
    // Document Verification canceled → return
    {
      from: 'routine_task_3',
      to: 'system_tree_return_v1_30',
      label: 'Canceled',
      value: "@results['Document Verification']['Status'] == \"Canceled\"",
      type: 'Complete',
    },
    // Credit Assessment approved → Loan Approval
    {
      from: 'routine_approval_4',
      to: 'routine_approval_5',
      label: 'Approved',
      value: "@results['Credit Assessment']['Approval Decision'] != \"Denied\"",
      type: 'Complete',
    },
    // Credit Assessment denied → Return
    {
      from: 'routine_approval_4',
      to: 'system_tree_return_v1_30',
      label: 'Denied',
      value: "@results['Credit Assessment']['Approval Decision'] == \"Denied\"",
      type: 'Complete',
    },
    // Loan Approval → Return
    {
      from: 'routine_approval_5',
      to: 'system_tree_return_v1_30',
      label: '',
      value: '',
      type: 'Complete',
    },
  ],
  nodes: [
    // -----------------------------------------------------------------------
    // Start
    // -----------------------------------------------------------------------
    {
      configured: true,
      defers: false,
      deferrable: false,
      visible: false,
      name: 'Start',
      messages: [],
      dependents: {
        task: [{ label: '', type: 'Complete', value: '', content: 'utilities_echo_v1_1' }],
      },
      id: 'start',
      position: { x: 10, y: 10 },
      version: 1,
      parameters: [],
      definitionId: 'system_start_v1',
    },

    // -----------------------------------------------------------------------
    // Echo — build submission details string for tasks/approvals
    // -----------------------------------------------------------------------
    {
      configured: true,
      defers: false,
      deferrable: false,
      visible: true,
      name: 'Build Submission Details',
      messages: [],
      dependents: {
        task: [{ label: '', type: 'Complete', value: '', content: 'routine_task_2' }],
      },
      id: 'utilities_echo_v1_1',
      position: { x: 10, y: 120 },
      version: 1,
      parameters: [
        {
          dependsOnId: '',
          dependsOnValue: '',
          description: '',
          id: 'input',
          label: 'Input',
          menu: '',
          value:
            '<%= "Borrower: #{@values[\'Borrower Name\']} | Amount: #{@values[\'Loan Amount\']} | Type: #{@values[\'Loan Type\']}" %>',
          required: true,
        },
      ],
      definitionId: 'utilities_echo_v1',
    },

    // -----------------------------------------------------------------------
    // Stage 1: Pre-Screening Review (Task → Relationship Managers)
    // -----------------------------------------------------------------------
    {
      configured: true,
      defers: true,
      deferrable: true,
      visible: true,
      name: 'Pre-Screening Review',
      messages: [],
      dependents: {
        task: [
          {
            label: 'Pre-Screening Complete',
            type: 'Complete',
            value: "@results['Pre-Screening Review']['Status'] != \"Canceled\"",
            content: 'routine_task_3',
          },
          {
            label: 'Canceled',
            type: 'Complete',
            value: "@results['Pre-Screening Review']['Status'] == \"Canceled\"",
            content: 'system_tree_return_v1_30',
          },
        ],
      },
      id: 'routine_task_2',
      position: { x: 10, y: 260 },
      version: 1,
      parameters: [
        {
          dependsOnId: '',
          dependsOnValue: '',
          description: 'The Submission Id of the Originating Submission',
          id: 'Originating Submission Id',
          label: 'Originating Submission Id',
          menu: '',
          value: '<%= @submission[\'Id\'] %>',
          required: true,
        },
        {
          dependsOnId: '',
          dependsOnValue: '',
          description: 'List or array of Assignees (Teams and/or Individuals)',
          id: 'Assignees',
          label: 'Assignees',
          menu: '',
          value: 'Relationship Managers',
          required: true,
        },
        {
          dependsOnId: '',
          dependsOnValue: '',
          description: 'Details of the Submission',
          id: 'Submission Details',
          label: 'Submission Details',
          menu: '',
          value: '<%= @results[\'Build Submission Details\'][\'output\'] %>',
          required: false,
        },
        {
          dependsOnId: '',
          dependsOnValue: '',
          description: 'Task Summary',
          id: 'Task Summary',
          label: 'Task Summary',
          menu: '',
          value:
            'Pre-Screening Review — <%= @values[\'Borrower Name\'] %> (<%= @submission[\'Handle\'] %>)',
          required: false,
        },
      ],
      definitionId: 'routine_task',
    },

    // -----------------------------------------------------------------------
    // Stage 2: Document Verification (Task → Loan Operations)
    // -----------------------------------------------------------------------
    {
      configured: true,
      defers: true,
      deferrable: true,
      visible: true,
      name: 'Document Verification',
      messages: [],
      dependents: {
        task: [
          {
            label: 'Verification Complete',
            type: 'Complete',
            value: "@results['Document Verification']['Status'] != \"Canceled\"",
            content: 'routine_approval_4',
          },
          {
            label: 'Canceled',
            type: 'Complete',
            value: "@results['Document Verification']['Status'] == \"Canceled\"",
            content: 'system_tree_return_v1_30',
          },
        ],
      },
      id: 'routine_task_3',
      position: { x: 10, y: 480 },
      version: 1,
      parameters: [
        {
          dependsOnId: '',
          dependsOnValue: '',
          description: 'The Submission Id of the Originating Submission',
          id: 'Originating Submission Id',
          label: 'Originating Submission Id',
          menu: '',
          value: '<%= @submission[\'Id\'] %>',
          required: true,
        },
        {
          dependsOnId: '',
          dependsOnValue: '',
          description: 'List or array of Assignees (Teams and/or Individuals)',
          id: 'Assignees',
          label: 'Assignees',
          menu: '',
          value: 'Loan Operations',
          required: true,
        },
        {
          dependsOnId: '',
          dependsOnValue: '',
          description: 'Details of the Submission',
          id: 'Submission Details',
          label: 'Submission Details',
          menu: '',
          value: '<%= @results[\'Build Submission Details\'][\'output\'] %>',
          required: false,
        },
        {
          dependsOnId: '',
          dependsOnValue: '',
          description: 'Task Summary',
          id: 'Task Summary',
          label: 'Task Summary',
          menu: '',
          value:
            'Document Verification — <%= @values[\'Borrower Name\'] %> (<%= @submission[\'Handle\'] %>)',
          required: false,
        },
      ],
      definitionId: 'routine_task',
    },

    // -----------------------------------------------------------------------
    // Stage 3: Credit Assessment (Approval → Credit Officers)
    // -----------------------------------------------------------------------
    {
      configured: true,
      defers: true,
      deferrable: true,
      visible: true,
      name: 'Credit Assessment',
      messages: [],
      dependents: {
        task: [
          {
            label: 'Approved',
            type: 'Complete',
            value: "@results['Credit Assessment']['Approval Decision'] != \"Denied\"",
            content: 'routine_approval_5',
          },
          {
            label: 'Denied',
            type: 'Complete',
            value: "@results['Credit Assessment']['Approval Decision'] == \"Denied\"",
            content: 'system_tree_return_v1_30',
          },
        ],
      },
      id: 'routine_approval_4',
      position: { x: 10, y: 700 },
      version: 1,
      parameters: [
        {
          dependsOnId: '',
          dependsOnValue: '',
          description: 'The Submission Id of the Originating Submission',
          id: 'Originating Submission Id',
          label: 'Originating Submission Id',
          menu: '',
          value: '<%= @submission[\'Id\'] %>',
          required: true,
        },
        {
          dependsOnId: '',
          dependsOnValue: '',
          description: 'List or array of Approvers (Teams and/or Individuals)',
          id: 'Approvers',
          label: 'Approvers',
          menu: '',
          value: 'Credit Officers',
          required: true,
        },
        {
          dependsOnId: '',
          dependsOnValue: '',
          description: 'Details of the Submission',
          id: 'Submission Details',
          label: 'Submission Details',
          menu: '',
          value: '<%= @results[\'Build Submission Details\'][\'output\'] %>',
          required: true,
        },
        {
          dependsOnId: '',
          dependsOnValue: '',
          description: 'Summary of the Approval',
          id: 'Approval Summary',
          label: 'Approval Summary',
          menu: '',
          value:
            'Credit Assessment — <%= @values[\'Borrower Name\'] %> (Amount: <%= @values[\'Loan Amount\'] %>)',
          required: true,
        },
      ],
      definitionId: 'routine_approval',
    },

    // -----------------------------------------------------------------------
    // Stage 4: Loan Approval (Approval → Credit Officers + Compliance)
    // -----------------------------------------------------------------------
    {
      configured: true,
      defers: true,
      deferrable: true,
      visible: true,
      name: 'Loan Approval',
      messages: [],
      dependents: {
        task: [
          {
            label: '',
            type: 'Complete',
            value: '',
            content: 'system_tree_return_v1_30',
          },
        ],
      },
      id: 'routine_approval_5',
      position: { x: 10, y: 920 },
      version: 1,
      parameters: [
        {
          dependsOnId: '',
          dependsOnValue: '',
          description: 'The Submission Id of the Originating Submission',
          id: 'Originating Submission Id',
          label: 'Originating Submission Id',
          menu: '',
          value: '<%= @submission[\'Id\'] %>',
          required: true,
        },
        {
          dependsOnId: '',
          dependsOnValue: '',
          description: 'List or array of Approvers (Teams and/or Individuals)',
          id: 'Approvers',
          label: 'Approvers',
          menu: '',
          value: 'Credit Officers',
          required: true,
        },
        {
          dependsOnId: '',
          dependsOnValue: '',
          description: 'Details of the Submission',
          id: 'Submission Details',
          label: 'Submission Details',
          menu: '',
          value: '<%= @results[\'Build Submission Details\'][\'output\'] %>',
          required: true,
        },
        {
          dependsOnId: '',
          dependsOnValue: '',
          description: 'Summary of the Approval',
          id: 'Approval Summary',
          label: 'Approval Summary',
          menu: '',
          value:
            'Final Loan Approval — <%= @values[\'Borrower Name\'] %> requesting <%= @values[\'Loan Amount\'] %> (<%= @values[\'Loan Type\'] %>)',
          required: true,
        },
      ],
      definitionId: 'routine_approval',
    },

    // -----------------------------------------------------------------------
    // Return
    // -----------------------------------------------------------------------
    {
      configured: true,
      defers: false,
      deferrable: false,
      visible: false,
      name: 'Return',
      messages: [],
      dependents: '',
      id: 'system_tree_return_v1_30',
      position: { x: 10, y: 1140 },
      version: 1,
      parameters: [
        {
          dependsOnId: '',
          dependsOnValue: '',
          description: '',
          id: 'status',
          label: 'Status',
          menu: '',
          value: 'Complete',
          required: false,
        },
        {
          dependsOnId: '',
          dependsOnValue: '',
          description: '',
          id: 'description',
          label: 'Description',
          menu: '',
          value: 'Loan application workflow completed',
          required: false,
        },
      ],
      definitionId: 'system_tree_return_v1',
    },
  ],
};

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
export async function createLoanWorkflow(apiClient) {
  console.log('Creating loan application workflow...\n');

  const payload = {
    name: loanWorkflow.name,
    event: 'Submission Submitted',
    treeId: randomUUID(),
    treeJson: loanWorkflow,
  };

  const { status, ok, data } = await apiClient.post(
    '/kapps/commercial-lending/forms/loan-application/workflows?force=true',
    { body: payload },
  );

  if (!ok) {
    console.error(`❌ Failed to create workflow (HTTP ${status}):`);
    console.error(JSON.stringify(data, null, 2));
    throw new Error(`Workflow creation failed: HTTP ${status}`);
  }

  console.log('✅ Loan Application Submitted workflow created successfully!');
  console.log(`   Name:  ${data.workflow?.name || loanWorkflow.name}`);
  console.log(`   Event: ${data.workflow?.event || 'Submission Submitted'}`);
  console.log(`   Stages: Pre-Screening → Document Verification → Credit Assessment → Loan Approval`);
}

// Standalone runner
if (import.meta.url === `file://${process.argv[1]}`) {
  createLoanWorkflow(client).catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
}
