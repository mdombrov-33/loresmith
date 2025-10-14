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
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleLogin = () => {
    // TODO: Implement login logic
    console.log("Login:", formData);
  };

  const handleGoogleAuth = () => {
    // TODO: Implement Google OAuth
    console.log("Google OAuth");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] p-0 border-0 shadow-2xl">
        <div className="relative overflow-hidden rounded-lg">

          <div className="p-8">
            <DialogHeader className="pb-2 text-center">
              <DialogTitle className="text-center text-2xl font-semibold">
                Welcome to LoreSmith
              </DialogTitle>
            </DialogHeader>

            <div className="mt-8 space-y-6">
              <div className="space-y-2">
                <Label
                  htmlFor="username"
                  className="text-foreground text-sm font-medium"
                >
                  Username
                </Label>
                <Input
                  id="username"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      username: e.target.value,
                    }))
                  }
                  className="h-11 px-3"
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
                />
              </div>
              <div className="pt-2">
                <Button
                  className="h-11 w-full text-base font-medium"
                  onClick={handleLogin}
                >
                  Sign In
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
                  className="w-full h-11"
                  onClick={handleGoogleAuth}
                >
                  <FcGoogle className="mr-2 h-4 w-4" />
                  Continue with Google
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
