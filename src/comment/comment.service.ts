import { type User } from '../db/prisma'
import { type Context } from 'hono'
import { BaseService } from '../common/base'

export class CommentService extends BaseService {
  constructor() {
    super()
  }
  public listComments = async (ctx: Context, postId: string) => {
    try {
      const commentList = await this.prisma.comment.findMany({
        where: { post_id: parseInt(postId) },
        orderBy: { created_at: 'desc' },
        include: { user_profile: true, liked_by: true },
      })
      return ctx.json(commentList, 200)
    } catch (error) {
      throw ctx.json({ message: 'Internal server error' }, 500)
    }
  }
  public createNewComment = async (
    ctx: Context,
    postId: string,
    text: string,
    user: Omit<User, 'password'>
  ) => {
    try {
      const currentUserProfile = await this.prisma.profile.findFirst({
        where: { user_id: user.id },
      })
      if (!currentUserProfile) throw ctx.json({ message: 'Not found' }, 404)
      await this.prisma.comment.create({
        data: {
          post_id: parseInt(postId),
          profile_id: currentUserProfile.id,
          text,
        },
      })
      return ctx.json({ message: 'Successfully created new comment.' }, 201)
    } catch (error) {
      throw ctx.json({ message: 'Internal server error' }, 500)
    }
  }
  public deleteComment = async (
    ctx: Context,
    commentId: string,
    user: Omit<User, 'password'>
  ) => {
    try {
      const currentUserProfile = await this.prisma.profile.findFirst({
        where: { user_id: user.id },
      })
      if (!currentUserProfile) throw ctx.json({ message: 'Not found' }, 404)
      await this.prisma.comment.delete({ where: { id: parseInt(commentId) } })
      return ctx.json({ message: 'Successfully deleted comment.' }, 202)
    } catch (error) {
      throw ctx.json({ message: 'Internal server error' }, 500)
    }
  }
  public likeComment = async (
    ctx: Context,
    commentId: string,
    user: Omit<User, 'password'>
  ) => {
    try {
      const currentUserProfile = await this.prisma.profile.findFirst({
        where: { user_id: user.id },
      })
      const targetComment = await this.prisma.comment.findFirst({
        where: { id: parseInt(commentId) },
      })
      if (!targetComment) throw ctx.json({ message: 'Bad request.' }, 400)
      if (targetComment.profile_id !== currentUserProfile?.id)
        throw ctx.json({ message: 'Unauthorized' }, 401)
      await this.prisma.commentLike.create({
        data: {
          comment_id: targetComment.id,
          profile_id: currentUserProfile.id,
        },
      })
      return ctx.json({ message: 'Successfully liked comment' }, 201)
    } catch (error) {
      throw ctx.json({ message: 'Internal server error' }, 500)
    }
  }
  public unlikeComment = async (
    ctx: Context,
    commentId: string,
    user: Omit<User, 'password'>
  ) => {
    try {
      const currentUserProfile = await this.prisma.profile.findFirst({
        where: { user_id: user.id },
      })
      const targetComment = await this.prisma.comment.findFirst({
        where: { id: parseInt(commentId) },
      })
      if (!targetComment) throw ctx.json({ message: 'Bad request.' }, 400)
      if (targetComment.profile_id !== currentUserProfile?.id)
        throw ctx.json({ message: 'Unauthorized' }, 401)
      await this.prisma.commentLike.delete({
        where: {
          profile_id_comment_id: {
            comment_id: targetComment.id,
            profile_id: currentUserProfile.id,
          },
        },
      })
      return ctx.json({ message: 'Successfully unliked comment' }, 201)
    } catch (error) {
      throw ctx.json({ message: 'Internal server error' }, 500)
    }
  }
}
