import { useSelector } from 'react-redux';
import clsx from 'clsx';
import { TicketsTabs } from '../../../components/tickets/TicketsTabs.jsx';
import { TicketFilters } from '../../../components/tickets/TicketFilters.jsx';
import {
  EmptyCard,
  TicketCard,
} from '../../../components/tickets/TicketCard.jsx';
import { Error } from '../../../components/states/Error.jsx';
import { Loading } from '../../../components/states/Loading.jsx';
import { Button } from '../../../atoms/Button.js';

export const ActionsList = ({ listData, listActions, filters, setFilters }) => {
  const mobile = useSelector(state => state.view.mobile);

  const { initialized, error, loading, data, pageNumber } = listData;
  const { nextPage, previousPage } = listActions;

  return (
    <>
      <div
        className={clsx(
          // Mobile first styles
          'my-4 flex max-xl:flex-col justify-between gap-6',
          // Non mobile styles
          'md:my-6 md:items-center',
        )}
      >
        <TicketsTabs active="actions" />
        <TicketFilters
          type="actions"
          filters={filters}
          setFilters={setFilters}
        ></TicketFilters>
      </div>

      {initialized && (
        <>
          {error ? (
            <Error error={error} />
          ) : (
            <div className="flex flex-col gap-4 mb-4 md:mb-6 md:grid md:grid-cols-[auto_2fr_1fr_auto]">
              {mobile && previousPage && (
                <Button
                  variant="tertiary"
                  onClick={previousPage}
                  disabled={loading}
                  icon="chevron-up"
                >
                  previous
                </Button>
              )}
              {loading && (
                <Loading className={!mobile ? 'col-start-1 col-end-5' : null} />
              )}
              {!loading &&
                data.map(submission => (
                  <TicketCard key={submission.id} submission={submission} />
                ))}
              {!loading && data.length === 0 && (
                <EmptyCard>There are no actions to show.</EmptyCard>
              )}
              {mobile && nextPage && (
                <Button
                  variant="tertiary"
                  onClick={nextPage}
                  disabled={loading}
                >
                  more...
                </Button>
              )}
              {!mobile && data?.length > 0 && (
                <div className="col-start-1 col-end-5 py-2.5 px-6 flex justify-center items-center gap-6 bg-white rounded-xl shadow-card min-h-16">
                  <Button
                    variant="secondary"
                    onClick={previousPage}
                    disabled={!previousPage || loading}
                    icon="chevron-left"
                  >
                    Previous
                  </Button>
                  <div className="flex justify-center items-center w-11 h-11 bg-secondary-400 rounded-full font-semibold">
                    {pageNumber}
                  </div>
                  <Button
                    variant="secondary"
                    onClick={nextPage}
                    disabled={!nextPage || loading}
                    iconEnd="chevron-right"
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </>
  );
};
