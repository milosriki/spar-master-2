import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Sparkles } from "lucide-react";

export const HeroSection = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email) {
      toast({
        title: "Missing Information",
        description: "Please provide your name and email",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    // Simulate submission delay
    setTimeout(() => {
      toast({
        title: "Thank you! 🎉",
        description: "You're on the list! Check your email for next steps.",
      });

      setName("");
      setEmail("");
      setPhone("");
      setIsLoading(false);
    }, 500);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 py-20 overflow-hidden">
      {/* Gradient background effects */}
      <div className="absolute inset-0 bg-gradient-hero opacity-50"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div className="relative z-10 max-w-6xl mx-auto text-center">
        <div className="flex justify-center mb-6 animate-fade-in">
          <Sparkles className="w-16 h-16 text-primary" />
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent animate-fade-in">
          Master Your Future with Spark Mastery
        </h1>

        <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto animate-fade-in">
          Transform your skills, unlock your potential, and achieve extraordinary results
          with our proven framework
        </p>

        <form
          onSubmit={handleSubmit}
          className="max-w-md mx-auto bg-card/80 backdrop-blur-sm p-8 rounded-2xl shadow-elevation animate-scale-in"
        >
          <div className="space-y-4 mb-6">
            <Input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 text-lg"
              required
            />
            <Input
              type="email"
              placeholder="Your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 text-lg"
              required
            />
            <Input
              type="tel"
              placeholder="Phone (Optional)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-12 text-lg"
            />
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full h-14 text-lg font-semibold bg-gradient-primary hover:opacity-90 transition-opacity"
            disabled={isLoading}
          >
            {isLoading ? "Submitting..." : "Get Started Free"}
          </Button>

          <p className="text-sm text-muted-foreground mt-4">
            Join 10,000+ people transforming their lives
          </p>
        </form>
      </div>
    </section>
  );
};
