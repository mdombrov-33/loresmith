"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { FcGoogle } from "react-icons/fc";
import { signIn } from "next-auth/react";
import { useAppStore } from "@/stores/appStore";
import { loginUser } from "@/lib/api";

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
      console.error("Google sign-in failed:", error);
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
              <div className="space-y-2">
                <Label
                  htmlFor="username"
                  className="text-foreground text-sm font-medium"
                >
                  Username
                </Label>
                <Input
                  id="username"
                  name="username"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      username: e.target.value,
                    }))
                  }
                  className="h-11 px-3"
                  autoComplete="username"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-foreground text-sm font-medium"
                >
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  className="h-11 px-3"
                  autoComplete="current-password"
                />
              </div>
              <div className="pt-2">
                {error && (
                  <div className="text-destructive mb-4 text-sm">{error}</div>
                )}
                <Button
                  type="submit"
                  className="h-11 w-full text-base font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>
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
                <Button
                  variant="outline"
                  className="h-11 w-full"
                  onClick={handleGoogleAuth}
                >
                  <FcGoogle className="mr-2 h-4 w-4" />
                  Continue with Google
                </Button>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
