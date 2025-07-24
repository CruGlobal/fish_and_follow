import { Router } from 'express';

export const rolesRouter = Router();

// Temporary placeholder route
rolesRouter.get('/', (req, res) => {
  res.json({ message: 'Roles route works!' });
});
