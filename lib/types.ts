export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  type?: 'onboarding' | 'policy_search' | 'general';
  policyFiles?: PolicyFile[];
}

// Enhanced PolicyFile interface to match backend
export interface PolicyFile {
  id: number;
  name: string;
  content: string;
  description: string;
  category: string;
  document_type: 'policy' | 'onboarding';
  tags: string[];
  file_path?: string;
  created_by: string;
  last_updated: string;
  is_active: boolean;
}

export interface ChatRequest {
  message: string;
  type?: 'onboarding' | 'policy_search'; // Optional - auto-detected if not provided
}

export interface ChatResponse {
  response: string;
  type: string;
  policy_files?: PolicyFile[];
}

export type ChatMode = 'onboarding' | 'policy_search';

// Document management types
export interface CreateDocumentRequest {
  name: string;
  content: string;
  description?: string;
  category: string;
  document_type: 'policy' | 'onboarding';
  tags: string[];
  created_by?: string;
  file_path?: string;
}

export interface UpdateDocumentRequest {
  name?: string;
  content?: string;
  description?: string;
  category?: string;
  document_type?: 'policy' | 'onboarding';
  tags?: string[];
  is_active?: boolean;
}

export interface DocumentSearchParams {
  q?: string;
  type?: 'policy' | 'onboarding';
  category?: string;
  active?: boolean;
}

export interface DocumentSearchResponse {
  documents: PolicyFile[];
  total: number;
  query: string;
}

// Dashboard-specific types
export interface DocumentStats {
  total: number;
  policies: number;
  onboardingDocs: number;
  categories: { [key: string]: number };
}

// Google Cloud Storage file upload types
export interface GoogleCloudStorageUploadResponse {
  fileId: string;
  webViewLink: string;
}

// Legacy file upload response (deprecated - kept for backwards compatibility)
export interface LegacyFileUploadResponse {
  success: boolean;
  message: string;
  file_name?: string;
  file_type?: string;
  file_size?: number;
  file_path?: string;
  extracted_text?: string;
  error?: string;
}

// Current file upload response (Google Cloud Storage)
export type FileUploadResponse = GoogleCloudStorageUploadResponse;

// Supported file types for Google Cloud Storage uploads
export interface SupportedFileType {
  extension: string;
  mime_types: string[];
  description: string;
  max_size_mb: number;
}

export interface SupportedFileTypesResponse {
  supported_types: SupportedFileType[];
  max_file_size: string;
  accepted_extensions: string[];
  accepted_mime_types?: string[];
} 