import React from 'react';
import { X, Sparkles, Zap, Crown, MessageCircle, Shield, TrendingUp } from 'lucide-react';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  messagesUsed: number;
  maxFreeMessages: number;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({
  isOpen,
  onClose,
  messagesUsed,
  maxFreeMessages,
}) => {
  if (!isOpen) return null;

  const handleUpgrade = () => {
    // Future: Integrate Stripe payment
    // For now, store upgrade intent as a lead signal
    const upgradeIntent = {
      timestamp: new Date().toISOString(),
      messagesUsed,
      action: 'upgrade_clicked',
    };
    const intents = JSON.parse(localStorage.getItem('spar_upgrade_intents') || '[]');
    intents.push(upgradeIntent);
    localStorage.setItem('spar_upgrade_intents', JSON.stringify(intents));

    // Open external booking/upgrade page
    window.open('https://tinyurl.com/bookptd', '_blank');
    onClose();
  };

  const handleMaybeLater = () => {
    // Track dismissal — no guilt, 3-day cooldown
    localStorage.setItem('spar_paywall_dismissed', new Date().toISOString());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md animate-fade-in-up">
        <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-b from-slate-900 via-slate-900 to-amber-950/30 shadow-2xl shadow-amber-500/10">
          {/* Glow effect */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl" />
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-all z-10"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Content */}
          <div className="relative p-6 pt-8">
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>

            {/* Headline */}
            <h2 className="text-xl font-bold text-center text-white mb-1">
              Mark has more to say...
            </h2>
            <p className="text-sm text-center text-slate-400 mb-6">
              You've used your {maxFreeMessages} free coaching sessions today.
              <br />
              Unlock unlimited AI coaching to keep your momentum.
            </p>

            {/* Usage indicator */}
            <div className="mb-6 px-4">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                <span>Today's sessions</span>
                <span className="text-amber-400 font-medium">{messagesUsed}/{maxFreeMessages}</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-red-500 rounded-full transition-all duration-500"
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3 mb-6">
              {[
                { icon: MessageCircle, text: 'Unlimited AI coaching conversations', color: 'text-blue-400' },
                { icon: Zap, text: 'Priority response speed', color: 'text-yellow-400' },
                { icon: Shield, text: 'Advanced workout programming', color: 'text-green-400' },
                { icon: TrendingUp, text: 'Detailed progress analytics', color: 'text-purple-400' },
              ].map(({ icon: Icon, text, color }, i) => (
                <div key={i} className="flex items-center gap-3 px-3">
                  <div className={`w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                  <span className="text-sm text-slate-300">{text}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <button
              onClick={handleUpgrade}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold text-sm shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              <span className="flex items-center justify-center gap-2">
                <Crown className="w-4 h-4" />
                Unlock Pro — Book a Free Strategy Call
              </span>
            </button>

            {/* Social proof */}
            <p className="text-xs text-center text-slate-500 mt-3">
              Join 200+ Dubai executives training at the next level
            </p>

            {/* Maybe later */}
            <button
              onClick={handleMaybeLater}
              className="w-full mt-3 py-2 text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              Maybe later — I'll continue tomorrow
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaywallModal;
