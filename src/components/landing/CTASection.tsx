import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Clock, ArrowRight } from "lucide-react";

export const CTASection = () => {
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
        lead_source: "cta_section",
      });

      if (error) throw error;

      toast({
        title: "Welcome Aboard!",
        description: "You're all set! Check your email for next steps.",
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
    <section className="py-20 px-4 bg-gradient-to-br from-primary/10 via-accent/5 to-background relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-hero opacity-30"></div>
      
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className="flex justify-center mb-6 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-destructive/20 text-destructive px-4 py-2 rounded-full border border-destructive/30">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-semibold">Limited Time Offer</span>
          </div>
        </div>

        <h2 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
          Ready to Transform Your Life?
        </h2>

        <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto animate-fade-in">
          Join thousands of successful individuals who have already started their journey
        </p>

        <form
          onSubmit={handleSubmit}
          className="max-w-md mx-auto bg-card/90 backdrop-blur-sm p-8 rounded-2xl shadow-elevation border border-primary/20 animate-scale-in"
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
            className="w-full h-14 text-lg font-semibold bg-gradient-primary hover:opacity-90 transition-opacity group"
            disabled={isLoading}
          >
            {isLoading ? (
              "Processing..."
            ) : (
              <>
                Start Your Journey Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>

          <p className="text-sm text-muted-foreground mt-4">
            🔒 Your information is 100% secure
          </p>
        </form>

        <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-muted-foreground animate-fade-in">
          <div className="flex items-center gap-2">
            ✓ No credit card required
          </div>
          <div className="flex items-center gap-2">
            ✓ Cancel anytime
          </div>
          <div className="flex items-center gap-2">
            ✓ 30-day money-back guarantee
          </div>
        </div>
      </div>
    </section>
  );
};
