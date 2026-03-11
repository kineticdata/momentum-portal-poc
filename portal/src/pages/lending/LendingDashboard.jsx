import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import clsx from 'clsx';
import { defineKqlQuery, searchSubmissions } from '@kineticdata/react';
import { Icon } from '../../atoms/Icon.jsx';
import { MetricsCard } from '../../components/lending/MetricsCard.jsx';
import { RiskBadge } from '../../components/lending/RiskBadge.jsx';
import { Error } from '../../components/states/Error.jsx';
import { Loading } from '../../components/states/Loading.jsx';
import { useData } from '../../helpers/hooks/useData.js';
import { getAttributeValue } from '../../helpers/records.js';

// Mock metrics data for POC
const MOCK_METRICS = [
  {
    title: 'Total Applications',
    value: '2,847',
    icon: 'file-text',
    trend: { value: '+12.5%', direction: 'up' },
    color: 'primary',
  },
  {
    title: 'Pending Approval',
    value: '184',
    icon: 'clock',
    trend: { value: '-3.2%', direction: 'down' },
    color: 'warning',
  },
  {
    title: 'Avg Processing Days',
    value: '4.2',
    icon: 'calendar-stats',
    trend: { value: '-18%', direction: 'down' },
    color: 'success',
  },
  {
    title: 'STP Rate',
    value: '78.6%',
    icon: 'bolt',
    trend: { value: '+5.1%', direction: 'up' },
    color: 'info',
  },
  {
    title: 'Active Loans',
    value: '1,923',
    icon: 'building-bank',
    trend: { value: '+8.7%', direction: 'up' },
    color: 'accent',
  },
  {
    title: 'Fraud Detection Rate',
    value: '99.2%',
    icon: 'shield-check',
    trend: { value: '+0.3%', direction: 'up' },
    color: 'error',
  },
];

const STAGE_COLORS = {
  'Pre-Screening': 'kbadge-info',
  'Document Collection': 'kbadge-warning',
  'Document Verification': 'kbadge-warning',
  'Fraud Check': 'kbadge-error',
  'Credit Assessment': 'kbadge-primary',
  Approval: 'kbadge-accent',
  Disbursement: 'kbadge-success',
  Active: 'kbadge-success',
  Declined: 'kbadge-error',
};

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

export const LendingDashboard = () => {
  const { profile } = useSelector(state => state.app);

  return (
    <>
      {/* Welcome Hero */}
      <div className="bg-gradient-to-br from-primary/10 via-base-200 to-accent/5 gutter py-10 md:py-14">
        <div className="flex-c-st gap-6 max-w-screen-xl mx-auto">
          <div className="flex-c-st gap-2">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
              Welcome back,{' '}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {profile.displayName}
              </span>
            </h1>
            <p className="text-base-content/60 text-lg">
              Commercial Lending Operations Dashboard
            </p>
          </div>
          <div className="flex-sc gap-3 flex-wrap">
            <Link
              to="/apply"
              className="kbtn kbtn-primary kbtn-lg gap-2 shadow-lg shadow-primary/25"
            >
              <Icon name="plus" size={20} />
              New Application
            </Link>
            <Link
              to="/pipeline"
              className="kbtn kbtn-outline kbtn-base kbtn-lg gap-2"
            >
              <Icon name="layout-kanban" size={20} />
              View Pipeline
            </Link>
            <Link
              to="/queue"
              className="kbtn kbtn-outline kbtn-base kbtn-lg gap-2"
            >
              <Icon name="list-check" size={20} />
              My Queue
            </Link>
          </div>
        </div>
      </div>

      <div className="gutter py-8">
        <div className="flex-c-st gap-8 max-w-screen-xl mx-auto">
        {/* Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 w-full">
          {MOCK_METRICS.map(metric => (
            <MetricsCard key={metric.title} {...metric} />
          ))}
        </div>

        {/* Content Sections */}
        <div className="flex-c-st xl:flex-bs gap-8 xl:gap-10 w-full items-stretch">
          {/* Recent Applications */}
          <div className="flex-1 flex-c-st gap-4 min-w-0">
            <div className="flex-bc">
              <h2 className="text-xl md:text-2xl font-bold">
                Recent Applications
              </h2>
              <Link
                to="/pipeline"
                className="kbtn kbtn-sm kbtn-ghost gap-1 text-primary"
              >
                View All
                <Icon name="arrow-right" size={16} />
              </Link>
            </div>
            <div className="kcard overflow-hidden">
              <div className="kcard-body p-0">
                <RecentApplicationsTable />
              </div>
            </div>
          </div>

          {/* My Tasks */}
          <div className="xl:w-96 flex-c-st gap-4 flex-none">
            <div className="flex-bc">
              <h2 className="text-xl md:text-2xl font-bold">My Tasks</h2>
              <Link
                to="/queue"
                className="kbtn kbtn-sm kbtn-ghost gap-1 text-primary"
              >
                View All
                <Icon name="arrow-right" size={16} />
              </Link>
            </div>
            <MyTasksList />
          </div>
        </div>
        </div>
      </div>
    </>
  );
};

const RecentApplicationsTable = () => {
  const params = useMemo(
    () => ({
      kapp: 'commercial-lending',
      form: 'loan-application',
      search: {
        q: defineKqlQuery().end()(),
        include: ['details', 'values', 'form', 'form.attributesMap'],
        limit: 5,
      },
    }),
    [],
  );

  const { initialized, loading, response } = useData(
    searchSubmissions,
    params,
  );
  const submissions = response?.submissions || [];

  if (!initialized) return null;
  if (response?.error) return <Error error={response.error} />;
  if (loading && submissions.length === 0) return <Loading />;

  return (
    <div className="overflow-x-auto">
      <table className="ktable ktable-sm">
        <thead>
          <tr className="bg-base-200/50">
            <th className="font-semibold">Borrower</th>
            <th className="font-semibold">Amount</th>
            <th className="font-semibold">Type</th>
            <th className="font-semibold">Stage</th>
            <th className="font-semibold">Risk</th>
            <th className="font-semibold">Date</th>
            <th className="font-semibold">Status</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map(submission => (
            <tr
              key={submission.id}
              className="hover:bg-base-200/30 transition-colors"
            >
              <td>
                <Link
                  to={`/applications/${submission.id}`}
                  className="font-medium text-primary hover:underline"
                >
                  {submission.values?.['Borrower Name'] ||
                    submission.values?.['Company Name'] ||
                    submission.label ||
                    '--'}
                </Link>
              </td>
              <td className="font-mono text-sm">
                {formatCurrency(submission.values?.['Loan Amount'])}
              </td>
              <td className="text-sm">
                {submission.values?.['Loan Type'] || '--'}
              </td>
              <td>
                <span
                  className={clsx(
                    'kbadge kbadge-sm',
                    STAGE_COLORS[submission.values?.['Stage']] ||
                      'kbadge-ghost',
                  )}
                >
                  {submission.values?.['Stage'] || 'New'}
                </span>
              </td>
              <td>
                <RiskBadge
                  level={submission.values?.['Risk Level'] || 'Medium'}
                />
              </td>
              <td className="text-sm text-base-content/60">
                {formatDate(submission.createdAt)}
              </td>
              <td>
                <span
                  className={clsx('kbadge kbadge-sm kbadge-outline', {
                    'kbadge-success': submission.coreState === 'Closed',
                    'kbadge-info': submission.coreState === 'Submitted',
                    'kbadge-warning': submission.coreState === 'Draft',
                  })}
                >
                  {submission.coreState}
                </span>
              </td>
            </tr>
          ))}
          {submissions.length === 0 && (
            <tr>
              <td colSpan={7} className="text-center text-base-content/50 py-8">
                No recent applications found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

const MyTasksList = () => {
  const { profile } = useSelector(state => state.app);

  const params = useMemo(
    () => ({
      kapp: 'commercial-lending',
      search: {
        q: defineKqlQuery()
          .in('type', 'types')
          .or()
          .equals('values[Assigned Individual]', 'username')
          .in('values[Assigned Team]', 'teams')
          .end()
          .end()({
          types: ['Approval', 'Task', 'Review'],
          username: profile.username,
          teams: profile.memberships?.map(m => m.team.name) || [],
        }),
        include: ['details', 'values', 'form', 'form.attributesMap'],
        limit: 5,
      },
    }),
    [profile],
  );

  const { initialized, loading, response } = useData(
    searchSubmissions,
    params,
  );
  const submissions = response?.submissions || [];

  if (!initialized) return null;
  if (response?.error) return <Error error={response.error} />;
  if (loading && submissions.length === 0) return <Loading />;

  return (
    <div className="flex-c-st gap-3">
      {submissions.map(submission => {
        const icon = getAttributeValue(submission.form, 'Icon', 'clipboard');
        const typeBadge =
          submission.form?.name === 'Approval'
            ? 'kbadge-accent'
            : submission.form?.name === 'Review'
              ? 'kbadge-info'
              : 'kbadge-primary';

        return (
          <Link
            key={submission.id}
            to={`/queue/${submission.id}`}
            className="kcard hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 w-full"
          >
            <div className="kcard-body gap-3">
              <div className="flex-sc gap-3">
                <div className="icon-box bg-primary/10 text-primary">
                  <Icon name={icon} size={20} />
                </div>
                <div className="flex-auto flex-c-st gap-0.5 min-w-0">
                  <span className="font-medium text-sm line-clamp-1">
                    {submission.label}
                  </span>
                  <span className="text-xs text-base-content/50">
                    {submission.values?.['Assigned Team'] || 'Unassigned'}
                  </span>
                </div>
                <span className={clsx('kbadge kbadge-sm', typeBadge)}>
                  {submission.form?.name || submission.type}
                </span>
              </div>
            </div>
          </Link>
        );
      })}
      {submissions.length === 0 && (
        <div className="kcard">
          <div className="kcard-body text-center text-base-content/50 py-8">
            <Icon
              name="circle-check"
              size={40}
              className="mx-auto mb-2 text-success/40"
            />
            <p>You're all caught up!</p>
          </div>
        </div>
      )}
    </div>
  );
};
