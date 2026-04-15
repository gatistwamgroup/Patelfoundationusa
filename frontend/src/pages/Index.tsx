import { lazy, Suspense } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import About from '@/components/About';
import JourneyRoadmap from '@/components/JourneyRoadmap';
import FounderLetter from '@/components/FounderLetter';
import ImpactStats from '@/components/ImpactStats';
import Programs from '@/components/Programs';
import WallOfHope from '@/components/WallOfHope';
import SEO from '@/components/SEO';

const LatestStories = lazy(() => import('@/components/LatestStories'));
const GrandFinale = lazy(() => import('@/components/GrandFinale'));

const Index = () => {
  return (
    <main className="w-full relative">
      <SEO
        title="Patel Foundation USA | Empowering Global Communities"
        description="A US-based 501(c)(3) non-profit dedicated to transforming lives in India. Help us provide education, nutrition, and healthcare to rural children through sustainable development."
        keywords="USA Charity, 501c3 NGO, Donate to India, Patel Foundation, Rural Education, Child Nutrition India, Give to India from USA"
      />
      <Navbar />
      <Hero />
      <About />
      <JourneyRoadmap />
      <FounderLetter />
      <WallOfHope />
      <ImpactStats />
      <Programs />
      <Suspense fallback={null}>
        <LatestStories />
        <GrandFinale />
      </Suspense>
    </main>
  );
};

export default Index;
