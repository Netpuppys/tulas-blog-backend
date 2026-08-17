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

  // status=all -> no filter (dashboard wants everything).
  // status=<value> -> exact match on that status.
  // status omitted -> default to published + legacy posts (status is
  // explicitly null in Mongo for posts saved before this field existed).
  // Using an explicit OR here instead of `status: { not: 'draft' } }`
  // because that NOT filter was excluding null-status posts entirely
  // on Mongo instead of matching them, which hid every existing post.
  if (status && status !== 'all') {
    andConditons.push({ status });
  } else if (!status) {
    andConditons.push({ OR: [{ status: 'published' }, { status: null }] });
  }

  const whereConditons: Prisma.PostWhereInput =
    andConditons.length > 0 ? { AND: andConditons } : {};

  const result = await prisma.post.findMany({
    skip,
    take: limit,
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
  const total = await prisma.post.count({
    where: whereConditons,
  });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const getSinglePost = async (
  slug: string,
  status?: string
): Promise<Post | null> => {
  const cleanSlug = normalizeSlug(slug);
  const slugMatch = { OR: [{ slug: cleanSlug }, { slug: `${cleanSlug}/` }] };
  // status=all (dashboard) can see drafts; anyone else only gets posts
  // that aren't drafts (published, or legacy posts with no status set).
  const includeAll = status === 'all';
  const whereConditons: Prisma.PostWhereInput = includeAll
    ? slugMatch
    : {
        AND: [
          slugMatch,
          { OR: [{ status: 'published' }, { status: null }] },
        ],
      };

  const result = await prisma.post.findFirst({
    where: whereConditons,
    include: {
      category: true,
    },
  });
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
