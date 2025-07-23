import express, { Request, Response } from 'express';
import { contactsRouter } from './routes/contacts.router';
import { usersRouter } from './routes/users.router';
import { rolesRouter } from './routes/roles.router';
import { followUpStatusRouter } from './routes/followUpStatus.router';
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();
app.use(express.json());

// const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req: Request, res: Response) => {
  res.send('Hello from Express with TypeScript!');
});

app.get('/api/v1/fish', (req: Request, res: Response) => {
  res.send('It is working');
});

// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });

app.use('/contacts', contactsRouter);
app.use('/users', usersRouter);
app.use('/follow-up-status', followUpStatusRouter);
app.use('/roles', rolesRouter);

export default app;