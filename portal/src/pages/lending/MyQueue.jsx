import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import clsx from 'clsx';
import { defineKqlQuery, searchSubmissions } from '@kineticdata/react';
import { Icon } from '../../atoms/Icon.jsx';
import { RiskBadge } from '../../components/lending/RiskBadge.jsx';
import { Error } from '../../components/states/Error.jsx';
import { Loading } from '../../components/states/Loading.jsx';
import { useData } from '../../helpers/hooks/useData.js';
import { getAttributeValue } from '../../helpers/records.js';

const TABS = [
  { label: 'All', value: 'all', icon: 'list' },
  { label: 'Approvals', value: 'Approval', icon: 'thumb-up' },
  { label: 'Tasks', value: 'Task', icon: 'clipboard' },
  { label: 'Reviews', value: 'Review', icon: 'eye' },
];

const TYPE_STYLES = {
  Approval: {
    badge: 'kbadge-accent',
    bg: 'bg-accent/10',
    text: 'text-accent',
    icon: 'thumb-up',
  },
  Task: {
    badge: 'kbadge-primary',
    bg: 'bg-primary/10',
    text: 'text-primary',
    icon: 'clipboard',
  },
  Review: {
    badge: 'kbadge-info',
    bg: 'bg-info/10',
    text: 'text-info',
    icon: 'eye',
  },
};

const formatDate = dateStr => {
  if (!dateStr) return '--';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

const getDaysOpen = dateStr => {
  if (!dateStr) return null;
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.floor(diff / 86400000);
};

export const MyQueue = () => {
  const { profile } = useSelector(state => state.app);
  const [activeTab, setActiveTab] = useState('all');

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
        limit: 25,
      },
    }),
    [profile],
  );

  const { initialized, loading, response } = useData(
    searchSubmissions,
    params,
  );
  const allSubmissions = response?.submissions || [];

  // Filter by active tab
  const submissions =
    activeTab === 'all'
      ? allSubmissions
      : allSubmissions.filter(s => s.type === activeTab);

  // Tab counts
  const counts = useMemo(() => {
    const c = { all: allSubmissions.length, Approval: 0, Task: 0, Review: 0 };
    allSubmissions.forEach(s => {
      if (c[s.type] !== undefined) c[s.type]++;
    });
    return c;
  }, [allSubmissions]);

  return (
    <div className="flex-c-st min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-accent/5 via-base-200 to-primary/5 gutter py-8 border-b border-base-300">
        <div className="max-w-screen-lg mx-auto flex-c-st gap-6">
          <div className="flex-sc gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center shadow-lg shadow-accent/20">
              <Icon name="list-check" size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">My Work Queue</h1>
              <p className="text-sm text-base-content/50">
                {allSubmissions.length} items require your attention
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex-sc gap-1 bg-base-100 p-1 rounded-xl border border-base-300 w-fit">
            {TABS.map(tab => (
              <button
                key={tab.value}
                type="button"
                className={clsx(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  activeTab === tab.value
                    ? 'bg-primary text-primary-content shadow-md shadow-primary/20'
                    : 'text-base-content/60 hover:text-base-content hover:bg-base-200',
                )}
                onClick={() => setActiveTab(tab.value)}
              >
                <Icon name={tab.icon} size={16} />
                {tab.label}
                <span
                  className={clsx(
                    'kbadge kbadge-xs',
                    activeTab === tab.value
                      ? 'kbadge-ghost bg-white/20 text-primary-content'
                      : 'kbadge-ghost',
                  )}
                >
                  {counts[tab.value]}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="gutter py-6 max-w-screen-lg mx-auto w-full">
        {!initialized ? null : response?.error ? (
          <Error error={response.error} />
        ) : loading && allSubmissions.length === 0 ? (
          <Loading />
        ) : submissions.length === 0 ? (
          <div className="flex-c-sc py-16 gap-4">
            <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center">
              <Icon name="circle-check" size={40} className="text-success" />
            </div>
            <h3 className="text-xl font-bold">All Caught Up!</h3>
            <p className="text-base-content/50">
              No {activeTab === 'all' ? '' : activeTab.toLowerCase() + ' '}items
              in your queue right now.
            </p>
          </div>
        ) : (
          <div className="flex-c-st gap-3">
            {submissions.map(submission => {
              const typeStyle =
                TYPE_STYLES[submission.form?.name] || TYPE_STYLES.Task;
              const daysOpen = getDaysOpen(submission.createdAt);
              const isUrgent = daysOpen !== null && daysOpen > 3;
              const isCritical = daysOpen !== null && daysOpen > 5;

              return (
                <div
                  key={submission.id}
                  className={clsx(
                    'kcard transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5',
                    isCritical && 'border-l-4 border-l-error',
                    isUrgent && !isCritical && 'border-l-4 border-l-warning',
                  )}
                >
                  <div className="kcard-body">
                    <div className="flex-sc gap-4 flex-wrap">
                      {/* Type Icon */}
                      <div
                        className={clsx(
                          'w-12 h-12 rounded-xl flex items-center justify-center flex-none',
                          typeStyle.bg,
                        )}
                      >
                        <Icon
                          name={typeStyle.icon}
                          size={24}
                          className={typeStyle.text}
                        />
                      </div>

                      {/* Main Content */}
                      <div className="flex-auto min-w-0 flex-c-st gap-1">
                        <div className="flex-sc gap-2 flex-wrap">
                          <span
                            className={clsx(
                              'kbadge kbadge-sm',
                              typeStyle.badge,
                            )}
                          >
                            {submission.form?.name || submission.type}
                          </span>
                          {isUrgent && (
                            <span
                              className={clsx(
                                'kbadge kbadge-sm',
                                isCritical ? 'kbadge-error' : 'kbadge-warning',
                              )}
                            >
                              <Icon name="alert-triangle" size={12} />
                              {isCritical ? 'SLA Breach' : 'SLA Warning'}
                            </span>
                          )}
                        </div>
                        <h3 className="font-semibold line-clamp-1">
                          {submission.label}
                        </h3>
                        <div className="flex-sc gap-4 text-xs text-base-content/50 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Icon name="user" size={12} />
                            {submission.values?.['Borrower Name'] || 'Unknown'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Icon name="users" size={12} />
                            {submission.values?.['Assigned Team'] ||
                              'Unassigned'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Icon name="calendar" size={12} />
                            {formatDate(submission.createdAt)}
                          </span>
                          {daysOpen !== null && (
                            <span
                              className={clsx('flex items-center gap-1', {
                                'text-error font-medium': isCritical,
                                'text-warning font-medium':
                                  isUrgent && !isCritical,
                              })}
                            >
                              <Icon name="clock" size={12} />
                              {daysOpen}d open
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex-sc gap-2 flex-none">
                        <RiskBadge
                          level={
                            submission.values?.['Risk Level'] || 'Medium'
                          }
                        />
                        <Link
                          to={`/applications/${submission.values?.['Originating Id'] || submission.id}`}
                          className="kbtn kbtn-sm kbtn-primary gap-1"
                        >
                          <Icon name="arrow-right" size={16} />
                          Open
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
