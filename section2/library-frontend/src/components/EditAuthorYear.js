import React, { useState } from 'react'
import gql from 'graphql-tag';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { GET_AUTHORS } from './Authors'


const EditAuthor = () => {
  const [author, setAuthor] = useState('')
  const [year, setYear] = useState('')

  const { data } = useQuery(GET_AUTHORS)

  const EDIT_AUTHOR = gql`
  mutation editAuthor($name: String!, $setBornTo: Int!) {
    editAuthor(name: $name, setBornTo: $setBornTo)  {
        name
        born
      }
    }
  `

  const [editAuthor] = useMutation(
      EDIT_AUTHOR,
      {
        refetchQueries: [
          {query: GET_AUTHORS}
        ]
      }
    )
  
  const submit = async (e) => {
    e.preventDefault()

    await editAuthor({
      variables: {
        name: author,
        setBornTo: year
      }
    })

    setYear('')
    setAuthor('')
  }

  return (
    <div>
      <h2>Set birth year</h2>
      <form onSubmit={submit}>
        Author: 
        <select value={author} onChange={({target}) => setAuthor(target.value)}>
          <option>Choose the author here</option>
          {data && data.allAuthors.map(({name}) => <option key={name} value={name}>{name}</option>)}
        </select>
        <div>
          Year
          <input
            value={year}
            onChange={({ target }) => setYear(parseInt(target.value))}
          />
        </div>
        <button type='submit'>Update Author</button>
      </form>
    </div>
  )
}

export default EditAuthor