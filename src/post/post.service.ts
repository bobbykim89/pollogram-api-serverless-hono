import { type User } from '../db/prisma'
import { type Context } from 'hono'
import type { MultipartBody } from '../types'
import { UseMultipartData } from '../utils'
import { BaseService } from '../common/base'

export class PostService extends BaseService {
  private useMultipartData: UseMultipartData
  constructor() {
    super()
    this.useMultipartData = new UseMultipartData()
  }
  public getPostList = async (ctx: Context) => {
    try {
      const postList = await this.prisma.post.findMany({
        orderBy: { created_at: 'desc' },
      })
      return ctx.json(postList, 200)
    } catch (error) {
      throw ctx.json({ message: 'Internal server error' }, 500)
    }
  }
  public getPostDetail = async (ctx: Context, id: string) => {
    try {
      const currentPost = await this.prisma.post.findFirst({
        where: { id: parseInt(id) },
        include: { comments: true, liked_by: true, user_profile: true },
      })
      if (!currentPost) throw ctx.json({ message: 'Not found' }, 404)
      return ctx.json(currentPost, 200)
    } catch (error) {
      throw ctx.json({ message: 'Internal server error' }, 500)
    }
  }
  public createPost = async (
    ctx: Context,
    user: Omit<User, 'password'>,
    body: MultipartBody
  ) => {
    try {
      const currentUserProfile = await this.prisma.profile.findUnique({
        where: { user_id: user.id },
      })
      if (!currentUserProfile) throw ctx.json({ message: 'Not found' }, 404)
      const cloudinaryRes = await this.useMultipartData.uploadCloudinary(
        ctx,
        body['image'],
        'post'
      )
      const bodyText: string =
        typeof body['text'] === 'string' ? body['text'] : ''
      if (!cloudinaryRes)
        throw ctx.json({ message: 'Failed to upload image.' }, 408)
      await this.prisma.post.create({
        data: {
          image_id: cloudinaryRes.image_id,
          text: bodyText,
          profile_id: currentUserProfile.id,
        },
      })
      return ctx.json({ message: 'Successfully created a new post' }, 201)
    } catch (error) {
      throw ctx.json({ message: 'Internal server error' }, 500)
    }
  }
  public deletePost = async (
    ctx: Context,
    user: Omit<User, 'password'>,
    id: string
  ) => {
    try {
      const currentUserProfile = await this.prisma.profile.findFirst({
        where: { user_id: user.id },
      })
      const targetPost = await this.prisma.post.findFirst({
        where: { id: parseInt(id) },
      })
      if (!targetPost) throw ctx.json({ message: 'Bad request' }, 400)
      if (
        targetPost.profile_id !== currentUserProfile?.id ||
        (user.role !== 'MANAGER' && user.role !== 'ADMIN')
      )
        throw ctx.json({ message: 'Unauthorized' }, 401)
      await this.prisma.post.delete({ where: { id: targetPost.id } })
      await this.useMultipartData.deleteCloudinaryImage(targetPost.image_id)
      return ctx.json({ message: 'Successfully deleted post.' }, 203)
    } catch (error) {
      throw ctx.json({ message: 'Internal server error' }, 500)
    }
  }
  public likePost = async (
    ctx: Context,
    postId: string,
    user: Omit<User, 'password'>
  ) => {
    try {
      const currentUserProfile = await this.prisma.profile.findFirst({
        where: { user_id: user.id },
      })
      const targetPost = await this.prisma.post.findFirst({
        where: { id: parseInt(postId) },
      })
      if (!targetPost) throw ctx.json({ message: 'Bad request' }, 400)
      if (targetPost.profile_id !== currentUserProfile?.id)
        throw ctx.json({ message: 'Unauthorized' }, 401)
      await this.prisma.postLike.create({
        data: { post_id: targetPost.id, profile_id: currentUserProfile.id },
      })
      return ctx.json({ message: 'Successfully liked the post' }, 201)
    } catch (error) {
      throw ctx.json({ message: 'Internal server error' }, 500)
    }
  }
  public unlikePost = async (
    ctx: Context,
    postId: string,
    user: Omit<User, 'password'>
  ) => {
    try {
      const currentUserProfile = await this.prisma.profile.findFirst({
        where: { user_id: user.id },
      })
      const targetPost = await this.prisma.post.findFirst({
        where: { id: parseInt(postId) },
      })
      if (!targetPost) throw ctx.json({ message: 'Bad request' }, 400)
      if (targetPost.profile_id !== currentUserProfile?.id)
        throw ctx.json({ message: 'Unauthorized' }, 401)
      await this.prisma.postLike.delete({
        where: {
          profile_id_post_id: {
            post_id: targetPost.id,
            profile_id: currentUserProfile.id,
          },
        },
      })
      return ctx.json({ message: 'Successfully liked the post' }, 201)
    } catch (error) {
      throw ctx.json({ message: 'Internal server error' }, 500)
    }
  }
}
