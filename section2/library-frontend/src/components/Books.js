import React, { useState } from 'react'
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';

export const GET_BOOKS = gql`
{
  allBooks  {
    title
    published
    author { 
      name
    }
    genres
  }
}
`

const Books = (props) => {
  const [genre ,setGenre] = useState('Tech')
  const [genres, addGenres] = useState([])
  const { loading, error, data } = useQuery(GET_BOOKS)

  if(loading) return 'Loading ...'
  if(error) return `Error! ${error.message}`

  if (!props.show) {
    return null
  }

  if(data.allBooks){
    data.allBooks.forEach(book => {
      book.genres.forEach(genre => {
        if(!genres.includes(genre)){
          addGenres(genres.concat(genre))
        }
      })
    })
  }

  return (
    <div>
      <h2>books</h2>

  <p>in genre <strong>{genre}</strong></p>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              author
            </th>
            <th>
              published
            </th>
          </tr>
          {data.allBooks 
            && data.allBooks
              .filter(books => books.genres.includes(genre))
              .map(book =>
                <tr key={book.title}>
                  <td>{book.title}</td>
                  <td>{book.author.name}</td>
                  <td>{book.published}</td>
                </tr>
          )}
        </tbody>
      </table>
      {data.allBooks
        && genres.map(genre => 
        <button onClick={() => setGenre(genre)} key={genre}>
          {genre}
        </button>)
      }
    </div>
  )
}

export default Books