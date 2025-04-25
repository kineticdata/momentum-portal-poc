import { useSelector } from 'react-redux';
import { fetchCategory } from '@kineticdata/react';
import { Loading } from '../states/Loading.jsx';
import clsx from 'clsx';
import { PopularServiceButton } from '../../atoms/Button.jsx';
import { getAttributeValue } from '../../helpers/records.js';
import { useMemo } from 'react';
import { useData } from '../../helpers/hooks/useData.js';

export const PopularServicesSection = () => {
  const { mobile, desktop } = useSelector(state => state.view);
  const { kappSlug } = useSelector(state => state.app);

  // Parameters for the query
  const params = useMemo(
    () => ({
      kappSlug,
      categorySlug: 'popular-services',
      include:
        'categorizations.form,categorizations.form.attributesMap,categorizations.form.categorizations.category',
    }),
    [kappSlug],
  );

  // Retrieve the popular requests when the panel opens
  const { initialized, loading, response } = useData(fetchCategory, params);
  const popularForms = response?.category?.categorizations?.map(c => c?.form);

  return loading ? (
    <Loading />
  ) : (
    initialized && popularForms?.length > 0 && (
      <div
        className={clsx(
          'flex gap-2 max-md:-mx-(--gutter-size) max-md:px-(--gutter-size) max-md:overflow-x-auto',
          'md:max-xl:justify-evenly',
          'xl:grid xl:grid-cols-2 xl:gap-6',
        )}
      >
        {popularForms.slice(0, mobile ? 6 : 4).map((popularForm, index) => (
          <PopularServiceButton
            key={popularForm.slug}
            index={index}
            icon={getAttributeValue(popularForm, 'Icon', 'forms')}
            category={
              popularForm.categorizations?.find(
                c => c.category.slug !== 'popular-services',
              )?.category?.name
            }
            small={!desktop}
            className="flex-none max-md:w-[calc(100%/3-0.75rem/2)]"
            to={`/forms/${popularForm.slug}`}
          >
            {popularForm.name}
          </PopularServiceButton>
        ))}
      </div>
    )
  );
};
