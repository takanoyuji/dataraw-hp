import { Hero } from "@/components/home/hero";
import { LatestArticles } from "@/components/home/latest-articles";
import { Mission } from "@/components/home/mission";
import { Services } from "@/components/home/services";
import { Cases } from "@/components/home/cases";
import { Profile } from "@/components/home/profile";
import { Contact } from "@/components/home/contact";
import { Products } from "@/components/home/products";

export default function HomePage() {
  return (
    <>
      <Hero />
      <LatestArticles />
      <Mission />
      <Services />
      <Cases />
      <Products />
      <Profile />
      <Contact />
    </>
  );
}
