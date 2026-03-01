import InquiryForm from '../components/InquiryForm';
import './ContactPage.css';

function ContactPage() {
  const whatsappLink = 'https://wa.me/919881440099?text=Hi%20Sunrise%20Apparels%2C%20I%20want%20to%20know%20more.';

  return (
    <section className='page container contact-page'>
      <div className='contact-head'>
        <p className='contact-head__eyebrow'>Sunrise Apparels</p>
        <h1 className='section-title'>Contact & Inquiry</h1>
        <p className='contact-head__text'>Share your inquiry and our team will respond quickly.</p>
      </div>

      <section className='contact-block form-card'>
        <h2>Contact</h2>
        <p>Talk to our team directly for product help, availability, and custom requests.</p>
        <a href={whatsappLink} target='_blank' rel='noreferrer' className='contact-whatsapp btn'>
          Chat on WhatsApp
        </a>
        <div className='contact-details'>
          <p><strong>Phone:</strong> +91 98814 40099</p>
          <p><strong>Address:</strong> Shop No. 2, Opp. Kala Mandir Apartment, Sai Vasan Shah Bazar, Ulhasnagar – 421005</p>
          <p><strong>Hours:</strong> Mon-Sat, 10:00 AM - 8:00 PM</p>
        </div>
      </section>

      <section className='inquiry-block'>
        <h2>Inquiry Form</h2>
        <p>Prefer writing to us? Submit your inquiry below.</p>
        <InquiryForm />
      </section>
    </section>
  );
}

export default ContactPage;
