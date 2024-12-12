import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import { Home } from './home/Home.jsx';
import { Actions } from './tickets/actions/Actions.jsx';
import { Requests } from './tickets/requests/Requests.jsx';
import { Form } from './forms/Form.jsx';
import { Profile } from './profile/Profile.jsx';
import { useSelector } from 'react-redux';
import { DesktopHeader } from '../components/header/DesktopHeader.jsx';
import { MobileFooter } from '../components/footer/MobileFooter.jsx';

const Redirect = ({ to }) => {
  const params = useParams();
  return (
    <Navigate
      to={(typeof to === 'function' ? to(params) : to) || '/'}
      replace={true}
    />
  );
};

export const PrivateRoutes = () => {
  const { mobile } = useSelector(state => state.view);
  return (
    <>
      {!mobile && <DesktopHeader></DesktopHeader>}
      <Routes>
        {/* Canonical route for submissions */}
        <Route
          path="/kapps/:kappSlug/forms/:formSlug/submissions/:submissionId"
          element={
            <Redirect
              to={params =>
                `/kapps/${params.kappSlug}/forms/${params.formSlug}/${params.submissionId}`
              }
            />
          }
        />
        {/* Canonical route for forms */}
        <Route
          path="/kapps/:kappSlug/forms/:formSlug/:submissionId?"
          element={<Form />}
        />
        {/* Canonical route for kapps */}
        <Route path="/kapps/:kappSlug" element={<Redirect to="/" />} />

        {/* Portal routes */}
        <Route path="/actions/*" element={<Actions />} />
        <Route path="/requests/*" element={<Requests />} />
        <Route path="/forms/:formSlug/:submissionId?" element={<Form />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/login" element={<Navigate to="/" />} />
        <Route path="/*" element={<Home />} />
      </Routes>
      {mobile && <MobileFooter></MobileFooter>}
    </>
  );
};
