import cors from 'cors';
import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy } from 'passport-openidconnect';
import { requireAuth } from './middleware/auth';
import { CipherKey } from 'crypto';

import { contactsRouter } from './routes/contacts.router';
import { usersRouter } from './routes/users.router';
import { rolesRouter } from './routes/roles.router';
import { followUpStatusRouter } from './routes/followUpStatus.router';
import bodyParser from 'body-parser';

dotenv.config();

const app = express();

const oktaClientID = process.env.OKTA_CLIENT_ID;
const oktaClientSecret = process.env.OKTA_CLIENT_SECRET;
const oktaDomain = process.env.OKTA_DOMAIN_URL;
const sessionSecret = process.env.SESSION_SECRET as CipherKey;

const port = process.env.PORT || 3000;

/**
 * This is a helathcheck for container monitoring (datadog).
 * Just needs to respond with 200. Does not require auth.
 */
app.get('/healthcheck', (_req, res: Response) => {
  res.status(200).send("Ok");
});

// Proper CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// Passport configuration
passport.use('oidc', new Strategy({
  issuer: `https://${oktaDomain}`,
  authorizationURL: `https://${oktaDomain}/oauth2/v1/authorize`,
  tokenURL: `https://${oktaDomain}/oauth2/v1/token`,
  userInfoURL: `https://${oktaDomain}/oauth2/v1/userinfo`,
  clientID: oktaClientID || '',
  clientSecret: oktaClientSecret || '',
  callbackURL: 'http://localhost:3000/authorization-code/callback',
  scope: 'openid profile'
}, (issuer: any, profile: any, done: any) => {
  return done(null, profile);
}));

passport.serializeUser((user: any, next: any) => {
  next(null, user);
});

passport.deserializeUser((obj: any, next: any) => {
  next(null, obj);
});

app.get('/', (req: Request, res: Response) => {
  res.send('Hello from Express with TypeScript!');
});

app.get('/api/auth/status', (req: Request, res: Response) => {
  res.json({
    authenticated: req.isAuthenticated(),
    user: req.user || null
  });
});

app.use('/signin', passport.authenticate('oidc'));

// Fixed signout route
app.post('/signout', (req: Request, res: Response, next: any) => {
  req.logout((err: any) => {
    if (err) { return next(err); }

    req.session.destroy((err: any) => {
      if (err) { return next(err); }

      // Send JSON response instead of redirect
      res.json({
        success: true,
        message: 'Logged out successfully',
        redirectUrl: 'http://localhost:5173/'
      });
    });
  });
});

app.use('/authorization-code/callback',
  passport.authenticate('oidc', { failureMessage: true, failWithError: true }),
  (req: Request, res: Response) => {
    // Redirect to your frontend after successful auth
    res.redirect('http://localhost:5173/contacts');
  }
);

const protectedRouter = express.Router();

// Apply auth middleware to all routes in this router
protectedRouter.use(requireAuth);

app.use('/contacts', contactsRouter);
app.use('/users', usersRouter);
app.use('/follow-up-status', followUpStatusRouter);
app.use('/roles', rolesRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;
