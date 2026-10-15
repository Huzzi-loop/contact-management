import { Router } from 'express';
import { tagController } from '../controllers/tag.controller';
import { validate } from '../middlewares/validate.middleware';
import { createTagSchema } from '../validators/tag.validator';

const router = Router();

router.get('/', tagController.getAllTags);
router.get('/:id', tagController.getTagById);
router.post('/', validate(createTagSchema, 'body'), tagController.createTag);

export default router;
