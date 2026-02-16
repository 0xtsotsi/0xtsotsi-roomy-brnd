import type { Route } from "./+types/profile.$userId";
import Navbar from "../../components/Navbar";
import { User, Calendar, Users, Edit3, ArrowLeft, Clock } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { getUserProfile, updateUserProfile, getCurrentUser } from "../../lib/puter.action";
import { nl } from "../../lib/translations";
import Button from "../../components/ui/Button";
import { useRef } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Profiel - Roome.brnd" },
    { name: "description", content: "Gebruikersprofiel op Roome.brnd" },
  ];
}

export default function ProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const currentUser = getCurrentUser();

  const bioRef = useRef<HTMLTextAreaElement>(null);
  const usernameRef = useRef<HTMLInputElement>(null);

  const isOwnProfile = async () => {
    const user = await currentUser;
    return user?.id === userId;
  };

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      const data = await getUserProfile(userId);
      setProfile(data);
      setLoading(false);
    };

    loadProfile();
  }, [userId]);

  const handleSave = async () => {
    if (!profile) return;

    setSaving(true);
    const updates: { bio?: string; username?: string } = {};

    if (bioRef.current) {
      updates.bio = bioRef.current.value;
    }
    if (usernameRef.current) {
      updates.username = usernameRef.current.value;
    }

    const updated = await updateUserProfile(updates);
    if (updated) {
      setProfile({
        ...profile,
        user: { ...profile.user, ...updated },
      });
      setEditing(false);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="profile-page">
        <Navbar />
        <div className="loading-state">
          <div className="spinner"></div>
          <p>{nl.actions.loading}</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-page">
        <Navbar />
        <div className="empty-state">
          <User className="empty-icon" size={48} />
          <h3>Gebruiker niet gevonden</h3>
          <Button onClick={() => navigate("/")} variant="primary">
            Terug naar home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <Navbar />

      <section className="page-header">
        <div className="section-inner">
          <Button
            variant="ghost"
            size="sm"
            className="back-button"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={18} />
            Terug
          </Button>

          <div className="profile-header-content">
            <div className="avatar-large">
              {profile.user.username?.charAt(0).toUpperCase()}
            </div>

            <div className="profile-info">
              <div className="profile-header-top">
                <h1>{profile.user.username}</h1>
                <p className="member-since">
                  <Calendar size={14} />
                  {nl.profile.memberSince} {new Date(profile.user.createdAt).toLocaleDateString('nl-NL')}
                </p>
              </div>

              {profile.user.bio && (
                <p className="bio">{profile.user.bio}</p>
              )}

              <div className="profile-stats">
                <div className="stat">
                  <Users size={20} />
                  <div>
                    <span className="stat-value">{profile.projectCount}</span>
                    <span className="stat-label">{nl.profile.projects}</span>
                  </div>
                </div>
                <div className="stat">
                  <Users size={20} />
                  <div>
                    <span className="stat-value">{profile.publicProjectCount}</span>
                    <span className="stat-label">{nl.profile.publicProjects}</span>
                  </div>
                </div>
              </div>
            </div>

            {isOwnProfile() && (
              <div className="profile-actions">
                {!editing ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditing(true)}
                  >
                    <Edit3 size={16} />
                    {nl.profile.editProfile}
                  </Button>
                ) : (
                  <div className="edit-actions">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleSave}
                      disabled={saving}
                    >
                      {saving ? nl.actions.loading : nl.profile.save}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditing(false)}
                    >
                      {nl.profile.cancel}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {editing && (
        <section className="edit-profile-section">
          <div className="section-inner">
            <div className="form-group">
              <label>{nl.profile.username}</label>
              <input
                ref={usernameRef}
                type="text"
                defaultValue={profile.user.username}
                className="input"
              />
            </div>

            <div className="form-group">
              <label>{nl.profile.bio}</label>
              <textarea
                ref={bioRef}
                defaultValue={profile.user.bio || ""}
                className="textarea"
                rows={4}
                placeholder="Vertel iets over uzzelf..."
              />
            </div>
          </div>
        </section>
      )}

      <section className="content">
        <div className="section-inner">
          <h2>Openbare Projecten</h2>

          {profile.recentProjects.length === 0 ? (
            <div className="empty-state">
              <p>Geen openbare projecten yet.</p>
            </div>
          ) : (
            <div className="projects-grid">
              {profile.recentProjects.map(({ id, name, renderedImage, sourceImage, timestamp }) => (
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
                      <span>{nl.projects.publicBadge}</span>
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
          )}
        </div>
      </section>
    </div>
  );
}
