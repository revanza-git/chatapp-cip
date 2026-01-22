import { Injectable } from '@nestjs/common';
import fetch from 'node-fetch';

interface OllamaRequest {
  model: string;
  prompt: string;
  stream: boolean;
}

interface OllamaResponse {
  response: string;
  done: boolean;
}

interface HFRequest {
  inputs: string;
  parameters?: Record<string, any>;
}

interface HFResponseItem {
  generated_text: string;
}

@Injectable()
export class LlmService {
  async callLlm(prompt: string): Promise<string> {
    const aiEnabled = process.env.AI_ENABLED;
    if (aiEnabled !== 'true') {
      return this.generateMockResponse(prompt);
    }

    const ollamaResponse = await this.callOllama(prompt).catch(() => null);
    if (ollamaResponse) {
      return ollamaResponse;
    }

    const hfResponse = await this.callHuggingFace(prompt).catch(() => null);
    if (hfResponse) {
      return hfResponse;
    }

    return this.generateMockResponse(prompt);
  }

  private async callOllama(prompt: string): Promise<string> {
    const ollamaUrl = process.env.OLLAMA_URL;
    if (!ollamaUrl) {
      throw new Error('OLLAMA_URL not configured');
    }

    const securityPrompt = `You are an IT security assistant for company onboarding.\n\nContext: You help new employees understand security policies including passwords, VPN, data protection, and incident response.\n\nEmployee Question: ${prompt}\n\nProvide a helpful, professional response about IT security. Keep it concise and actionable.`;

    const requestBody: OllamaRequest = {
      model: 'llama3.1:8b',
      prompt: securityPrompt,
      stream: false
    };

    const response = await fetch(`${ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'User-Agent': 'Mozilla/5.0'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error('Ollama request failed');
    }

    const data = (await response.json()) as OllamaResponse;
    return data.response;
  }

  private async callHuggingFace(prompt: string): Promise<string> {
    const hfToken = process.env.HF_TOKEN;
    if (!hfToken) {
      throw new Error('HF_TOKEN not configured');
    }

    const requestBody: HFRequest = {
      inputs: prompt,
      parameters: {
        max_length: 200,
        temperature: 0.7,
        do_sample: true,
        pad_token_id: 50256
      }
    };

    const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${hfToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error('Hugging Face request failed');
    }

    const data = (await response.json()) as HFResponseItem[];
    if (data.length) {
      return data[0].generated_text;
    }

    return "I'm sorry, I couldn't generate a response.";
  }

  private generateMockResponse(prompt: string): string {
    const lower = prompt.toLowerCase();

    if (lower.includes('password')) {
      return 'Our password policy requires at least 12 characters with uppercase, lowercase, numbers, and special characters. Passwords must be changed every 90 days. Would you like me to show you the complete policy document?';
    }

    if (lower.includes('vpn')) {
      return 'For remote work, you must use our company VPN. Make sure your device is encrypted and follow secure Wi-Fi practices. Personal devices need MDM enrollment.';
    }

    if (lower.includes('incident')) {
      return 'Security incidents must be reported within 2 hours. Follow our escalation process: Level 1 (Help Desk) → Level 2 (Security Team) → Level 3 (CISO). Document all actions taken.';
    }

    if (lower.includes('data')) {
      return 'All company data must be classified as Public, Internal, Confidential, or Restricted. Confidential and Restricted data requires encryption at rest and in transit.';
    }

    return 'I can help you with IT security questions including passwords, VPN access, data protection, and incident response. What would you like to know?';
  }
}
