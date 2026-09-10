import { useState, FormEvent } from 'react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const Contact = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const imgRef = useScrollAnimation<HTMLDivElement>();
  const formRef = useScrollAnimation<HTMLDivElement>();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new URLSearchParams();
    const firstName = (form.querySelector('[name="first_name"]') as HTMLInputElement)?.value || '';
    const lastName = (form.querySelector('[name="last_name"]') as HTMLInputElement)?.value || '';
    const email = (form.querySelector('[name="email"]') as HTMLInputElement)?.value || '';
    const phone = (form.querySelector('[name="phone"]') as HTMLInputElement)?.value || '';
    const message = (form.querySelector('[name="message"]') as HTMLTextAreaElement)?.value || '';

    if (!firstName || !lastName || !email) return;

    data.append('first_name', firstName);
    data.append('last_name', lastName);
    data.append('email', email);
    data.append('phone', phone);
    data.append('message', message);

    setLoading(true);
    try {
      await fetch('https://readdy.ai/api/form/d7om869uelgcie28i700', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: data.toString(),
      });
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="w-full bg-[#eaf0f6] py-20 md:py-28 px-8 md:px-12">
      <div className="w-full flex flex-col lg:flex-row gap-16 lg:gap-24">
        {/* Left: image */}
        <div ref={imgRef} className="lg:w-96 flex-shrink-0 slide-left">
          <div className="w-full h-64 md:h-full min-h-64 rounded-lg overflow-hidden">
            <img
              src="https://readdy.ai/api/search-image?query=professional%20woman%20on%20video%20call%20at%20modern%20desk%2C%20laptop%20open%20with%20project%20management%20interface%20visible%2C%20clean%20minimal%20home%20office%2C%20blue%20gray%20tones%2C%20natural%20window%20light%2C%20focused%20productive%20atmosphere%2C%20tech%20professional&width=500&height=600&seq=contact-img-001&orientation=portrait"
              alt="Get in touch with TASKS."
              className="w-full h-full object-cover object-top"
            />
          </div>
        </div>

        {/* Right: form */}
        <div ref={formRef} className="flex-1 slide-right">
          <div className="w-12 h-px bg-gray-900 mb-8"></div>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">Let's Talk</h2>
          <p className="text-gray-500 text-base leading-relaxed mb-10">
            Ready to see TASKS. in action? Drop us a message and our team will set up a personalized demo tailored to your workflow — no commitment required.
          </p>

          {submitted ? (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
              <i className="ri-checkbox-circle-line text-4xl text-green-500 mb-4 block"></i>
              <p className="text-gray-900 font-bold text-lg">Message sent!</p>
              <p className="text-gray-500 text-sm mt-2">We'll get back to you soon.</p>
            </div>
          ) : (
            <form
              data-readdy-form
              id="contact-form"
              onSubmit={handleSubmit}
              className="flex flex-col gap-5"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="first_name"
                    required
                    className="border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-gray-900 transition-colors"
                    placeholder="First name"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="last_name"
                    required
                    className="border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-gray-900 transition-colors"
                    placeholder="Last name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    className="border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-gray-900 transition-colors"
                    placeholder="your@email.com"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Phone
                  </label>
                  <input
                    name="phone"
                    type="tel"
                    className="border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-gray-900 transition-colors"
                    placeholder="+1 234 567 890"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Message
                </label>
                <textarea
                  name="message"
                  rows={5}
                  maxLength={500}
                  className="border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-gray-900 transition-colors resize-none"
                  placeholder="Your message..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="self-start bg-gray-900 text-white px-10 py-4 text-sm font-bold hover:bg-[#f97316] transition-colors cursor-pointer whitespace-nowrap disabled:opacity-60"
              >
                {loading ? 'Sending...' : 'Submit'}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default Contact;
