import { create } from 'zustand';
import { RoomType } from '@roomspark/shared';
import type { RoomUsage } from '@roomspark/shared';

interface ImageToUpload {
  uri: string;
}

interface NewProjectStore {
  imageToUpload: ImageToUpload;
  style: string;
  roomType: RoomUsage | null;

  reset: () => void;
  setImageToUpload: (imageToUpload: ImageToUpload) => void;
  setStyle: (style: string) => void;
  setRoomType: (roomType: RoomUsage) => void;
}

/** When creating a new project, we jump between a few different pages.
 * This makes keeping the state between them a bit tricky. This simplifies it.
 * ONLY add state here that is needed between pages when creating a new project.
 */
export const useNewProjectStore = create<NewProjectStore>(set => ({
  imageToUpload: { uri: '' },
  style: null,
  roomType: null,

  reset: () =>
    set({
      imageToUpload: { uri: '' },
      style: null,
      roomType: null,
    }),

  setImageToUpload: (imageToUpload: ImageToUpload) =>
    set({
      imageToUpload,
    }),

  setStyle: (style: RoomType) =>
    set({
      style,
    }),

  setRoomType: (roomType: RoomUsage) => set({ roomType }),
}));
