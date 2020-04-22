import React, { Component } from 'react';
import { Login } from './Login'
import './App.css';
import { Main } from './Main';
import { proxy } from './Proxy';

export default class App extends Component
{
  state = { is_logged_in: false }

  componentDidMount()
  {
    proxy.addEventListener("login", () => { this.setState({is_logged_in:true}) })
  }

  render()
  {
    return (
      <div className="app">
      {!this.state.is_logged_in && <Login />}
      {this.state.is_logged_in && <Main />}
      </div>
    );
  }
}
