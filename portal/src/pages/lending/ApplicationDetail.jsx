import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import clsx from 'clsx';
import { fetchSubmission } from '@kineticdata/react';
import { Icon } from '../../atoms/Icon.jsx';
import { StagePipeline } from '../../components/lending/StagePipeline.jsx';
import { RiskBadge } from '../../components/lending/RiskBadge.jsx';
import { AuditTimeline } from '../../components/lending/AuditTimeline.jsx';
import { DocumentList } from '../../components/lending/DocumentList.jsx';
import { Error } from '../../components/states/Error.jsx';
import { Loading } from '../../components/states/Loading.jsx';
import { useData } from '../../helpers/hooks/useData.js';

// Mock activities for the POC timeline
const MOCK_ACTIVITIES = [
  {
    title: 'Application Submitted',
    description: 'Loan application submitted via digital portal',
    date: new Date(Date.now() - 7 * 86400000).toISOString(),
    user: 'System',
    type: 'submission',
  },
  {
    title: 'Pre-Screening Passed',
    description: 'Automated eligibility checks passed. KYC verified.',
    date: new Date(Date.now() - 6 * 86400000).toISOString(),
    user: 'AutoScreen Engine',
    type: 'system',
  },
  {
    title: 'Documents Received',
    description: 'Financial statements and tax returns uploaded',
    date: new Date(Date.now() - 4 * 86400000).toISOString(),
    user: 'Borrower',
    type: 'task',
  },
  {
    title: 'Document Verification',
    description: 'OCR extraction complete. Manual review pending.',
    date: new Date(Date.now() - 2 * 86400000).toISOString(),
    user: 'Doc Processing Team',
    type: 'review',
  },
  {
    title: 'Credit Assessment',
    description: 'Awaiting underwriting review',
    date: null,
    user: null,
    type: 'approval',
  },
];

// Mock documents for the POC
const MOCK_DOCUMENTS = [
  {
    name: 'Financial Statements FY2025',
    status: 'verified',
    date: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    name: 'Tax Returns (3 Years)',
    status: 'verified',
    date: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    name: 'Business Registration',
    status: 'verified',
    date: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    name: 'Collateral Appraisal Report',
    status: 'pending',
    date: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    name: 'Board Resolution',
    status: 'flagged',
    date: null,
  },
];

const formatCurrency = value => {
  const num = parseFloat(value);
  if (isNaN(num)) return value || '--';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

const formatDate = dateStr => {
  if (!dateStr) return '--';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const InfoRow = ({ label, value, mono }) => (
  <div className="flex-bc py-2 border-b border-base-200 last:border-0">
    <span className="text-sm text-base-content/60 font-medium">{label}</span>
    <span className={clsx('text-sm font-semibold', mono && 'font-mono')}>
      {value || '--'}
    </span>
  </div>
);

export const ApplicationDetail = () => {
  const { id } = useParams();

  const params = useMemo(
    () => ({
      id,
      include:
        'details,values,form,form.attributesMap,activities,children,children.values,children.form',
    }),
    [id],
  );

  const { initialized, loading, response } = useData(fetchSubmission, params);
  const submission = response?.submission;
  const values = submission?.values || {};
  const children = submission?.children || [];

  if (!initialized) return null;
  if (response?.error) {
    return (
      <div className="gutter py-8">
        <Error error={response.error} />
      </div>
    );
  }
  if (loading && !submission) {
    return (
      <div className="gutter py-8">
        <Loading />
      </div>
    );
  }

  const currentStage = values['Stage'] || 'Pre-Screening';

  return (
    <div className="flex-c-st min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/8 via-base-200 to-accent/5 gutter py-6 border-b border-base-300">
        <div className="max-w-screen-xl mx-auto flex-c-st gap-4">
          <div className="flex-bc flex-wrap gap-4">
            <div className="flex-sc gap-3">
              <Link
                to="/pipeline"
                className="kbtn kbtn-ghost kbtn-circle kbtn-sm"
              >
                <Icon name="arrow-left" size={20} />
              </Link>
              <div>
                <h1 className="text-xl md:text-2xl font-bold">
                  {values['Borrower Name'] ||
                    values['Company Name'] ||
                    submission?.label ||
                    'Loan Application'}
                </h1>
                <div className="flex-sc gap-3 text-sm text-base-content/50">
                  <span>ID: {submission?.handle || id?.slice(0, 8)}</span>
                  <span className="w-1 h-1 rounded-full bg-base-content/30" />
                  <span>Submitted {formatDate(submission?.submittedAt)}</span>
                </div>
              </div>
            </div>
            <div className="flex-sc gap-2">
              <RiskBadge level={values['Risk Level'] || 'Medium'} />
              <span
                className={clsx('kbadge kbadge-lg', {
                  'kbadge-success': submission?.coreState === 'Closed',
                  'kbadge-info': submission?.coreState === 'Submitted',
                  'kbadge-warning': submission?.coreState === 'Draft',
                })}
              >
                {submission?.coreState}
              </span>
            </div>
          </div>

          {/* Stage Pipeline */}
          <StagePipeline currentStage={currentStage} />
        </div>
      </div>

      {/* Content */}
      <div className="gutter py-8 max-w-screen-xl mx-auto w-full">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column - Details */}
          <div className="xl:col-span-2 flex-c-st gap-6">
            {/* Borrower Info Card */}
            <div className="kcard">
              <div className="kcard-body">
                <div className="flex-sc gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon name="building" size={18} className="text-primary" />
                  </div>
                  <h2 className="text-lg font-bold">Borrower Information</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                  <div>
                    <InfoRow
                      label="Borrower Name"
                      value={values['Borrower Name']}
                    />
                    <InfoRow
                      label="Registration Number"
                      value={values['Business Registration Number']}
                    />
                    <InfoRow label="Contact Email" value={values['Contact Email']} />
                    <InfoRow label="Phone" value={values['Contact Phone']} />
                  </div>
                  <div>
                    <InfoRow label="Business Type" value={values['Business Type']} />
                    <InfoRow label="Industry" value={values['Industry Sector']} />
                    <InfoRow
                      label="Years in Business"
                      value={values['Years in Business']}
                    />
                    <InfoRow
                      label="Annual Revenue"
                      value={formatCurrency(values['Annual Revenue'])}
                      mono
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Loan Details Card */}
            <div className="kcard">
              <div className="kcard-body">
                <div className="flex-sc gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Icon
                      name="cash"
                      size={18}
                      className="text-accent"
                    />
                  </div>
                  <h2 className="text-lg font-bold">Loan Details</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                  <div>
                    <InfoRow label="Loan Type" value={values['Loan Type']} />
                    <InfoRow
                      label="Requested Amount"
                      value={formatCurrency(values['Loan Amount'])}
                      mono
                    />
                    <InfoRow label="Purpose" value={values['Loan Purpose']} />
                    <InfoRow label="Tenure" value={values['Requested Tenure Months'] ? `${values['Requested Tenure Months']} months` : '--'} />
                  </div>
                  <div>
                    <InfoRow
                      label="Collateral Type"
                      value={values['Collateral Type']}
                    />
                    <InfoRow
                      label="Collateral Value"
                      value={formatCurrency(values['Collateral Value'])}
                      mono
                    />
                    <InfoRow
                      label="STP Eligible"
                      value={values['STP Eligible']}
                    />
                    <InfoRow
                      label="AI Confidence"
                      value={values['AI Confidence Score'] ? `${values['AI Confidence Score']}%` : '--'}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Assessment */}
            <div className="kcard">
              <div className="kcard-body">
                <div className="flex-sc gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center">
                    <Icon
                      name="shield-check"
                      size={18}
                      className="text-warning"
                    />
                  </div>
                  <h2 className="text-lg font-bold">Risk Assessment</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-base-200 rounded-xl p-4 text-center">
                    <div className="text-xs text-base-content/50 mb-1">
                      Risk Score
                    </div>
                    <div className="text-2xl font-bold text-primary">
                      {values['Risk Score'] || '--'}
                    </div>
                  </div>
                  <div className="bg-base-200 rounded-xl p-4 text-center">
                    <div className="text-xs text-base-content/50 mb-1">
                      Risk Level
                    </div>
                    <RiskBadge level={values['Risk Level'] || 'Medium'} />
                  </div>
                  <div className="bg-base-200 rounded-xl p-4 text-center">
                    <div className="text-xs text-base-content/50 mb-1">
                      AI Confidence
                    </div>
                    <div className="text-2xl font-bold">
                      {values['AI Confidence Score'] ? `${values['AI Confidence Score']}%` : '--'}
                    </div>
                  </div>
                  <div className="bg-base-200 rounded-xl p-4 text-center">
                    <div className="text-xs text-base-content/50 mb-1">
                      Decision
                    </div>
                    <div className={clsx('text-2xl font-bold', {
                      'text-success': values['Decision'] === 'Approved',
                      'text-error': values['Decision'] === 'Denied',
                    })}>
                      {values['Decision'] || '--'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Child Submissions */}
            {children.length > 0 && (
              <div className="kcard">
                <div className="kcard-body">
                  <div className="flex-sc gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-info/10 flex items-center justify-center">
                      <Icon
                        name="subtask"
                        size={18}
                        className="text-info"
                      />
                    </div>
                    <h2 className="text-lg font-bold">
                      Related Tasks & Reviews
                    </h2>
                  </div>
                  <div className="flex-c-st gap-3">
                    {children.map(child => (
                      <div
                        key={child.id}
                        className="flex-sc gap-4 p-4 bg-base-200/50 rounded-xl border border-base-300 hover:border-primary/30 transition-colors"
                      >
                        <div
                          className={clsx(
                            'w-10 h-10 rounded-full flex items-center justify-center flex-none',
                            {
                              'bg-accent/15 text-accent':
                                child.form?.name === 'Approval',
                              'bg-info/15 text-info':
                                child.form?.name === 'Review',
                              'bg-primary/15 text-primary':
                                child.form?.name === 'Task',
                            },
                          )}
                        >
                          <Icon
                            name={
                              child.form?.name === 'Approval'
                                ? 'thumb-up'
                                : child.form?.name === 'Review'
                                  ? 'eye'
                                  : 'clipboard'
                            }
                            size={20}
                          />
                        </div>
                        <div className="flex-auto min-w-0">
                          <div className="font-medium text-sm line-clamp-1">
                            {child.label}
                          </div>
                          <div className="text-xs text-base-content/50">
                            {child.form?.name} &middot;{' '}
                            {child.values?.['Assigned Team'] || 'Unassigned'}
                          </div>
                        </div>
                        <span
                          className={clsx('kbadge kbadge-sm kbadge-outline', {
                            'kbadge-success': child.coreState === 'Closed',
                            'kbadge-info': child.coreState === 'Submitted',
                            'kbadge-warning': child.coreState === 'Draft',
                          })}
                        >
                          {child.coreState}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Timeline & Documents */}
          <div className="flex-c-st gap-6">
            {/* Audit Timeline */}
            <div className="kcard">
              <div className="kcard-body">
                <div className="flex-sc gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                    <Icon
                      name="timeline"
                      size={18}
                      className="text-success"
                    />
                  </div>
                  <h2 className="text-lg font-bold">Audit Trail</h2>
                </div>
                <AuditTimeline activities={MOCK_ACTIVITIES} />
              </div>
            </div>

            {/* Documents */}
            <div className="kcard">
              <div className="kcard-body">
                <div className="flex-sc gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-error/10 flex items-center justify-center">
                    <Icon
                      name="files"
                      size={18}
                      className="text-error"
                    />
                  </div>
                  <h2 className="text-lg font-bold">Documents</h2>
                </div>
                <DocumentList documents={MOCK_DOCUMENTS} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
