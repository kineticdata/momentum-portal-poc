import { useSelector } from 'react-redux';
import clsx from 'clsx';
import { TicketsTabs } from '../../../components/tickets/TicketsTabs.jsx';
import {
  EmptyCard,
  TicketCard,
} from '../../../components/tickets/TicketCard.jsx';
import { Error } from '../../../components/states/Error.jsx';
import { Loading } from '../../../components/states/Loading.jsx';
import { Button } from '../../../atoms/Button.jsx';
import { TicketFilters } from '../../../components/tickets/TicketFilters.jsx';

export const RequestsList = ({
  listData,
  listActions,
  filters,
  setFilters,
}) => {
  const mobile = useSelector(state => state.view.mobile);

  const { initialized, error, loading, data, pageNumber } = listData;
  const { nextPage, previousPage, reloadPage } = listActions;

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
        <TicketsTabs active="requests" />
        <TicketFilters
          type="requests"
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
              {/* Mobile previous page button */}
              {mobile && !loading && previousPage && (
                <Button
                  variant="tertiary"
                  onClick={previousPage}
                  disabled={loading}
                  icon="chevron-up"
                >
                  previous
                </Button>
              )}

              {/* Loading indicator if we're loading and there is no data */}
              {loading &&
                (mobile ? (
                  <Loading xsmall size={36} />
                ) : (
                  !data && <Loading className="col-start-1 col-end-5" />
                ))}

              {/* List of data */}
              {data?.length > 0 &&
                data.map(submission => (
                  <TicketCard
                    key={submission.id}
                    submission={submission}
                    reload={reloadPage}
                  />
                ))}

              {/* Empty message if we're not loading and there is no data*/}
              {data?.length === 0 && (
                <EmptyCard>
                  There are no requests to show
                  {previousPage ? ' on this page' : ''}.
                </EmptyCard>
              )}

              {/*Mobile next page button*/}
              {mobile && !loading && nextPage && (
                <Button
                  variant="tertiary"
                  onClick={nextPage}
                  disabled={loading}
                >
                  more...
                </Button>
              )}

              {/* Non mobile pagination UI */}
              {!mobile && (data?.length > 0 || previousPage) && (
                <div className="col-start-1 col-end-5 py-2.5 px-6 flex justify-center items-center gap-6 bg-white rounded-xl shadow-card min-h-16">
                  <Button
                    variant="secondary"
                    onClick={previousPage}
                    disabled={!previousPage || loading}
                    icon="chevron-left"
                  >
                    Previous
                  </Button>
                  {loading ? (
                    <Loading xsmall size={36} />
                  ) : (
                    <div className="flex justify-center items-center w-11 h-11 bg-secondary-400 rounded-full font-semibold">
                      {pageNumber}
                    </div>
                  )}
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
