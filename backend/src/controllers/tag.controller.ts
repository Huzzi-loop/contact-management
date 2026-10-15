import { Request, Response, NextFunction } from 'express';
import { TagService, tagService } from '../services/tag.service';
import { ApiResponse } from '../utils/apiResponse';

export class TagController {
  constructor(private readonly service: TagService = tagService) {}

  getAllTags = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const tags = await this.service.getAllTags();
      return ApiResponse.success(res, tags, 'Tags retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  getTagById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const tag = await this.service.getTagById(id);
      return ApiResponse.success(res, tag, 'Tag retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  createTag = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const newTag = await this.service.createTag(req.body);
      return ApiResponse.created(res, newTag, 'Tag created successfully');
    } catch (error) {
      next(error);
    }
  };
}

export const tagController = new TagController();
