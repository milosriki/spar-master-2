import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Download, CheckCircle } from "lucide-react";

export const LeadMagnetSection = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
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

    try {
      const { error } = await supabase.from("spark_leads").insert({
        name,
        email,
        lead_source: "lead_magnet",
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Check your email - your free guide is on the way!",
      });

      setName("");
      setEmail("");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-secondary/50 to-background">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in">
            <div className="bg-gradient-primary p-1 rounded-2xl">
              <div className="bg-secondary rounded-2xl p-8 h-full flex flex-col justify-center">
                <Download className="w-16 h-16 text-primary mb-4" />
                <h3 className="text-2xl font-bold mb-4">Free Resource</h3>
                <p className="text-lg text-muted-foreground mb-6">
                  "The Ultimate Mastery Blueprint"
                </p>
                <ul className="space-y-3">
                  {[
                    "Step-by-step action plan",
                    "Expert strategies revealed",
                    "30-day transformation guide",
                    "Bonus templates & checklists",
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Get Your Free Guide
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Download our comprehensive guide and start your transformation today
            </p>

            <form
              onSubmit={handleSubmit}
              className="bg-card/80 backdrop-blur-sm p-8 rounded-2xl shadow-elevation"
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
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full h-14 text-lg font-semibold bg-gradient-primary hover:opacity-90 transition-opacity"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Download Free Guide"}
              </Button>

              <p className="text-sm text-muted-foreground mt-4 text-center">
                No spam. Unsubscribe anytime.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
