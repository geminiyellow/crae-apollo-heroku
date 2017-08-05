import React from 'react';
import ReactDOM from 'react-dom';
import {
  ApolloClient,
  ApolloProvider,
  createNetworkInterface,
} from 'react-apollo';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

// REACT_APP_GRAPHQL_URI is defined at .env file. When the app is deployed to
// heroku, the REACT_APP_GRAPHQL_URI env variable needs to be reset to point to
// https://<YOUR-APP-NAME>.herokuapp.com/graphql (this will have precedence over
// the default value provided at .env file). See the .env file on how to do this.
const isNotProduction = process.env.NODE_ENV !== 'production';
const uri = isNotProduction ? 'http://localhost:3001/graphql' : process.env.REACT_APP_GRAPHQL_URI;

// Log
console.log('process.env.NODE_ENV', process.env.NODE_ENV);
console.log('GRAPHQL_URI', uri);

const networkInterface = createNetworkInterface({ uri });
const client = new ApolloClient({ networkInterface });

ReactDOM.render((
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>),
  document.getElementById('root')
);
registerServiceWorker();
