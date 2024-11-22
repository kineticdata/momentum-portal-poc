import clsx from 'clsx';
import { useSelector } from 'react-redux';
import { TicketsSection } from '../../components/home/TicketsSection.jsx';
import { ShortcutsSection } from '../../components/home/ShortcutsSection.jsx';
import { WelcomeSection } from '../../components/home/WelcomeSection.jsx';
import { PopularServicesSection } from '../../components/home/PopularServicesSection.jsx';

export const Home = () => {
  const { mobile, tablet, desktop } = useSelector(state => state.view);

  return (
    <div className={clsx('py-6 xl:flex xl:gap-14')}>
      {desktop && (
        <>
          <div className="flex-1 xl:basis-[36%] min-w-0 flex flex-col gap-6">
            <WelcomeSection />
            <TicketsSection />
          </div>
          <div className="flex-1 xl:basis-[60%] flex flex-col gap-6">
            <PopularServicesSection />
            <ShortcutsSection />
          </div>
        </>
      )}
      {(mobile || tablet) && (
        <div className="flex flex-col items-stretch gap-10">
          <WelcomeSection />
          <PopularServicesSection />
          <TicketsSection />
          <ShortcutsSection />
        </div>
      )}
    </div>
  );
};
