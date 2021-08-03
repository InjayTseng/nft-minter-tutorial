import './App.css'
import Minter from './Minter'
import 'bootstrap/dist/css/bootstrap.min.css'
import { Navbar, Container, Nav, NavDropdown } from 'react-bootstrap'
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom'

function App() {
  return (
    <div className="App">
      <Router>
        <div>
          {/* <Link to="/">Home </Link>
          <Link to="/about">About Us </Link>
          <Link to="/users">Users </Link> */}
          <Navbar bg="light" expand="lg">
            <Container>
              <Navbar.Brand href="/">DXT</Navbar.Brand>
              <Navbar.Toggle aria-controls="basic-navbar-nav" />
              <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="me-auto">
                  <Nav.Link href="/minter">Minter</Nav.Link>
                  <Nav.Link href="/about">About</Nav.Link>
                </Nav>
              </Navbar.Collapse>
            </Container>
          </Navbar>
          {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
          <Switch>
            <Route path="/about">
              <About />
            </Route>
            <Route path="/users">
              <Users />
            </Route>
            <Route path="/minter">
              <Minter />
            </Route>
          </Switch>
        </div>
      </Router>
    </div>
  )
}

function About() {
  return <h2>About</h2>
}

function Users() {
  return <h2>Users</h2>
}

export default App
