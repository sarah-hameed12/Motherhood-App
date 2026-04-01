export interface VideoTutorial {
  id: string;
  url: string;
  name: string;
  category?: string;
}

export interface VideoTutorialCreate {
  url: string;
  name: string;
  category?: string;
}