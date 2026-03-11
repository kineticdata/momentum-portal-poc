import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../atoms/Icon.jsx';
import { KineticForm } from '../../components/kinetic-form/KineticForm.jsx';

export const NewApplication = () => {
  const navigate = useNavigate();

  const handleCompleted = useCallback(
    response => {
      if (response?.submission?.id) {
        navigate(`/applications/${response.submission.id}`);
      }
    },
    [navigate],
  );

  const handleCreated = useCallback(
    response => {
      if (
        response?.submission?.coreState === 'Submitted' &&
        response?.submission?.displayedPage?.type !== 'confirmation'
      ) {
        navigate(`/applications/${response.submission.id}`);
      }
    },
    [navigate],
  );

  return (
    <div className="flex-c-st min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/8 via-base-200 to-success/5 gutter py-8 border-b border-base-300">
        <div className="max-w-screen-xl mx-auto flex-sc gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-xl shadow-primary/25">
            <Icon name="file-plus" size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              New Loan Application
            </h1>
            <p className="text-sm text-base-content/50 mt-1">
              Complete the form below to submit a new commercial loan
              application
            </p>
          </div>
        </div>
      </div>

      {/* Form Container */}
      <div className="gutter py-8">
        <div className="max-w-screen-xl mx-auto w-full">
        <div className="kcard">
          <div className="kcard-body">
            <KineticForm
              kappSlug="commercial-lending"
              formSlug="loan-application"
              completed={handleCompleted}
              created={handleCreated}
            />
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};
