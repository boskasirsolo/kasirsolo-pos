'use client';

import { useState, useCallback, useEffect } from 'react';
import { fetchFaqs, type FaqItem } from '../data/queries';

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFaqs().then((data) => {
      setFaqs(data);
      setLoading(false);
    });
  }, []);

  const toggle = useCallback((index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  }, []);

  if (loading || faqs.length === 0) {
    return null;
  }

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
        {faqs.map((faq, i) => (
          <div key={faq.id} className={`faq-item ${openIndex === i ? 'open' : ''}`}>
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
