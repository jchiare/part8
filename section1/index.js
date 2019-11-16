require('dotenv').config()
const { ApolloServer, gql, UserInputError } = require('apollo-server')
const mongoose = require('mongoose')

const Book = require('./models/Book')
const Author = require('./models/Author')
const DB_url = process.env.MONGODB_URI

mongoose.set('useFindAndModify', false)

console.log('connecting to', DB_url)

mongoose.connect(DB_url, { useNewUrlParser: true })
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })

const typeDefs = gql`
  type Books {
    title: String!,
    author: Author!,
    published: Int!,
    genres: [String!]!,
    id: ID!
  }

  type Author {
    name: String!,
    born: Int,
    bookCount: Int
  }

  input AuthorInput {
    name: String!,
    born: Int
  }

  type EditedAuthor {
    name: String,
    born: Int
  }

  type Query {
    bookCount: Int,
    authorCount: Int,
    allBooks(author: String, genres: String): [Books],
    allAuthors: [Author]
  }

  type Mutation {
    addBook(
      title: String,
      author: AuthorInput!,
      published: Int,
      genres: [String]
    ): Books,

    editAuthor(
      name: String,
      setBornTo: Int
    ): EditedAuthor,

    addAuthor(
      name:String!,
      born:Int
    ): Author
  }

`

const resolvers = {
  Query: {
    bookCount: () => Book.collection.countDocuments(),
    authorCount: () =>  Author.collection.countDocuments(),
    allBooks: async () => await Book.find({}),
    allAuthors: async () => await Author.find({})
  },
  Author: {
    bookCount: async ({ name }) => {
      const author = await Author.findOne({name})
      const bookCount = await Book.find({author}).count()
      return bookCount
    }
  },
  Mutation: {
    addAuthor: (root,args) => {
      const author = new Author({ ...args})
      return author.save()
    },
    addBook: async (root,args) => {
      const authorName = args.author.name || "No Name"
      const doesAuthorExist = await Author.findOne({name: authorName})
      const author = doesAuthorExist || await Author.findOne({name: "No Name"})
      const book = new Book({ ... args, author})
      try {
        await book.save()
      } catch(error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }
      return book
    },
    editAuthor: async (root,{name, setBornTo}) => {
      if(name.length < 4) throw new UserInputError(`'${name}' must be at least 4 characters for 'name' arg`, { invalidArgs:name})
      const authorToChange = await Author.findOne({name})
      if(!authorToChange) return null
      authorToChange.born = setBornTo

      try {
        await authorToChange.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }
      return { 
        name, 
        born: setBornTo 
      } 
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})