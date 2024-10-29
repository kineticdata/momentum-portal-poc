import { Route, Routes } from 'react-router-dom';
import { ServiceForm } from './ServiceForm.jsx';
import { ServicesList } from './SevicesList.jsx';

export const Services = () => {
  return (
    <Routes>
      <Route path=":category?/forms/:id" element={<ServiceForm />}></Route>
      <Route path=":category?" element={<ServicesList />}></Route>
    </Routes>
  );
};
