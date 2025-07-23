import { NextFunction, Request, Response } from 'express';

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const isAuthenticated = req.isAuthenticated ? req.isAuthenticated() : !!req.user;
  
  if (!isAuthenticated) {
    return res.status(401).json({ 
      error: 'Authentication required',
      authenticated: false 
    });
  }
  
  next();
};

