import { Router } from 'express';
import { contactController } from './contact.controller';
import { validate } from '../../middlewares/validate.middleware';
import { createContactSchema, updateContactSchema } from './contact.validator';

const router = Router();

router.post('/', validate(createContactSchema, 'body'), contactController.createContact);
router.get('/:id', contactController.getContactById);
router.patch('/:id', validate(updateContactSchema, 'body'), contactController.updateContact);

export default router;
