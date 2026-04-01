import { getRequest, postRequest } from "./requests";
import type { VideoTutorial, VideoTutorialCreate } from "../interfaces/tutorial";

export const getAllTutorials = async (): Promise<VideoTutorial[]> => {
  const result = await getRequest("/video-tutorials/all");
  return result;
};

export const getTutorialById = async (id: string): Promise<VideoTutorial> => {
  const result = await getRequest(`/video-tutorials/${id}`);
  return result;
};

export const createTutorial = async (
  data: VideoTutorialCreate
): Promise<VideoTutorial> => {
  const result = await postRequest("/video-tutorials/create", data);
  return result;
};