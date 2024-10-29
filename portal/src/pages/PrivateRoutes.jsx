import { Route, Routes } from 'react-router-dom';
import { Home } from './home/Home.jsx';
import { Actions } from './actions/Actions.jsx';
import { Requests } from './requests/Requests.jsx';
import { Services } from './services/Services.jsx';
import { Profile } from './profile/Profile.js';

export const PrivateRoutes = () => {
  return (
    <Routes>
      <Route path="/actions/*" element={<Actions />}></Route>
      <Route path="/requests/*" element={<Requests />}></Route>
      <Route path="/services/*" element={<Services />}></Route>
      <Route path="/profile" element={<Profile />}></Route>
      <Route path="/*" element={<Home />}></Route>
    </Routes>
  );
};
