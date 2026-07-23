'use client';

import { useState, useCallback } from 'react';
import { faqData } from '../data/faq-data';

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = useCallback((index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  }, []);

  return (
    <section className="faq-section" id="faq">
      <div className="container text-center">
        <span className="section-badge">{'\u2753'} FAQ</span>
        <h2 className="section-title">
          Pertanyaan yang <span className="gradient-text">Sering Ditanyakan</span>
        </h2>
        <p className="section-subtitle">
          Temukan jawaban untuk pertanyaan umum tentang KASIRSOLO.
        </p>
      </div>

      <div className="faq-list">
        {faqData.map((faq, i) => (
          <div key={i} className={`faq-item ${openIndex === i ? 'open' : ''}`}>
            <button className="faq-question" onClick={() => toggle(i)}>
              <span>{faq.question}</span>
              <span className="faq-toggle">+</span>
            </button>
            <div className="faq-answer">
              <div className="faq-answer-inner">{faq.answer}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
