import type { Route } from "./+types/home";
import Navbar from "../../components/Navbar";
import {ArrowRight, ArrowUpRight, Clock, Layers, Users} from "lucide-react";
import Button from "../../components/ui/Button";
import Upload from "../../components/Upload";
import {useNavigate} from "react-router";
import {useEffect, useRef, useState} from "react";
import {createProject, getProjects, getCommunityFeed} from "../../lib/puter.action";
import { nl } from "../../lib/translations";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Roomy.brnd - AI Architecturale Visualisatie" },
    { name: "description", content: "Visualiseer uw plattegronden in fotorealistische 3D met AI" },
  ];
}

export default function Home() {
    const navigate = useNavigate();
    const [projects, setProjects] = useState<DesignItem[]>([]);
    const [communityProjects, setCommunityProjects] = useState<DesignItem[]>([]);
    const isCreatingProjectRef = useRef(false);
    const { isSignedIn, userId } = useOutletContext<AuthContext>()

    const handleUploadComplete = async (base64Image: string) => {
        try {
            if(isCreatingProjectRef.current) return false;
            isCreatingProjectRef.current = true;
            const newId = Date.now().toString();
            const name = `Woning ${newId}`;

            const newItem = {
                id: newId, name, sourceImage: base64Image,
                renderedImage: undefined,
                timestamp: Date.now()
            }

            const saved = await createProject({ item: newItem, visibility: 'private' });

            if(!saved) {
                console.error("Project aanmaken mislukt");
                return false;
            }

            setProjects((prev) => [saved, ...prev]);

            navigate(`/visualizer/${newId}`, {
                state: {
                    initialImage: saved.sourceImage,
                    initialRendered: saved.renderedImage || null,
                    name
                }
            });

            return true;
        } finally {
            isCreatingProjectRef.current = false;
        }
    }

    useEffect(() => {
        const fetchProjects = async () => {
            const items = await getProjects();
            setProjects(items)

            // Also fetch community projects
            const community = await getCommunityFeed(12);
            setCommunityProjects(community);
        }

        fetchProjects();
    }, []);

  return (
      <div className="home">
          <Navbar />

          <section className="hero">
              <div className="announce">
                  <div className="dot">
                      <div className="pulse"></div>
                  </div>

                  <p>Roomy.brnd 2.0 Introductie</p>
              </div>

              <h1>Ontwerp prachtige ruimtes op het snel van gedachten met Roomy.brnd</h1>

              <p className="subtitle">
                  Roomy.brnd is een AI-first ontwerpomgeving die helpt bij het visualiseren, renderen en leveren van architecturische projecten sneller dan ooit.
              </p>

              <div className="actions">
                  <a href="#upload" className="cta">
                      Begin met bouwen <ArrowRight className="icon" />
                  </a>

                  <Button variant="outline" size="lg" className="demo">
                      Bekijk Demo
                  </Button>
              </div>

              <div id="upload" className="upload-shell">
                <div className="grid-overlay" />

                  <div className="upload-card">
                      <div className="upload-head">
                          <div className="upload-icon">
                              <Layers className="icon" />
                          </div>

                          <h3>{nl.hero.uploadTitle}</h3>
                          <p>{nl.hero.uploadSubtitle}</p>
                      </div>

                      <Upload onComplete={handleUploadComplete} />
                  </div>
              </div>
          </section>

          <section className="projects">
              <div className="section-inner">
                  <div className="section-head">
                      <div className="copy">
                          <h2>{nl.projects.title}</h2>
                          <p>{nl.projects.subtitle}</p>
                      </div>
                  </div>

                  {isSignedIn && projects.length > 0 && (
                      <div className="projects-section">
                          <h3>Mijn Projecten</h3>
                          <div className="projects-grid">
                              {projects.slice(0, 6).map(({id, name, renderedImage, sourceImage, timestamp, isPublic}) => (
                                  <div key={id} className="project-card group" onClick={() => navigate(`/visualizer/${id}`)}>
                                      <div className="preview">
                                          <img src={renderedImage || sourceImage} alt={name || "Project"} />
                                          <div className="badge">
                                              <span>{isPublic ? nl.projects.publicBadge : nl.projects.privateBadge}</span>
                                          </div>
                                      </div>

                                      <div className="card-body">
                                          <div>
                                              <h3>{name || "Project"}</h3>
                                              <div className="meta">
                                                  <Clock size={12} />
                                                  <span>{new Date(timestamp).toLocaleDateString('nl-NL')}</span>
                                              </div>
                                          </div>
                                          <div className="arrow">
                                              <ArrowUpRight size={18} />
                                          </div>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  )}

                  <div className="projects-section">
                      <div className="section-head">
                          <div className="copy">
                              <h3><Users className="inline-icon" /> {nl.community.title}</h3>
                          </div>
                      </div>

                      <div className="projects-grid">
                          {communityProjects.map(({id, name, renderedImage, sourceImage, timestamp, ownerName}) => (
                              <div key={id} className="project-card group" onClick={() => navigate(`/visualizer/${id}`)}>
                                  <div className="preview">
                                      <img src={renderedImage || sourceImage} alt={name || "Project"} />
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
                  </div>
              </div>
          </section>
      </div>
  )
}
