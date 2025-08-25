import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApprovalComment } from '../entities';
import { CreateApprovalCommentDto, UpdateApprovalCommentDto } from '../dto';

@Injectable()
export class ApprovalCommentService {
  constructor(
    @InjectRepository(ApprovalComment)
    private readonly commentRepository: Repository<ApprovalComment>,
  ) {}

  async create(createDto: CreateApprovalCommentDto, userId: string, userName: string): Promise<ApprovalComment> {
    const comment = this.commentRepository.create({
      ...createDto,
      userId,
      userName,
      commentDate: new Date(),
    });

    return await this.commentRepository.save(comment);
  }

  async findByRequestId(requestId: string): Promise<ApprovalComment[]> {
    return await this.commentRepository.find({
      where: { requestId, isActive: true },
      order: { commentDate: 'ASC' },
    });
  }

  async findById(id: string): Promise<ApprovalComment> {
    const comment = await this.commentRepository.findOne({
      where: { id, isActive: true },
    });

    if (!comment) {
      throw new NotFoundException(`Comment with id ${id} not found`);
    }

    return comment;
  }

  async update(id: string, updateDto: UpdateApprovalCommentDto, userId: string): Promise<ApprovalComment> {
    const comment = await this.findById(id);
    
    if (comment.userId !== userId) {
      throw new BadRequestException('You can only edit your own comments');
    }

    Object.assign(comment, updateDto);
    comment.updatedAt = new Date();

    return await this.commentRepository.save(comment);
  }

  async delete(id: string, userId: string): Promise<void> {
    const comment = await this.findById(id);
    
    if (comment.userId !== userId) {
      throw new BadRequestException('You can only delete your own comments');
    }

    // Soft delete
    comment.isActive = false;
    comment.deletedAt = new Date();
    
    await this.commentRepository.save(comment);
  }

  async getCommentsWithReplies(requestId: string): Promise<ApprovalComment[]> {
    // Lấy tất cả comments cho request
    const comments = await this.commentRepository.find({
      where: { requestId, isActive: true },
      order: { commentDate: 'ASC' },
    });

    // Tổ chức thành cấu trúc tree
    const commentMap = new Map<string, ApprovalComment & { replies: ApprovalComment[] }>();
    const rootComments: (ApprovalComment & { replies: ApprovalComment[] })[] = [];

    // Khởi tạo map
    comments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    // Tổ chức tree
    comments.forEach(comment => {
      const commentWithReplies = commentMap.get(comment.id);
      if (comment.parentCommentId) {
        const parent = commentMap.get(comment.parentCommentId);
        if (parent) {
          parent.replies.push(commentWithReplies!);
        }
      } else {
        rootComments.push(commentWithReplies!);
      }
    });

    return rootComments;
  }
}
