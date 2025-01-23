import { Modal } from '../../atoms/Modal.jsx';
import { ark } from '@ark-ui/react/factory';
import { useState, useMemo } from 'react';
import { debounce } from 'lodash-es';
import { fetchForms } from '@kineticdata/react';
import useDataList from '../../helpers/useDataList.js';
import { useSelector } from 'react-redux';
import { ServiceCard } from '../services/ServiceCard.jsx';
import { Loading } from '../states/Loading.jsx';
import { Error } from '../states/Error.jsx';
import { Button } from '../../atoms/Button.jsx';

export const SearchModal = ({ children }) => {
  // State for opening the modal
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [inputValue, setInputValue] = useState('');
  const { kappSlug } = useSelector(state => state.app);

  // Debounce the query by 300ms
  const debouncedSetQuery = useMemo(
    () =>
      debounce(value => {
        setQuery(value);
      }, 300),
    [],
  );

  const handleInputChange = e => {
    const value = e.target.value;
    setInputValue(value);
    debouncedSetQuery(value);
  };

  const [searchResults, searchActions] = useDataList(
    fetchForms,
    query
      ? [
          {
            kappSlug,
            q: `type = "Service" AND name *=* "${query}"`,
            limit: 10,
          },
        ]
      : null,
    response => response.forms,
  );

  const onModalExit = () => {
    setInputValue('');
    setQuery('');
  };

  return (
    <Modal
      title="Search"
      open={open}
      onOpenChange={({ open }) => setOpen(open)}
      onExitComplete={onModalExit}
      size="sm"
    >
      <ark.div asChild slot="trigger">
        {children}
      </ark.div>
      <div slot="title" className="field">
        <input
          type="text"
          name="Search"
          placeholder="How can we help you?"
          value={inputValue}
          onChange={handleInputChange}
        />
      </div>
      <div slot="body" className="flex flex-col items-stretch gap-3">
        {searchResults.initialized &&
          (searchResults.loading ? (
            <Loading />
          ) : searchResults.error ? (
            <Error error={searchResults.error} />
          ) : searchResults.data?.length > 0 ? (
            searchResults.data.map(form => (
              <ServiceCard
                key={form.slug}
                form={form}
                className="!shadow-none !border-gray-200"
                onClick={() => setOpen(false)}
              />
            ))
          ) : inputValue.length > 0 ? (
            <p className="text-gray-900 text-center italic">
              No results found.
            </p>
          ) : null)}

        {(searchActions.previousPage || searchActions.nextPage) && (
          <div className="col-start-1 col-end-5 py-2.5 px-6 flex justify-center items-center gap-6 bg-white rounded-xl min-h-16">
            <Button
              variant="secondary"
              onClick={searchActions.previousPage}
              disabled={!searchActions.previousPage || searchResults.loading}
              icon="chevron-left"
            >
              Previous
            </Button>
            <div className="flex justify-center items-center flex-none w-11 h-11 bg-secondary-400 rounded-full font-semibold">
              {searchResults.pageNumber}
            </div>
            <Button
              variant="secondary"
              onClick={searchActions.nextPage}
              disabled={!searchActions.nextPage || searchResults.loading}
              iconEnd="chevron-right"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};
