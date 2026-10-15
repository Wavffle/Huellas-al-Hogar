import HeroSection from '../components/home/HeroSection';
import AnimalsCarousel from '../components/home/AnimalsCarousel';
import PurposeSection from '../components/home/PurposeSection';
import HowItWorksSection from '../components/home/HowItWorksSection';
import FaqSection from '../components/home/FaqSection';

export default function HomePage() {
  return (
      <>
        <HeroSection />
        <AnimalsCarousel />
        <PurposeSection />
        <HowItWorksSection />
        <FaqSection />
      </>
  );
}