import { Router } from 'express';
import { contactController } from './contact.controller';
import { validate } from '../../middlewares/validate.middleware';
import {
  createContactSchema,
  updateContactSchema,
  getContactsQuerySchema,
  addTagToContactSchema,
  bulkTagsSchema,
} from './contact.validator';

const router = Router();

router.get('/', validate(getContactsQuerySchema, 'query'), contactController.getContacts);
router.post('/', validate(createContactSchema, 'body'), contactController.createContact);
router.post('/bulk-tags', validate(bulkTagsSchema, 'body'), contactController.bulkUpdateTags);
router.get('/:id', contactController.getContactById);
router.patch('/:id', validate(updateContactSchema, 'body'), contactController.updateContact);
router.delete('/:id', contactController.deleteContact);

router.post('/:id/tags', validate(addTagToContactSchema, 'body'), contactController.addTagToContact);
router.delete('/:id/tags/:tagId', contactController.removeTagFromContact);

export default router;
