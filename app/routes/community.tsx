import type { Route } from "./+types/community";
import Navbar from "../../components/Navbar";
import { Search, Users, Clock, ArrowUpRight } from "lucide-react";
import { useNavigate, useOutletContext } from "react-router";
import { useEffect, useState } from "react";
import { getCommunityFeed, searchProjects, getCurrentUser } from "../../lib/puter.action";
import { nl } from "../../lib/translations";
import Button from "../../components/ui/Button";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Gemeenschap - Roomy.brnd" },
    { name: "description", content: "Ontdek ontwerpen van de Roomy.brnd gemeenschap" },
  ];
}

export default function CommunityPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<DesignItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadProjects = async () => {
      setLoading(true);
      const items = await getCommunityFeed(50);
      setProjects(items);
      setLoading(false);
    };

    loadProjects();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      const items = await getCommunityFeed(50);
      setProjects(items);
    } else {
      const results = await searchProjects(searchQuery);
      setProjects(results);
    }
  };

  return (
    <div className="community-page">
      <Navbar />

      <section className="page-header">
        <div className="section-inner">
          <div className="header-content">
            <div className="icon-wrapper">
              <Users className="icon" />
            </div>
            <div>
              <h1>{nl.community.title}</h1>
              <p>{nl.community.subtitle}</p>
            </div>
          </div>

          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-wrapper">
              <Search className="search-icon" size={20} />
              <input
                type="text"
                placeholder={nl.community.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
            <Button type="submit" variant="primary">
              Zoeken
            </Button>
          </form>
        </div>
      </section>

      <section className="content">
        <div className="section-inner">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>{nl.actions.loading}</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="empty-state">
              <Users className="empty-icon" size={48} />
              <h3>{nl.community.noResults}</h3>
            </div>
          ) : (
            <div className="projects-grid">
              {projects.map(({ id, name, renderedImage, sourceImage, timestamp, ownerName }) => (
                <div
                  key={id}
                  className="project-card group"
                  onClick={() => navigate(`/visualizer/${id}`)}
                >
                  <div className="preview">
                    <img
                      src={renderedImage || sourceImage}
                      alt={name || "Project"}
                      loading="lazy"
                    />
                    <div className="badge">
                      <span>{nl.projects.community}</span>
                    </div>
                  </div>

                  <div className="card-body">
                    <div>
                      <h3>{name || "Project"}</h3>
                      <div className="meta">
                        <Clock size={12} />
                        <span>{new Date(timestamp).toLocaleDateString('nl-NL')}</span>
                        <span>Door {ownerName || 'Anoniem'}</span>
                      </div>
                    </div>
                    <div className="arrow">
                      <ArrowUpRight size={18} />
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
