import { Router } from 'express';
import tagRoutes from './tag.routes';

const router = Router();

router.use('/tags', tagRoutes);

export default router;
