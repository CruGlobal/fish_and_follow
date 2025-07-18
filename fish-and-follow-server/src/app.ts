import express, { Request, Response } from 'express';
import { rolesRouter } from './routes/roles.router';

const app = express();
app.use(express.json());

// const port = process.env.PORT || 3000;

app.get('/', (req: Request, res: Response) => {
  res.send('Hello from Express with TypeScript!');
});

app.get('/api/v1/fish', (req: Request, res: Response) => {
  res.send('It is working');
});

// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });

app.use('/roles', rolesRouter);

export default app;