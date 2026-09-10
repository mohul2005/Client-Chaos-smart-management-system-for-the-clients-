import Navbar from '@/components/feature/Navbar';
import Footer from '@/components/feature/Footer';
import Hero from './components/Hero';
import TrustedBy from './components/TrustedBy';
import About from './components/About';
import StreamlineFeature from './components/StreamlineFeature';
import Services from './components/Services';
import Testimonials from './components/Testimonials';
import Pricing from './components/Pricing';
import FeaturesGrid from './components/FeaturesGrid';
import Contact from './components/Contact';
import ScrollTop from './components/ScrollTop';

const HomePage = () => {
  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <Navbar />
      <Hero />
      <TrustedBy />
      <About />
      <StreamlineFeature />
      <Services />
      <Testimonials />
      <Pricing />
      <FeaturesGrid />
      <Contact />
      <Footer />
      <ScrollTop />
    </div>
  );
};

export default HomePage;
