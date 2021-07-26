import React from 'react';
import { useHistory } from "react-router-dom";
import { ReactComponent as UserIcon } from '../svg/user.svg';
import {NavLink} from 'react-router-dom'

import {Navbar, NavDropdown, Nav} from 'react-bootstrap';

const AppNav = (props) => {

  const history = useHistory();

  const onLinkClick = (evt) => {
    evt.preventDefault();
    history.push(evt.target.dataset.rbEventKey);
  }

  const linkStyle = {
    outline: 'none',
    color: '#fff'
  };

  const selectedLink = {
    outline: 'none',
    color: '#000'
  }

  const iconContainer = {
    marginLeft: 'auto',
    marginRight: '10px',
    marginTop: '0px',
    marginBottom: '0px',
    padding: '0',
    position: 'absolute',
    right: '5px'
  }

  const iconStyle = {
    padding: '0',
    margin: '0',
    height: '100%',
    width: '100%'
  };

  return (
    <Navbar bg="primary" expand="lg">
      <Navbar.Brand style={linkStyle}>DriveSafe</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto w-100">
          <NavLink exact style={linkStyle} activeStyle={selectedLink} className="nav-link" to="/" >Home</NavLink>
          <NavLink exact style={linkStyle} activeStyle={selectedLink} className="nav-link" to="/quizzes" >Quizzes</NavLink>
          <NavLink exact style={linkStyle} activeStyle={selectedLink} className="nav-link" to="/accidents/summary" >Accidents</NavLink>
          <NavLink exact style={linkStyle} activeStyle={selectedLink} className="nav-link" to="/rivalries">Rivalries</NavLink>
          {props.hasPermission('controlpanel.view') === true &&  <NavLink style={linkStyle} activeStyle={selectedLink} className="nav-link" to="/admin" >Control Panel</NavLink>}
          {props.userData !== null ? <NavLink exact style={linkStyle} activeStyle={selectedLink} className="nav-link" to="/signout" >Sign out</NavLink> : <NavLink exact style={linkStyle} activeStyle={selectedLink} className="nav-link" to="/signin" >Sign in</NavLink>}
          {
            props.userData !== null &&
            <Nav.Link className="d-lg-none" href={"/profile/edit"} onClick={onLinkClick}>
                  Profile
            </Nav.Link>
          }
          {
            /* Display profile icon depending on screen size*/
            props.userData !== null ?
                <div className="d-none d-lg-block" style={iconContainer}>
                   <NavLink style={linkStyle} activeStyle={selectedLink} className="nav-link" to="/profile/edit" >
                    {<UserIcon style={iconStyle} onClick={() => history.push('/profile/edit')} />}
                  </NavLink>
                </div>
            :
              <React.Fragment />
          }
        </Nav>
      </Navbar.Collapse>
    </Navbar >
  );
}

export default AppNav;