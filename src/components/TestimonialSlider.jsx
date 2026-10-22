import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { safeExternalUrl } from "../lib/url.js";

export default function TestimonialSlider({ testimonials }) {
  const [active, setActive] = useState(0);
  useEffect(() => setActive((current) => Math.max(0, Math.min(current, testimonials.length - 1))), [testimonials.length]);
  if (testimonials.length === 0) return <div className="empty-state">Approved client reviews will appear here when they are added.</div>;
  const testimonial = testimonials[active];
  const photoUrl = safeExternalUrl(testimonial.photo) ? testimonial.photo : "";
  const change = (delta) => setActive((current) => (current + delta + testimonials.length) % testimonials.length);

  return (
    <div>
      <article className="testimonial-card" aria-live="polite">
        <p className="eyebrow"><span className="eyebrow-dot" /> Client feedback</p>
        <blockquote className="testimonial-quote">{testimonial.quote}</blockquote>
        <div className="testimonial-author">
          <span className="testimonial-avatar">{photoUrl ? <img src={photoUrl} alt="" loading="lazy" /> : "PHOTO"}</span>
          <div><strong>{testimonial.name}</strong><span>{testimonial.role} · {testimonial.company}</span></div>
        </div>
      </article>
      <div className="testimonial-controls">
        <button className="icon-button" type="button" aria-label="Previous testimonial" onClick={() => change(-1)}><ArrowLeft size={15} /></button>
        <button className="icon-button" type="button" aria-label="Next testimonial" onClick={() => change(1)}><ArrowRight size={15} /></button>
      </div>
    </div>
  );
}
