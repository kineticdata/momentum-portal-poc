import { Route, Routes } from 'react-router-dom';
import { RequestsList } from './RequestsList.jsx';
import { RequestDetail } from './RequestDetail.jsx';
import { defineKqlQuery, searchSubmissions } from '@kineticdata/react';
import { useSelector } from 'react-redux';
import { useMemo, useState } from 'react';
import useDataList from '../../../helpers/useDataList.js';

const buildMyRequestsSearch = (profile, filters) => {
  // Start query builder
  const search = defineKqlQuery();

  // Limit form types
  search.in('type', 'types');
  // Add core state query if filtering by either status
  if (filters.status.open || filters.status.closed || filters.status.draft) {
    search.in('coreState', 'statuses');
  }
  // Add assignment query, making sure at least one part is always included
  search.or();
  search.equals('createdBy', 'username');
  search.equals('submittedBy', 'username');
  search.equals('values[Requested For]', 'username');
  // End or block
  search.end();
  // End query builder
  search.end();

  return {
    q: search.end()({
      types: ['Service'],
      statuses: [
        filters.status.draft && 'Draft',
        filters.status.open && 'Submitted',
        filters.status.closed && 'Closed',
      ].filter(Boolean),
      username: profile.username,
    }),
    include: ['details', 'values', 'form', 'form.attributesMap'],
    limit: 10,
  };
};

export const Requests = () => {
  const { profile, kappSlug } = useSelector(state => state.app);

  // State for filters
  const [filters, setFilters] = useState({
    status: { draft: false, open: false, closed: false },
  });

  // Search object based on the current filters
  const search = useMemo(
    () => buildMyRequestsSearch(profile, filters),
    [profile, filters],
  );

  // Retrieve the actions list data
  const [listData, listActions] = useDataList(
    searchSubmissions,
    [{ kapp: kappSlug, search }],
    ({ submissions }) => submissions,
  );

  return (
    <Routes>
      <Route path=":id" element={<RequestDetail listActions={listActions} />} />
      <Route
        path="*"
        element={
          <RequestsList
            listData={listData}
            listActions={listActions}
            filters={filters}
            setFilters={setFilters}
          />
        }
      />
    </Routes>
  );
};
