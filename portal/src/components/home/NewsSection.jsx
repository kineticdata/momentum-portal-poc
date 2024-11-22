import { useSelector } from 'react-redux';
import clsx from 'clsx';
import { Carousel } from '@ark-ui/react/carousel';
import { defineKqlQuery, searchSubmissions } from '@kineticdata/react';
import { sortBy } from '../../helpers/index.js';
import useDataList from '../../helpers/useDataList.js';
import { Loading } from '../states/Loading.jsx';
import { useEffect, useState } from 'react';
import { Button } from '../../atoms/Button.jsx';

const NewsLink = ({ title, description, link, image, index, mobile }) => {
  return (
    <a
      href={link}
      target="_blank"
      rel="noreferrer"
      className="w-full h-full flex outline-0"
      aria-label={`Article ${index + 1}`}
      tabIndex={-1}
    >
      <div
        className={clsx(
          // Common styles
          'flex-auto flex flex-col',
          // Mobile first styles
          'py-4 px-3',
          // Non mobile styles
          'md:gap-4 md:py-10 md:px-20',
        )}
      >
        <div
          className={clsx(
            // Common styles
            'text-primary-100 font-medium ',
            // Mobile first styles
            'text-sm line-clamp-3',
            // Non mobile styles
            'md:text-h3 md:line-clamp-1',
          )}
        >
          {title}
        </div>
        {!mobile && (
          <div className="flex-none text-primary-100 line-clamp-1">
            {description}
          </div>
        )}
      </div>
      {image && (
        <img
          src={image}
          alt={`Image for article ${index + 1}`}
          className="flex-none basis-1/2 md:basis-1/3 h-full object-cover"
        />
      )}
    </a>
  );
};

const newsSearch = {
  q: defineKqlQuery().equals('values[Status]', 'status').end()({
    status: 'Active',
  }),
  include: ['values'],
  limit: 5,
};
// Transform function for converting news submissions into the format
// needed for the UI
const newsTransform = ({ submissions }) =>
  submissions
    .map(({ values }) => ({
      title: values['Title'],
      description: values['Description'],
      link: values['URL'],
      image: values['Image URL'],
      sortOrder: parseInt(values['Sort Order'], 10) || 999,
    }))
    .filter(news => news.link)
    .sort(sortBy('sortOrder'));

export const NewsSection = () => {
  const mobile = useSelector(state => state.view.mobile);
  const { kappSlug } = useSelector(state => state.app);

  const [{ initialized, error, loading, data }] = useDataList(
    searchSubmissions,
    [{ kapp: kappSlug, form: 'portal-news', search: newsSearch }],
    newsTransform,
  );

  const pageSize = data.length || 1;
  const [openIndex, setOpenIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (!paused) {
      const timeout = setTimeout(() => {
        setOpenIndex((openIndex + 1) % pageSize);
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [openIndex, paused, pageSize]);

  return (
    initialized &&
    !error && (
      <>
        {loading && <Loading />}
        {!loading && data.length > 0 && (
          <Carousel.Root
            index={openIndex}
            onIndexChange={({ index }) => setOpenIndex(index)}
            loop={true}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            className={clsx(
              'relative block h-28 md:h-44 overflow-hidden transition',
              'bg-gray-900 bg-glassmorphism-border p-0.5 rounded-2xl',
            )}
          >
            <Carousel.Viewport
              className={clsx(
                'relative flex flex-col h-full w-full overflow-hidden',
                'bg-gray-900 bg-glassmorphism-linear rounded-[0.875rem]',
              )}
            >
              <Carousel.ItemGroup className="flex-auto max-h-full">
                {data.map((news, index) => (
                  <Carousel.Item key={index} index={index}>
                    <NewsLink index={index} mobile={mobile} {...news} />
                  </Carousel.Item>
                ))}
              </Carousel.ItemGroup>
            </Carousel.Viewport>
            <Carousel.IndicatorGroup
              className={clsx(
                'absolute bottom-0.75 left-1.5 md:bottom-5 md:left-[4.625rem]',
              )}
            >
              {data.map((news, index) => (
                <Carousel.Indicator key={index} index={index} asChild>
                  <Button
                    variant="custom"
                    icon="point-filled"
                    size="custom"
                    aria-label={`Show article ${index + 1}`}
                    className={clsx(
                      'p-0 border-transparent text-white opacity-20 data-[current]:opacity-100',
                      'hover:text-secondary-400 hover:opacity-100',
                      'focus-within:text-secondary-400 focus-within:opacity-100',
                    )}
                    tabIndex={-1}
                  >
                    <a
                      href={news.link}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={news.title}
                      className="pointer-events-none"
                      onFocus={() => {
                        setOpenIndex(index);
                        setPaused(true);
                      }}
                      onBlur={() => {
                        setPaused(false);
                      }}
                    />
                  </Button>
                </Carousel.Indicator>
              ))}
            </Carousel.IndicatorGroup>
          </Carousel.Root>
        )}
      </>
    )
  );
};
