import type { Metadata } from "next";
import AnimationShowcase from "@/components/animations/AnimationShowcase";

export const metadata: Metadata = {
  title: "Animation Showcase - Portfolio",
  description: "A focused series of motion studies for product and interface development.",
};

export default function AnimationsPage() {
  return <AnimationShowcase />;
}
