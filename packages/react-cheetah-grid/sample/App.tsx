import {
  BrowserRouter as Router,
  Switch,
  Route,
  NavLink,
} from "react-router-dom";

import { Columns } from "./Columns";
import { Events } from "./Events";
import { Message } from "./Message";
import { Selection } from "./Selection";
import { Theme } from "./Theme";
import { Sort } from "./Sort";
import { HeaderAction } from "./HeaderAction";

export function App() {
  return (
    <Router>
      <div className="p-4 h-full box-border">
        <nav>
          <div className="tabs">
            <NavLink
              to="/"
              className="tab tab-lifted"
              activeClassName="tab-active"
              exact={true}
            >
              Columns
            </NavLink>
            <NavLink
              to="/events"
              className="tab tab-lifted"
              activeClassName="tab-active"
            >
              Events
            </NavLink>
            <NavLink
              to="/selection"
              className="tab tab-lifted"
              activeClassName="tab-active"
            >
              Selection
            </NavLink>
            <NavLink
              to="/message"
              className="tab tab-lifted"
              activeClassName="tab-active"
            >
              Cell Message
            </NavLink>
            <NavLink
              to="/theme"
              className="tab tab-lifted"
              activeClassName="tab-active"
            >
              Theme
            </NavLink>
            <NavLink
              to="/sort"
              className="tab tab-lifted"
              activeClassName="tab-active"
            >
              Sort
            </NavLink>
            <NavLink
              to="/headeraction"
              className="tab tab-lifted"
              activeClassName="tab-active"
            >
              Header Action
            </NavLink>
          </div>
        </nav>

        <div className="p-4 h-full box-border">
          <div className="card shadow-lg h-full box-border">
            <div className="card-body h-full box-border">
              <Switch>
                <Route path="/datasources"></Route>
                <Route path="/events">
                  <Events />
                </Route>
                <Route path="/selection">
                  <Selection />
                </Route>
                <Route path="/message">
                  <Message />
                </Route>
                <Route path="/theme">
                  <Theme />
                </Route>
                <Route path="/sort">
                  <Sort />
                </Route>
                <Route path="/headeraction">
                  <HeaderAction />
                </Route>
                <Route path="/">
                  <Columns />
                </Route>
              </Switch>
            </div>
          </div>
        </div>
      </div>
    </Router>
  );
}
