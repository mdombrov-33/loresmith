"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ActionButton from "@/components/shared/ActionButton";
import { Separator } from "@/components/ui/separator";
import { FcGoogle } from "react-icons/fc";
import { useAppStore } from "@/stores/appStore";
import { registerUser, loginUser } from "@/lib/api/auth";
import { AuthInput } from "./AuthInput";
import { AuthPasswordInput } from "./AuthPasswordInput";

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export function RegisterModal({
  isOpen,
  onClose,
  onSwitchToLogin,
}: RegisterModalProps) {
  const { login } = useAppStore();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    if (
      !formData.username ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("Please fill in all fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await registerUser({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      const loginResponse = await loginUser({
        username: formData.username,
        password: formData.password,
      });

      login(loginResponse.user);

      onClose();
      setFormData({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleRegister();
  };

  const handleGoogleAuth = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="border-0 p-0 shadow-2xl sm:max-w-[400px]">
        <div className="relative overflow-hidden rounded-lg">
          <div className="p-8">
            <DialogHeader className="pb-2 text-center">
              <DialogTitle className="text-center text-2xl font-semibold">
                Welcome to LoreSmith
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <AuthInput
                id="reg-username"
                label="Username"
                placeholder="Choose a username"
                value={formData.username}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, username: value }))
                }
                autoComplete="username"
              />
              <AuthInput
                id="reg-email"
                label="Email"
                placeholder="Enter your email"
                type="email"
                value={formData.email}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, email: value }))
                }
                autoComplete="email"
              />
              <AuthPasswordInput
                id="reg-password"
                label="Password"
                placeholder="Create a password"
                value={formData.password}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, password: value }))
                }
                autoComplete="new-password"
              />
              <AuthPasswordInput
                id="reg-confirm-password"
                label="Confirm Password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, confirmPassword: value }))
                }
                error={
                  formData.confirmPassword &&
                  formData.password !== formData.confirmPassword
                    ? "Passwords do not match"
                    : undefined
                }
                autoComplete="new-password"
              />
              <div className="pt-2">
                {error && (
                  <div className="text-destructive mb-4 text-sm">{error}</div>
                )}
                <ActionButton
                  type="submit"
                  className="h-11 w-full text-base font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </ActionButton>
              </div>
              <div className="text-muted-foreground text-center text-sm">
                Already have an account?{" "}
                <button
                  onClick={onSwitchToLogin}
                  className="text-primary font-medium transition-colors hover:underline"
                >
                  Sign In
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
