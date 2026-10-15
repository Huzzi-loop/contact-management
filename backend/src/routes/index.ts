import { Router } from 'express';
import tagRoutes from '../modules/tag/tag.routes';
import contactRoutes from '../modules/contact/contact.routes';

const router = Router();

router.use('/tags', tagRoutes);
router.use('/contacts', contactRoutes);

export default router;
