import React, { useState } from 'react'
import gql from 'graphql-tag';
import { useMutation } from '@apollo/react-hooks';
import { GET_BOOKS } from './Books'
import { GET_AUTHORS } from './Authors'
import EditAuthor from './EditAuthorYear'


const NewBook = (props) => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [published, setPublished] = useState(false)
  const [genre, setGenre] = useState('')
  const [genres, setGenres] = useState([])

  const ADD_BOOK = gql`
  mutation addBook($title: String!, $author: String!, $published: Int, $genres: [String]) {
    addBook(title: $title, author: $author, published: $published, genres: $genres)  {
        title
        author
        published
        genres
      }
    }
  `

  const [addBook] = useMutation(
      ADD_BOOK,
      {
        refetchQueries: [
          { query: GET_BOOKS }, 
          {query: GET_AUTHORS}
        ]
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