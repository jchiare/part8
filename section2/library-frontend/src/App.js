import React, { useState, useEffect } from 'react'
import gql from 'graphql-tag';
import { useMutation, useApolloClient } from '@apollo/react-hooks';

import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import LoginForm from './components/LoginForm'

const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password)  {
      value
    }
  }
`

const App = () => {
  const [page, setPage] = useState('authors')
  const [token, setToken] = useState(null)

  const [login] = useMutation(LOGIN)

  const client = useApolloClient()

  const handleLogout = () => {
    localStorage.removeItem('phonebook-user-token')
    setToken(null)
    client.resetStore()
    setPage('login')
  }

  useEffect(() => {
    if(token) setPage('add')
  },[token])

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        {token 
          ? <>
              <button onClick={() => setPage('add')}>add book</button>
              <button onClick={() => handleLogout()}>logout</button>
            </>
          : <button onClick={() => setPage('login')}>login</button>
         }
      </div>

      <Authors
        show={page === 'authors'}
      />

      <Books
        show={page === 'books'}
      />

      <NewBook
        show={page === 'add'}
      />

      <LoginForm
        login={login}
        setToken={(token) => setToken(token)}
        show={page === 'login'}
      />

    </div>
  )
}

export default App