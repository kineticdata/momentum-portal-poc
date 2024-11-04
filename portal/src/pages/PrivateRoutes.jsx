import { Navigate, Route, Routes } from 'react-router-dom';
import { Home } from './home/Home.jsx';
import { Actions } from './actions/Actions.jsx';
import { Requests } from './requests/Requests.jsx';
import { Services } from './services/Services.jsx';
import { Profile } from './profile/Profile.js';
import { useSelector } from 'react-redux';
import { DesktopHeader } from '../components/header/DesktopHeader.jsx';
import { MobileFooter } from '../components/footer/MobileFooter.jsx';

export const PrivateRoutes = () => {
  const { mobile } = useSelector(state => state.view);
  return (
    <>
      {!mobile && <DesktopHeader></DesktopHeader>}
      <Routes>
        <Route path="/actions/*" element={<Actions />} />
        <Route path="/requests/*" element={<Requests />} />
        <Route path="/services/*" element={<Services />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/login" element={<Navigate to="/" />} />
        <Route path="/*" element={<Home />} />
      </Routes>
      {mobile && <MobileFooter></MobileFooter>}
    </>
  );
};
