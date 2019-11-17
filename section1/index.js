require('dotenv').config()
const { ApolloServer, gql, UserInputError, AuthenticationError } = require('apollo-server')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')


const Book = require('./models/Book')
const Author = require('./models/Author')
const User = require('./models/User')

const DB_url = process.env.MONGODB_URI
const JWT_SECRET = process.env.JWT_SECRET

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

  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }
  
  type Token {
    value: String!
  }  

  type Query {
    bookCount: Int,
    authorCount: Int,
    allBooks(author: String, genre: String): [Books],
    allAuthors: [Author],
    me: User
  }

  type Mutation {
    addBook(
      title: String,
      author: String!,
      published: Int!,
      genres: [String]
    ): Books

    editAuthor(
      name: String,
      setBornTo: Int
    ): EditedAuthor

    addAuthor(
      name:String!,
      born:Int
    ): Author

    createUser(
      username: String!
      favoriteGenre: String!
    ): User

    login(
      username: String!
      password: String!
    ): Token
  }

`

const resolvers = {
  Query: {
    bookCount: () => Book.collection.countDocuments(),
    authorCount: () =>  Author.collection.countDocuments(),
    allBooks: async (_, { genre}) => {
      return genre
        ? await Book.find({'genres': { $in: genre }}).populate('author')
        : await Book.find({}).populate('author')}
    ,
    allAuthors: async () => await Author.find({}),
    me: (_, __, {currentUser}) => currentUser
  },
  Author: {
    bookCount: async ({ name }) => {
      const author = await Author.findOne({name})
      const bookCount = await Book.find({author}).count()
      return bookCount
    }
  },
  Mutation: {
    createUser: async(_, { username, favoriteGenre }) => {
      const user = new User({ username, favoriteGenre })
      try {
        user.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }
      return user
    },
    login: async (_, { username, password}) => {
      const user = await User.findOne({ username })
  
      if ( !user || password !== 'secred' ) {
        throw new UserInputError("wrong credentials")
      }
  
      const userForToken = {
        username: user.username,
        id: user._id,
      }
  
      return { value: jwt.sign(userForToken, JWT_SECRET) }
    },
    addAuthor: async (_,args) => {
      const author = new Author({ ...args})
      try {
        await author.save()
      } catch(error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      } 
      return author
    },
    addBook: async (  _,  args, { currentUser } ) => {
      if (!currentUser) throw new AuthenticationError("not authenticated")

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
    editAuthor: async (_,{name, setBornTo}, {currentUser}) => {
      if (!currentUser) throw new AuthenticationError("not authenticated")
      
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
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
      const decodedToken = jwt.verify(
        auth.substring(7), JWT_SECRET
      )
      const currentUser = await User.findById(decodedToken.id)
      return { currentUser }
    }
  }
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})