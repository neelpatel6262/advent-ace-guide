import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SignIn2 } from "@/components/ui/clean-minimal-sign-in";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && session.user.email_confirmed_at) {
        // Only redirect if email is verified
        navigate("/");
      }
    });

    // Check if user is already logged in with verified email
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && session.user.email_confirmed_at) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignIn = async (email: string, password: string) => {
    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          setError("Email or password is incorrect. Please try again.");
        } else if (error.message.includes("Email not confirmed")) {
          // User exists but email not verified
          localStorage.setItem("pendingVerificationEmail", email);
          navigate("/verify-email");
        } else {
          setError(error.message);
        }
      } else if (data.user && !data.user.email_confirmed_at) {
        // User signed in but email not verified
        localStorage.setItem("pendingVerificationEmail", email);
        await supabase.auth.signOut();
        navigate("/verify-email");
      } else {
        toast({
          title: "Welcome back!",
          description: "Successfully signed in.",
        });
        navigate("/");
      }
    } catch (err: any) {
      setError(err.message || "Unable to sign in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (email: string, password: string) => {
    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        if (error.message.includes("User already registered")) {
          setError("This email is already registered. Please sign in instead.");
        } else {
          setError(error.message);
        }
      } else if (data.user && !data.user.email_confirmed_at) {
        // Email verification required
        localStorage.setItem("pendingVerificationEmail", email);
        toast({
          title: "Check your email!",
          description: "We've sent you a verification link.",
        });
        navigate("/verify-email");
      }
    } catch (err: any) {
      setError(err.message || "Unable to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSocialLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        setError(error.message);
        toast({
          title: "Google sign-in failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (err: any) {
      setError(err.message || "Unable to sign in with Google.");
    } finally {
      setIsSocialLoading(false);
    }
  };

  const handleForgotPassword = async (email: string) => {
    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccessMessage("Check your email for the password reset link!");
        toast({
          title: "Reset link sent!",
          description: "Check your email for the password reset link.",
        });
      }
    } catch (err: any) {
      setError(err.message || "Unable to send reset email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SignIn2
      onSignIn={handleSignIn}
      onSignUp={handleSignUp}
      onGoogleSignIn={handleGoogleSignIn}
      onForgotPassword={handleForgotPassword}
      isLoading={isLoading}
      isSocialLoading={isSocialLoading}
      error={error}
      successMessage={successMessage}
    />
  );
};

export default Auth;
