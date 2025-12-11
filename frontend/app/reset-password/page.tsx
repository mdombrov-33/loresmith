"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPassword } from "@/lib/api/auth";
import { AuthPasswordInput } from "@/components/navbar/AuthPasswordInput";
import ActionButton from "@/components/shared/buttons/ActionButton";
import Link from "next/link";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTokenLoading, setIsTokenLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setError("Invalid or missing reset token");
    }
    setIsTokenLoading(false);
  }, [searchParams]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError("Invalid or missing reset token");
      return;
    }

    if (!newPassword) {
      setError("Please enter a new password");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await resetPassword(token, newPassword);
      setSuccessMessage(response.message);
      setNewPassword("");
      setConfirmPassword("");

      // Redirect to home page after 2 seconds
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="rounded-lg border bg-card p-8 shadow-lg">
          {isTokenLoading ? (
            <div className="text-center">Loading...</div>
          ) : !token ? (
            <div className="text-destructive mb-4 text-center text-sm">
              Invalid or missing reset token. Please request a new password reset.
            </div>
          ) : successMessage ? (
            <div className="space-y-4 text-center">
              <div className="text-green-600 dark:text-green-400">
                {successMessage}
              </div>
              <p className="text-muted-foreground text-sm">
                Redirecting to home page...
              </p>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <AuthPasswordInput
                id="new-password"
                label="New Password"
                placeholder="Enter your new password"
                value={newPassword}
                onChange={setNewPassword}
                autoComplete="new-password"
              />

              <AuthPasswordInput
                id="confirm-password"
                label="Confirm Password"
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                autoComplete="new-password"
              />

              {error && (
                <div className="text-destructive text-sm">{error}</div>
              )}

              <ActionButton
                type="submit"
                className="h-11 w-full text-base font-medium"
                disabled={isLoading || !token}
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </ActionButton>
            </form>
          )}

          {!isTokenLoading && (
            <div className="text-muted-foreground mt-6 text-center text-sm">
            <Link
              href="/"
              className="text-primary font-medium transition-colors hover:underline"
            >
              Back to Home
            </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
