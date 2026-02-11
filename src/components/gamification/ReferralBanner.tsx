import React, { useState, useEffect } from 'react';
import { Copy, Check, Share2, Users } from 'lucide-react';
import { ReferralService } from '@/services/ReferralService';
import { Button } from '@/components/ui/button';

const ReferralBanner: React.FC = () => {
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [referralCount, setReferralCount] = useState(0);

  useEffect(() => {
    setCode(ReferralService.getCode());
    setReferralCount(ReferralService.getReferralCount());
  }, []);

  const handleShare = async () => {
    const result = await ReferralService.shareReferral();
    if (result === 'copied') {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full rounded-xl p-4 bg-gradient-to-r from-violet-500/10 to-blue-500/10 border border-violet-500/20">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center">
          <Users className="w-4 h-4 text-violet-400" />
        </div>
        <div>
          <div className="text-sm font-semibold text-white">
            Invite Friends, Earn Gold
          </div>
          <div className="text-xs text-muted-foreground">
            Both you and your friend get rewarded
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 bg-background/50 rounded-lg px-3 py-2 font-mono text-sm tracking-wider text-center border border-border">
          {code}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className="shrink-0"
        >
          {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
        </Button>
      </div>

      <Button
        onClick={handleShare}
        className="w-full bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white"
        size="sm"
      >
        <Share2 className="w-4 h-4 mr-2" />
        Share Invite Link
      </Button>

      {referralCount > 0 && (
        <div className="mt-2 text-xs text-center text-muted-foreground">
          {referralCount} friend{referralCount !== 1 ? 's' : ''} joined
        </div>
      )}
    </div>
  );
};

export default ReferralBanner;
