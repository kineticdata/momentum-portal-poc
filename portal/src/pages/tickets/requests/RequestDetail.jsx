import { Placeholder } from '../../Placeholder.jsx';
import { Button } from '../../../atoms/Button.js';
import { useSelector } from 'react-redux';

export const RequestDetail = () => {
  const mobile = useSelector(state => state.view.mobile);

  return (
    <>
      <div className="flex flex-col mt-4 mb-6 md:my-8">
        <div className="flex justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <Button
              variant="tertiary"
              icon="arrow-left"
              to=".."
              aria-label="Back"
            />
            <div className="h3">Title</div>
            <span>Status</span>
          </div>
          {!mobile && (
            <Button variant="tertiary" icon="file-check" to="review">
              View Request
            </Button>
          )}
        </div>
      </div>

      <div className="mx-auto lg:px-10 w-full max-w-screen-lg">
        <Placeholder title="Request Activity"></Placeholder>
      </div>

      {mobile && (
        <div className="flex justify-center py-6 mt-auto">
          <Button variant="secondary" icon="file-check" to="review">
            View Request
          </Button>
        </div>
      )}
    </>
  );
};
