import './AboutPage.css';

function AboutPage() {
  return (
    <section className='page container about-page'>
      <div className='about-hero'>
        <p className='about-hero__eyebrow'>Sunrise Apparels</p>
        <h1 className='section-title'>About Sunrise Apparels</h1>
        <p className='about-hero__text'>
          Our story blends modern tailoring with timeless design cues and thoughtful craftsmanship.
        </p>
      </div>

      <div className='about-grid'>
        <article className='form-card about-card'>
          <h3>Mission & Vision</h3>
          <p>Build an enduring apparel house that values craftsmanship, function, and responsible sourcing.</p>
        </article>
        <article className='form-card about-card'>
          <h3>Founder Message</h3>
          <p>We design pieces that make everyday dressing calm, confident, and intentional.</p>
        </article>
        <article className='form-card about-card'>
          <h3>Sustainability</h3>
          <p>Low-impact fabrics, mindful batches, and long-life design standards.</p>
        </article>
      </div>
    </section>
  );
}

export default AboutPage;
