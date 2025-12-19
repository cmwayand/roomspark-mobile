import { useCallback, useState, useMemo, useEffect, useRef } from 'react';
import { useApiQuery, useApiMutation } from '@/src/lib/api/useApi';
import {
  CreateProjectResponse,
  GenerateImageResponse,
  GetProductsResponse,
  GetProjectDetailsResponse,
  UploadResponse,
} from '@roomspark/shared';
import { useNewProjectStore } from '../state/newProjectStore';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import type { RoomType, RoomUsage } from '@roomspark/shared';

type LoadingState = {
  uploading: boolean;
  generating: boolean;
  searching: boolean;
  creating: boolean;
};

type ProjectFlowData = Omit<GetProjectDetailsResponse, 'status' | 'error'>;

export function useProjectFlow(projectId: string) {
  const emptyProject = useMemo(
    () =>
      ({
        project: {
          id: '',
          name: '',
          created_at: '',
          image: '',
        },
        uploads: [],
        generated: [],
        products: [],
      }) as ProjectFlowData,
    []
  );

  const { style, roomType } = useNewProjectStore();
  const [project, setProject] = useState<ProjectFlowData>(emptyProject);
  const [loading, setLoading] = useState<LoadingState>({
    uploading: false,
    generating: false,
    searching: false,
    creating: false,
  });
  const [error, setError] = useState<string | null>(null);

  // React Query hooks - much simpler!
  const {
    data: projectData,
    isLoading: projectLoading,
    error: projectError,
    refetch: refetchProject,
  } = useApiQuery<GetProjectDetailsResponse>(`/api/get-project?projectId=${projectId}`, {
    enabled: !!projectId && projectId !== '' && projectId !== 'newProject',
    queryKey: ['project', projectId],
  });

  const createProjectMutation = useApiMutation<CreateProjectResponse>('/api/create-project', {
    method: 'POST',
    timeout: 10000,
  });

  const uploadMutation = useApiMutation<UploadResponse>('/api/upload', {
    method: 'POST',
    timeout: 20000,
  });

  const generateImageMutation = useApiMutation<GenerateImageResponse>('/api/generate-image', {
    method: 'POST',
    timeout: 100000,
  });

  const searchProductsMutation = useApiMutation<GetProductsResponse>('/api/get-products', {
    method: 'POST',
    timeout: 100000,
  });

  // Simple refs for stable function references
  const projectIdRef = useRef(projectId);
  const refetchRef = useRef(refetchProject);

  // Update refs on each render
  projectIdRef.current = projectId;
  refetchRef.current = refetchProject;

  // Update project state when data changes
  useEffect(() => {
    if (projectData) {
      setProject(projectData);
      setError(null);
    } else if (projectError) {
      setError(projectError);
      setProject(emptyProject);
    }
  }, [projectData, projectError, emptyProject]);

  // Reset state when projectId changes
  useEffect(() => {
    if (projectIdRef.current === projectId) {
      return;
    }
    projectIdRef.current = projectId;

    setProject(emptyProject);
    setLoading({
      uploading: false,
      generating: false,
      searching: false,
      creating: false,
    });
    setError(null);
  }, [projectId, emptyProject]);

  const updateLoading = useCallback((updates: Partial<LoadingState>) => {
    setLoading(prev => ({ ...prev, ...updates }));
  }, []);

  const uploadPhoto = useCallback(
    async (imageUri: string, projectId: string): Promise<string | undefined> => {
      try {
        updateLoading({ uploading: true });
        setError(null);

        // Resize and compress the image
        const manipResult = await ImageManipulator.manipulateAsync(
          imageUri,
          [{ resize: { width: 1024 } }],
          { format: ImageManipulator.SaveFormat.PNG, compress: 0.8 }
        );

        // Convert to base64
        const base64ImageData = await FileSystem.readAsStringAsync(manipResult.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const filename = imageUri.split('/').pop();
        const fileType = 'image/png';

        const result = await uploadMutation.mutateAsync({
          photo: base64ImageData,
          filename,
          fileType,
          projectId,
        });

        // Only update state if we have a valid imageId
        if (result && result.imageId) {
          const imageId = result.imageId;
          setProject(prev => ({
            ...prev,
            uploads: [
              ...prev.uploads,
              {
                id: imageId,
                url: imageUri,
                type: 'upload' as const,
                created_at: '',
                source: '',
              },
            ],
          }));
          return imageId;
        }

        return undefined;
      } catch (error: any) {
        console.error('Upload error:', error);
        setError('Failed to upload photo');
        return undefined;
      } finally {
        updateLoading({ uploading: false });
      }
    },
    [uploadMutation, updateLoading]
  );

  const generateImage = useCallback(
    async (
      originalImageId: string,
      projectId: string,
      roomType?: RoomType,
      roomUsage?: RoomUsage
    ): Promise<GenerateImageResponse | undefined> => {
      try {
        updateLoading({ generating: true });
        setError(null);

        const result = await generateImageMutation.mutateAsync({
          imageId: originalImageId,
          projectId,
          roomType,
          roomUsage,
        });

        // Only update state if we have a valid imageId
        if (result && result.imageId) {
          const imageId = result.imageId;
          setProject(prev => ({
            ...prev,
            generated: [
              ...prev.generated,
              {
                id: imageId,
                url: result.imageUrl ?? '',
                type: 'generated' as const,
                created_at: '',
                source: '',
              },
            ],
          }));
          return result;
        }

        return undefined;
      } catch (error) {
        console.error('Generation error:', error);
        setError('Failed to generate image');
        return undefined;
      } finally {
        updateLoading({ generating: false });
      }
    },
    [generateImageMutation, updateLoading]
  );

  const searchProducts = useCallback(
    async (imageId: string, projectId: string) => {
      try {
        updateLoading({ searching: true });
        setError(null);

        const result = await searchProductsMutation.mutateAsync({
          imageId: imageId,
          projectId: projectId,
        });

        if (result?.products) {
          // Update project state with products
          setProject(prev => ({
            ...prev,
            products: result.products ?? [],
          }));
        }

        return result?.products;
      } catch (error) {
        console.error('Product search error:', error);
        setError('Failed to search products');
        return undefined;
      } finally {
        updateLoading({ searching: false });
      }
    },
    [searchProductsMutation, updateLoading]
  );

  const startNewProject = useCallback(
    async (imageToUpload: { uri: string }) => {
      try {
        console.log('Starting new project flow');
        setLoading(prev => ({ ...prev, creating: true }));
        setError(null);
        setProject(emptyProject);

        // Step 1: Create project
        const newProject = await createProjectMutation.mutateAsync({});
        if (!newProject) {
          setError('Failed to create project');
          return;
        }

        // Update project state with basic info
        setProject(prev => ({
          ...prev,
          project: {
            id: newProject.project.id,
            name: newProject.project.name,
            created_at: newProject.project.created_at,
            image: '',
          },
        }));

        // Step 2: Upload photo
        console.log('Uploading photo');
        const uploadedImageId = await uploadPhoto(imageToUpload.uri, newProject.project.id);
        if (!uploadedImageId) {
          return;
        }

        // Step 3: Generate image
        console.log('Generating image');
        const generateImageResponse = await generateImage(
          uploadedImageId,
          newProject.project.id,
          style,
          roomType
        );
        if (!generateImageResponse?.imageId) {
          return;
        }

        // Step 4: Search products
        console.log('Searching products');
        await searchProducts(generateImageResponse.imageId, newProject.project.id);
      } catch (error) {
        console.error('New project flow error:', error);
        setError('Failed to complete project creation');
      } finally {
        setLoading(prev => ({ ...prev, creating: false }));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const fetchExistingProject = useCallback(async () => {
    // Use ref to get current values without dependencies
    const currentProjectId = projectIdRef.current;
    const currentRefetch = refetchRef.current;

    if (currentProjectId && currentProjectId !== '' && currentProjectId !== 'newProject') {
      await currentRefetch();
    }
  }, []); // No dependencies to prevent infinite loops

  const reset = useCallback(() => {
    setProject(emptyProject);
    setLoading({
      uploading: false,
      generating: false,
      searching: false,
      creating: false,
    });
    setError(null);
  }, [emptyProject]);

  // Combine React Query loading with local loading states
  const isLoading = projectLoading || Object.values(loading).some(Boolean);

  return {
    project,
    loading: {
      ...loading,
      fetching: projectLoading,
    },
    error: error || projectError,
    isLoading,
    startNewProject,
    fetchExistingProject,
    reset,
  };
}
