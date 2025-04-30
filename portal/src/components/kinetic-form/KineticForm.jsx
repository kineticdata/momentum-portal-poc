import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CoreForm } from '@kineticdata/react';
import { Button } from '../../atoms/Button.jsx';
import { valuesFromQueryParams } from '../../helpers/index.js';
import { toastSuccess } from '../../helpers/toasts.js';
import { Loading as Pending } from '../states/Loading.jsx';

const ReviewPaginationControl = ({ index, actions }) => {
  const mobile = useSelector(state => state.view.mobile);
  return (
    <div className="flex justify-between md:justify-center items-center gap-3 md:gap-5 mt-5">
      <Button
        variant="secondary"
        onClick={actions.previousPage}
        disabled={!actions.previousPage}
        icon="chevron-left"
      >
        Previous{!mobile ? ' Page' : ''}
      </Button>
      <div
        className="flex justify-center items-center w-11 h-11 bg-accent text-accent-content rounded-full font-semibold"
        title="Current Page"
      >
        {index + 1}
      </div>
      <Button
        variant="secondary"
        onClick={actions.nextPage}
        disabled={!actions.nextPage}
        iconEnd="chevron-right"
      >
        Next{!mobile ? ' Page' : ''}
      </Button>
    </div>
  );
};

export const KineticForm = ({
  kappSlug,
  formSlug,
  submissionId,
  values,
  components = {},
  ...props
}) => {
  const [searchParams] = useSearchParams();
  const paramFieldValues = valuesFromQueryParams(searchParams);
  const navigate = useNavigate();

  const handleCreated = useCallback(
    response => {
      // Redirect to route with submission id if submission is not submitted or
      // there is a confirmation page to render.
      if (
        response.submission.coreState !== 'Submitted' ||
        response.submission?.displayedPage?.type === 'confirmation'
      ) {
        navigate(response.submission.id, { state: { persistToasts: true } });
      }

      if (response.submission.coreState === 'Draft') {
        toastSuccess({ title: 'Saved successfully.' });
      }
    },
    [navigate],
  );

  const handleUpdated = useCallback(response => {
    if (response.submission.coreState === 'Draft') {
      toastSuccess({ title: 'Saved successfully.' });
    }
  }, []);

  return (
    <CoreForm
      submission={submissionId}
      kapp={kappSlug}
      form={formSlug}
      values={values || paramFieldValues}
      components={{ Pending, ReviewPaginationControl, ...components }}
      created={handleCreated}
      updated={handleUpdated}
      {...props}
    />
  );
};
