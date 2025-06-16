import { Route, Routes } from 'react-router-dom';
import { fetchForms } from '@kineticdata/react';
import { Settings } from './Settings.jsx';
import { useData } from '../../helpers/hooks/useData.js';
import { sortBy } from '../../helpers/index.js';
import { SettingsForm } from './SettingsForm.jsx';
import { Datastore } from './Datastore.jsx';
import { DatastoreRecords } from './DatastoreRecords.jsx';

const settingsFormsParams = {
  kappSlug: 'admin-center',
  include: 'attributesMap',
  q: 'type = "Settings" AND (status = "Active" OR status = "New")',
};

const datastoreFormsParams = {
  kappSlug: 'admin-center',
  include: 'attributesMap,authorization,fields',
  q: 'type = "Data" AND (status = "Active" OR status = "New")',
};

export const SettingsRouting = () => {
  // Retrieve all settings forms
  const settingsForms = useData(fetchForms, settingsFormsParams);

  // Retrieve all datastore forms
  const datastoreForms = useData(fetchForms, datastoreFormsParams);

  const datastores =
    datastoreForms.initialized && !datastoreForms.loading
      ? datastoreForms?.response?.forms || []
      : null;

  const settings =
    settingsForms.initialized && !settingsForms.loading && datastores
      ? [
          datastores?.length > 0 && {
            label: 'Datastore',
            description: 'Management of referential and configuration data.',
            icon: 'forms',
            to: 'datastore',
          },
          {
            label: 'Profile',
            description: 'Management of your user profile.',
            icon: 'user',
            to: '/profile',
          },
          ...(settingsForms?.response?.forms?.map(form => ({
            label: form.name,
            description: form.description,
            icon: form.attributesMap['Icon']?.[0],
            to: form.slug,
          })) || []),
        ]
          .filter(Boolean)
          .sort(sortBy('label'))
      : null;

  return (
    <Routes>
      <Route path="/" element={<Settings settings={settings} />} />
      <Route
        path="/datastore"
        element={<Datastore datastores={datastores} />}
      />
      <Route
        path="/datastore/:formSlug/:id?"
        element={<DatastoreRecords datastores={datastores} />}
      />
      <Route path="/:formSlug" element={<SettingsForm />} />
    </Routes>
  );
};
