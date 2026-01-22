import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ChatService } from '../services/chat.service';
import { AuthGuard } from '../guards/auth.guard';
import { AuditService } from '../services/audit.service';

@Controller('api/chat')
@UseGuards(AuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService, private readonly auditService: AuditService) {}

  @Post()
  async chat(@Body() body: { message: string; type?: string }, @Req() req: any) {
    const response = await this.chatService.handleChat(body.message, body.type);

    if (response.policy_files?.length) {
      const docNames = response.policy_files.map((doc: any) => doc.name).join(', ');
      await this.auditService.logSystemActivity({
        userId: req.user.id,
        action: 'VIEW',
        details: `Chat search '${body.message}' returned ${response.policy_files.length} documents: ${docNames}`
      });
    } else {
      await this.auditService.logSystemActivity({
        userId: req.user.id,
        action: 'VIEW',
        details: `Chat search '${body.message}' (type: ${body.type || 'auto'}) - no documents returned`
      });
    }

    return response;
  }
}
