import { graphqlExpress, graphiqlExpress } from 'graphql-server-express';
import { makeExecutableSchema } from 'graphql-tools';
import bodyParser from 'body-parser';
import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import cors from 'cors';
import session from 'express-session';
import uuid from 'node-uuid';
import { Author } from './src/models';
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
// FACEBOOK SERVER PROVIDER (VIA PASSPORT)
//------------------------------------------------------------------------------
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;

// Configure the Facebook strategy for use by Passport.
//
// OAuth 2.0-based strategies require a `verify` function which receives the
// credential (`accessToken`) for accessing the Facebook API on the user's
// behalf, along with the user's profile.  The function must invoke `cb`
// with a user object, which will be set at `req.user` in route handlers after
// authentication.
const fbOptions = {
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: process.env.FACEBOOK_APP_AUTH_CALLBACK,
  profileFields: ['id', 'displayName', 'photos', 'emails'],
};
const fbCallback = (accessToken, refreshToken, profile, done) => {
  console.log(accessToken, refreshToken, profile);
  Author.findOrCreate(profile, (err, user) => {
    console.log('callback', err, user);
    if (err) { return done(err); }
    return done(null, user);
  });
};

passport.use(new FacebookStrategy(fbOptions, fbCallback));

// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  In a
// production-quality application, this would typically be as simple as
// supplying the user ID when serializing, and querying the user record by ID
// from the database when deserializing.  However, due to the fact that this
// example does not have a database, the complete Facebook profile is serialized
// and deserialized.
passport.serializeUser((user, done) => {
  console.log('serializeUser', user);
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  console.log('deserializeUser', id);
  /* DB.Users.get(id).then( (user, err) => {
    return done(err, user);
  }); */
});

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
// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());
server.use(session({ genid() { return uuid.v4(); }, secret: 'Z3]GJW!?9uP”/Kpe' }));

// Initialize Passport and restore authentication state, if any, from the
// session.
server.use(passport.initialize());
server.use(passport.session());

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
// FACEBOOK AUTH ENDPOINTS
//------------------------------------------------------------------------------
// Redirect the user to Facebook for authentication. When complete, Facebook
// will redirect the user back to the application at /auth/facebook/callback
server.get(
  '/auth/facebook',
  passport.authenticate('facebook', { scope: ['email'] }),
);

// Facebook will redirect the user to this URL after approval. Finish the
// authentication process by attempting to obtain an access token. If access was
// granted, the user will be logged in. Otherwise, authentication has failed.
server.get(
  '/auth/facebook/callback',
  passport.authenticate('facebook', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true,
  })
);

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
