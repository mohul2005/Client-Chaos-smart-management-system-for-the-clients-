import Navbar from '@/components/feature/Navbar';
import Footer from '@/components/feature/Footer';
import FeatureStreamline from './components/FeatureStreamline';
import FeatureHowItWorks from './components/FeatureHowItWorks';
import FeatureWorkload from './components/FeatureWorkload';
import FeatureStats from './components/FeatureStats';
import ScrollTop from '@/pages/home/components/ScrollTop';

const FeaturesPage = () => {
  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <Navbar />
      <div className="pt-16">
        <FeatureStreamline />
        <FeatureHowItWorks />
        <FeatureWorkload />
        <FeatureStats />
      </div>
      <Footer />
      <ScrollTop />
    </div>
  );
};

export default FeaturesPage;