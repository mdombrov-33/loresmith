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
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleRegister = () => {
    // TODO: Implement register logic
    console.log("Register:", formData);
  };

  const handleGoogleAuth = () => {
    // TODO: Implement Google OAuth
    console.log("Google OAuth");
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

            <div className="mt-8 space-y-6">
              <div className="space-y-2">
                <Label
                  htmlFor="reg-username"
                  className="text-foreground text-sm font-medium"
                >
                  Username
                </Label>
                <Input
                  id="reg-username"
                  placeholder="Choose a username"
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
                  htmlFor="reg-email"
                  className="text-foreground text-sm font-medium"
                >
                  Email
                </Label>
                <Input
                  id="reg-email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  className="h-11 px-3"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="reg-password"
                  className="text-foreground text-sm font-medium"
                >
                  Password
                </Label>
                <Input
                  id="reg-password"
                  type="password"
                  placeholder="Create a password"
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
                  onClick={handleRegister}
                >
                  Create Account
                </Button>
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
                <Button
                  variant="outline"
                  className="h-11 w-full"
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
