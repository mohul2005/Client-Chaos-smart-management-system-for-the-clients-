import Navbar from '@/components/feature/Navbar';
import Footer from '@/components/feature/Footer';
import Contact from '@/pages/home/components/Contact';
import TrustedBy from '@/pages/home/components/TrustedBy';
import ScrollTop from '@/pages/home/components/ScrollTop';

const ContactPage = () => {
  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <Navbar />
      <div className="pt-16">
        <Contact />
        <TrustedBy />
      </div>
      <Footer />
      <ScrollTop />
    </div>
  );
};

export default ContactPage;