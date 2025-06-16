import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { CoreForm } from '@kineticdata/react';
import { SettingsHeading } from './Settings.jsx';
import { Loading as Pending } from '../../components/states/Loading.jsx';
import { valuesFromQueryParams } from '../../helpers/index.js';

export const SettingsForm = () => {
  const [form, setForm] = useState('');
  const { formSlug } = useParams();
  const [searchParams] = useSearchParams();
  const paramFieldValues = valuesFromQueryParams(searchParams);

  return (
    <>
      <SettingsHeading pageName={form?.name?.()} />

      <CoreForm
        kapp="admin-center"
        form={formSlug}
        values={paramFieldValues}
        components={{ Pending }}
        loaded={setForm}
      />
    </>
  );
};
