import { Target, TrendingUp, Users, Zap } from "lucide-react";

const benefits = [
  {
    icon: Target,
    title: "Proven Framework",
    description:
      "Follow our step-by-step system that has helped thousands achieve their goals faster than they thought possible",
  },
  {
    icon: TrendingUp,
    title: "Accelerated Growth",
    description:
      "Cut your learning curve in half with expert guidance and advanced strategies that deliver real results",
  },
  {
    icon: Users,
    title: "Community Support",
    description:
      "Join a thriving community of like-minded individuals who motivate and inspire each other daily",
  },
  {
    icon: Zap,
    title: "Instant Access",
    description:
      "Start immediately with our comprehensive resources and tools available 24/7 on any device",
  },
];

export const BenefitsSection = () => {
  return (
    <section className="py-20 px-4 relative">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Why Choose Spark Mastery?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to succeed, all in one place
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-card/50 backdrop-blur-sm p-6 rounded-2xl border border-border hover:border-primary/50 transition-all hover:shadow-glow hover:-translate-y-1 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-14 h-14 bg-gradient-primary rounded-xl flex items-center justify-center mb-4">
                <benefit.icon className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
              <p className="text-muted-foreground">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
