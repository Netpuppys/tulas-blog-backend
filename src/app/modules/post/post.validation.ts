import { z } from 'zod';

const createZodPost = z.object({
  body: z.object({
    title: z.string({
      required_error: 'Title is required',
    }),
    meta_title: z.string({
      required_error: 'Meta title is required',
    }),
    banner_img: z.string({
      required_error: 'Banner img is required',
    }),
    content: z.string({
      required_error: 'Content is required',
    }),
    short_description: z
      .string({
        required_error: 'Short description is required',
      })
      .optional(),
    meta_description: z
      .string({
        required_error: 'Meta description is required',
      })
      .optional(),
    author_name: z
      .string({
        required_error: 'Author is required',
      })
      .optional(),
    slug: z.string({
      required_error: 'Slug is required',
    }),
    category_id: z.string({
      required_error: 'Category is required',
    }),
    tags: z.array(z.string()).optional(),
    meta_keywords: z.array(z.string()).optional(),
    status: z.enum(['draft', 'published']).optional(),
  }),
});

const updateZodPost = z.object({
  body: z.object({
    title: z
      .string({
        required_error: 'Title is required',
      })
      .optional(),
    meta_title: z
      .string({
        required_error: 'Meta title is required',
      })
      .optional(),
    banner_img: z
      .string({
        required_error: 'Banner img is required',
      })
      .optional(),
    content: z
      .string({
        required_error: 'Content is required',
      })
      .optional(),
    short_description: z
      .string({
        required_error: 'Short description is required',
      })
      .optional(),
    meta_description: z
      .string({
        required_error: 'Meta description is required',
      })
      .optional(),
    author_name: z
      .string({
        required_error: 'Author is required',
      })
      .optional(),
    slug: z
      .string({
        required_error: 'Slug is required',
      })
      .optional(),
    category_id: z
      .string({
        required_error: 'Category is required',
      })
      .optional(),
    tags: z.array(z.string()).optional(),
    status: z.enum(['draft', 'published']).optional(),
  }),
});

export const PostValidation = {
  createZodPost,
  updateZodPost,
};
