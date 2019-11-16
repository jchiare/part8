import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import ApolloClient from 'apollo-boost'
import { ApolloProvider } from '@apollo/react-hooks';

const client = new ApolloClient({
  uri: 'http://localhost:4000/graphql',
  onError: ({ networkError, graphQLErrors }) => {
    console.error('graphQLErrors', graphQLErrors)
    console.error('networkError', networkError)
  },
  connectToDevTools: true
})

ReactDOM.render(  
  <ApolloProvider client={client} >
    <App />
  </ApolloProvider>, 
  document.getElementById('root')
)