import { Badges } from './Badges.jsx';
import { Buttons } from './Buttons.jsx';

export const Theme = () => {
  return (
    <div className="flex flex-col gap-6 my-8">
      <h1>Theme Builder</h1>

      <Buttons />
      <Badges />
    </div>
  );
};
