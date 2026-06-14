"use client";

import { useEffect, useState } from "react";

const projects = [
  {
    id: "1",
    title: "Project I",
    meta: "C / C++",
    description: "Description coming soon.",
  },
  {
    id: "2",
    title: "Project II",
    meta: "Systems",
    description: "Description coming soon.",
  },
  {
    id: "3",
    title: "Project III",
    meta: "Optimization",
    description: "Description coming soon.",
  },
];

export default function Home() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function onScroll() {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(total > 0 ? window.scrollY / total : 0);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <div
        className="progress-bar"
        style={{ width: `${progress * 100}%` }}
      />

      <div className="container">
        <header>
          <h1>AJ Khullar</h1>
          <p className="subtitle">USC &middot; Junior &middot; Computer Science</p>
        </header>

        <section>
          <p>
            Computer science undergraduate at the University of Southern
            California. I write software that runs close to the metal — mostly
            C and C++, mostly concerned with making things fast.
          </p>
          <p>
            I care about correctness first and performance second, because you
            cannot optimize what is wrong. I am drawn to problems where
            efficiency has real consequences: compilers, memory systems,
            algorithms under genuine constraints.
          </p>
        </section>

        <hr />

        <section>
          <h2>Specialization</h2>
          <p>
            Systems programming in C and C++. My focus is performance-critical
            code: cache-aware data structures, SIMD, profile-guided optimization,
            and the discipline of measuring before guessing. I am comfortable
            with manual memory management, undefined behavior, and the space
            between what you write and what the machine actually executes.
          </p>
        </section>

        <section>
          <h2>Education</h2>
          <p>
            University of Southern California, Los Angeles.<br />
            B.S. Computer Science &mdash; Junior, expected graduation 2028.<br />
            Coursework: Data Structures &amp; Algorithms, Computer Systems,
            Operating Systems, Programming Languages, Discrete Mathematics.
          </p>
        </section>

        <hr />

        <section>
          <h2>Projects</h2>
          <div className="project-list">
            {projects.map((project) => (
              <div key={project.id} className="project-entry">
                <h3>{project.title}</h3>
                <p className="project-meta">{project.meta}</p>
                <p>{project.description}</p>
                <div className="demo-placeholder">live demo</div>
              </div>
            ))}
          </div>
        </section>

        <hr />

        <section>
          <h2>Contact</h2>
          <ul className="contact-links">
            <li>
              <a href="mailto:arjunkhullar2006@gmail.com">email</a>
            </li>
            <li>
              <a href="https://github.com/ajkhullar" target="_blank" rel="noopener noreferrer">
                github
              </a>
            </li>
          </ul>
        </section>
      </div>
    </>
  );
}
