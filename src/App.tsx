import React from 'react';
import './App.css';
import Header from './client/components/Header'
import {Route, Switch} from "react-router";
import Emulators from "./client/pages/Emulators";
import Home from "./client/pages/Home";
import NotFound from "./client/pages/NotFound";
import Chip8 from "./client/pages/emulator/Chip8";

function App() {
  return (
    <main className="App">
      <Header />
      <Switch>
          <Route path={Home.URL} component={Home} exact />
          <Route path={Emulators.URL} component={Emulators} exact />
          <Route path='/about' component={Home} />

          <Route path={Chip8.URL} component={Chip8} />

          <Route component={NotFound} />
      </Switch>
    </main>
  );
}

export default App;
