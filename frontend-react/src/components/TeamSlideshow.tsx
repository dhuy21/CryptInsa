import { useEffect, useState } from "react";
import type { TouchEvent } from "react";
import type { TeamMember } from "../aboutContent";

const AUTOPLAY_MS = 5000;

type TeamSlideshowProps = {
  members: TeamMember[];
};

export default function TeamSlideshow({ members }: TeamSlideshowProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = members.length;

  function go(next: number) {
    setIndex((next + count) % count);
  }

  useEffect(() => {
    if (paused) {
      return undefined;
    }
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % count);
    }, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [paused, count]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") {
        setIndex((current) => (current - 1 + count) % count);
      } else if (event.key === "ArrowRight") {
        setIndex((current) => (current + 1) % count);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [count]);

  function onTouchStart(event: TouchEvent<HTMLDivElement>) {
    event.currentTarget.dataset.startX = String(event.touches[0].clientX);
  }

  function onTouchEnd(event: TouchEvent<HTMLDivElement>) {
    const startX = Number(event.currentTarget.dataset.startX || 0);
    const diff = startX - event.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      go(index + (diff > 0 ? 1 : -1));
    }
  }

  return (
    <div
      className="slideshow-container"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="slides-wrapper">
        {members.map((member, memberIndex) => (
          <div
            className={memberIndex === index ? "team-slide active" : "team-slide"}
            key={member.name}
          >
            <div className="slide-content">
              <div className="member-avatar">
                <div className="avatar-placeholder">
                  <i className="fas fa-user" />
                </div>
              </div>
              <div className="member-info">
                <h3 className="member-name">{member.name}</h3>
                <p className="member-role">{member.role}</p>
                <p className="member-description">{member.description}</p>
                <div className="member-skills">
                  {member.skills.map((skill) => (
                    <span className="skill" key={skill}>{skill}</span>
                  ))}
                </div>
                <div className="member-social">
                  <a href="#slideshow" className="social-link" aria-label="GitHub">
                    <i className="fab fa-github" />
                  </a>
                  <a href="#slideshow" className="social-link" aria-label="LinkedIn">
                    <i className="fab fa-linkedin" />
                  </a>
                  <a href="#slideshow" className="social-link" aria-label="Email">
                    <i className="fas fa-envelope" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="slideshow-nav">
        <button className="nav-btn prev-btn" type="button" onClick={() => go(index - 1)} aria-label="Précédent">
          <i className="fas fa-chevron-left" />
        </button>
        <button className="nav-btn next-btn" type="button" onClick={() => go(index + 1)} aria-label="Suivant">
          <i className="fas fa-chevron-right" />
        </button>
      </div>
      <div className="slideshow-dots">
        {members.map((member, memberIndex) => (
          <button
            className={memberIndex === index ? "dot active" : "dot"}
            key={member.name}
            type="button"
            aria-label={member.name}
            onClick={() => setIndex(memberIndex)}
          />
        ))}
      </div>
    </div>
  );
}
