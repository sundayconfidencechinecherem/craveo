import { AuthenticationError, UserInputError } from 'apollo-server-express';
import UserModel, { IUser } from '../../models/User.model';
import PostModel from '../../models/Post.model';
import { generateToken, generateRefreshToken, verifyRefreshToken } from '../../utils/auth.utils';
import { Context, LeanUser } from '../types';
import { Types } from 'mongoose';

const userResolvers = {
  User: {
    // Resolve followerCount from the followers array
    followerCount: async (parent: IUser | any) => {
      // If followers array is populated, use its length
      if (parent.followers && Array.isArray(parent.followers)) {
        return parent.followers.length;
      }
      // Otherwise, fetch the user with followers populated
      const user = await UserModel.findById(parent.id || parent._id)
        .select('followers')
        .populate('followers');
      return user?.followers?.length || 0;
    },

    // Resolve followingCount from the following array
    followingCount: async (parent: IUser | any) => {
      if (parent.following && Array.isArray(parent.following)) {
        return parent.following.length;
      }
      const user = await UserModel.findById(parent.id || parent._id)
        .select('following')
        .populate('following');
      return user?.following?.length || 0;
    },

    // Resolve postCount by counting user's posts
    postCount: async (parent: IUser | any) => {
      const count = await PostModel.countDocuments({ 
        author: parent.id || parent._id 
      });
      return count;
    },

    // Helper to resolve followers array if needed
    followers: async (parent: IUser | any) => {
      if (parent.followers && Array.isArray(parent.followers)) {
        // If already populated with User objects, return as is
        if (parent.followers.length > 0 && typeof parent.followers[0] === 'object' && 'username' in parent.followers[0]) {
          return parent.followers;
        }
        // If it's ObjectId array, populate it
        const user = await UserModel.findById(parent.id || parent._id)
          .populate('followers', 'id username email fullName avatar bio');
        return user?.followers || [];
      }
      return [];
    },

    // Helper to resolve following array if needed
    following: async (parent: IUser | any) => {
      if (parent.following && Array.isArray(parent.following)) {
        if (parent.following.length > 0 && typeof parent.following[0] === 'object' && 'username' in parent.following[0]) {
          return parent.following;
        }
        const user = await UserModel.findById(parent.id || parent._id)
          .populate('following', 'id username email fullName avatar bio');
        return user?.following || [];
      }
      return [];
    },

    // Resolve savedPosts array
// In backend/src/graphql/resolvers/userResolvers.ts - UPDATE THE savedPosts resolver
// Resolve savedPosts array
savedPosts: async (parent: IUser | any) => {
  if (parent.savedPosts && Array.isArray(parent.savedPosts)) {
    if (parent.savedPosts.length > 0 && typeof parent.savedPosts[0] === 'object' && 'content' in parent.savedPosts[0]) {
      return parent.savedPosts;
    }
    // IMPORTANT: Populate savedPosts with actual post data
    const user = await UserModel.findById(parent.id || parent._id)
      .populate({
        path: 'savedPosts',
        populate: {
          path: 'author',
          select: 'id username fullName avatar isVerified'
        }
      });
    return user?.savedPosts || [];
  }
  return [];
},

    // Ensure id field is always available
    id: (parent: IUser | any) => {
      return parent._id ? parent._id.toString() : parent.id;
    },

    // Format dates
    createdAt: (parent: IUser | any) => {
      if (parent.createdAt instanceof Date) {
        return parent.createdAt.toISOString();
      }
      return parent.createdAt?.toISOString?.() || parent.createdAt;
    },

    updatedAt: (parent: IUser | any) => {
      if (parent.updatedAt instanceof Date) {
        return parent.updatedAt.toISOString();
      }
      return parent.updatedAt?.toISOString?.() || parent.updatedAt || parent.createdAt;
    },

    lastLogin: (parent: IUser | any) => {
      if (parent.lastLogin instanceof Date) {
        return parent.lastLogin.toISOString();
      }
      return parent.lastLogin?.toISOString?.() || parent.lastLogin;
    },

    dateOfBirth: (parent: IUser | any) => {
      if (parent.dateOfBirth instanceof Date) {
        return parent.dateOfBirth.toISOString();
      }
      return parent.dateOfBirth?.toISOString?.() || parent.dateOfBirth;
    },
  },

  Query: {
  me: async (_: any, __: any, { user }: Context) => {
    if (!user) throw new AuthenticationError('You must be logged in');
    const found = await UserModel.findById(user._id)
      .populate('followers', 'id username fullName avatar')
      .populate('following', 'id username fullName avatar')
      .populate({
        path: 'savedPosts',
        populate: {
          path: 'author',
          select: 'id username fullName avatar isVerified'
        }
      })
      .lean<LeanUser>();
    
    if (!found) throw new UserInputError('User not found');
    return { ...found, id: (found._id as Types.ObjectId).toString() };
  },

  getUser: async (_: any, { id }: { id: string }) => {
    const user = await UserModel.findById(id)
      .populate('followers', 'id username fullName avatar')
      .populate('following', 'id username fullName avatar')
      .populate({
        path: 'savedPosts',
        populate: {
          path: 'author',
          select: 'id username fullName avatar isVerified'
        }
      })
      .lean<LeanUser>();
    
    if (!user) throw new UserInputError('User not found');
    return { ...user, id: (user._id as Types.ObjectId).toString() };
  },

    searchUsers: async (_: any, { query, limit = 20 }: { query: string, limit: number }) => {
      const users = await UserModel.find({
        $or: [
          { username: { $regex: query, $options: 'i' } },
          { fullName: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } }
        ]
      })
      .limit(limit)
      .select('id username email fullName avatar bio followerCount followingCount postCount')
      .lean<LeanUser[]>();
      
      return users.map(user => ({ 
        ...user, 
        id: (user._id as Types.ObjectId).toString() 
      }));
    },
  },

  Mutation: {
    signup: async (
      _: any,
      { username, email, fullName, password, confirmPassword, dateOfBirth, bio, website, location, avatar }: any,
      { user }: Context
    ) => {
      if (password !== confirmPassword) {
        throw new UserInputError('Passwords do not match');
      }

      const existing = await UserModel.findOne({ $or: [{ email }, { username }] });
      if (existing) throw new UserInputError('Email or username already in use');

      const userDoc = await UserModel.create({
        username,
        email,
        fullName,
        password,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        bio: bio || "",
        website: website || "",
        location: location || "",
        avatar: avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random`,
        coverPhoto: "/images/covers/default.jpg",
        isPrivate: false,
        lastLogin: new Date(),
      });

      const accessToken = generateToken(userDoc);
      const refreshToken = generateRefreshToken(userDoc);

      return {
        success: true,
        message: 'Signup successful',
        accessToken,
        refreshToken,
        user: {
          id: (userDoc._id as Types.ObjectId).toString(),
          username: userDoc.username,
          email: userDoc.email,
          fullName: userDoc.fullName,
          dateOfBirth: userDoc.dateOfBirth?.toISOString(),
          avatar: userDoc.avatar,
          bio: userDoc.bio,
          coverPhoto: userDoc.coverPhoto,
          website: userDoc.website,
          location: userDoc.location,
          isVerified: userDoc.isVerified,
          isPrivate: userDoc.isPrivate,
          lastLogin: userDoc.lastLogin?.toISOString(),
          createdAt: userDoc.createdAt.toISOString(),
          updatedAt: userDoc.updatedAt?.toISOString(),
        },
      };
    },

    login: async (_: any, { identifier, password }: any, context: Context) => {
      const user = await UserModel.findOne({
        $or: [{ email: identifier }, { username: identifier }],
      }).select('+password');

      if (!user) throw new UserInputError('Invalid credentials');

      const isMatch = await user.comparePassword(password);
      if (!isMatch) throw new UserInputError('Invalid credentials');

      // Update last login time
      user.lastLogin = new Date();
      await user.save();

      const accessToken = generateToken(user);
      const refreshToken = generateRefreshToken(user);

      // Populate followers/following for the response
      const populatedUser = await UserModel.findById(user._id)
        .populate('followers', 'id username fullName avatar')
        .populate('following', 'id username fullName avatar');

      return {
        success: true,
        message: 'Login successful',
        accessToken,
        refreshToken,
        user: {
          id: (user._id as Types.ObjectId).toString(),
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          dateOfBirth: user.dateOfBirth?.toISOString(),
          avatar: user.avatar,
          bio: user.bio,
          coverPhoto: user.coverPhoto,
          website: user.website,
          location: user.location,
          isVerified: user.isVerified,
          isPrivate: user.isPrivate,
          lastLogin: user.lastLogin?.toISOString(),
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt?.toISOString(),
          followers: populatedUser?.followers || [],
          following: populatedUser?.following || [],
        },
      };
    },

    refreshToken: async (_: any, { token }: { token: string }) => {
      const decoded: any = verifyRefreshToken(token);
      const user = await UserModel.findById(decoded._id);
      if (!user) throw new UserInputError('User not found');

      const accessToken = generateToken(user);
      const refreshToken = generateRefreshToken(user);

      return {
        success: true,
        message: 'Token refreshed',
        accessToken,
        refreshToken,
        user: {
          id: (user._id as Types.ObjectId).toString(),
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          dateOfBirth: user.dateOfBirth?.toISOString(),
          avatar: user.avatar,
          bio: user.bio,
          coverPhoto: user.coverPhoto,
          website: user.website,
          location: user.location,
          isVerified: user.isVerified,
          isPrivate: user.isPrivate,
          lastLogin: user.lastLogin?.toISOString(),
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt?.toISOString(),
        },
      };
    },

    updateProfile: async (_: any, args: any, { user }: Context) => {
      if (!user) throw new AuthenticationError('You must be logged in');

      // Fields that can be updated
      const updateData: any = {};
      const allowedFields = [
        'username', 'fullName', 'email', 'bio', 'website', 
        'location', 'avatar', 'coverPhoto', 'isPrivate', 'dateOfBirth'
      ];
      
      allowedFields.forEach(field => {
        if (args[field] !== undefined) {
          updateData[field] = args[field];
        }
      });

      // Handle date conversion for dateOfBirth
      if (args.dateOfBirth) {
        updateData.dateOfBirth = new Date(args.dateOfBirth);
      }

      // If username is being updated, check if it's available
      if (args.username && args.username !== user.username) {
        const existingUser = await UserModel.findOne({ username: args.username });
        if (existingUser) throw new UserInputError('Username already taken');
      }

      // If email is being updated, check if it's available
      if (args.email && args.email !== user.email) {
        const existingUser = await UserModel.findOne({ email: args.email });
        if (existingUser) throw new UserInputError('Email already in use');
      }

      const updatedUser = await UserModel.findByIdAndUpdate(
        user._id,
        { $set: updateData },
        { new: true, runValidators: true }
      )
        .populate('followers', 'id username fullName avatar')
        .populate('following', 'id username fullName avatar');

      if (!updatedUser) throw new UserInputError('User not found');

      return {
        success: true,
        message: 'Profile updated successfully',
        user: {
          id: (updatedUser._id as Types.ObjectId).toString(),
          username: updatedUser.username,
          email: updatedUser.email,
          fullName: updatedUser.fullName,
          dateOfBirth: updatedUser.dateOfBirth?.toISOString(),
          avatar: updatedUser.avatar,
          bio: updatedUser.bio,
          coverPhoto: updatedUser.coverPhoto,
          website: updatedUser.website,
          location: updatedUser.location,
          isVerified: updatedUser.isVerified,
          isPrivate: updatedUser.isPrivate,
          lastLogin: updatedUser.lastLogin?.toISOString(),
          createdAt: updatedUser.createdAt.toISOString(),
          updatedAt: updatedUser.updatedAt?.toISOString(),
          followers: updatedUser.followers,
          following: updatedUser.following,
        },
      };
    },

    followUser: async (_: any, { userId }: { userId: string }, { user }: Context) => {
      if (!user) throw new AuthenticationError('You must be logged in');
      if (user._id.toString() === userId) throw new UserInputError('You cannot follow yourself');

      // Add to following and followers
      await UserModel.findByIdAndUpdate(user._id, { 
        $addToSet: { following: userId } 
      });
      await UserModel.findByIdAndUpdate(userId, { 
        $addToSet: { followers: user._id } 
      });

      return { success: true, message: 'User followed successfully' };
    },

    unfollowUser: async (_: any, { userId }: { userId: string }, { user }: Context) => {
      if (!user) throw new AuthenticationError('You must be logged in');
      if (user._id.toString() === userId) throw new UserInputError('You cannot unfollow yourself');

      // Remove from following and followers
      await UserModel.findByIdAndUpdate(user._id, { 
        $pull: { following: userId } 
      });
      await UserModel.findByIdAndUpdate(userId, { 
        $pull: { followers: user._id } 
      });

      return { success: true, message: 'User unfollowed successfully' };
    },
  },
};

export default userResolvers;