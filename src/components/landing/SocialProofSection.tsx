import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, Users, Download, TrendingUp } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Entrepreneur",
    content:
      "Spark Mastery completely transformed my approach. Within 3 months, I doubled my productivity and achieved goals I thought would take years.",
    rating: 5,
  },
  {
    name: "Michael Chen",
    role: "Marketing Director",
    content:
      "The framework is brilliant. Simple, actionable, and incredibly effective. I've recommended it to my entire team.",
    rating: 5,
  },
  {
    name: "Emily Rodriguez",
    role: "Freelance Designer",
    content:
      "Best investment I've made in myself. The community alone is worth it, but the resources are game-changing.",
    rating: 5,
  },
];

const stats = [
  { icon: Users, value: "10,000+", label: "Active Members" },
  { icon: Download, value: "50,000+", label: "Resources Downloaded" },
  { icon: TrendingUp, value: "94%", label: "Success Rate" },
  { icon: Star, value: "4.9/5", label: "Average Rating" },
];

export const SocialProofSection = () => {
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <stat.icon className="w-8 h-8 text-primary-foreground" />
              </div>
              <div className="text-3xl md:text-4xl font-bold mb-2 text-primary">
                {stat.value}
              </div>
              <div className="text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Trusted by Thousands
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            See what our community has to say
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-card/50 backdrop-blur-sm p-6 rounded-2xl border border-border hover:border-primary/50 transition-all animate-fade-in"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 fill-accent text-accent"
                  />
                ))}
              </div>
              <p className="text-muted-foreground mb-6">
                "{testimonial.content}"
              </p>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                    {testimonial.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
