import React from 'react';
import Navbar from 'react-bootstrap/NavBar';
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { useHistory } from "react-router-dom";

const AppNav = (props) => {

  const history = useHistory();

  const onLinkClick = (evt) => {
    evt.preventDefault();
    history.push(evt.target.dataset.rbEventKey);
    
  }

  return (
    <Navbar bg="light" expand="lg">
      <Navbar.Brand href="/" onClick={onLinkClick}>Driver Safety</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          <Nav.Link href="/" onClick={onLinkClick}>Home</Nav.Link>
          <Nav.Link href="/quizzes" onClick={onLinkClick}>Quizzes</Nav.Link>
          {props.hasPermission('controlpanel.view') === true ? <Nav.Link href="/admin" onClick={onLinkClick}>Control Panel</Nav.Link> : <React.Fragment/>}
          {props.userData !== null ? <Nav.Link href="/signout" onClick={onLinkClick}>Sign out</Nav.Link> : <Nav.Link href="/signin" onClick={onLinkClick}>Sign in</Nav.Link>}
          <NavDropdown title="Dropdown" id="basic-nav-dropdown">
            <NavDropdown.Item href="/action/3.1" onClick={onLinkClick}>Action</NavDropdown.Item>
            <NavDropdown.Item href="/action/3.2" onClick={onLinkClick}>Another action</NavDropdown.Item>
            <NavDropdown.Item href="/action/3.3" onClick={onLinkClick}>Something</NavDropdown.Item>
            <NavDropdown.Divider />
            <NavDropdown.Item href="/action/3.4" onClick={onLinkClick}>Separated link</NavDropdown.Item>
          </NavDropdown>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default AppNav;