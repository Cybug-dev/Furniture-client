import { motion } from 'framer-motion';
import {
  ArrowRight,
  Code2,
  Database,
  Goal,
  Layers3,
  MonitorSmartphone,
  Smartphone,
  Sprout,
  UsersRound,
  Wrench,
} from 'lucide-react';
import { Link } from 'react-router';
import Header from '../Header/Header.jsx';
import Footer from '../Footer/Footer.jsx';
import './AboutPage.scss';

const reveal = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0 },
};

const technologies = [
  { name: 'React', logo: 'https://cdn.simpleicons.org/react/61DAFB' },
  { name: 'SCSS', logo: 'https://cdn.simpleicons.org/sass/CC6699' },
  { name: 'Node.js', logo: 'https://cdn.simpleicons.org/nodedotjs/5FA04E' },
  { name: 'Express', logo: 'https://cdn.simpleicons.org/express/111111' },
  { name: 'Prisma', logo: 'https://cdn.simpleicons.org/prisma/2D3748' },
  { name: 'PostgreSQL', logo: 'https://cdn.simpleicons.org/postgresql/4169E1' },
  { name: 'Cloudinary', logo: 'https://cdn.simpleicons.org/cloudinary/3448C5' },
];

const services = [
  {
    title: 'Responsive Websites',
    description: 'Clean, modern, mobile-friendly websites.',
    icon: Smartphone,
  },
  {
    title: 'Data-Driven Websites',
    description: 'Dynamic content powered by real backend data.',
    icon: Database,
  },
  {
    title: 'Web Applications',
    description: 'Interactive applications with practical features.',
    icon: Layers3,
  },
  {
    title: 'Full-Stack Applications',
    description: 'Frontend, backend, and database solutions.',
    icon: Code2,
  },
];

function IconBadge({ icon: Icon }) {
  return (
    <span className="about-icon" aria-hidden="true">
      <Icon size={26} strokeWidth={1.9} />
    </span>
  );
}

export default function AboutPage() {
  return (
    <div className="about-page">
      <Header />

      <main className="about-main">
        <section className="about-hero" aria-labelledby="about-title">
          <div className="about-hero__content">
            <h1 id="about-title">About Furniture</h1>
            <p className="about-hero__intro">
              A modern furniture store built with passion, creativity, and a focus on
              responsive, data-driven web experiences.
            </p>
            <span className="about-hero__accent" aria-hidden="true" />
            <p className="about-hero__copy">
              We created this project to combine modern design, seamless shopping, and
              real-world development skills while building something practical as a team.
            </p>
          </div>
        </section>

        <div className="about-container">
          <section className="about-story-grid" aria-label="Our team and purpose">
            <motion.article
              className="about-card about-card--tinted"
              variants={reveal}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4 }}
            >
              <IconBadge icon={UsersRound} />
              <div>
                <h2>Who built this project?</h2>
                <p>
                  The Furniture Project was designed by Cybug and built by the Next Gen Devs
                  team, consisting of Jackwrld, Ogor and Emmanuel.
                </p>
              </div>
            </motion.article>

            <motion.article
              className="about-card"
              variants={reveal}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: 0.08 }}
            >
              <IconBadge icon={Goal} />
              <div>
                <h2>Why we built it</h2>
                <p>
                  We built this project to improve as a team, cooperate together, practice
                  the languages and tools we are learning, and gain mastery by building real
                  projects.
                </p>
              </div>
            </motion.article>
          </section>

          <motion.section
            className="about-panel"
            aria-labelledby="tools-title"
            variants={reveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.18 }}
            transition={{ duration: 0.4 }}
          >
            <div className="about-section-heading">
              <IconBadge icon={Wrench} />
              <div>
                <h2 id="tools-title">Built with modern tools</h2>
                <p>We used a modern full-stack setup to bring the project to life.</p>
              </div>
            </div>

            <ul className="about-tech-list" aria-label="Technology stack">
              {technologies.map(({ name, logo }) => (
                <li className="about-tech" key={name}>
                  <img src={logo} alt="" width="25" height="25" loading="lazy" />
                  <span>{name}</span>
                </li>
              ))}
            </ul>
          </motion.section>

          <motion.section
            className="about-panel about-services"
            aria-labelledby="services-title"
            variants={reveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.4 }}
          >
            <div className="about-section-heading">
              <IconBadge icon={MonitorSmartphone} />
              <div>
                <h2 id="services-title">What we build</h2>
                <p>
                  We build modern digital solutions with a focus on clean design,
                  responsiveness, and practical functionality.
                </p>
              </div>
            </div>

            <div className="about-service-grid">
              {services.map(({ title, description, icon: Icon }) => (
                <article className="about-service" key={title}>
                  <IconBadge icon={Icon} />
                  <div>
                    <h3>{title}</h3>
                    <p>{description}</p>
                  </div>
                </article>
              ))}
            </div>
          </motion.section>

          <section className="about-cta" aria-labelledby="about-cta-title">
            <IconBadge icon={Sprout} />
            <div className="about-cta__copy">
              <h2 id="about-cta-title">Let&apos;s build something great together</h2>
              <p>Have a project in mind or want to collaborate? We&apos;d love to hear from you.</p>
            </div>
            <Link className="about-cta__button" to="/contact">
              Contact us <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
