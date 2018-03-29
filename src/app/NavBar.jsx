import React from 'react';

/**
 * The navbar for the app.  Extra controls can be rendered into it via children
 */
const NavBar = ({children}) => {
  return (
    <nav className="process-nav">
      <a className="nostyle" href="/"><h1 className="nav-name">processable</h1></a>
      <div id="nav-children">
        {children}
      </div>
      <div id="navigation">
        {/*<div className="nav-box">help</div>
        <div className="nav-box">about</div>*/}
        <div className="nav-box"
          onClick={() => window.open('https://goo.gl/forms/TzxutG6qZeBoBgmL2', '_blank')}>feedback</div>
        <div className="nav-box"
          onClick={() => window.location.href = 'http://github.com/rmw2/processable'}>github</div>
      </div>
    </nav>
  );
};

export default NavBar;