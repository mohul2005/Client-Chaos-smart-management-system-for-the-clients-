import Navbar from '@/components/feature/Navbar';
import Footer from '@/components/feature/Footer';
import Pricing from '@/pages/home/components/Pricing';
import ScrollTop from '@/pages/home/components/ScrollTop';

const PricingPage = () => {
  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <Navbar />
      <div className="pt-16">
        <Pricing />
      </div>
      <Footer />
      <ScrollTop />
    </div>
  );
};

export default PricingPage;