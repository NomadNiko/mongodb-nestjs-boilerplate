import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConversationSchemaClass, ConversationSchemaDocument } from './schemas/conversation.schema';
import { MessageSchemaClass, MessageSchemaDocument } from './schemas/message.schema';
import { UserSchemaClass, UserSchemaDocument } from '../users/schemas/user.schema';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { QueryMessagesDto } from './dto/query-messages.dto';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectModel(ConversationSchemaClass.name)
    private conversationModel: Model<ConversationSchemaDocument>,
    @InjectModel(MessageSchemaClass.name)
    private messageModel: Model<MessageSchemaDocument>,
    @InjectModel(UserSchemaClass.name)
    private userModel: Model<UserSchemaDocument>,
  ) {}

  async create(createConversationDto: CreateConversationDto, currentUserId: string): Promise<ConversationSchemaDocument> {
    const { participantIds, name } = createConversationDto;
    
    // Add current user to participants if not already included
    const allParticipantIds = [...new Set([...participantIds, currentUserId])];
    
    // Validate and convert string IDs to ObjectIds
    const participantObjectIds = allParticipantIds.map(id => {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException(`Invalid participant ID: ${id}`);
      }
      return new Types.ObjectId(id);
    });
    
    // Check if a conversation with exact same participants already exists
    const existingConversation = await this.conversationModel
      .findOne({
        participants: { $all: participantObjectIds, $size: participantObjectIds.length }
      })
      .populate('participants', '_id email firstName lastName role')
      .lean()
      .exec() as ConversationSchemaDocument;
    
    if (existingConversation) {
      return existingConversation;
    }
    
    // Create new conversation
    const conversation = new this.conversationModel({
      participants: participantObjectIds,
      name,
      lastMessageAt: new Date(),
    });
    
    const savedConversation = await conversation.save();
    const populatedConversation = await this.conversationModel
      .findById(savedConversation._id)
      .populate('participants', '_id email firstName lastName role')
      .lean();
    if (!populatedConversation) {
      throw new Error('Failed to retrieve saved conversation');
    }
    return populatedConversation as ConversationSchemaDocument;
  }

  async findUserConversations(userId: string): Promise<ConversationSchemaDocument[]> {
    const userObjectId = new Types.ObjectId(userId);
    
    return this.conversationModel
      .find({ participants: userObjectId })
      .populate('participants', '_id email firstName lastName role')
      .sort({ lastMessageAt: -1 })
      .lean()
      .exec() as Promise<ConversationSchemaDocument[]>;
  }

  async findOne(conversationId: string, userId: string): Promise<ConversationSchemaDocument> {
    const userObjectId = new Types.ObjectId(userId);
    const conversationObjectId = new Types.ObjectId(conversationId);
    
    const conversation = await this.conversationModel
      .findOne({
        _id: conversationObjectId,
        participants: userObjectId, // Ensure user is part of conversation
      })
      .populate('participants', '_id email firstName lastName role')
      .lean()
      .exec() as ConversationSchemaDocument;
    
    if (!conversation) {
      throw new NotFoundException('Conversation not found or you do not have access to it');
    }
    
    return conversation;
  }

  async getMessages(conversationId: string, userId: string, queryMessagesDto: QueryMessagesDto): Promise<{
    messages: MessageSchemaDocument[];
    total: number;
    page: number;
    limit: number;
  }> {
    // First verify user has access to conversation
    await this.findOne(conversationId, userId);
    
    const { page = 1, limit = 20 } = queryMessagesDto;
    const skip = (page - 1) * limit;
    
    const conversationObjectId = new Types.ObjectId(conversationId);
    
    const [messages, total] = await Promise.all([
      this.messageModel
        .find({ conversationId: conversationObjectId })
        .populate('senderId', '_id email firstName lastName role')
        .sort({ timestamp: -1 }) // Most recent first
        .skip(skip)
        .limit(limit)
        .lean()
        .exec() as Promise<MessageSchemaDocument[]>,
      this.messageModel.countDocuments({ conversationId: conversationObjectId }),
    ]);
    
    return {
      messages: messages.reverse(), // Reverse to show oldest first in page
      total,
      page,
      limit,
    };
  }

  async sendMessage(conversationId: string, sendMessageDto: SendMessageDto, senderId: string): Promise<MessageSchemaDocument> {
    // Verify user has access to conversation
    await this.findOne(conversationId, senderId);
    
    const conversationObjectId = new Types.ObjectId(conversationId);
    const senderObjectId = new Types.ObjectId(senderId);
    
    // Create the message
    const message = new this.messageModel({
      conversationId: conversationObjectId,
      senderId: senderObjectId,
      content: sendMessageDto.content,
      timestamp: new Date(),
    });
    
    const savedMessage = await message.save();
    
    // Update conversation's lastMessageAt
    await this.conversationModel.findByIdAndUpdate(conversationObjectId, {
      lastMessageAt: new Date(),
    });
    
    // Populate sender info and return
    const populatedMessage = await this.messageModel
      .findById(savedMessage._id)
      .populate('senderId', '_id email firstName lastName role')
      .lean()
      .exec() as MessageSchemaDocument;
    if (!populatedMessage) {
      throw new Error('Failed to retrieve saved message');
    }
    return populatedMessage;
  }

  async searchUsers(searchTerm: string): Promise<any[]> {
    if (!searchTerm || searchTerm.trim().length === 0) {
      return [];
    }
    
    const searchRegex = new RegExp(searchTerm, 'i');
    
    const users = await this.userModel
      .find({
        $or: [
          { email: searchRegex },
          { firstName: searchRegex },
          { lastName: searchRegex },
        ],
      })
      .select('_id email firstName lastName role')
      .limit(20)
      .lean()
      .exec();

    // Ensure _id is always a string for React Native compatibility
    return users.map(user => ({
      _id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    }));
  }

  async remove(conversationId: string, userId: string): Promise<void> {
    const userObjectId = new Types.ObjectId(userId);
    const conversationObjectId = new Types.ObjectId(conversationId);
    
    const conversation = await this.conversationModel.findOne({
      _id: conversationObjectId,
      participants: userObjectId,
    });
    
    if (!conversation) {
      throw new NotFoundException('Conversation not found or you do not have access to it');
    }
    
    // Delete all messages in the conversation
    await this.messageModel.deleteMany({ conversationId: conversationObjectId });
    
    // Delete the conversation
    await this.conversationModel.findByIdAndDelete(conversationObjectId);
  }
}