"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ActionButton from "@/components/shared/buttons/ActionButton";
import { Separator } from "@/components/ui/separator";
import { FcGoogle } from "react-icons/fc";
import { useAppStore } from "@/stores/appStore";
import { loginUser, forgotPassword } from "@/lib/api/auth";
import { AuthInput } from "./AuthInput";
import { AuthPasswordInput } from "./AuthPasswordInput";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
}

export function LoginModal({
  isOpen,
  onClose,
  onSwitchToRegister,
}: LoginModalProps) {
  const { login } = useAppStore();
  const [view, setView] = useState<"login" | "forgot-password">("login");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [forgotEmail, setForgotEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleLogin = async () => {
    if (!formData.username || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await loginUser({
        username: formData.username,
        password: formData.password,
      });

      login(response.user);

      onClose();
      setFormData({ username: "", password: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin();
  };

  const handleGoogleAuth = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail) {
      setError("Please enter your email");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      await forgotPassword(forgotEmail);
      setSuccessMessage("Check your email for a password reset link");
      setForgotEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reset email");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setView("login");
    setError("");
    setSuccessMessage("");
    setFormData({ username: "", password: "" });
    setForgotEmail("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseModal}>
      <DialogContent className="border-0 p-0 shadow-2xl sm:max-w-[400px]">
        <div className="relative overflow-hidden rounded-lg">
          <div className="p-8">
            <DialogHeader className="pb-2 text-center">
              <DialogTitle className="text-center text-2xl font-semibold">
                {view === "login" ? "Welcome to LoreSmith" : "Reset Password"}
              </DialogTitle>
            </DialogHeader>

            {view === "login" ? (
              <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <AuthInput
                id="username"
                label="Username"
                placeholder="Enter your username"
                value={formData.username}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, username: value }))
                }
                autoComplete="username"
              />
              <AuthPasswordInput
                id="password"
                label="Password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, password: value }))
                }
                autoComplete="current-password"
              />

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setView("forgot-password")}
                  className="text-primary text-sm font-medium transition-colors hover:underline"
                >
                  Forgot Password?
                </button>
              </div>

              <div className="pt-2">
                {error && (
                  <div className="text-destructive mb-4 text-sm">{error}</div>
                )}
                <ActionButton
                  type="submit"
                  className="h-11 w-full text-base font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                </ActionButton>
              </div>
              <div className="text-muted-foreground text-center text-sm">
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={onSwitchToRegister}
                  className="text-primary font-medium transition-colors hover:underline"
                >
                  Create Account
                </button>
              </div>

              {/* OAuth Section */}
              <div className="mt-6">
                <Separator className="my-4" />
                <div className="text-muted-foreground mb-4 text-center text-sm">
                  or continue with
                </div>
                <ActionButton
                  variant="outline"
                  className="h-11 w-full"
                  onClick={handleGoogleAuth}
                  icon={<FcGoogle className="h-4 w-4" />}
                >
                  Continue with Google
                </ActionButton>
              </div>
            </form>
            ) : (
              <div className="mt-8 space-y-6">
                {successMessage ? (
                  <>
                    <div className="text-green-600 dark:text-green-400 text-center">
                      {successMessage}
                    </div>
                    <ActionButton
                      onClick={() => {
                        setView("login");
                        setError("");
                        setSuccessMessage("");
                      }}
                      className="h-11 w-full text-base font-medium"
                    >
                      Back to Login
                    </ActionButton>
                  </>
                ) : (
                  <>
                    <p className="text-muted-foreground text-sm">
                      Enter your email address and we&apos;ll send you a link to reset your password.
                    </p>

                    <AuthInput
                      id="forgot-email"
                      label="Email"
                      placeholder="Enter your email"
                      value={forgotEmail}
                      onChange={setForgotEmail}
                      autoComplete="email"
                    />

                    {error && (
                      <div className="text-destructive text-sm">{error}</div>
                    )}

                    <ActionButton
                      onClick={handleForgotPassword}
                      className="h-11 w-full text-base font-medium"
                      disabled={isLoading}
                    >
                      {isLoading ? "Sending..." : "Send Reset Link"}
                    </ActionButton>

                    <div className="text-muted-foreground text-center text-sm">
                      Remember your password?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setView("login");
                          setError("");
                          setSuccessMessage("");
                        }}
                        className="text-primary font-medium transition-colors hover:underline"
                      >
                        Back to Login
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
