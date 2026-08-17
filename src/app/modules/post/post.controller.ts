import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import pick from '../../../shared/pick';
import sendResponse from '../../../shared/sendResponse';
import { postFilterableFields } from './post.constants';
import { PostService } from './post.services';

const createPost = catchAsync(async (req: Request, res: Response) => {
  const result = await PostService.createPost(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Post created successfully',
    data: result,
  });
});

const getAllPost = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, postFilterableFields);
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const result = await PostService.getAllPost(filters, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Post fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getSinglePost = catchAsync(async (req: Request, res: Response) => {
  const { slug } = req.params;
  const { status } = req.query;
  const result = await PostService.getSinglePost(slug, status as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Post fetched successfully',
    data: result,
  });
});

const updatePost = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await PostService.updatePost(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Post updated successfully',
    data: result,
  });
});

const deletePost = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await PostService.deletePost(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Post deleted successfully',
    data: result,
  });
});

export const PostController = {
  createPost,
  getAllPost,
  getSinglePost,
  updatePost,
  deletePost,
};
