

interface Message {
  id: number;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export interface AiConversation {
  id: string;
  topic: string;
  user_id: string,
  created_at: string
  updated_at:  string
  messages: Message[]
}


export interface AIMessage {
  id: string;
  conversation_id: string;
  user_id: string;
  sender: 'user' | 'ai'; 
  text: string;
  created_at: string;
}