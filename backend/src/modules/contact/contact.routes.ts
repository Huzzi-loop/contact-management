import { Router } from 'express';
import { contactController } from './contact.controller';
import { validate } from '../../middlewares/validate.middleware';
import { createContactSchema } from './contact.validator';

const router = Router();

router.post('/', validate(createContactSchema, 'body'), contactController.createContact);
router.get('/:id', contactController.getContactById);

export default router;
