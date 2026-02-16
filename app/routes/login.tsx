import type { Route } from "./+types/login";
import { useState } from "react";
import { useNavigate } from "react-router";
import { LogIn, Mail, Lock } from "lucide-react";
import Button from "../../components/ui/Button";
import { nl } from "../../lib/translations";
import Logo from "../../components/Logo";

export function meta({}: Route.MetaArgs) {
    return [
        { title: "Inloggen - Roome.brnd" },
        { name: "description", content: "Log in bij Roome.brnd om uw projecten te beheren" },
    ];
}

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Puter.js auth will be integrated here
            // For now, redirect to home with logged-in state
            navigate("/");
        } catch (error) {
            console.error("Login failed:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePuterAuth = async () => {
        try {
            const puter = (window as any).puter;
            if (puter && puter.auth) {
                const user = await puter.auth.signIn();
                if (user) {
                    navigate("/");
                }
            }
        } catch (error) {
            console.error("Puter auth failed:", error);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-header">
                    <Logo size="lg" />
                    <h1>{nl.login.title}</h1>
                    <p>{nl.login.subtitle}</p>
                </div>

                <form className="login-form" onSubmit={handleLogin}>
                    <div className="form-group">
                        <label htmlFor="email">{nl.login.email}</label>
                        <div className="input-wrapper">
                            <Mail className="input-icon" />
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder={nl.login.emailPlaceholder}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">{nl.login.password}</label>
                        <div className="input-wrapper">
                            <Lock className="input-icon" />
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder={nl.login.passwordPlaceholder}
                                required
                            />
                        </div>
                    </div>

                    <Button type="submit" variant="primary" size="lg" className="w-full" disabled={isLoading}>
                        {isLoading ? nl.login.loading : <><LogIn className="icon" /> {nl.login.submit}</>}
                    </Button>
                </form>

                <div className="divider">
                    <span>{nl.login.or}</span>
                </div>

                <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                    onClick={handlePuterAuth}
                >
                    {nl.login.puterButton}
                </Button>

                <p className="login-footer">
                    {nl.login.noAccount}{" "}
                    <a href="/pricing">{nl.login.signup}</a>
                </p>
            </div>
        </div>
    );
}
