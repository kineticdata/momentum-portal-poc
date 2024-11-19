import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { KineticForm } from '../../components/kinetic-form/KineticForm.jsx';
import { useCallback, useMemo } from 'react';
import { generateFormLayout } from '../../components/forms/FormLayout.jsx';

export const Form = ({ review }) => {
  const mobile = useSelector(state => state.view.mobile);
  const { kappSlug, formSlug, submissionId } = useParams();
  const portalKappSlug = useSelector(state => state.app.kappSlug);
  const navigate = useNavigate();
  const location = useLocation();
  // If backPath state isn't set, set back path to the requests page if there
  // is a submission id, or to the home page otherwise, but only on mobile
  // since the UI doesn't have any other way out of this page on mobile.
  const backTo =
    location.state?.backPath ||
    (submissionId ? '/requests' : mobile ? '/' : null);

  const Layout = useMemo(() => generateFormLayout({ backTo }), []);

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
