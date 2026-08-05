import { Onest } from "next/font/google";
import FlowstateHero from "@/components/flowstate/FlowstateHero";

const onest = Onest({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-onest",
});

export const metadata = {
  title: "Flowstate — Deep Work in a Distracted World",
  description: "Cut through the noise, reclaim your attention, and do work that truly matters.",
};

export default function FlowstatePage() {
  return (
    <div className={onest.variable}>
      <FlowstateHero />
    </div>
  );
}
