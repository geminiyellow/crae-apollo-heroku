import { graphqlExpress, graphiqlExpress } from 'graphql-server-express';
import bodyParser from 'body-parser';
import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import cors from 'cors';
import { makeExecutableSchema } from 'graphql-tools';
import schema from './src/schema';
import resolvers from './src/resolvers';
import initDB from './src/init-db';

//------------------------------------------------------------------------------
// LOGS
//------------------------------------------------------------------------------
// Log env vars
console.log('process.env.NODE_ENV', process.env.NODE_ENV);
console.log('process.env.PORT', process.env.PORT);
console.log('process.env.MONGO_URL', process.env.MONGO_URL);

//------------------------------------------------------------------------------
// MONGO CONNECTION
//------------------------------------------------------------------------------
const MONGO_URL = process.env.MONGO_URL;
mongoose.connect(MONGO_URL);
mongoose.Promise = global.Promise;

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:')); // eslint-disable-line
db.once('open', console.log.bind(console, `Database connected to ${MONGO_URL}`)); // eslint-disable-line

// Populate DB
initDB();

//------------------------------------------------------------------------------
// INIT EXPRESS SERVER
//------------------------------------------------------------------------------
// Initialize Express server. Port is set by Heroku when the app is deployed or
// when running locally using the 'heroku local' command.
const server = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
server.set('port', PORT);

//------------------------------------------------------------------------------
// MIDDLEWARES
//------------------------------------------------------------------------------
// Apply middleware to parse incoming body requests into JSON format.
server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());

//------------------------------------------------------------------------------
// ENABLE CORS ON DEV MODE
//------------------------------------------------------------------------------
if (process.env.NODE_ENV !== 'production') {
  // Enable the server to receive requests from the React app when running locally.
  server.use('*', cors({ origin: 'http://localhost:3000' }));
}

//------------------------------------------------------------------------------
// SERVER STATIC FILE
//------------------------------------------------------------------------------
// Serve static files from the React app
const staticFiles = express.static(path.join(__dirname, '../../client/build'));
server.use(staticFiles);

//------------------------------------------------------------------------------
// GRAPHQL ENDPOINT
//------------------------------------------------------------------------------
const executableSchema = makeExecutableSchema({
  typeDefs: schema,
  resolvers,
});

server.use(
  '/graphql',
  // bodyParser.json(), // middleware: parses incoming requests into JSON format.
  graphqlExpress({ schema: executableSchema })
);

//------------------------------------------------------------------------------
// GRAPHIQL ENDPOINT
//------------------------------------------------------------------------------
server.use(
  '/graphiql',
  graphiqlExpress({ endpointURL: '/graphql' })
);

//------------------------------------------------------------------------------
// CATCH ALL
//------------------------------------------------------------------------------
// The "catchall" handler: for any request that doesn't match one above, send
// back React's index.html file.
server.use('*', staticFiles);

//------------------------------------------------------------------------------
// LISTEN
//------------------------------------------------------------------------------
server.listen(server.get('port'), () => {
  console.log(`Listening on ${server.get('port')}`);
});
