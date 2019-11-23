import React, { useState, useEffect } from 'react'
import gql from 'graphql-tag';
import { useMutation, useApolloClient, useSubscription } from '@apollo/react-hooks';

import Authors from './components/Authors'
import Books from './components/Books'
import NewBook, { UpdateBookCache } from './components/NewBook'
import LoginForm from './components/LoginForm'
import Recommendation from './components/Recommendation'

const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password)  {
      value
    }
  }
`

export const BOOK_DETAILS = gql`
fragment BookDetails on Books {
  title
  author {
    name
  }
  published
  genres
}
`

const BOOK_ADDED = gql`
subscription {
  bookAdded {
    ...BookDetails
  }
}
${BOOK_DETAILS}
`

const App = () => {
  const [errorMessage, setErrorMessage] = useState(null)
  const handleError = error => {
    setErrorMessage(error.graphQLErrors[0].message)
    setTimeout(() => {
      setErrorMessage(null)
    }, 5000)
  }

  const [page, setPage] = useState('authors')
  const [token, setToken] = useState(null)

  const [login] = useMutation(LOGIN,
    { onError: handleError }
  )

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

  
  useSubscription(BOOK_ADDED, {
    onSubscriptionData: ({ subscriptionData }) => {
      const { bookAdded } = subscriptionData.data
      window.alert(`Added ${JSON.stringify(bookAdded)}`)
      UpdateBookCache(client,bookAdded)
    }
  })

  return (
    <div>
      {errorMessage&&
        <div style={{color: 'red'}}>
          {errorMessage}
        </div>
      }
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        {!token 
          ? <>
              <button onClick={() => setPage('add')}>add book</button>
              <button onClick={() => setPage('rec')}>recommendations</button>
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

      <Recommendation
        show={page === 'rec'}
      />

    </div>
  )
}

export default App