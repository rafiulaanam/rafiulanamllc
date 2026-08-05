"use client";

import { useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import fluidSimulation from "./fluidSimulation";
import styles from "./FlowstateHero.module.css";

const HEADING = "Deep Work in a Distracted World";
const SUBLINE = "Cut through the noise, reclaim your attention, and do work that truly matters.";

const NAV_LINKS = [
  { label: "How it works?", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "Products", href: "#products" },
  { label: "Blog", href: "#blog" },
];

function Words({ text, baseDelay, stagger }) {
  const words = text.split(" ");
  return words.map((word, i) => (
    <span key={i}>
      <span className={styles.word} style={{ transitionDelay: `${baseDelay + i * stagger}ms` }}>
        {word}
      </span>
      {i < words.length - 1 ? " " : ""}
    </span>
  ));
}

export default function FlowstateHero() {
  const canvasRef = useRef(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const destroy = fluidSimulation(canvas);
    return () => destroy?.();
  }, []);

  useEffect(() => {
    const lenis = new Lenis({ smoothWheel: true });
    let rafId;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    const id = requestAnimationFrame(() => setRevealed(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <section className={`${styles.hero} ${revealed ? styles.revealed : ""}`}>
      <canvas ref={canvasRef} aria-hidden="true" className={styles.canvas} />
      <div aria-hidden="true" className={styles.scrim} />

      <header className={styles.nav}>
        <a href="/" className={styles.brand}>
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={styles.brandGlyph}>
            <path
              d="M2.5 9c2.5 0 2.5 4.2 5 4.2S10 9 12 9s2.5 4.2 5 4.2S19.5 9 21.5 9"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <path
              d="M2.5 15c2.5 0 2.5 4.2 5 4.2S10 15 12 15s2.5 4.2 5 4.2S19.5 15 21.5 15"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              opacity="0.5"
            />
          </svg>
          Flowstate
        </a>

        <nav className={styles.navLinks}>
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <a href="#get-started" className={styles.pill}>
          Get Started
        </a>
      </header>

      <div className={styles.center}>
        <p className={styles.badge}>10K+ already in flow</p>

        <h1 className={styles.heading}>
          <Words text={HEADING} baseDelay={480} stagger={85} />
        </h1>

        <p className={styles.subline}>
          <Words text={SUBLINE} baseDelay={1150} stagger={22} />
        </p>

        <div className={styles.formWrap}>
          <form
            className={styles.form}
            onSubmit={(e) => e.preventDefault()}
          >
            <div className={styles.formBar}>
              <input type="email" required placeholder="Enter your email" />
              <button type="submit" className={styles.pill}>
                Join Waitlist
              </button>
            </div>
          </form>
        </div>
      </div>

      <footer className={styles.footer}>© 2026 Flowstate — engineered for deep work.</footer>
    </section>
  );
}
