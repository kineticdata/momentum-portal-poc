import { Route, Routes } from 'react-router-dom';
import { RequestsList } from './RequestsList.jsx';
import { RequestDetail } from './RequestDetail.jsx';

export const Requests = () => {
  return (
    <Routes>
      <Route path=":id" element={<RequestDetail />}></Route>
      <Route path="*" element={<RequestsList />}></Route>
    </Routes>
  );
};
