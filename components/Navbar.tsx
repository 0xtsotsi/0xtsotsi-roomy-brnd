import {Box, User, Menu, X} from "lucide-react";
import Button from "./ui/Button";
import {useOutletContext, useNavigate} from "react-router";
import {useState} from "react";
import Logo from "./Logo";

const Navbar = () => {
    const { isSignedIn, userName, userId, signIn, signOut } = useOutletContext<AuthContext>()
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleAuthClick = async () => {
        if(isSignedIn) {
            try {
                await signOut();
            } catch (e) {
                console.error(`Puter sign out failed: ${e}`);
            }
            return;
        }

        try {
            await signIn();
        } catch (e) {
            console.error(`Puter sign in failed: ${e}`);
        }
    };

    const navLinks = [
        { label: "Home", href: "/" },
        { label: "Gemeenschap", href: "/community" },
        { label: "Prijzen", href: "/pricing" },
        { label: "Zakelijk", href: "/business" },
    ];

    return (
        <header className="navbar">
            <nav className="inner">
                <div className="left">
                    <div className="brand" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
                        <Logo />
                    </div>

                    <ul className={`links ${mobileMenuOpen ? 'open' : ''}`}>
                        {navLinks.map((link) => (
                            <li key={link.href}>
                                <a href={link.href} onClick={(e) => {
                                    e.preventDefault();
                                    navigate(link.href);
                                    setMobileMenuOpen(false);
                                }}>
                                    {link.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="actions">
                    {isSignedIn && userId && (
                        <button
                            className="profile-link"
                            onClick={() => {
                                navigate(`/profile/${userId}`);
                                setMobileMenuOpen(false);
                            }}
                        >
                            <User size={18} />
                        </button>
                    )}

                    {isSignedIn ? (
                        <div className="user-section">
                            <span className="greeting">
                                {userName ? `Hallo, ${userName}` : 'Ingelogd'}
                            </span>
                            <Button size="sm" onClick={handleAuthClick} className="btn">
                                Uitloggen
                            </Button>
                        </div>
                    ) : (
                        <Button onClick={handleAuthClick} size="sm" variant="ghost">
                            Inloggen
                        </Button>
                    )}

                    <button
                        className="mobile-menu-toggle"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </nav>
        </header>
    )
}

export default Navbar
