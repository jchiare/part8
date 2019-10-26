import React from 'react'
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';

export const GET_BOOKS = gql`
{
  allBooks  {
    title,
    author,
    published
  }
}
`

const Books = (props) => {

  const { loading, error, data } = useQuery(GET_BOOKS)

  if(loading) return 'Loading ...'
  if(error) return `Error! ${error.message}`

  if (!props.show) {
    return null
  }

  const books = data ? data.allBooks : []

  return (
    <div>
      <h2>books</h2>

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
          {books.map(a =>
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author}</td>
              <td>{a.published}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default Books