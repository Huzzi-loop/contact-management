import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { ApiResponse } from './utils/apiResponse';
import { NotFoundError } from './utils/apiError';
import { errorHandler } from './middlewares/error.middleware';
import routes from './routes';

export const createApp = (): Express => {
  const app = express();

  // Middleware
  app.use(
    cors({
      origin: true, // Automatically reflect requesting origin (e.g., http://localhost:3000, production domains)
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
      exposedHeaders: ['Content-Range', 'X-Content-Range'],
    })
  );
  app.options('*', cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Basic Health Check route (accessible at /health and /api/health)
  app.get(['/health', '/api/health'], (_req: Request, res: Response) => {
    return ApiResponse.success(
      res,
      {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      },
      'CRM backend service is operational'
    );
  });

  // Mount API v1 routes
  app.use('/api/v1', routes);

  // 404 Fallback
  app.use((req: Request, _res: Response, next: NextFunction) => {
    next(new NotFoundError(`Cannot ${req.method} ${req.originalUrl}`));
  });

  // Global Error Handler
  app.use(errorHandler);

  return app;
};

export const app = createApp();
export default app;


