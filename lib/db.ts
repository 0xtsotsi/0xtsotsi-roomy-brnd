// Puter.js global types
declare global {
  interface Window {
    puter: any;
  }
}

const puter = typeof window !== 'undefined' ? window.puter : null;

// Types
export interface User {
    id: string;
    email: string;
    username: string;
    createdAt: number;
    bio?: string;
    avatar?: string;
}

export interface Project {
    id: string;
    name: string;
    sourceImage: string;
    renderedImage?: string;
    isPublic: boolean;
    ownerId: string;
    ownerName?: string;
    createdAt: number;
    updatedAt: number;
}

// KV Keys
const KEYS = {
    USER: (id: string) => `user:${id}`,
    USER_BY_EMAIL: (email: string) => `user:email:${email.toLowerCase()}`,
    USER_PROJECTS: (userId: string) => `projects:${userId}`,
    PROJECT: (id: string) => `project:${id}`,
    PUBLIC_PROJECTS: `projects:public`,
    COMMUNITY_FEED: `feed:public`,
};

// Database Operations
export const db = {
    // ============ USER OPERATIONS ============

    async getUser(id: string): Promise<User | null> {
        try {
            const data = await puter.kv.get(KEYS.USER(id));
            return data as User | null;
        } catch {
            return null;
        }
    },

    async getUserByEmail(email: string): Promise<User | null> {
        try {
            const userId = await puter.kv.get(KEYS.USER_BY_EMAIL(email));
            if (!userId) return null;
            return await this.getUser(userId as string);
        } catch {
            return null;
        }
    },

    async createUser(user: User): Promise<User> {
        await puter.kv.set(KEYS.USER(user.id), user);
        await puter.kv.set(KEYS.USER_BY_EMAIL(user.email), user.id);
        return user;
    },

    async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
        const user = await this.getUser(id);
        if (!user) return null;
        const updated = { ...user, ...updates };
        await puter.kv.set(KEYS.USER(id), updated);
        return updated;
    },

    // ============ PROJECT OPERATIONS ============

    async getProject(id: string): Promise<Project | null> {
        try {
            const data = await puter.kv.get(KEYS.PROJECT(id));
            return data as Project | null;
        } catch {
            return null;
        }
    },

    async createProject(project: Project): Promise<Project> {
        await puter.kv.set(KEYS.PROJECT(project.id), project);

        // Add to user's project list
        const userProjects = await this.getUserProjects(project.ownerId);
        userProjects.unshift(project.id);
        await puter.kv.set(KEYS.USER_PROJECTS(project.ownerId), userProjects);

        // Add to public feed if public
        if (project.isPublic) {
            await this.addToCommunityFeed(project);
        }

        return project;
    },

    async updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
        const project = await this.getProject(id);
        if (!project) return null;

        const updated = { ...project, ...updates, updatedAt: Date.now() };
        await puter.kv.set(KEYS.PROJECT(id), updated);

        // Update community feed if visibility changed
        if (updated.isPublic && !project.isPublic) {
            await this.addToCommunityFeed(updated);
        } else if (!updated.isPublic && project.isPublic) {
            await this.removeFromCommunityFeed(id);
        }

        return updated;
    },

    async deleteProject(id: string, userId: string): Promise<boolean> {
        const project = await this.getProject(id);
        if (!project || project.ownerId !== userId) return false;

        await puter.kv.delete(KEYS.PROJECT(id));

        // Remove from user's project list
        const userProjects = await this.getUserProjects(userId);
        const filtered = userProjects.filter(pid => pid !== id);
        await puter.kv.set(KEYS.USER_PROJECTS(userId), filtered);

        // Remove from public feed if was public
        if (project.isPublic) {
            await this.removeFromCommunityFeed(id);
        }

        return true;
    },

    async getUserProjects(userId: string): Promise<string[]> {
        try {
            const data = await puter.kv.get(KEYS.USER_PROJECTS(userId));
            return (data as string[]) || [];
        } catch {
            return [];
        }
    },

    async getUserProjectsWithDetails(userId: string): Promise<Project[]> {
        const projectIds = await this.getUserProjects(userId);
        const projects: Project[] = [];

        for (const id of projectIds) {
            const project = await this.getProject(id);
            if (project) projects.push(project);
        }

        return projects.sort((a, b) => b.updatedAt - a.updatedAt);
    },

    // ============ COMMUNITY FEED ============

    async getCommunityFeed(limit = 50): Promise<Project[]> {
        try {
            const projectIds = await puter.kv.get(KEYS.COMMUNITY_FEED) as string[] || [];
            const projects: Project[] = [];

            for (const id of projectIds.slice(0, limit)) {
                const project = await this.getProject(id);
                if (project && project.isPublic) {
                    projects.push(project);
                }
            }

            return projects;
        } catch {
            return [];
        }
    },

    async addToCommunityFeed(project: Project): Promise<void> {
        const feed = await puter.kv.get(KEYS.COMMUNITY_FEED) as string[] || [];

        // Remove if already exists (to move to top)
        const filtered = feed.filter(id => id !== project.id);
        filtered.unshift(project.id);

        // Keep only latest 100
        await puter.kv.set(KEYS.COMMUNITY_FEED, filtered.slice(0, 100));
    },

    async removeFromCommunityFeed(projectId: string): Promise<void> {
        const feed = await puter.kv.get(KEYS.COMMUNITY_FEED) as string[] || [];
        const filtered = feed.filter(id => id !== projectId);
        await puter.kv.set(KEYS.COMMUNITY_FEED, filtered);
    },

    // ============ SEARCH ============

    async searchPublicProjects(query: string): Promise<Project[]> {
        const feed = await this.getCommunityFeed(100);
        const lowerQuery = query.toLowerCase();

        return feed.filter(p =>
            p.name.toLowerCase().includes(lowerQuery) ||
            p.ownerName?.toLowerCase().includes(lowerQuery)
        );
    },
};

// ============ AUTH HELPERS ============

export const auth = {
    async signIn(): Promise<User> {
        const puterUser = await puter.auth.signIn();

        let user = await db.getUserByEmail(puterUser.email);

        if (!user) {
            // Create new user
            user = await db.createUser({
                id: puterUser.uid || puterUser.username || Date.now().toString(),
                email: puterUser.email,
                username: puterUser.username || puterUser.email.split('@')[0],
                createdAt: Date.now(),
            });
        }

        return user;
    },

    async signOut(): Promise<void> {
        await puter.auth.signOut();
    },

    async getCurrentUser(): Promise<User | null> {
        try {
            const puterUser = await puter.auth.getUser();
            if (!puterUser) return null;
            return await db.getUserByEmail(puterUser.email);
        } catch {
            return null;
        }
    },
};
