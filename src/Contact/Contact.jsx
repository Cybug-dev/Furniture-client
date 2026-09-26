import { useState } from "react";
import {
  ArrowRight,
  Check,
  Clock3,
  ExternalLink,
  Headphones,
  Mail,
  MapPin,
  MessageCircle,
  Package,
  Send,
  ShoppingBag,
  User,
  Zap,
} from "lucide-react";
import { Link } from "react-router";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import "./Contact.scss";

const supportCards = [
  {
    icon: Mail,
    title: "Email Support",
    description: "For general questions, orders, or support.",
    value: "support@furniture.com",
    type: "email",
    href: "mailto:support@furniture.com",
  },
  {
    icon: MessageCircle,
    title: "Chat on WhatsApp",
    description: "Get faster help on WhatsApp.",
    value: "+2349137538050",
    type: "whatsapp",
    href: "https://wa.me/23491375038050",
  },
];

const helpCards = [
  {
    icon: ShoppingBag,
    title: "Order Support",
    description: "Get help with your orders, shipping, tracking or returns.",
  },
  {
    icon: Package,
    title: "Product Inquiries",
    description: "Have questions about our products, materials or customization? We're here to help.",
  },
  {
    icon: MessageCircle,
    title: "Website Feedback",
    description: "Found a bug or have a suggestion? We'd love to hear your feedback to make your experience better.",
  },
];

const subjects = [
  "Order Support",
  "Product Inquiry",
  "Shipping & Delivery",
  "Returns & Refunds",
  "Website Feedback",
  "Other",
];

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    whatsapp: "",
    subject: "",
    message: "",
    consent: false,
  });

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    console.log("Contact form submitted:", formData);
  };

  return (
    <>
      <Header />

      <main className="contact-page">
        <section className="contact-hero">
          <div className="contact-hero__background" />

          <div className="contact-container contact-hero__content">
            <p className="contact-hero__eyebrow">WE'D LOVE TO HEAR FROM YOU</p>

            <h1>Contact us</h1>

            <p className="contact-hero__description">
              Have a question, feedback, or need support? Our team is here to
              help you with product inquiries, orders, website support, or
              collaboration opportunities.
            </p>
          </div>
        </section>

        <section className="contact-container contact-main">
          <div className="contact-layout">
            <div className="contact-form-card">
              <div className="contact-section-heading">
                <h2>Send us a message</h2>
                <p>
                  Fill out the form below and we'll get back to you as soon as
                  possible.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="contact-form">
                <div className="contact-form__row">
                  <div className="contact-field">
                    <label htmlFor="name">
                      Full name <span>*</span>
                    </label>

                    <div className="contact-input">
                      <User size={18} />
                      <input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="contact-field">
                    <label htmlFor="email">
                      Email address <span>*</span>
                    </label>

                    <div className="contact-input">
                      <Mail size={18} />
                      <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="contact-form__row">
                  <div className="contact-field">
                    <label htmlFor="whatsapp">
                      WhatsApp number <span>*</span>
                    </label>

                    <div className="contact-input">
                      <MessageCircle size={18} />
                      <input
                        id="whatsapp"
                        name="whatsapp"
                        type="tel"
                        placeholder="+234 91439 21358"
                        value={formData.whatsapp}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <small>
                      We may contact you on WhatsApp for a faster response.
                    </small>
                  </div>

                  <div className="contact-field">
                    <label htmlFor="subject">
                      Subject <span>*</span>
                    </label>

                    <div className="contact-input">
                      <Package size={18} />

                      <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select a subject</option>

                        {subjects.map((subject) => (
                          <option key={subject} value={subject}>
                            {subject}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="contact-field">
                  <label htmlFor="message">
                    Message <span>*</span>
                  </label>

                  <div className="contact-textarea">
                    <MessageCircle size={18} />

                    <textarea
                      id="message"
                      name="message"
                      maxLength={500}
                      placeholder="Tell us how we can help you..."
                      value={formData.message}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="contact-character-count">
                    {formData.message.length}/500
                  </div>
                </div>

                <label className="contact-consent">
                  <input
                    type="checkbox"
                    name="consent"
                    checked={formData.consent}
                    onChange={handleChange}
                    required
                  />

                  <span className="contact-consent__box">
                    <Check size={13} />
                  </span>

                  <span>
                    I agree to be contacted back regarding my query.{" "}
                    <strong>*</strong>
                  </span>
                </label>

                <button type="submit" className="contact-submit">
                  <Send size={18} />
                  <span>Send message</span>
                </button>
              </form>
            </div>

            <aside className="contact-sidebar">
              {supportCards.map((card) => {
                const Icon = card.icon;

                return (
                  <Link
                    key={card.title}
                    to={card.href}
                    className="support-card"
                    target={card.type === "whatsapp" ? "_blank" : undefined}
                    rel={
                      card.type === "whatsapp"
                        ? "noopener noreferrer"
                        : undefined
                    }
                  >
                    <div className="support-card__icon">
                      <Icon size={25} />
                    </div>

                    <div className="support-card__content">
                      <h3>{card.title}</h3>
                      <p>{card.description}</p>
                      <strong>{card.value}</strong>
                    </div>

                    <span className="support-card__arrow">
                      <ArrowRight size={19} />
                    </span>
                  </Link>
                );
              })}

              <div className="support-card support-card--static">
                <div className="support-card__icon">
                  <Headphones size={25} />
                </div>

                <div className="support-card__content">
                  <h3>Support Hours</h3>

                  <div className="support-hours">
                    <div>
                      <Clock3 size={16} />
                      <span>Monday - Saturday: 9:00 AM - 8:00 PM</span>
                    </div>

                    <div>
                      <Clock3 size={16} />
                      <span>Sunday: 10:00 AM - 5:00 PM</span>
                    </div>

                    <div>
                      <Zap size={16} />
                      <span>We usually respond within 24 hours.</span>
                    </div>
                  </div>
                </div>
              </div>

              <Link to="#faq" className="support-card">
                <div className="support-card__icon support-card__icon--question">
                  <MessageCircle size={25} />
                </div>

                <div className="support-card__content">
                  <h3>Quick Help</h3>
                  <p>
                    Looking for quick answers? Check our FAQ section for common
                    questions about orders, shipping, returns and more.
                  </p>
                </div>

                <span className="support-card__arrow">
                  <ArrowRight size={19} />
                </span>
              </Link>
            </aside>
          </div>
        </section>

        <section className="contact-help" id="faq">
          <div className="contact-container">
            <div className="contact-help__heading">
              <p>WHY CONTACT US?</p>
              <h2>We can help with</h2>
            </div>

            <div className="help-grid">
              {helpCards.map((card) => {
                const Icon = card.icon;

                return (
                  <article className="help-card" key={card.title}>
                    <div className="help-card__icon">
                      <Icon size={25} />
                    </div>

                    <div>
                      <h3>{card.title}</h3>
                      <p>{card.description}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="contact-container contact-location">
          <div className="location-card">
            <div className="location-info">
              <div className="location-info__icon">
                <MapPin size={27} />
              </div>

              <div>
                <p>OUR LOCATION</p>
                <h2>Our Office</h2>
                <address>
                  123 Design Street, Koramangala
                  <br />
                  Bengaluru, Karnataka 560034, India
                </address>
              </div>
            </div>

            <div className="location-map">
              <div className="location-map__grid" />

              <div className="location-map__pin">
                <MapPin size={27} />
              </div>

              <Link
                to="https://maps.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="location-map__button"
              >
                <MapPin size={16} />
                <span>View on Google Maps</span>
                <ExternalLink size={15} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}