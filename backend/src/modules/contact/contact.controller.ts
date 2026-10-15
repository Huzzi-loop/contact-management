import { Request, Response, NextFunction } from 'express';
import { ContactService, contactService } from './contact.service';
import { ApiResponse } from '../../utils/apiResponse';

export class ContactController {
  constructor(private readonly service: ContactService = contactService) {}

  createContact = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const contact = await this.service.createContact(req.body);
      return ApiResponse.created(res, contact, 'Contact created successfully');
    } catch (error) {
      next(error);
    }
  };
}

export const contactController = new ContactController();
