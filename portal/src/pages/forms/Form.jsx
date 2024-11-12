import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { KineticForm } from '../../components/kinetic-form/KineticForm.jsx';
import { useCallback, useMemo } from 'react';
import { generateFormLayout } from '../../components/forms/FormLayout.jsx';

export const Form = ({ review }) => {
  const { kappSlug, formSlug, submissionId } = useParams();
  const portalKappSlug = useSelector(state => state.app.kappSlug);
  const navigate = useNavigate();

  const Layout = useMemo(() => generateFormLayout(), []);

  const handleCompleted = useCallback(
    response => {
      // Redirect if there is no confirmation page to render.
      if (response.submission?.displayedPage?.type !== 'confirmation') {
        navigate(`/requests/${response.submission.id}`);
      }
    },
    [navigate],
  );

  return (
    <KineticForm
      kappSlug={kappSlug || portalKappSlug}
      formSlug={formSlug}
      submissionId={submissionId}
      components={{ Layout }}
      completed={handleCompleted}
      review={review}
    />
  );
};
