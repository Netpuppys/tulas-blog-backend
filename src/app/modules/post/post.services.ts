import { Post, Prisma } from '@prisma/client';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import prisma from '../../../shared/prisma';
import { postSearchableFields } from './post.constants';
import { IPostFilterRequest } from './post.interface';

const normalizeSlug = (slug: string): string => slug.trim().replace(/\/+$/, '');

const createPost = async (data: Post): Promise<Post> => {
  if (data.slug) {
    data.slug = normalizeSlug(data.slug);
  }
  // Default to draft when the caller doesn't specify — safer than
  // accidentally publishing something meant to stay private.
  if (!data.status) {
    data.status = 'draft';
  }
  const result = await prisma.post.create({
    data,
  });
  return result;
};

const getAllPost = async (
  filters: IPostFilterRequest,
  options: IPaginationOptions
): Promise<IGenericResponse<Post[]>> => {
  const { page, limit, skip } = paginationHelpers.calculatePagination(options);
  const { searchTerm, status } = filters;

  const andConditons = [];

  if (searchTerm) {
    andConditons.push({
      OR: postSearchableFields.map(field => ({
        [field]: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      })),
    });
  }

  const whereConditons: Prisma.PostWhereInput =
    andConditons.length > 0 ? { AND: andConditons } : {};

  // Status is filtered in application code below rather than in the Mongo
  // query. A Mongo-level `{ status: { not: 'draft' } }` / null-OR filter
  // on this optional field was unreliable in production and hid every
  // published post, so we fetch the (search-filtered) set and filter by
  // status in JS, which behaves identically no matter how the field is
  // stored (missing, null, or a string).
  const allMatching = await prisma.post.findMany({
    where: whereConditons,
    orderBy:
      options.sortBy && options.sortOrder
        ? {
            [options.sortBy]: options.sortOrder,
          }
        : {
            created_at: 'desc',
          },
    include: {
      category: true,
    },
  });

  const filtered =
    status === 'all'
      ? allMatching
      : status
      ? allMatching.filter(post => post.status === status)
      : allMatching.filter(post => post.status !== 'draft');

  const total = filtered.length;
  const paginatedResult = filtered.slice(skip, skip + limit);

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: paginatedResult,
  };
};

const getSinglePost = async (
  slug: string,
  status?: string
): Promise<Post | null> => {
  const cleanSlug = normalizeSlug(slug);
  const slugMatch = { OR: [{ slug: cleanSlug }, { slug: `${cleanSlug}/` }] };

  const result = await prisma.post.findFirst({
    where: slugMatch,
    include: {
      category: true,
    },
  });

  if (!result) {
    return null;
  }

  // status=all (dashboard) can see drafts; anyone else gets a 404-style
  // null for drafts. Checked in JS after the fetch — see getAllPost for
  // why we don't rely on a Mongo-level status filter for this.
  const includeAll = status === 'all';
  if (!includeAll && result.status === 'draft') {
    return null;
  }

  return result;
};

const updatePost = async (
  id: string,
  payload: Partial<Post>
): Promise<Post> => {
  if (payload.slug) {
    payload.slug = normalizeSlug(payload.slug);
  }
  const result = await prisma.post.update({
    where: {
      id,
    },
    data: payload,
  });
  return result;
};

const deletePost = async (id: string): Promise<Post> => {
  const result = await prisma.post.delete({
    where: {
      id,
    },
  });
  return result;
};

export const PostService = {
  createPost,
  getAllPost,
  getSinglePost,
  updatePost,
  deletePost,
};
