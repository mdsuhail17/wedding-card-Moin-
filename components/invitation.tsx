"use client";

import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

/* ── card content — edit these values to customise the invitation ── */
const CONTENT = {
  bride: "Noora",
  brideFull: "Noora Shaikh",
  groom: "Moin",
  groomFull: "Moin Khan",
  initials: "M·N",
  bismillah: "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
  coverLabel: "Insha Allah Nikah",
  coverDate: "12 & 13 · 12 · 2026",
  openLabel: "Tap to open",
  gettingMarried: "Insha Allah, are getting married",
  saveDate: "12th & 13th December 2026",
  captions: {
    forever: "Two hearts, one beautiful beginning",
    nikah: "Written in the stars, sealed with dua",
    couple: "Join us as our forever begins",
  },
  invite: {
    heading: "Dear Guests!",
    opener:
      "In the name of Almighty Allah, the Most Beneficent and the Most Merciful.",
    line1: "We, the family of Mrs. Pyari Begum Khan & Late Mr. Abdul Razak Khan, solicit your gracious presence on the auspicious occasion of the wedding ceremony of our grand son",
    groomParents: "S/o Mr. Abdul Aziz Khan & Mrs. Asiya Bi",
    brideParents: "D/o Mr. Abdul Kalam Azad Shaikh & Mrs. Noor Afshan, Hubli",
    dua: "May Allah guide this marriage to the best of Understanding, Prosperity, Blessing and Success, and guide them to always be on the Straight Path. Ameen.",
  },
  detailsTitle: "Nikah & Reception",
  details: [
    ["Event", "Insha Allah Nikah"],
    ["Date", "12th December 2026"],
    ["Day", "Saturday"],
    ["Time", "12:35 PM · Followed by Lunch"],
    ["Event", "Reception"],
    ["Date", "13th December 2026"],
    ["Day", "Sunday"],
    ["Time", "8:30 PM · Followed by Dinner"],
  ] as const,
  venue: {
    title: "Venues",
    places: [
      {
        event: "Nikah · Cubix Hotel",
        name: "Cubix Hotel, Gokul Road, Rajendra Nagar, Hubballi",
        photo: "/assets/cubix.webp",
        mapLabel: "Open in map",
        mapUrl:
          "https://www.google.com/maps/search/?api=1&query=Cubix+Hotel+Gokul+Road+Hubballi",
      },
      {
        event: "Reception · The Grand Lawns",
        name:
          "The Grand Lawns, Naveen Park Entrance, Kusugal Road, Keshwapur, Hubballi",
        photo: "/assets/grand.avif",
        mapLabel: "Open in map",
        mapUrl:
          "https://www.google.com/maps/search/?api=1&query=The+Grand+Lawns+Kusugal+Road+Keshwapur+Hubballi",
      },
    ],
  },
  countdownTitle: "Until the Nikah",
  countdownNote: "Insha Allah · 12th December 2026",
  withLove:
    "With Best Compliments · Mutwalli-O-Arakin-E-Jamat, Rehmaniya Masjid, Chetana Colony, Hubballi",
  blessings: "Khan Family, Relatives & Friends · Presents in Blessings only",
};

/* Nikah — 12 December 2026, 12:35 PM local time */
const WEDDING_AT = new Date(2026, 11, 12, 12, 35, 0).getTime();
const CAL_YEAR = 2026;
const CAL_MONTH = 11; // December (0-indexed)
const CAL_DAYS = [12, 13]; // Nikah on the 12th, Reception on the 13th

/* deterministic PRNG so server and client render identical decorations */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function Invitation() {
  const [phase, setPhase] = useState<"cover" | "opening" | "open">("cover");
  const [coverMounted, setCoverMounted] = useState(true);
  const [wide, setWide] = useState(false);
  const [left, setLeft] = useState<number | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const coverRef = useRef<HTMLElement>(null);
  const timers = useRef<number[]>([]);

  useEffect(
    () => () => {
      timers.current.forEach((t) => {
        window.clearTimeout(t);
        window.clearInterval(t);
      });
    },
    [],
  );

  /* countdown */
  useEffect(() => {
    const tick = () =>
      setLeft(Math.max(0, Math.floor((WEDDING_AT - Date.now()) / 1000)));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  /* blurred backdrop video on wide screens */
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 900px)");
    const update = () => setWide(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  /* scroll progress bar */
  useEffect(() => {
    const bar = document.getElementById("bar");
    if (!bar) return;
    const onScroll = () => {
      bar.style.width =
        (scrollY / Math.max(1, document.body.scrollHeight - innerHeight)) *
          100 +
        "%";
    };
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, []);

  /* keep the cover scroll-locked on touch devices */
  useEffect(() => {
    const cover = coverRef.current;
    if (!cover) return;
    const stop = (e: Event) => e.preventDefault();
    cover.addEventListener("touchmove", stop, { passive: false });
    return () => cover.removeEventListener("touchmove", stop);
  }, [coverMounted]);

  /* muted flag set imperatively so autoplay reliably starts */
  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = true;
  }, []);

  const open = useCallback(() => {
    if (phase !== "cover") return;
    setPhase("opening");

    const video = videoRef.current;
    if (video) {
      try {
        video.muted = false;
        video.volume = 0.7;
        video.play().catch(() => {});
        const fade = window.setInterval(() => {
          video.volume = Math.max(0, video.volume - 0.03);
          if (video.volume <= 0.03) window.clearInterval(fade);
        }, 90);
        timers.current.push(fade);
      } catch {
        /* sound is a bonus — ignore */
      }
    }

    timers.current.push(
      window.setTimeout(() => setPhase("open"), 1300),
      window.setTimeout(() => {
        setCoverMounted(false);
        document.body.classList.remove("locked");
        window.scrollTo(0, 0);
      }, 2700),
    );
  }, [phase]);

  /* scroll reveals — armed once the cover opens */
  useEffect(() => {
    if (phase !== "open") return;
    document
      .querySelectorAll<HTMLElement>(".bism, .names, .sp1, .home, .cfl")
      .forEach((el) => el.classList.add("in"));

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18 },
    );
    document
      .querySelectorAll<HTMLElement>(".rv:not(.in), .frame:not(.in), .line:not(.in)")
      .forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [phase]);

  /* deterministic decorations */
  const sparks = useMemo(() => {
    const r = mulberry32(7);
    const out: ReactNode[] = [];
    for (let i = 0; i < 18; i++)
      out.push(
        <span
          key={`s${i}`}
          className="sp"
          style={
            {
              left: `${r() * 96}%`,
              top: `${r() * 92}%`,
              fontSize: `${8 + r() * 10}px`,
              animationDelay: `${r() * 4}s`,
              animationDuration: `${3 + r() * 3}s`,
            } as CSSProperties
          }
        >
          {i % 3 ? "✦" : "❀"}
        </span>,
      );
    for (let j = 0; j < 10; j++)
      out.push(
        <span
          key={`p${j}`}
          className="pt"
          style={
            {
              left: `${r() * 100}%`,
              fontSize: `${10 + r() * 10}px`,
              animationDuration: `${9 + r() * 8}s`,
              animationDelay: `${r() * 9}s`,
            } as CSSProperties
          }
        >
          ❀
        </span>,
      );
    return out;
  }, []);

  const burst = useMemo(() => {
    const r = mulberry32(99);
    return Array.from({ length: 38 }, (_, i) => {
      const angle = r() * 6.283;
      const dist = 110 + r() * 230;
      return (
        <span
          key={i}
          className="bt"
          style={
            {
              "--dx": `${Math.cos(angle) * dist}px`,
              "--dy": `${Math.sin(angle) * dist}px`,
              animationDelay: `${r() * 0.25}s`,
              ...(i % 3 ? {} : { width: "9px", height: "9px" }),
            } as CSSProperties
          }
        />
      );
    });
  }, []);

  const ambient = useMemo(() => {
    const r = mulberry32(21);
    return Array.from({ length: 12 }, (_, i) => {
      const style = {
        left: `${r() * 100}%`,
        "--sx": `${(r() - 0.5) * 140}px`,
        fontSize: `${11 + r() * 9}px`,
        animationDuration: `${15 + r() * 13}s`,
        animationDelay: `-${r() * 24}s`,
      } as CSSProperties;
      return i % 3 === 0 ? (
        <i key={i} className="d" style={style} />
      ) : (
        <i key={i} style={style}>
          {i % 2 ? "❀" : "✿"}
        </i>
      );
    });
  }, []);

  const calendar = useMemo(() => {
    const blanks = new Date(CAL_YEAR, CAL_MONTH, 1).getDay();
    const days = new Date(CAL_YEAR, CAL_MONTH + 1, 0).getDate();
    const cells: ReactNode[] = [];
    ["S", "M", "T", "W", "T", "F", "S"].forEach((d, i) =>
      cells.push(<b key={`h${i}`}>{d}</b>),
    );
    for (let i = 0; i < blanks; i++) cells.push(<span key={`b${i}`} />);
    for (let d = 1; d <= days; d++)
      cells.push(
        <span key={`d${d}`} className={CAL_DAYS.includes(d) ? "d" : undefined}>
          {d}
        </span>,
      );
    return cells;
  }, []);

  const countdown =
    left === null
      ? ["--", "--", "--", "--"]
      : [
          String(Math.floor(left / 86400)).padStart(2, "0"),
          String(Math.floor((left % 86400) / 3600)).padStart(2, "0"),
          String(Math.floor((left % 3600) / 60)).padStart(2, "0"),
          String(left % 60).padStart(2, "0"),
        ];
  const units = ["Days", "Hours", "Mins", "Secs"];

  return (
    <>
      <div id="bar" />

      {coverMounted && (
        <section
          ref={coverRef}
          id="cover"
          className={phase === "cover" ? "hero" : "hero opening"}
          aria-label="Invitation cover"
          onClick={open}
        >
          {wide && (
            <video
              className="bgb"
              muted
              loop
              autoPlay
              playsInline
              preload="auto"
              src="/assets/intro.mp4"
            />
          )}
          <video
            ref={videoRef}
            className="bgv"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster="/assets/poster.jpg"
            src="/assets/intro.mp4"
          />
          <div className="shade" />
          <div className="flash" />
          <div id="sparks">{sparks}</div>
          {phase === "opening" && burst}
          <div className="ring">
            <span className="ar">{CONTENT.initials}</span>
          </div>
          <p className="small">{CONTENT.coverLabel}</p>
          <h1 className="script">
            {CONTENT.groom} &amp; {CONTENT.bride}
          </h1>
          <p className="date">{CONTENT.coverDate}</p>
          <button className="open" type="button">
            {CONTENT.openLabel}
          </button>
        </section>
      )}

      <section className="namesec">
        <span className="cfl" aria-hidden="true">
          <i style={{ left: "2px", top: "30px", fontSize: "24px" }}>❀</i>
          <i style={{ left: "86px", top: "2px", fontSize: "14px" }}>✦</i>
          <i style={{ left: "150px", top: "46px", fontSize: "19px" }}>✿</i>
          <i style={{ left: "58px", top: "118px", fontSize: "16px" }}>✦</i>
          <i style={{ left: "8px", top: "98px", fontSize: "13px" }}>❀</i>
        </span>
        <span className="home">
          <img
            src="/assets/home.jpg"
            alt={`${CONTENT.groom} and ${CONTENT.bride}`}
          />
        </span>
        <p className="bism ar rv">{CONTENT.bismillah}</p>
        <h2 className="names script rv wr">
          {CONTENT.groom}
          <em>&amp;</em>
          {CONTENT.bride}
        </h2>
        <p className="small sp1 rv">{CONTENT.gettingMarried}</p>
      </section>

      <div className="duo">
        <section className="fsec">
          <div className="fwrap">
            <div className="frame f1">
              <div className="pane">
                <img
                  src="/assets/forever.jpg"
                  alt={`${CONTENT.groom} and ${CONTENT.bride}`}
                />
              </div>
            </div>
          </div>
          <p className="cap rv">{CONTENT.captions.forever}</p>
        </section>

        <section>
          <div className="card rv">
            <span className="heart">♡</span>
            <h2 className="script wr">{CONTENT.invite.heading}</h2>
            <p className="opener">{CONTENT.invite.opener}</p>
            <p>
              {CONTENT.invite.line1} <b>{CONTENT.groomFull}</b> <i>with</i>{" "}
              <b>{CONTENT.brideFull}</b>.
            </p>
            <p className="parents">
              {CONTENT.groomFull}, B.E. — {CONTENT.invite.groomParents}
            </p>
            <p className="parents">
              {CONTENT.brideFull}, B.E. — {CONTENT.invite.brideParents}
            </p>
            <p className="dua">{CONTENT.invite.dua}</p>
          </div>
        </section>
      </div>

      <div className="duo r">
        <section className="fsec">
          <div className="fwrap">
            <div className="frame f3">
              <div className="pane">
                <img
                  src="/assets/secondPage.jpg"
                  alt={`${CONTENT.groom} and ${CONTENT.bride} at the nikah`}
                />
              </div>
            </div>
          </div>
          <p className="cap rv">{CONTENT.captions.nikah}</p>
        </section>

        <section>
          <p className="std rv">
            Save <i>the</i> Date
          </p>
          <p className="mon rv">December</p>
          <div className="cal rv">{calendar}</div>
          <p className="yr rv">2026</p>
          <p className="dates rv">{CONTENT.saveDate}</p>
        </section>
      </div>

      <section className="det">
        <h2 className="script rv wr">{CONTENT.detailsTitle}</h2>
        {CONTENT.details.map(([label, value], i) => (
          <Fragment key={`${label}-${i}`}>
            {i > 0 && <div className="line" />}
            <div className={`rv ${i % 2 ? "fr" : "fl"}`}>
              <p className="small">{label}</p>
              <p className="v">{value}</p>
            </div>
          </Fragment>
        ))}
      </section>

      <section className="venue">
        <h2 className="script rv wr">{CONTENT.venue.title}</h2>
        {CONTENT.venue.places.map((place) => (
          <div className="vblock" key={place.event}>
            <div className="vimg rv">
              <img src={place.photo} alt={place.name} />
            </div>
            <p className="small rv">{place.event}</p>
            <p className="rv">{place.name}</p>
            <a
              className="btn rv"
              href={place.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {place.mapLabel}
            </a>
          </div>
        ))}
      </section>

      <div className="duo">
        <section className="fsec">
          <div className="fwrap">
            <div className="frame f2">
              <div className="pane">
                <img
                  src="/assets/lastPhoto.jpg"
                  alt={`${CONTENT.groom} and ${CONTENT.bride}`}
                />
              </div>
            </div>
          </div>
          <p className="cap rv">{CONTENT.captions.couple}</p>
        </section>

        <section>
          <div className="cd card rv">
            <h2 className="script wr">{CONTENT.countdownTitle}</h2>
            <p className="small" style={{ fontSize: "10px" }}>
              {CONTENT.countdownNote}
            </p>
            <div className="boxes">
              {countdown.map((value, i) => (
                <div key={units[i]}>
                  <strong key={value}>{value}</strong>
                  <small>{units[i]}</small>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <section className="fam">
        <div className="ring rv">
          <span className="ar">{CONTENT.initials}</span>
        </div>
        <p className="script rv">
          The Families of {CONTENT.groom} &amp; {CONTENT.bride}
        </p>
        <p className="small rv" style={{ marginTop: "8px" }}>
          With Love
        </p>
        <p className="fine rv">{CONTENT.withLove}</p>
        <p className="fine rv">{CONTENT.blessings}</p>
      </section>

      {phase !== "cover" && <div id="amb">{ambient}</div>}
    </>
  );
}
