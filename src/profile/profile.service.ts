import { PrismaClient, User } from '@prisma/client'
import type { Context } from 'hono'
import type {
  ProfileUsernameUpdateInput,
  ProfileDescriptionUpdateInput,
} from './dto'
import type { MultipartBody } from '../types'
import { UseMultipartData } from '../utils'

export class ProfileService {
  private prisma: PrismaClient
  private useMultipartData: UseMultipartData
  constructor() {
    this.prisma = new PrismaClient()
    this.useMultipartData = new UseMultipartData()
  }
  public getProfileList = async (ctx: Context) => {
    try {
      const profileList = await this.prisma.profile.findMany()
      return ctx.json(profileList, 200)
    } catch (error) {
      throw ctx.json({ message: 'Internal server error' }, 500)
    }
  }
  public getCurrentUserProfile = async (
    ctx: Context,
    user: Omit<User, 'password'>
  ) => {
    try {
      const currentUserProfile = await this.prisma.profile.findUnique({
        where: { user_id: user.id },
        include: {
          posts: true,
          followed_by: true,
          following: true,
          liked_posts: true,
          liked_comments: true,
        },
      })
      if (!currentUserProfile) return ctx.json({ message: 'Not found' }, 404)
      return ctx.json(currentUserProfile, 200)
    } catch (error) {
      throw ctx.json({ message: 'Internal server error' }, 500)
    }
  }
  public getProfileById = async (ctx: Context, id: string) => {
    try {
      const userProfile = await this.prisma.profile.findFirst({
        where: { id: parseInt(id) },
        include: {
          posts: true,
          followed_by: true,
          following: true,
          liked_posts: true,
          liked_comments: true,
        },
      })
      if (!userProfile) return ctx.json({ message: 'Not found' }, 404)
      return ctx.json(userProfile, 200)
    } catch (error) {
      throw ctx.json({ message: 'Internal server error' }, 500)
    }
  }
  public updateUsername = async (
    ctx: Context,
    body: ProfileUsernameUpdateInput,
    user: Omit<User, 'password'>
  ) => {
    try {
      const { username } = body
      const currentUserProfile = await this.prisma.profile.findUnique({
        where: { user_id: user.id },
      })
      if (!currentUserProfile) return ctx.json({ message: 'Not found' }, 404)
      await this.prisma.profile.update({
        where: { id: currentUserProfile.id },
        data: { username },
      })
      return ctx.json({ message: 'Successfully updated profile' }, 201)
    } catch (error) {
      throw ctx.json({ message: 'Internal server error' }, 500)
    }
  }
  public updateProfileDescription = async (
    ctx: Context,
    body: ProfileDescriptionUpdateInput,
    user: Omit<User, 'password'>
  ) => {
    try {
      const { description } = body
      const currentUserProfile = await this.prisma.profile.findUnique({
        where: { user_id: user.id },
      })
      if (!currentUserProfile) return ctx.json({ message: 'Not found' }, 404)
      await this.prisma.profile.update({
        where: { id: currentUserProfile.id },
        data: { profile_description: description },
      })
      return ctx.json({ message: 'Successfully updated profile' }, 201)
    } catch (error) {
      throw ctx.json({ message: 'Internal server error' }, 500)
    }
  }
  public updateProfileImage = async (
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
        'profile'
      )
      if (!cloudinaryRes) return
      await this.prisma.profile.update({
        where: { id: currentUserProfile.id },
        data: { image_id: cloudinaryRes?.image_id },
      })
      return ctx.json({ message: 'Successfully updated profile.' }, 203)
    } catch (error) {
      throw ctx.json({ message: 'Internal server error' }, 500)
    }
  }
  // TODO: add profile image update
  public followUser = async (
    ctx: Context,
    user: Omit<User, 'password'>,
    id: string
  ) => {
    try {
      const currentUserProfile = await this.prisma.profile.findUnique({
        where: { user_id: user.id },
      })
      if (!currentUserProfile) return ctx.json({ message: 'Not found' }, 404)
      const targetUserProfile = await this.prisma.profile.findFirst({
        where: { id: parseInt(id) },
      })
      if (!targetUserProfile) return ctx.json({ message: 'Not found' }, 404)
      await this.prisma.follow.create({
        data: {
          followed_by_id: currentUserProfile.id,
          following_id: targetUserProfile.id,
        },
      })
      return ctx.json({ message: 'Successfully followed user.' }, 201)
    } catch (error) {
      throw ctx.json({ message: 'Internal server error' }, 500)
    }
  }
  public unfollowUser = async (
    ctx: Context,
    user: Omit<User, 'password'>,
    id: string
  ) => {
    try {
      const currentUserProfile = await this.prisma.profile.findUnique({
        where: { user_id: user.id },
      })
      if (!currentUserProfile) return ctx.json({ message: 'Not found' }, 404)
      const targetUserProfile = await this.prisma.profile.findFirst({
        where: { id: parseInt(id) },
      })
      if (!targetUserProfile) return ctx.json({ message: 'Not found' }, 404)
      await this.prisma.follow.delete({
        where: {
          following_id_followed_by_id: {
            followed_by_id: currentUserProfile.id,
            following_id: targetUserProfile.id,
          },
        },
      })
      return ctx.json({ message: 'Successfully unfollowed user.' }, 201)
    } catch (error) {
      throw ctx.json({ message: 'Internal server error' }, 500)
    }
  }
}
