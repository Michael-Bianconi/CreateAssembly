import React from 'react';
import './App.css';
import Header from './client/components/Header'
import {Route, Switch} from "react-router";
import Home from "./client/pages/Home";
import NotFound from "./client/pages/NotFound";
import Chip8 from "./client/pages/Chip8";

function App() {

    // We specify random keys on emulators so they always reload when
    // we navigate to them. Otherwise, if you try to navigate to a
    // emulator you are already on, the component will not re-render.
    return (
        <main className="App">
            <Header/>
            <Switch>
                <Route path={Home.URL} component={Home} exact/>
                <Route path='/about' component={Home}/>
                <Route path={Chip8.URL} component={Chip8}/>
                <Route component={NotFound}/>
            </Switch>
        </main>
    );
}

export default App;
