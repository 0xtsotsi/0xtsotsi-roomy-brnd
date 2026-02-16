import type { Route } from "./+types/business";
import { Building2, Users, Zap, Shield, HeadsetIcon, Mail, Phone, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router";
import Navbar from "../../components/Navbar";
import { nl } from "../../lib/translations";
import Logo from "../../components/Logo";
import Button from "../../components/ui/Button";

const benefits = [
    {
        icon: Users,
        title: nl.business.benefits.team.title,
        description: nl.business.benefits.team.description
    },
    {
        icon: Zap,
        title: nl.business.benefits.api.title,
        description: nl.business.benefits.api.description
    },
    {
        icon: Shield,
        title: nl.business.benefits.sla.title,
        description: nl.business.benefits.sla.description
    },
    {
        icon: HeadsetIcon,
        title: nl.business.benefits.whiteLabel.title,
        description: nl.business.benefits.whiteLabel.description
    }
];

const useCases = [
    {
        title: nl.business.useCases.architects.title,
        description: nl.business.useCases.architects.description
    },
    {
        title: nl.business.useCases.realtors.title,
        description: nl.business.useCases.realtors.description
    },
    {
        title: nl.business.useCases.agencies.title,
        description: nl.business.useCases.agencies.description
    }
];

export function meta({}: Route.MetaArgs) {
    return [
        { title: "Zakelijk - Roome.brnd" },
        { name: "description", content: "Zakelijke oplossingen voor architectuurvisualisatie" },
    ];
}

export default function Business() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        company: "",
        email: "",
        message: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission
        console.log("Business inquiry:", formData);
        // Show success message or redirect
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    return (
        <div className="business-page">
            <Navbar />

            <section className="business-header">
                <div className="container">
                    <Logo size="lg" className="mb-4" />
                    <h1>{nl.business.title}</h1>
                    <p>{nl.business.subtitle}</p>
                </div>
            </section>

            <section className="business-benefits">
                <div className="container">
                    <h2>{nl.business.benefitsTitle}</h2>
                    <div className="benefits-grid">
                        {benefits.map((benefit, index) => {
                            const Icon = benefit.icon;
                            return (
                                <div key={index} className="benefit-card">
                                    <div className="benefit-icon">
                                        <Icon />
                                    </div>
                                    <h3>{benefit.title}</h3>
                                    <p>{benefit.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            <section className="business-use-cases">
                <div className="container">
                    <h2>{nl.business.useCasesTitle}</h2>
                    <div className="use-cases-grid">
                        {useCases.map((useCase, index) => (
                            <div key={index} className="use-case-card">
                                <h3>{useCase.title}</h3>
                                <p>{useCase.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="business-contact">
                <div className="container">
                    <div className="contact-layout">
                        <div className="contact-info">
                            <h2>{nl.business.contactTitle}</h2>
                            <p>{nl.business.contactSubtitle}</p>
                            
                            <div className="contact-methods">
                                <div className="contact-method">
                                    <Mail className="icon" />
                                    <div>
                                        <h3>Email</h3>
                                        <p>business@roome.brnd</p>
                                    </div>
                                </div>
                                <div className="contact-method">
                                    <Phone className="icon" />
                                    <div>
                                        <h3>{nl.business.phone}</h3>
                                        <p>+31 6 12345678</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="contact-form-wrapper">
                            <form className="contact-form" onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label htmlFor="name">{nl.business.form.name}</label>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        placeholder={nl.business.form.namePlaceholder}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="company">{nl.business.form.company}</label>
                                    <input
                                        id="company"
                                        name="company"
                                        type="text"
                                        value={formData.company}
                                        onChange={handleChange}
                                        required
                                        placeholder={nl.business.form.companyPlaceholder}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="email">{nl.business.form.email}</label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        placeholder={nl.business.form.emailPlaceholder}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="message">{nl.business.form.message}</label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        placeholder={nl.business.form.messagePlaceholder}
                                        rows={4}
                                    />
                                </div>

                                <Button type="submit" variant="primary" size="lg" className="w-full">
                                    {nl.business.form.submit}
                                    <ArrowRight className="icon" />
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
