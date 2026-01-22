import { Injectable } from '@nestjs/common';
import { LlmService } from './llm.service';
import { SearchService } from './search.service';
import { PrismaService } from './prisma.service';

@Injectable()
export class ChatService {
  constructor(
    private readonly llmService: LlmService,
    private readonly searchService: SearchService,
    private readonly prisma: PrismaService
  ) {}

  detectChatIntent(message: string): string {
    const lowerMsg = message.toLowerCase();
    const policyKeywords = [
      'policy', 'procedure', 'document', 'find', 'search', 'show me', 'where',
      'regulation', 'rule', 'guideline', 'locate', 'download', 'access',
      'compliance', 'requirement', 'standard', 'protocol', 'directive'
    ];
    const onboardingKeywords = [
      'learn', 'training', 'how to', 'what is', 'explain', 'teach', 'guide',
      'help me understand', 'tutorial', 'introduction', 'basics', 'fundamentals',
      'getting started', 'overview', 'concept', 'definition', 'why', 'when',
      'best practice', 'tip', 'advice', 'recommendation', 'example'
    ];

    let policyScore = 0;
    let onboardingScore = 0;

    policyKeywords.forEach(keyword => {
      if (lowerMsg.includes(keyword)) policyScore += 1;
    });
    onboardingKeywords.forEach(keyword => {
      if (lowerMsg.includes(keyword)) onboardingScore += 1;
    });

    if (lowerMsg.includes('show me') || lowerMsg.includes('find')) {
      policyScore += 2;
    }
    if (lowerMsg.includes('how') || lowerMsg.includes('what')) {
      onboardingScore += 2;
    }

    return policyScore > onboardingScore ? 'policy_search' : 'onboarding';
  }

  async handleChat(message: string, type?: string) {
    const chatType = type || this.detectChatIntent(message);

    if (chatType === 'policy_search') {
      return this.handlePolicySearch(message);
    }

    return this.handleOnboarding(message);
  }

  async handleOnboarding(message: string) {
    const llmResponse = await this.llmService.callLlm(message);
    const documents = await this.prisma.policyFile.findMany({
      where: { isActive: true }
    });

    this.searchService.setDocuments(documents);
    const matches = this.searchService.search(message, 5);

    const matchedPolicies = matches.map(match => match.document);

    return {
      response: llmResponse,
      type: 'onboarding',
      policy_files: matchedPolicies
    };
  }

  async handlePolicySearch(message: string) {
    const documents = await this.prisma.policyFile.findMany({
      where: { isActive: true }
    });

    this.searchService.setDocuments(documents);
    const matches = this.searchService.search(message, 10);

    const matchedPolicies = matches.map(match => match.document);

    let responseText = '';
    if (matchedPolicies.length) {
      const summaries = matches.slice(0, 3).map(match => {
        return `${match.document.name} (${match.document.category}): ${this.truncateText(match.document.content, 200)}`;
      });

      const policyPrompt = `You are an IT security policy assistant. A user is searching for policy information.\n\nSearch Query: ${message}\n\nRelevant Policy Context:\n${summaries.join('\n\n')}\n\nProvide a helpful, professional response that:\n1. Directly answers the user's policy question\n2. References the relevant policies found\n3. Gives specific, actionable guidance\n4. Keeps response concise and focused\n\nResponse:`;

      responseText = await this.llmService.callLlm(policyPrompt);
      responseText += `\n\nI found ${matchedPolicies.length} relevant document(s) that you can review for complete details.`;
    } else {
      const noResultsPrompt = `You are an IT security policy assistant. A user searched for "${message}" but no matching policy documents were found.\n\nProvide a helpful response that:\n1. Acknowledges no specific documents were found\n2. Suggests alternative search terms or topics\n3. Mentions common policy areas like passwords, data protection, remote work, incident response\n4. Keeps tone professional and helpful\n\nResponse:`;

      responseText = await this.llmService.callLlm(noResultsPrompt);
    }

    return {
      response: responseText,
      type: 'policy_search',
      policy_files: matchedPolicies
    };
  }

  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text;
    }
    let truncated = text.slice(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > maxLength / 2) {
      truncated = truncated.slice(0, lastSpace);
    }
    return `${truncated}...`;
  }
}
