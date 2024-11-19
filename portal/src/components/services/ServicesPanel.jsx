import { useState } from 'react';
import { useSelector } from 'react-redux';
import { ark } from '@ark-ui/react/factory';
import { produce } from 'immer';
import { fetchCategory, fetchForms } from '@kineticdata/react';
import { Panel } from '../../atoms/Panel.jsx';
import {
  Button,
  CategoryButton,
  CloseButton,
  PopularServiceButton,
} from '../../atoms/Button.js';
import useDataItem from '../../helpers/useDataItem.js';
import { getAttributeValue } from '../../helpers/records.js';
import { Loading } from '../states/Loading.jsx';
import clsx from 'clsx';
import { ServiceCard } from './ServiceCard.jsx';

export const ServicesPanel = ({ children }) => {
  const mobile = useSelector(state => state.view.mobile);
  const { kapp, kappSlug } = useSelector(state => state.app);

  // Get the categories and filter out any hidden ones
  const categories = kapp.categories?.filter(
    c => getAttributeValue(c, 'Hidden', 'false')?.toLowerCase() !== 'true',
  );

  // State for opening the panel
  const [open, setOpen] = useState(false);
  // State for path of categories and subcategories that have been opened
  const [path, setPath] = useState([]);

  // Are there any categories
  const hasCategories = categories?.length > 0;
  // Current category object
  const currentCategory =
    path.length > 0
      ? categories?.find(c => c.slug === path[path.length - 1])
      : null;
  // List of subcategories for current category, or all root categories
  const currentCategories = currentCategory
    ? categories.filter(
        c => getAttributeValue(c, 'Parent') === currentCategory.slug,
      )
    : categories?.filter(c => !getAttributeValue(c, 'Parent'));

  // Handler for going into a category
  const handleEnterCategory = categorySlug => {
    // The setTimeout is needed as a workaround to an ArkUI bug. If you click a
    // button in a Dialog, and that button is removed from the DOM due to the
    // click handler, the Dialog closes unexpectedly.
    window.setTimeout(
      () =>
        setPath(p =>
          produce(p, o => {
            o.push(categorySlug);
          }),
        ),
      0,
    );
  };
  // Handler for going to the previous category page, or root page
  const handleExitCategory = () => {
    // The setTimeout is needed as a workaround to an ArkUI bug. If you click a
    // button in a Dialog, and that button is removed from the DOM due to the
    // click handler, the Dialog closes unexpectedly.
    window.setTimeout(
      () =>
        setPath(p =>
          produce(p, o => {
            o.pop();
          }),
        ),
      0,
    );
  };

  // Retrieve the popular requests when the panel opens
  const [popularData] = useDataItem(
    fetchCategory,
    open && [
      {
        kappSlug,
        categorySlug: 'popular-services',
        include:
          'categorizations.form,categorizations.form.attributesMap,categorizations.form.categorizations.category',
      },
    ],
    response => response.category?.categorizations?.map(c => c?.form),
  );

  // Retrieve the services for the current category when a category is opened
  const [servicesData] = useDataItem(
    fetchCategory,
    open &&
      !!currentCategory && [
        {
          kappSlug,
          categorySlug: currentCategory.slug,
          include:
            'categorizations.form,categorizations.form.attributesMap,categorizations.form',
        },
      ],
    // Pull our the list of forms from the category
    response => response.category?.categorizations?.map(c => c?.form),
  );

  // Retrieve all services if there are no categories
  const [allServicesData] = useDataItem(
    fetchForms,
    open &&
      !hasCategories && [
        {
          kappSlug,
          include: 'attributesMap',
          q: 'type = "Service"',
        },
      ],
    response => response.forms,
  );

  // Are any of the data fetches for services loading
  const servicesLoading = servicesData.loading || allServicesData.loading;

  // When clicking a link to a service, if we're not on mobile, override the state for the link
  const serviceLinkProps = !mobile ? { state: null } : {};

  return (
    categories && (
      <Panel
        open={open}
        onOpenChange={({ open }) => setOpen(open)}
        onExitComplete={() => setPath([])}
      >
        <ark.div asChild slot="trigger">
          {children}
        </ark.div>
        <div slot="content">
          <div className="flex justify-between items-center gap-3 mb-6">
            {currentCategory && (
              <Button
                variant="tertiary"
                icon="arrow-left"
                aria-label="Exit Category"
                onClick={() => handleExitCategory()}
              />
            )}
            <span className="h3">
              {!currentCategory ? 'New Request' : currentCategory.name}
            </span>
            <CloseButton className="ml-auto" onClick={() => setOpen(false)} />
          </div>

          <div className="flex flex-col items-stretch gap-10">
            {/* Render a loader while popular services are loading */}
            {popularData.loading && <Loading />}

            {/* Render the popular services when not viewing a category */}
            {!currentCategory &&
              popularData.initialized &&
              popularData.data?.length > 0 && (
                <div className="flex flex-col items-stretch gap-3">
                  <div className="h3 text-center">Popular</div>
                  <div
                    className={clsx(
                      'flex gap-2',
                      mobile && ['-mx-6 px-6 overflow-x-auto'],
                      !mobile && ['flex-col'],
                    )}
                  >
                    {popularData.data.map((popularForm, index) =>
                      mobile ? (
                        <PopularServiceButton
                          key={popularForm.slug}
                          index={index}
                          icon={getAttributeValue(popularForm, 'Icon', 'forms')}
                          category={
                            popularForm.categorizations?.find(
                              c => c.category.slug !== 'popular-services',
                            )?.category?.name
                          }
                          className="flex-none w-[calc(100%/3-0.75rem/2)]"
                          to={`/forms/${popularForm.slug}`}
                          onClick={() => setOpen(false)}
                          {...serviceLinkProps}
                        >
                          {popularForm.name}
                        </PopularServiceButton>
                      ) : (
                        <ServiceCard
                          key={popularForm.slug}
                          form={popularForm}
                          onClick={() => setOpen(false)}
                          {...serviceLinkProps}
                        />
                      ),
                    )}
                  </div>
                </div>
              )}

            {/* Render the categories when there are any */}
            {!!currentCategories?.length > 0 && (
              <div className="flex flex-col items-stretch gap-3">
                {!currentCategory && (
                  <div className="h3 text-center">Categories</div>
                )}
                <div
                  className={clsx('flex flex-wrap justify-center  gap-7', {
                    'md:justify-start': !currentCategory,
                    'md:justify-evenly': currentCategory,
                  })}
                >
                  {currentCategories.map((category, index) => (
                    <CategoryButton
                      key={category.slug}
                      index={index}
                      icon={getAttributeValue(category, 'Icon')}
                      className="w-[8.4375rem]"
                      onClick={() => handleEnterCategory(category.slug)}
                    >
                      {category.name}
                    </CategoryButton>
                  ))}
                </div>
              </div>
            )}

            {/* Render a loader while services are loading */}
            {!popularData.loading && servicesLoading && <Loading />}

            {/* Render the services for the current category */}
            {servicesData.initialized &&
              !servicesData.loading &&
              servicesData.data?.length > 0 && (
                <div className="flex flex-col items-stretch gap-3">
                  <div className="h3 text-center">Services</div>
                  <div className={clsx('flex flex-col gap-2')}>
                    {servicesData.data.map(form => (
                      <ServiceCard
                        key={form.slug}
                        form={form}
                        onClick={() => setOpen(false)}
                        {...serviceLinkProps}
                      />
                    ))}
                  </div>
                </div>
              )}

            {/* Render all services if there are no categories */}
            {allServicesData.initialized &&
              allServicesData.data?.length > 0 && (
                <div className="flex flex-col items-stretch gap-3">
                  <div className="h3 text-center">All Services</div>
                  <div className={clsx('flex flex-col gap-2')}>
                    {allServicesData.data.map(form => (
                      <ServiceCard
                        key={form.slug}
                        form={form}
                        onClick={() => setOpen(false)}
                        {...serviceLinkProps}
                      />
                    ))}
                  </div>
                </div>
              )}
          </div>
        </div>
      </Panel>
    )
  );
};
