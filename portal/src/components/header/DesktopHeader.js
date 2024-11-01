import { HeaderPortal } from './HeaderPortal.jsx';

export const DesktopHeader = props => {
  return (
    <HeaderPortal>
      <nav className="stretch py-3 flex items-center gap-20 bg-white">
        <b className="h1">LOGO</b>
        <div className="ml-auto rounded-full bg-blue-950 w-12 h-12"></div>
      </nav>
    </HeaderPortal>
  );
};
