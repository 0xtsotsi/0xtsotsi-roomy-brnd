import type { Route } from "./+types/community";
import { useEffect, useState } from "react";
import { Eye, Globe, Heart, Clock } from "lucide-react";
import { useNavigate } from "react-router";
import Navbar from "../../components/Navbar";
import { getCommunityFeed } from "../../lib/puter.action";
import { nl } from "../../lib/translations";
import Logo from "../../components/Logo";

interface CommunityProject {
    id: string;
    name: string;
    sourceImage: string;
    renderedImage: string;
    isPublic: boolean;
    timestamp: number;
    ownerId?: string;
}

export function meta({}: Route.MetaArgs) {
    return [
        { title: "Gemeenschap - Roome.brnd" },
        { name: "description", content: "Bekijk projecten van de Roome.brnd gemeenschap" },
    ];
}

export default function Community() {
    const navigate = useNavigate();
    const [projects, setProjects] = useState<CommunityProject[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadCommunityProjects = async () => {
            setLoading(true);
            try {
                const items = await getCommunityFeed(50);
                setProjects(items);
            } catch (error) {
                console.error("Failed to load community projects:", error);
            } finally {
                setLoading(false);
            }
        };

        loadCommunityProjects();
    }, []);

    const handleProjectClick = (id: string) => {
        navigate(`/visualizer/${id}`);
    };

    return (
        <div className="community-page">
            <Navbar />

            <section className="community-header">
                <div className="container">
                    <Logo size="lg" className="mb-4" />
                    <h1>{nl.community.title}</h1>
                    <p>{nl.community.subtitle}</p>
                </div>
            </section>

            <section className="community-content">
                <div className="container">
                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>{nl.community.loading}</p>
                        </div>
                    ) : projects.length === 0 ? (
                        <div className="empty-state">
                            <Globe className="icon" />
                            <h3>{nl.community.emptyTitle}</h3>
                            <p>{nl.community.emptySubtitle}</p>
                        </div>
                    ) : (
                        <div className="projects-grid">
                            {projects.map((project) => (
                                <div
                                    key={project.id}
                                    className="community-card group"
                                    onClick={() => handleProjectClick(project.id)}
                                >
                                    <div className="card-image">
                                        {project.renderedImage ? (
                                            <img
                                                src={project.renderedImage}
                                                alt={project.name}
                                                className="rendered-image"
                                            />
                                        ) : (
                                            <div className="placeholder-image">
                                                <Eye className="icon" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="card-content">
                                        <h3>{project.name}</h3>
                                        <div className="card-meta">
                                            {project.isPublic && (
                                                <span className="badge public">
                                                    <Globe className="icon" />
                                                    Openbaar
                                                </span>
                                            )}
                                            <span className="timestamp">
                                                <Clock className="icon" />
                                                {new Date(project.timestamp).toLocaleDateString("nl-NL")}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
