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
import { signIn } from "next-auth/react";
import { useAppStore } from "@/stores/appStore";
import { loginUser } from "@/lib/api/auth";
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
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

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

      login(response.token, response.user);

      //TODO: nuke this approach later and set httpOnly cookie from backend
      document.cookie = "auth=true; path=/; max-age=2592000"; //* 30 days

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

  const handleGoogleAuth = async () => {
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch (error) {
      console.error(error);
      setError("Google sign-in failed");
    }
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
