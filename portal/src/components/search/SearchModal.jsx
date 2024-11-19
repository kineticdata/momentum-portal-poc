import { Modal } from '../../atoms/Modal.jsx';
import { ark } from '@ark-ui/react/factory';
import { useState } from 'react';
import { debounce } from 'lodash-es';

export const SearchModal = ({ children }) => {
  // State for opening the modal
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  /*
   * TODO
   *  - Search for forms when query has a value.
   *  - Debounce the query by 300ms, using the lodash debounce function
   *  - search for forms of type Service by name using the contains query,
   *      with a limit of 10
   *  - render a list of forms using the ServiceCard component
   *  - render pagination controls, styles like they are in the request page
   *  - render loading, error, and empty states when applicable
   */

  return (
    <Modal
      title="Search"
      open={open}
      onOpenChange={({ open }) => setOpen(open)}
      onExitComplete={() => setQuery('')}
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
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>
      <div slot="body">TODO</div>
    </Modal>
  );
};
