'use client';

import { useEffect, useState } from 'react';
import { useTestimonials } from '../logic/useTestimonials';
import type { Testimonial } from '../data/queries';
import { fetchTestimonials } from '../data/queries';

export function TestimonialsSection() {
  const { scrollRef, scrollLeft, scrollRight } = useTestimonials();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTestimonials().then((data) => {
      setTestimonials(data);
      setLoading(false);
    });
  }, []);

  if (loading || testimonials.length === 0) {
    return null;
  }

  return (
    <section className="testimonials-section" id="testimoni">
      <div className="container text-center">
        <span className="section-badge">{'\uD83D\uDCAC'} Testimoni</span>
        <h2 className="section-title">
          Dipercaya <span className="gradient-text">Ratusan</span> Pelaku Usaha
        </h2>
        <p className="section-subtitle">
          Dengarkan cerita sukses mereka yang sudah menggunakan KASIRSOLO untuk
          bisnis mereka.
        </p>
      </div>

      <div className="testimonials-scroll-wrapper">
        <div className="testimonials-scroll" ref={scrollRef}>
          {testimonials.map((t, i) => (
            <div key={t.id || i} className="testimonial-card">
              <div className="testimonial-stars">
                {Array.from({ length: t.stars }).map((_, si) => (
                  <span key={si}>{'\u2B50'}</span>
                ))}
              </div>
              <p className="testimonial-text">&ldquo;{t.text}&rdquo;</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">{t.initials}</div>
                <div>
                  <div className="testimonial-name">{t.name}</div>
                  {t.role && <div className="testimonial-role">{t.role}</div>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="testimonial-nav">
        <button
          className="testimonial-nav-btn"
          onClick={scrollLeft}
          aria-label="Scroll kiri"
        >
          &#8592;
        </button>
        <button
          className="testimonial-nav-btn"
          onClick={scrollRight}
          aria-label="Scroll kanan"
        >
          &#8594;
        </button>
      </div>
    </section>
  );
}
