import express, { Request, Response } from 'express';

const app = express();
const port = process.env.PORT || 3000;

/**
 * This is a helathcheck for container monitoring (datadog).
 * Just needs to respond with 200. Does not require auth.
 */
app.get('/healthcheck', (_req, res: Response) => {
  res.status(200).send("Ok");
});

app.get('/', (req: Request, res: Response) => {
  res.send('Hello from Express with TypeScript!');
});

app.get('/api/v1/fish', (req: Request, res: Response) => {
  res.send('It is working');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
