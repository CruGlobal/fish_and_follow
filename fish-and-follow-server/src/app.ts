import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';


const DATA_FILE = './resources.json';
const app = express();
const port = process.env.PORT || 3000;


type Resource = {
  id: number;
  title: string;
  url: string;
  description: string;
}

app.use(cors());
app.use(express.json());

function loadResources(): Resource[] {
  if (fs.existsSync(DATA_FILE)) {
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  }
  return [];
}

function saveResources(resources: Resource[]) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(resources, null, 2));
}



/**
 * This is a healthcheck for container monitoring (datadog).
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

app.get('/api/resources', (_req, res) => {
  const resources = loadResources();
  res.json(resources);
});

app.post('/api/resources', (req, res) => {
  const { title, url, description } = req.body;
  const resources = loadResources();
  const newResource = {
    id: resources.length + 1,
    title,
    url,
    description
  };
  resources.push(newResource);
  saveResources(resources);
  res.status(201).json(newResource);
});

app.listen(port, () => {
  console.log(`API running at http://localhost:${port}`);
});