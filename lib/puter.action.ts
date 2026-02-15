import { db, auth, type Project } from "./db";
import { uploadImageToHosting, getOrCreateHostingConfig } from "./puter.hosting";
import { isHostedUrl } from "./utils";

// ============ AUTH ============

export const signIn = () => auth.signIn();
export const signOut = () => auth.signOut();
export const getCurrentUser = () => auth.getCurrentUser();

// ============ PROJECTS ============

export const createProject = async ({ item, visibility = "private" }: CreateProjectParams): Promise<Project | null> => {
    const user = await getCurrentUser();
    if (!user) {
        console.error('User not authenticated');
        return null;
    }

    const hosting = await getOrCreateHostingConfig();
    if (!hosting) {
        console.error('Failed to get hosting config');
        return null;
    }

    // Upload images to Puter hosting
    const hostedSource = item.sourceImage && !isHostedUrl(item.sourceImage)
        ? await uploadImageToHosting({ hosting, url: item.sourceImage, projectId: item.id, label: 'source' })
        : null;

    const hostedRender = item.renderedImage && !isHostedUrl(item.renderedImage)
        ? await uploadImageToHosting({ hosting, url: item.renderedImage, projectId: item.id, label: 'rendered' })
        : null;

    const resolvedSource = hostedSource?.url || (isHostedUrl(item.sourceImage) ? item.sourceImage : '');
    if (!resolvedSource) {
        console.error('Failed to host source image');
        return null;
    }

    const resolvedRender = hostedRender?.url || (isHostedUrl(item.renderedImage) ? item.renderedImage : undefined);

    const project: Project = {
        id: item.id,
        name: item.name,
        sourceImage: resolvedSource,
        renderedImage: resolvedRender,
        isPublic: visibility === 'public',
        ownerId: user.id,
        ownerName: user.username,
        createdAt: item.timestamp || Date.now(),
        updatedAt: Date.now(),
    };

    return await db.createProject(project);
};

export const getProjects = async (): Promise<Project[]> => {
    const user = await getCurrentUser();
    if (!user) return [];

    return await db.getUserProjectsWithDetails(user.id);
};

export const getProjectById = async ({ id }: { id: string }): Promise<Project | null> => {
    return await db.getProject(id);
};

export const updateProject = async ({ id, updates }: { id: string; updates: Partial<Project> }): Promise<Project | null> => {
    const user = await getCurrentUser();
    if (!user) return null;

    const project = await db.getProject(id);
    if (!project || project.ownerId !== user.id) return null;

    // Handle image uploads if provided
    if (updates.sourceImage && !isHostedUrl(updates.sourceImage)) {
        const hosting = await getOrCreateHostingConfig();
        if (hosting) {
            const hosted = await uploadImageToHosting({
                hosting,
                url: updates.sourceImage,
                projectId: id,
                label: 'source',
            });
            if (hosted) updates.sourceImage = hosted.url;
        }
    }

    if (updates.renderedImage && !isHostedUrl(updates.renderedImage)) {
        const hosting = await getOrCreateHostingConfig();
        if (hosting) {
            const hosted = await uploadImageToHosting({
                hosting,
                url: updates.renderedImage,
                projectId: id,
                label: 'rendered',
            });
            if (hosted) updates.renderedImage = hosted.url;
        }
    }

    return await db.updateProject(id, updates);
};

export const deleteProject = async ({ id }: { id: string }): Promise<boolean> => {
    const user = await getCurrentUser();
    if (!user) return false;

    return await db.deleteProject(id, user.id);
};

// ============ COMMUNITY ============

export const getCommunityFeed = async (limit = 50): Promise<Project[]> => {
    return await db.getCommunityFeed(limit);
};

export const searchProjects = async (query: string): Promise<Project[]> => {
    return await db.searchPublicProjects(query);
};

// ============ USER PROFILE ============

export const getUserProfile = async (userId: string) => {
    const user = await db.getUser(userId);
    if (!user) return null;

    const projects = await db.getUserProjectsWithDetails(userId);
    const publicProjects = projects.filter(p => p.isPublic);

    return {
        user,
        projectCount: projects.length,
        publicProjectCount: publicProjects.length,
        recentProjects: publicProjects.slice(0, 6),
    };
};

export const updateUserProfile = async (updates: { bio?: string; username?: string }) => {
    const user = await getCurrentUser();
    if (!user) return null;

    return await db.updateUser(user.id, updates);
};
