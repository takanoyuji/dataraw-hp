import { Hero } from "@/components/home/hero";
import { LatestArticles } from "@/components/home/latest-articles";
import { Mission } from "@/components/home/mission";
import { Services } from "@/components/home/services";
import { Cases } from "@/components/home/cases";
import { Profile } from "@/components/home/profile";
import { Contact } from "@/components/home/contact";

export default function HomePage() {
  return (
    <>
      <Hero />
      <LatestArticles />
      <Mission />
      <Services />
      <Cases />
      <Profile />
      <Contact />
    </>
  );
}
