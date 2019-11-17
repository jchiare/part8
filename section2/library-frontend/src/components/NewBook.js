import React, { useState } from 'react'
import gql from 'graphql-tag';
import { useMutation } from '@apollo/react-hooks';
import { GET_BOOKS } from './Books'
import { GET_AUTHORS } from './Authors'
import { GET_RECOMMENDED_BOOKS, GET_USER } from './Recommendation'
import EditAuthor from './EditAuthorYear'


const NewBook = (props) => {
  const [errorMessage, setErrorMessage] = useState(null)
  const handleError = error => {
    alert(error)
    setErrorMessage(error.graphQLErrors[0].message)
    setTimeout(() => {
      setErrorMessage(null)
    }, 10000)
  }

  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [published, setPublished] = useState('')
  const [genre, setGenre] = useState('')
  const [genres, setGenres] = useState([])

  const ADD_BOOK = gql`
  mutation addBook($title: String!, $author: String!, $published: Int!, $genres: [String]) {
    addBook(title: $title, author: $author, published: $published, genres: $genres)  {
        title
        author {
          name
        }
        published
        genres
      }
    }
  `

  const [addBook] = useMutation(
      ADD_BOOK,
      {
        refetchQueries: [
          { query: GET_AUTHORS }
        ],
        onError: handleError,
        update:(cache, { data: {addBook} }) => {

          // Add book to main book cache
          const cachedBooks = cache.readQuery({ query: GET_BOOKS })
          cachedBooks.allBooks.push(addBook)
          cache.writeQuery({
            query: GET_BOOKS,
            data: cachedBooks
          })

          // Check if new book should be added to recommended cache
          const user = cache.readQuery({ query: GET_USER })
          if(addBook.genres.includes(user.me.favoriteGenre)){
            const cachedRecommendedBooks = cache.readQuery({
               query: GET_RECOMMENDED_BOOKS ,
               variables: {genre: user.me.favoriteGenre }
            })
            cachedRecommendedBooks.allBooks.push(addBook)
            cache.writeQuery({
              query: GET_RECOMMENDED_BOOKS,
              data: cachedRecommendedBooks
            })
          }

        }
      }
    )

  if (!props.show) {
    return null
  }
  
  const submit = async (e) => {
    e.preventDefault()
    await addBook({
      variables: { title, author, published, genres }
    })

    setTitle('')
    setPublished('')
    setAuthor('')
    setGenres([])
    setGenre('')
  }

  const addGenre = () => {
    setGenres(genres.concat(genre))
    setGenre('')
  }

  return (
    <div>
      {errorMessage &&
        <div style={{color: 'red'}}>
          {errorMessage}
        </div>
      }
      <form onSubmit={submit}>
        <div>
          title
          <input
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>
        <div>
          author
          <input
            value={author}
            onChange={({ target }) => setAuthor(target.value)}
          />
        </div>
        <div>
          published
          <input
            type='number'
            value={published}
            onChange={({ target }) => setPublished(parseInt(target.value))}
          />
        </div>
        <div>
          <input
            value={genre}
            onChange={({ target }) => setGenre(target.value)}
          />
          <button onClick={addGenre} type="button">add genre</button>
        </div>
        <div>
          genres: {genres.join(' ')}
        </div>
        <button type='submit'>create book</button>
      </form>
      <EditAuthor />
    </div>
  )
}

export default NewBook