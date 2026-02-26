import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import './HeroBanner.css';

function HeroBanner({ images = [] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const safeImages = useMemo(() => images.filter(Boolean), [images]);
  const hasImages = safeImages.length > 0;

  useEffect(() => {
    if (safeImages.length < 2) return undefined;

    const intervalId = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % safeImages.length);
    }, 3500);

    return () => clearInterval(intervalId);
  }, [safeImages]);

  // Ensure activeIndex is always valid during render without a secondary effect
  const validActiveIndex = activeIndex >= safeImages.length ? 0 : activeIndex;

  return (
    <section className='hero'>
      {hasImages && (
        <div className='hero__slides'>
          {safeImages.map((image, index) => (
            <div
              key={`${image}-${index}`}
              style={{ backgroundImage: `url(${image})` }}
              className={`hero__slide ${index === validActiveIndex ? 'hero__slide--active' : ''}`}
            >
              <img src={image} alt='Sunrise Apparels collection' className='hero__slide-image' />
            </div>
          ))}
        </div>
      )}
      <div className='hero__content'>
        <p className='hero__eyebrow'>Sunrise Apparels</p>
        <h1>
          AP<span className='hero__brand-e'>E</span>X
        </h1>
        <Link className='btn hero__explore-btn' to='/catalog'>
          Explore Collection
        </Link>
        {hasImages && (
          <div className='hero__dots'>
            {safeImages.map((_, index) => (
              <button
                key={index}
                type='button'
                className={`hero__dot ${index === validActiveIndex ? 'hero__dot--active' : ''}`}
                onClick={() => setActiveIndex(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default HeroBanner;
