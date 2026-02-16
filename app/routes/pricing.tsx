import type { Route } from "./+types/pricing";
import { Check, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router";
import Navbar from "../../components/Navbar";
import { nl } from "../../lib/translations";
import Logo from "../../components/Logo";
import Button from "../../components/ui/Button";

interface Plan {
    id: string;
    name: string;
    price: string;
    period: string;
    features: string[];
    highlighted: boolean;
    cta: string;
}

const plans: Plan[] = [
    {
        id: "free",
        name: "Gratis",
        price: "€0",
        period: "/maand",
        features: [
            "3 projecten per maand",
            "Basis AI generatie",
            "Standaard kwaliteit",
            "Community feed",
            "Export in HD"
        ],
        highlighted: false,
        cta: "Start Gratis"
    },
    {
        id: "pro",
        name: "Pro",
        price: "€29",
        period: "/maand",
        features: [
            "Onbeperkt projecten",
            "Premium AI generatie",
            "Hoge kwaliteit 4K",
            "Privé modus",
            "Prioriteit support",
            "Geen watermerk"
        ],
        highlighted: true,
        cta: "Start Pro"
    },
    {
        id: "business",
        name: "Zakelijk",
        price: "Custom",
        period: "/op aanvraag",
        features: [
            "Alles van Pro",
            "Team samenwerking",
            "API toegang",
            "White label optie",
            "Dedicated support",
            "SLA garantie"
        ],
        highlighted: false,
        cta: "Neem contact op"
    }
];

export function meta({}: Route.MetaArgs) {
    return [
        { title: "Prijzen - Roome.brnd" },
        { name: "description", content: "Bekijk onze prijsplannen voor Roome.brnd" },
    ];
}

export default function Pricing() {
    const navigate = useNavigate();

    const handleCtaClick = (planId: string) => {
        if (planId === "free" || planId === "pro") {
            navigate("/login");
        } else {
            navigate("/business");
        }
    };

    return (
        <div className="pricing-page">
            <Navbar />

            <section className="pricing-header">
                <div className="container">
                    <Logo size="lg" className="mb-4" />
                    <h1>{nl.pricing.title}</h1>
                    <p>{nl.pricing.subtitle}</p>
                </div>
            </section>

            <section className="pricing-content">
                <div className="container">
                    <div className="plans-grid">
                        {plans.map((plan) => (
                            <div
                                key={plan.id}
                                className={`plan-card ${plan.highlighted ? 'highlighted' : ''}`}
                            >
                                <div className="plan-header">
                                    <h3>{plan.name}</h3>
                                    <div className="plan-price">
                                        <span className="price">{plan.price}</span>
                                        <span className="period">{plan.period}</span>
                                    </div>
                                </div>

                                <ul className="plan-features">
                                    {plan.features.map((feature, index) => (
                                        <li key={index}>
                                            <Check className="icon" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                <Button
                                    variant={plan.highlighted ? "primary" : "outline"}
                                    size="lg"
                                    className="w-full"
                                    onClick={() => handleCtaClick(plan.id)}
                                >
                                    {plan.cta}
                                    {!plan.highlighted && <ArrowRight className="icon" />}
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="pricing-footer">
                <div className="container">
                    <h2>{nl.pricing.enterpriseTitle}</h2>
                    <p>{nl.pricing.enterpriseSubtitle}</p>
                    <Button variant="outline" size="lg" onClick={() => navigate("/business")}>
                        {nl.pricing.enterpriseCta}
                    </Button>
                </div>
            </section>
        </div>
    );
}
