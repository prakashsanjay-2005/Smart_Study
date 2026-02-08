export type FileType = 'audio' | 'image' | 'pdf';

export interface UploadedFile {
  id: string;
  name: string;
  type: FileType;
  url: string; // Blob URL for preview
  base64: string; // For API
  mimeType: string;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  linkedImageId?: string; // ID of an uploaded image relevant to this moment
  importance: 'high' | 'medium' | 'low';
}

export interface StudyInsight {
  topic: string;
  summary: string;
  examProbability: number;
  relatedSearchQuery?: string;
  searchResult?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
  sources?: { uri: string; title: string }[];
}