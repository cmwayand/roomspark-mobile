import { create } from 'zustand';

interface ImageToUpload {
  uri: string;
}

interface NewProjectStore {
  imageToUpload: ImageToUpload;
  style: string;

  reset: () => void;
  setImageToUpload: (imageToUpload: ImageToUpload) => void;
  setStyle: (style: string) => void;
}

/** When creating a new project, we jump between a few different pages.
 * This makes keeping the state between them a bit tricky. This simplifies it.
 * ONLY add state here that is needed between pages when creating a new project.
 */
export const useNewProjectStore = create<NewProjectStore>(set => ({
  imageToUpload: { uri: '' },
  style: '',

  reset: () =>
    set({
      imageToUpload: { uri: '' },
      style: '',
    }),

  setImageToUpload: (imageToUpload: ImageToUpload) =>
    set({
      imageToUpload,
    }),

  setStyle: (style: string) =>
    set({
      style,
    }),
}));
