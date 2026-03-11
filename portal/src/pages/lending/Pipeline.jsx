import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import clsx from 'clsx';
import { defineKqlQuery, searchSubmissions } from '@kineticdata/react';
import { Icon } from '../../atoms/Icon.jsx';
import { StageKanban } from '../../components/lending/StageKanban.jsx';
import { Error } from '../../components/states/Error.jsx';
import { Loading } from '../../components/states/Loading.jsx';
import { useData } from '../../helpers/hooks/useData.js';

const PIPELINE_STAGES = [
  'Pre-Screening',
  'Document Collection',
  'Document Verification',
  'Fraud Check',
  'Credit Assessment',
  'Approval',
  'Disbursement',
];

const LOAN_TYPE_FILTERS = [
  { label: 'All', value: null },
  { label: 'Term Loan', value: 'Term Loan' },
  { label: 'Working Capital', value: 'Working Capital' },
];

const STAGE_ICONS = {
  'Pre-Screening': 'search',
  'Document Collection': 'folder',
  'Document Verification': 'file-check',
  'Fraud Check': 'shield-check',
  'Credit Assessment': 'chart-bar',
  Approval: 'thumb-up',
  Disbursement: 'cash',
};

export const Pipeline = () => {
  const [activeFilter, setActiveFilter] = useState(null);

  const params = useMemo(
    () => ({
      kapp: 'commercial-lending',
      form: 'loan-application',
      search: {
        q: activeFilter
          ? defineKqlQuery()
              .equals('values[Loan Type]', 'loanType')
              .in('coreState', 'states')
              .end()({ loanType: activeFilter, states: ['Draft', 'Submitted'] })
          : defineKqlQuery()
              .in('coreState', 'states')
              .end()({ states: ['Draft', 'Submitted'] }),
        include: ['details', 'values', 'form', 'form.attributesMap'],
        limit: 1000,
      },
    }),
    [activeFilter],
  );

  const { initialized, loading, response } = useData(
    searchSubmissions,
    params,
  );
  const submissions = response?.submissions || [];

  // Count submissions per stage
  const stageCounts = useMemo(() => {
    const counts = {};
    PIPELINE_STAGES.forEach(stage => {
      counts[stage] = 0;
    });
    submissions.forEach(s => {
      const stage = s.values?.['Stage'];
      if (stage && counts[stage] !== undefined) {
        counts[stage]++;
      }
    });
    return counts;
  }, [submissions]);

  return (
    <div className="flex-c-st min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/5 via-base-200 to-accent/5 gutter py-8">
        <div className="max-w-screen-2xl mx-auto flex-c-st gap-6">
          <div className="flex-bc flex-wrap gap-4">
            <div className="flex-sc gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
                <Icon name="layout-kanban" size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">
                  Loan Pipeline
                </h1>
                <p className="text-sm text-base-content/50">
                  {submissions.length} active applications
                </p>
              </div>
            </div>
            {/* Filter Buttons */}
            <div className="flex-sc gap-2">
              {LOAN_TYPE_FILTERS.map(filter => (
                <button
                  key={filter.label}
                  type="button"
                  className={clsx(
                    'kbtn kbtn-sm transition-all duration-200',
                    activeFilter === filter.value
                      ? 'kbtn-primary shadow-md shadow-primary/20'
                      : 'kbtn-ghost bg-base-100',
                  )}
                  onClick={() => setActiveFilter(filter.value)}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Stage Summary Bar */}
          <div className="grid grid-cols-4 md:grid-cols-7 gap-2 w-full">
            {PIPELINE_STAGES.map(stage => (
              <div
                key={stage}
                className="kcard bg-base-100/80 backdrop-blur-sm"
              >
                <div className="kcard-body p-3 gap-1 items-center text-center">
                  <Icon
                    name={STAGE_ICONS[stage] || 'circle'}
                    size={18}
                    className="text-primary/60"
                  />
                  <span className="text-2xl font-bold tabular-nums">
                    {stageCounts[stage]}
                  </span>
                  <span className="text-[10px] text-base-content/50 font-medium leading-tight">
                    {stage}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Kanban Content */}
      <div className="gutter py-6 flex-auto max-w-screen-2xl mx-auto w-full">
        {!initialized ? null : response?.error ? (
          <Error error={response.error} />
        ) : loading && submissions.length === 0 ? (
          <Loading />
        ) : (
          <StageKanban submissions={submissions} stages={PIPELINE_STAGES} />
        )}
      </div>
    </div>
  );
};
