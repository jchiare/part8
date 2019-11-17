import React, { useState, useEffect } from 'react'
import gql from 'graphql-tag';
import { useQuery, useLazyQuery } from '@apollo/react-hooks';

export const GET_RECOMMENDED_BOOKS = gql`
query ($genre: String) {
  allBooks (genre: $genre)  {
    title
    published
    author { 
      name
    }
    genres
  }
}
`

export const GET_USER = gql`
{
  me {
    username
    favoriteGenre
  }
}
`

const Recommendation = (props) => {
  const [genre, setGenre] = useState(null)

  const {loading:userLoading, error:userError, data:userData } = useQuery(GET_USER)
  const [getBooks,{ loading, error, data }] = useLazyQuery(GET_RECOMMENDED_BOOKS)

  useEffect(() => {
    if(userData) setGenre(userData.me.favoriteGenre)
  },[userData])

  useEffect(() => {
    getBooks({
      variables: {
        genre
      }
    })
  },[genre, getBooks])

  if(userLoading || loading) return 'Loading ...'
  if(userError || error) return `Error! ${error.message}`

  if (!props.show) {
    return null
  }

  return (
    <div>
      <h2>Recommendations</h2>

  <p>Books in your favourite genre <strong>{genre}</strong></p>

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
              .map(book =>
                <tr key={book.title}>
                  <td>{book.title}</td>
                  <td>{book.author.name}</td>
                  <td>{book.published}</td>
                </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default Recommendation