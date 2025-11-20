"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import ActionButton from "@/components/shared/ActionButton";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/stores/appStore";
import { useSession } from "next-auth/react";

interface PlanTier {
  name: string;
  price: {
    monthly: number;
    annual: number;
  };
  description: string;
  features: string[];
  highlight?: boolean;
}

const plans: PlanTier[] = [
  {
    name: "Free",
    price: {
      monthly: 0,
      annual: 0,
    },
    description: "Start building your worlds",
    features: [
      "5 character generations per day",
      "2 worlds per month",
      "Public worlds only",
      "Community support",
    ],
  },
  {
    name: "Pro",
    price: {
      monthly: 9,
      annual: 7,
    },
    description: "For dedicated world builders",
    features: [
      "50 character generations per day",
      "10 worlds per month",
      "Private worlds",
      "Priority support",
      "Advanced customization",
    ],
    highlight: true,
  },
  {
    name: "Creator",
    price: {
      monthly: 29,
      annual: 23,
    },
    description: "For professional storytellers",
    features: [
      "Unlimited character generations",
      "Unlimited worlds",
      "Private worlds",
      "Priority support",
      "Custom themes (coming soon)",
      "Early access to new features",
    ],
  },
];

export default function PlansPage() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const router = useRouter();
  const { user, token, setIsLoginModalOpen, setAppStage } = useAppStore();
  const { data: session } = useSession();
  const isAuthenticated = !!session || (!!user && !!token);

  useEffect(() => {
    setAppStage("plans");
  }, [setAppStage]);

  const handleSelectPlan = (planName: string) => {
    setSelectedPlan(planName);

    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
      return;
    }

    // TODO: Navigate to payment page
    // router.push(`/payment?plan=${planName.toLowerCase()}&billing=${isAnnual ? 'annual' : 'monthly'}`);
  };

  return (
    <div className="relative min-h-screen w-full bg-background">
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-foreground mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Choose Your Plan
          </h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
            All tiers include access to the core world-building tools
          </p>
        </div>

        {/* Plans Grid */}
        <div className="mb-12 grid gap-8 md:grid-cols-3">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card
                className={cn(
                  "group relative h-full cursor-pointer overflow-hidden border-2 transition-all duration-300",
                  selectedPlan === plan.name
                    ? "border-primary shadow-2xl shadow-primary/40 -translate-y-2"
                    : plan.highlight
                      ? "border-primary/50 shadow-lg shadow-primary/20 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/30"
                      : "border-border hover:-translate-y-2 hover:border-primary/50 hover:shadow-xl"
                )}
                onClick={() => setSelectedPlan(plan.name)}
              >
                {plan.highlight && (
                  <div className="bg-primary absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-semibold text-white">
                    Popular
                  </div>
                )}

                {/* Glow effect for selected */}
                {selectedPlan === plan.name && (
                  <div className="absolute inset-0 -z-10 bg-primary/20 blur-2xl" />
                )}

                <CardContent className="flex h-full flex-col p-8">
                  <div className="mb-6">
                    <h3 className="text-foreground mb-2 text-2xl font-bold">
                      {plan.name}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {plan.description}
                    </p>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-foreground text-5xl font-bold">
                        ${isAnnual ? plan.price.annual : plan.price.monthly}
                      </span>
                      {plan.price.monthly > 0 && (
                        <span className="text-muted-foreground text-lg">
                          /month
                        </span>
                      )}
                    </div>
                    {plan.price.monthly > 0 && isAnnual && (
                      <p className="text-muted-foreground mt-1 text-xs">
                        Billed annually (${plan.price.annual * 12}/year)
                      </p>
                    )}
                  </div>

                  <div className="mb-8 flex-1 space-y-3">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-3">
                        <Check className="text-primary mt-0.5 h-5 w-5 flex-shrink-0" />
                        <span className="text-foreground text-sm">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  <ActionButton
                    size="default"
                    variant={selectedPlan === plan.name ? "default" : "outline"}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectPlan(plan.name);
                    }}
                    className="w-full"
                  >
                    {plan.name === "Free" ? "Current Plan" : selectedPlan === plan.name ? "Selected" : "Select Plan"}
                  </ActionButton>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Billing Toggle */}
        <div className="mb-8 flex items-center justify-center gap-4">
          <Label
            htmlFor="billing-toggle"
            className={cn(
              "text-sm font-medium transition-colors cursor-pointer",
              !isAnnual ? "text-foreground" : "text-muted-foreground"
            )}
          >
            Monthly
          </Label>
          <Switch
            id="billing-toggle"
            checked={isAnnual}
            onCheckedChange={setIsAnnual}
          />
          <Label
            htmlFor="billing-toggle"
            className={cn(
              "text-sm font-medium transition-colors cursor-pointer",
              isAnnual ? "text-foreground" : "text-muted-foreground"
            )}
          >
            Annual
            <span className="text-primary ml-2 text-xs">(Save 20%)</span>
          </Label>
        </div>

        {/* Confirmation Button */}
        {selectedPlan && selectedPlan !== "Free" && (
          <div className="flex justify-center">
            <ActionButton
              size="lg"
              onClick={() => handleSelectPlan(selectedPlan)}
              className="px-12"
            >
              Continue with {selectedPlan}
            </ActionButton>
          </div>
        )}
      </div>
    </div>
  );
}
