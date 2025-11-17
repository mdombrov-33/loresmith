import {
  Users,
  Shield,
  MapPin,
  Calendar,
  Gem,
  Heart,
  Brain,
  BookOpen,
  Lightbulb,
  Crown,
  Eye,
  Zap,
} from "lucide-react";

export const loreIcons: Record<string, React.ElementType> = {
  character: Users,
  faction: Shield,
  setting: MapPin,
  event: Calendar,
  relic: Gem,
};

export const getAttributeIcon = (key: string) => {
  const iconMap: Record<string, { icon: React.ElementType; color: string }> = {
    health: { icon: Heart, color: "text-red-500" },
    stress: { icon: Brain, color: "text-blue-500" },
    knowledge: { icon: BookOpen, color: "text-yellow-500" },
    empathy: { icon: Users, color: "text-pink-500" },
    resilience: { icon: Shield, color: "text-green-500" },
    creativity: { icon: Lightbulb, color: "text-orange-500" },
    influence: { icon: Crown, color: "text-purple-500" },
    perception: { icon: Eye, color: "text-indigo-500" },
  };

  const normalizedKey = key.toLowerCase().replace(/_/g, " ");
  return iconMap[normalizedKey] || { icon: Zap, color: "text-primary" };
};
