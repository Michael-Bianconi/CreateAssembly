import React from "react";
import Header from "../components/Header";

class Home extends React.Component {

    public static readonly URL = '/';

    render() {
        return (
            <div>
                <Header />
                <div>
                    Hello!
                </div>
            </div>
        );
    }
}

export default Home;