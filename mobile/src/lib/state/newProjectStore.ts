import { create } from 'zustand';

interface ImageToUpload {
  uri: string;
}

export type RoomTypeForPrompt = 'bedroom' | 'living_room';

interface NewProjectStore {
  imageToUpload: ImageToUpload;
  style: string;
  roomType: RoomTypeForPrompt | '';

  reset: () => void;
  setImageToUpload: (imageToUpload: ImageToUpload) => void;
  setStyle: (style: string) => void;
  setRoomType: (roomType: RoomTypeForPrompt) => void;
}

/** When creating a new project, we jump between a few different pages.
 * This makes keeping the state between them a bit tricky. This simplifies it.
 * ONLY add state here that is needed between pages when creating a new project.
 */
export const useNewProjectStore = create<NewProjectStore>(set => ({
  imageToUpload: { uri: '' },
  style: '',
  roomType: '',

  reset: () =>
    set({
      imageToUpload: { uri: '' },
      style: '',
      roomType: '',
    }),

  setImageToUpload: (imageToUpload: ImageToUpload) =>
    set({
      imageToUpload,
    }),

  setStyle: (style: string) =>
    set({
      style,
    }),

  setRoomType: (roomType: RoomTypeForPrompt) =>
    set({
      roomType,
    }),
}));
