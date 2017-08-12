import React, { Component } from 'react';
import './App.css';
import Authors from './components/Authors';
import AuthorAndPosts from './components/AuthorAndPosts';

class App extends Component {
  // See ES6 Classes section at: https://facebook.github.io/react/docs/reusable-components.html
  constructor(props) {
    super(props);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.state = {
      firstName: '',
      lastName: '',
    };
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;

    this.setState({
      [name]: value,
    });
  }

  render() {
    return (
      <div className="App">
        <h3>CRAE-Apollo-Heroku</h3>
        <a href="http://localhost:3001/auth/facebook">Continue with Facebook</a>
        <Authors />
        <h3>{'Enter author\'s name to get his/her posts:'}</h3>
        <form>
          <input
            name="firstName"
            type="text"
            placeholder="first name"
            value={this.state.firstName}
            onChange={this.handleInputChange}
          />
          <input
            name="lastName"
            type="text"
            placeholder="last name"
            value={this.state.lastName}
            onChange={this.handleInputChange}
          />
        </form>
        <AuthorAndPosts
          firstName={this.state.firstName}
          lastName={this.state.lastName}
        />
        <a
          href="https://github.com/fede-rodes/crae-apollo-heroku/tree/mongo"
          target="_blank"
          rel="noopener noreferrer"
        >
          https://github.com/fede-rodes/crae-apollo-heroku/tree/mongo
        </a>
      </div>
    );
  }
}

export default App;
