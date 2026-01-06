import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Mail, Loader2, CheckCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    // Get the email from session or localStorage
    const storedEmail = localStorage.getItem("pendingVerificationEmail");
    if (storedEmail) {
      setEmail(storedEmail);
    }

    // Check if user becomes verified
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user?.email_confirmed_at) {
        localStorage.removeItem("pendingVerificationEmail");
        toast({
          title: "Email verified!",
          description: "Welcome to TripCraft AI.",
        });
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  useEffect(() => {
    // Cooldown timer
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleResendEmail = async () => {
    if (!email || resendCooldown > 0) return;
    
    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        toast({
          title: "Failed to resend",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Email sent!",
          description: "Check your inbox for the verification link.",
        });
        setResendCooldown(60); // 60 second cooldown
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Unable to resend email.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-2xl shadow-xl p-8 space-y-6 text-center">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center">
              <Mail className="w-8 h-8 text-primary" />
            </div>
          </div>

          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">Check your email</h1>
            <p className="text-sm text-muted-foreground">
              We've sent a verification link to
            </p>
            {email && (
              <p className="text-sm font-medium text-foreground">{email}</p>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3 text-left">
              <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                Click the link in your email to verify your account
              </p>
            </div>
            <div className="flex items-start gap-3 text-left">
              <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                The link will expire in 24 hours
              </p>
            </div>
            <div className="flex items-start gap-3 text-left">
              <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                Check your spam folder if you don't see it
              </p>
            </div>
          </div>

          {/* Resend Button */}
          <div className="space-y-3">
            <Button
              onClick={handleResendEmail}
              disabled={isResending || resendCooldown > 0}
              variant="outline"
              className="w-full gap-2"
            >
              {isResending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : resendCooldown > 0 ? (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Resend in {resendCooldown}s
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Resend verification email
                </>
              )}
            </Button>

            <Link to="/auth" className="block">
              <Button variant="ghost" className="w-full text-muted-foreground">
                Back to sign in
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
