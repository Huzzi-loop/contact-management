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

  getContactById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const contact = await this.service.getContactById(id);
      return ApiResponse.success(res, contact, 'Contact retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  updateContact = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const updated = await this.service.updateContact(id, req.body);
      return ApiResponse.success(res, updated, 'Contact updated successfully');
    } catch (error) {
      next(error);
    }
  };

  deleteContact = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      await this.service.deleteContact(id);
      return ApiResponse.success(res, { id }, 'Contact deleted successfully');
    } catch (error) {
      next(error);
    }
  };

  getContacts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { search, sortBy, sortOrder, page, limit, tagId, company } = req.query as {
        search?: string;
        sortBy?: 'name' | 'createdAt';
        sortOrder?: 'asc' | 'desc';
        page?: any;
        limit?: any;
        tagId?: string;
        company?: string;
      };
      const result = await this.service.getContacts({
        search,
        sortBy,
        sortOrder,
        page: page !== undefined ? Number(page) : undefined,
        limit: limit !== undefined ? Number(limit) : undefined,
        tagId,
        company,
      });
      return ApiResponse.success(res, result.data, 'Contacts retrieved successfully', 200, result.meta);
    } catch (error) {
      next(error);
    }
  };

  addTagToContact = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const contactId = req.params.id as string;
      const { tagId } = req.body;
      const tag = await this.service.addTagToContact(contactId, tagId);
      return ApiResponse.success(res, tag, 'Tag added to contact successfully', 200);
    } catch (error) {
      next(error);
    }
  };

  removeTagFromContact = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const contactId = req.params.id as string;
      const tagId = req.params.tagId as string;
      await this.service.removeTagFromContact(contactId, tagId);
      return ApiResponse.success(res, null, 'Tag removed from contact successfully');
    } catch (error) {
      next(error);
    }
  };

  bulkUpdateTags = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.bulkUpdateTags(req.body);
      return ApiResponse.success(res, result, 'Bulk tags updated successfully');
    } catch (error) {
      next(error);
    }
  };
}

export const contactController = new ContactController();
