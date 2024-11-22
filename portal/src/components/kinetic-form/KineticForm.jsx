import { useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CoreForm } from '@kineticdata/react';
import { valuesFromQueryParams } from '../../helpers/index.js';
import { toastSuccess } from '../../helpers/toasts.js';
import { Loading as Pending } from '../states/Loading.jsx';

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
      components={{ Pending, ...components }}
      created={handleCreated}
      updated={handleUpdated}
      {...props}
    />
  );
};
