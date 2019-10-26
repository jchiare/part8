import React, { useState } from 'react'
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';

export const GET_AUTHORS = gql`
{
  allAuthors  {
    name,
    born,
    bookCount
  }
}
`

const Authors = (props) => {

  const { loading, error, data } = useQuery(GET_AUTHORS)

  if(loading) return 'Loading ...'
  if(error) return `Error! ${error.message}`

  if (!props.show) {
    return null
  }
  const authors = data ? data.allAuthors : []

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              born
            </th>
            <th>
              books
            </th>
          </tr>
          {authors.map(a =>
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          )}
        </tbody>
      </table>

    </div>
  )
}

export default Authors