import { Route, Routes } from 'react-router-dom';
import { ActionsList } from './ActionsList.jsx';
import { ActionDetail } from './ActionDetail.jsx';

export const Actions = () => {
  return (
    <Routes>
      <Route path=":id" element={<ActionDetail />}></Route>
      <Route path="*" element={<ActionsList />}></Route>
    </Routes>
  );
};
