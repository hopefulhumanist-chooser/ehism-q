import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Sprout, TreeDeciduous, TreePine, Trees, RotateCcw, Check, Target, Copy, Download, Share2 } from "lucide-react";

const INK = "#232B1E";
const PAPER = "#F2EAD3";
const PAPER_ALT = "#E9DFC1";
const MOSS = "#5C6B47";
const RUST = "#9A4A2F";
const GOLD = "#A9822E";
const LINE = "#C9BE9D";
const FOREST_TEXT = "#4A6644";

function GlobalStyle() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;1,9..144,500&family=Spectral:ital,wght@0,400;0,500;0,600;1,400&family=JetBrains+Mono:wght@400;700&display=swap');
      * { box-sizing: border-box; }
      ::selection { background: ${RUST}; color: ${PAPER}; }
      select option { background: ${PAPER}; color: ${INK}; }
      input::placeholder, textarea::placeholder { color: #A9A184; }
      @media print {
        body * { visibility: hidden; }
        .printable, .printable * { visibility: visible; }
        .printable { position: absolute; left: 0; top: 0; width: 100%; background: white !important; box-shadow: none !important; }
        .no-print { display: none !important; }
      }
    `}</style>
  );
}

const KEY_OPTIONS = [
  "Agree", "Disagree", "True", "False", "Yes", "No",
  "Meaningful", "Irrelevant", "Important", "Absurd", "Mystery", "I don\u2019t know",
];

const SECTIONS = [
  {
    id: "roots",
    label: "Roots",
    icon: Sprout,
    note: "what grounds you, firmly",
    items: [
      { n: 1, type: "select", text: "Everything is interconnected" },
      { n: 2, type: "select", text: "I have a monopoly on the truth" },
      { n: 3, type: "select", text: "Life is not a fairy tale, but it is full of everything that makes one" },
      { n: 4, type: "select", text: "Control the circumstance, or become one" },
      { n: 5, type: "select", text: "Accept the negative, but focus on the positive" },
      { n: 6, type: "select", text: "Metaphorically speaking, \u201cI am the mitochondria\u201d" },
      { n: 7, type: "select", text: "The meaning of life is to create a life\u2019s meaning" },
      { n: 8, type: "select", text: "The world is absurd" },
    ],
  },
  {
    id: "growth",
    label: "Growth",
    icon: TreeDeciduous,
    note: "How you move through it",
    items: [
      { n: 9, type: "select", text: "May the choices you make be the wisest ones possible, in the moments that you meet" },
      { n: 10, type: "select", text: "I am currently engaged in a leisure project" },
      { n: 11, type: "select", text: "Age is a state of mind" },
      { n: 12, type: "select", text: "The real business in life is the spiritual journey" },
      { n: 13, type: "select", text: "It is hard to be healthy in this world" },
      { n: 14, type: "select", text: "Crying, deep abdominal breathing, and reaching out for help are tools to cope with stress" },
      { n: 15, type: "text", text: "If you were to name this current chapter of your life story, what would you call it?" },
      { n: 16, type: "select", text: "Befriending boredom, creating, exploring & experimenting, journaling, reading, solitude, travel, walking in nature, and work are \u201cways\u201d of finding one\u2019s self \u2014 of figuring out \u201cWho am I?\u201d" },
      { n: 17, type: "select", text: "I have read Walden by Thoreau" },
      { n: 18, type: "select", text: "To define is to confine" },
      { n: 19, type: "select", text: "I often think about retirement" },
      { n: 20, type: "text", text: "What is your guiding metaphor in life?" },
    ],
  },
  {
    id: "canopy",
    label: "Canopy",
    icon: TreePine,
    note: "What you reach toward",
    items: [
      { n: 21, type: "select", text: "Freedom, like motivation, is like a unicorn" },
      { n: 22, type: "select", text: "Life is a process of choice" },
      { n: 23, type: "textarea", text: "What is one of the most significant and compelling questions you have ever been asked?" },
    ],
  },
  {
    id: "grove",
    label: "Grove",
    icon: Trees,
    note: "Who you stand among",
    items: [
      { n: 24, type: "select", text: "I talk with my friends about God, Truth, Justice, Love, Beauty, and all the perennial ideas" },
      { n: 25, type: "select", text: "The moment we most truly know someone is when we first meet them \u2014 because in that moment we realise we are a mystery to one another" },
      { n: 26, type: "text", text: "What is your favourite colour?" },
      { n: 27, type: "select", text: "I am happy" },
      { n: 28, type: "select", text: "I am aware of, and can list, my top five strengths" },
      { n: 29, type: "select", text: "Feelings are neither good nor bad, but rather information about how I am doing in the world" },
      { n: 30, type: "select", text: "I am aware of, and can list, my needs, core beliefs, intentions, interests, and values" },
      { n: 31, type: "select", text: "Today, I am committed to laughing, dancing, singing, smiling, playing, or engaging in a random act of kindness" },
      { n: 32, type: "select", text: "I know what I want to do with my life" },
      { n: 33, type: "select", text: "I was allowed to say \u201cI don\u2019t know\u201d without it being treated as a failure" },
    ],
  },
];

const TOTAL_ITEMS = SECTIONS.reduce((acc, s) => acc + s.items.length, 0);
const STORAGE_KEY = "ehism-q-responses-v1";

const SELECT_NUMBERS = SECTIONS.flatMap((s) => s.items.filter((it) => it.type === "select").map((it) => it.n));

const WRITE_FIELDS = [
  { n: 15, label: "this chapter, named" },
  { n: 20, label: "guiding metaphor" },
  { n: 23, label: "a compelling question, once asked" },
  { n: 26, label: "favourite colour" },
];

const STORY_PARAGRAPHS = [
  "Conversations was the kind of place that felt safer at midnight than most places felt in daylight — a caf\u00e9 on a street lined with cherry trees, all of them in bloom that week, petals catching the streetlight and drifting down slow, like something falling on purpose.",
  "Janus came a little after midnight, the way he had three nights running now — not for the coffee, which was good, but for the patio out front, tucked beneath the blossoms, half-lit and mostly empty, close enough to the sidewalk to watch the street through the low branches. The notebook in his bag was still mostly blank. The questions had been circling for weeks, the kind that didn't have tidy answers: what is the meaning of life — and beneath it, the more immediate version of the same question: how am I supposed to live mine — what do I actually do with it. Conversations was a refuge for the spirit, where the questions worth asking found voice.",
  "His table — the one at the far corner, half-shadowed by a low branch heavy with blossoms — was already taken. An older man sat there alone, a mug long gone cold in front of him, watching the street the way people watch something they've already made peace with. He lingered near the door, patient, in no rush to disturb him.",
  "After a while the old man rose. He moved slowly, with the deliberate ease of someone who had nowhere else he needed to be. As he passed, he paused — not long, just long enough — and glanced toward the empty chair he was leaving behind.",
  "\u201cCareful with that seat,\u201d he said, almost amused. \u201cIt has a habit of asking more than it answers.\u201d",
  "Janus wasn't sure if it was a joke. He nodded anyway, and smiled, the way you do at something you don't quite catch but like the sound of.",
  "Then the old man was walking again, past the blossoms, toward the gate at the edge of the patio.",
  "Janus crossed to the table, pulled out the chair, and stopped.",
  "There was a stack of a few pages sitting on the seat. Squared off, deliberate, like it had been placed there rather than left. A yellow Post-it note was stuck to the top page, and on it, in handwriting that looked older than it probably was, two words:",
  "__FOR_YOU__",
  "He looked up, fast, toward the gate — but the patio was empty. Just the blossoms drifting in the low light, and the particular stillness of a place at an hour when it belongs to no one in particular.",
  "He lifted the pages first, then sat, easing into the chair as though it might still hold whatever the old man had left behind in it.",
  "At the top of the first page, in plain type, a title:",
  "__TITLE__",
  "He didn't know what half the words in the title meant, strung together like that — it read like something between a research instrument and a riddle. But underneath the title was a key, a strange loose handful of words — Agree, Absurd, Mystery, I don't know, etc. — and underneath that, the first line:",
  "__FIRST_LINE__",
  "He read it twice. Then he took out his pen.",
  "Outside, a breeze moved through the cherry trees, petals sifting down onto the empty table beside him — falling, still, on purpose.",
];

const CONVERSATION = [
  {
    domain: "Roots",
    note: "what grounds you, firmly",
    prompts: [
      { n: 1, tag: "revisiting no. 2", text: "The survey asked, in a single closed word, whether you have a monopoly on the truth. Write about a belief you once held as certain that has since come apart. What replaced it, if anything has?" },
      { n: 2, tag: "revisiting no. 1", text: "You marked something next to \u201ceverything is interconnected.\u201d Name one specific relationship, place, or memory that makes this true for you \u2014 not as an idea, but as something you have actually felt." },
    ],
  },
  {
    domain: "Growth",
    note: "how you move through it",
    prompts: [
      { n: 3, tag: "revisiting no. 27", text: "The survey asks, in one word: I am happy. One word is not enough room for a whole life. Write the fuller answer \u2014 the one the word was standing in for." },
      { n: 4, tag: "revisiting your pressed specimen \u2014 this chapter, named", text: "You named this chapter of your life story. What does the chapter before this one still need from you before it's finished \u2014 an apology, a thank-you, a letting-go?" },
      { n: 5, tag: "revisiting no. 19", text: "The survey asks if you often think about retirement \u2014 the far end of work. Set that aside. What does \u201cenough, for today\u201d actually feel like in your body, right now?" },
    ],
  },
  {
    domain: "Canopy",
    note: "what you reach toward",
    prompts: [
      { n: 6, tag: "revisiting your pressed specimen \u2014 guiding metaphor", text: "You wrote your own guiding metaphor. If it had a season, which one is it in right now \u2014 and what told you that?" },
      { n: 7, tag: "revisiting your pressed specimen \u2014 a compelling question, once asked", text: "You named the most compelling question anyone has ever asked you. Turn it around: what is the question you have never been brave enough to ask someone else?" },
    ],
  },
  {
    domain: "Grove",
    note: "who you stand among",
    prompts: [
      { n: 8, tag: "revisiting your pressed specimen \u2014 favourite colour", text: "You named a favourite colour. If that colour were a person you trust, who would it be \u2014 and what do they see in you that you haven't fully seen yet?" },
      { n: 9, tag: "revisiting no. 24", text: "The survey mentions talking with friends about God, Truth, Justice, Love, Beauty. Write about the last time a conversation like that actually happened. Who was there? What went unsaid?" },
      { n: 10, tag: "for the road ahead", text: "A teacher tends to appear once the student is ready \u2014 and more often than not, the teacher is only another soul willing to sit across from you and listen. Who would you want to hand this survey to next? What would you want them to know before they read it?" },
    ],
  },
];

function PrintLine() {
  return <div style={{ borderBottom: `1px solid ${LINE}`, height: "26px", marginBottom: "10px" }} />;
}

function ViewHeader({ title, onBack, onPrint }) {
  return (
    <div className="no-print" style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      maxWidth: "620px", margin: "0 auto", padding: "20px 20px 0",
    }}>
      <button
        onClick={onBack}
        style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: "10.5px",
          letterSpacing: "0.05em", textTransform: "uppercase",
          color: "#C9CBB8", background: "none", border: "none", cursor: "pointer",
        }}
      >
        &larr; back to survey
      </button>
      {onPrint && (
        <button
          onClick={onPrint}
          style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: "10.5px",
            letterSpacing: "0.05em", textTransform: "uppercase",
            padding: "7px 14px", borderRadius: "20px",
            border: `1px solid #8FA06E`, background: "transparent", color: "#C9D9AE",
            cursor: "pointer",
          }}
        >
          print
        </button>
      )}
    </div>
  );
}

function StoryView({ onBack }) {
  return (
    <div style={{ minHeight: "100vh", background: INK }}>
      <GlobalStyle />
      <ViewHeader title="Windfall" onBack={onBack} onPrint={() => window.print()} />
      <div className="printable" style={{
        maxWidth: "560px", margin: "0 auto", padding: "28px 22px 60px",
        background: PAPER, borderRadius: "10px", marginTop: "20px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
      }}>
        <div style={{ textAlign: "center", marginBottom: "8px" }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", letterSpacing: "0.2em", color: GOLD }}>
            AN ORIGIN STORY
          </span>
        </div>
        <h1 style={{
          fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: "30px",
          color: INK, textAlign: "center", margin: "0 0 26px",
        }}>
          Windfall
        </h1>
        {STORY_PARAGRAPHS.map((p, i) => {
          if (p === "__FOR_YOU__") {
            return (
              <p key={i} style={{ textAlign: "center", fontFamily: "'Fraunces', serif", fontWeight: 600, fontStyle: "italic", fontSize: "18px", color: RUST, margin: "0 0 18px" }}>
                For you.
              </p>
            );
          }
          if (p === "__TITLE__") {
            return (
              <div key={i} style={{ textAlign: "center", margin: "0 0 18px" }}>
                <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: "22px", color: FOREST_TEXT }}>EHISM-Q</div>
                <div style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic", fontSize: "13px", color: "#8A8266" }}>
                  Existential Hyperion Interconnected Sequoia Mindfulness Questionnaire
                </div>
              </div>
            );
          }
          if (p === "__FIRST_LINE__") {
            return (
              <p key={i} style={{ textAlign: "center", fontFamily: "'JetBrains Mono', monospace", fontSize: "13px", color: MOSS, fontWeight: 700, margin: "0 0 18px" }}>
                1. Everything is interconnected.
              </p>
            );
          }
          return (
            <p key={i} style={{ fontFamily: "'Spectral', serif", fontSize: "15px", lineHeight: 1.7, color: INK, margin: "0 0 16px" }}>
              {p}
            </p>
          );
        })}
      </div>
    </div>
  );
}

function WorksheetView({ onBack }) {
  return (
    <div style={{ minHeight: "100vh", background: INK }}>
      <GlobalStyle />
      <ViewHeader title="Worksheet" onBack={onBack} onPrint={() => window.print()} />
      <div className="printable" style={{ maxWidth: "620px", margin: "0 auto", padding: "24px 20px 60px" }}>
        <div style={{ textAlign: "center", marginBottom: "26px" }}>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: "28px", color: PAPER, margin: "0 0 6px" }}>
            EHISM-Q
          </h1>
          <p style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic", fontSize: "13px", color: "#C9CBB8", margin: 0 }}>
            worksheet edition &mdash; for handwriting, or for someone else
          </p>
        </div>
        {SECTIONS.map((section) => (
          <div key={section.id} style={{
            background: PAPER, borderRadius: "10px", padding: "20px 18px",
            marginBottom: "16px", boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
          }}>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: "19px", color: INK, margin: "0 0 2px" }}>
              {section.label}
            </h2>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9.5px", color: "#8A8266", margin: "0 0 14px" }}>
              {section.note}
            </p>
            {section.items.map((item) => (
              <div key={item.n} style={{ marginBottom: "20px" }}>
                <div style={{ display: "flex", gap: "10px" }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: GOLD, fontWeight: 700, minWidth: "24px" }}>
                    {String(item.n).padStart(2, "0")}
                  </span>
                  <div style={{ flex: 1 }}>
                    <p style={{
                      fontFamily: "'Spectral', serif", fontStyle: item.type === "select" ? "normal" : "italic",
                      fontSize: "14px", color: INK, margin: "0 0 6px", lineHeight: 1.5,
                    }}>
                      {item.text}
                    </p>
                    {item.type === "select" && (
                      <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: GOLD, margin: "0 0 8px" }}>
                        {KEY_OPTIONS.join(" \u00b7 ")}
                      </p>
                    )}
                    <PrintLine />
                    <PrintLine />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function ConversationView({ onBack }) {
  return (
    <div style={{ minHeight: "100vh", background: INK }}>
      <GlobalStyle />
      <ViewHeader title="The Second Conversation" onBack={onBack} onPrint={() => window.print()} />
      <div className="printable" style={{ maxWidth: "620px", margin: "0 auto", padding: "24px 20px 60px" }}>
        <div style={{ textAlign: "center", marginBottom: "10px" }}>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: "26px", color: PAPER, margin: "0 0 6px" }}>
            The Second Conversation
          </h1>
          <p style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic", fontSize: "13px", color: "#C9CBB8", margin: 0 }}>
            EHISM-Q &mdash; supplemental reflections
          </p>
        </div>
        <p style={{
          fontFamily: "'Spectral', serif", fontStyle: "italic", fontSize: "13px", color: "#C9CBB8",
          textAlign: "center", maxWidth: "480px", margin: "16px auto 26px", lineHeight: 1.7,
        }}>
          When the student is ready, the teacher appears &mdash; often nothing more mystical than another
          soul willing to sit across from you and ask a better question. These ten prompts go deeper
          into what the survey could only gesture toward. There is no key here. Only room to write.
        </p>
        {CONVERSATION.map((section) => (
          <div key={section.domain} style={{
            background: PAPER, borderRadius: "10px", padding: "20px 18px",
            marginBottom: "16px", boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
          }}>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: "19px", color: FOREST_TEXT, margin: "0 0 2px" }}>
              {section.domain}
            </h2>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9.5px", color: "#8A8266", margin: "0 0 14px" }}>
              {section.note}
            </p>
            {section.prompts.map((p) => (
              <div key={p.n} style={{ marginBottom: "22px" }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: GOLD, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "4px" }}>
                  {p.n}. {p.tag}
                </div>
                <p style={{ fontFamily: "'Spectral', serif", fontSize: "14px", color: INK, margin: "0 0 10px", lineHeight: 1.55 }}>
                  {p.text}
                </p>
                <PrintLine /><PrintLine /><PrintLine /><PrintLine />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function Stamp({ value, onChange, id }) {
  const filled = Boolean(value);
  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          appearance: "none",
          WebkitAppearance: "none",
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "11px",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          fontWeight: 700,
          padding: "8px 30px 8px 14px",
          borderRadius: "3px",
          border: `2px solid ${filled ? RUST : LINE}`,
          color: filled ? RUST : "#8A8266",
          background: filled ? "rgba(154,74,47,0.08)" : "transparent",
          cursor: "pointer",
          outline: "none",
          transform: filled ? "rotate(-1.5deg)" : "none",
          transition: "all 0.15s ease",
        }}
      >
        <option value="">— mark —</option>
        {KEY_OPTIONS.map((opt) => (
          <option key={opt} value={opt}>{opt.toUpperCase()}</option>
        ))}
      </select>
      <svg
        width="10" height="10" viewBox="0 0 10 10"
        style={{
          position: "absolute", right: "10px", top: "50%",
          transform: "translateY(-50%)", pointerEvents: "none",
        }}
      >
        <path d="M1 3 L5 7 L9 3" stroke={filled ? RUST : "#8A8266"} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function Item({ item, value, onChange }) {
  const id = `item-${item.n}`;
  return (
    <div
      style={{
        padding: "16px 4px",
        borderBottom: `1px solid ${LINE}`,
      }}
    >
      <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "11px",
            color: GOLD,
            fontWeight: 700,
            paddingTop: "2px",
            minWidth: "34px",
          }}
        >
          No.{String(item.n).padStart(2, "0")}
        </span>
        <div style={{ flex: 1 }}>
          <label
            htmlFor={id}
            style={{
              fontFamily: "'Spectral', serif",
              fontSize: "15.5px",
              lineHeight: 1.5,
              color: INK,
              display: "block",
              marginBottom: "10px",
            }}
          >
            {item.text}
          </label>

          {item.type === "select" && (
            <Stamp id={id} value={value || ""} onChange={onChange} />
          )}

          {item.type === "text" && (
            <input
              id={id}
              type="text"
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
              placeholder="write here"
              style={{
                width: "100%",
                maxWidth: "420px",
                fontFamily: "'Spectral', serif",
                fontStyle: "italic",
                fontSize: "14.5px",
                color: INK,
                background: "transparent",
                border: "none",
                borderBottom: `1.5px solid ${LINE}`,
                padding: "4px 2px",
                outline: "none",
              }}
              onFocus={(e) => (e.target.style.borderBottomColor = RUST)}
              onBlur={(e) => (e.target.style.borderBottomColor = LINE)}
            />
          )}

          {item.type === "textarea" && (
            <textarea
              id={id}
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
              placeholder="write here"
              rows={2}
              style={{
                width: "100%",
                fontFamily: "'Spectral', serif",
                fontStyle: "italic",
                fontSize: "14.5px",
                color: INK,
                background: "rgba(0,0,0,0.02)",
                border: `1px solid ${LINE}`,
                borderRadius: "4px",
                padding: "8px 10px",
                outline: "none",
                resize: "vertical",
                lineHeight: 1.5,
              }}
              onFocus={(e) => (e.target.style.borderColor = RUST)}
              onBlur={(e) => (e.target.style.borderColor = LINE)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function EhismQApp() {
  const [responses, setResponses] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [saveState, setSaveState] = useState("idle"); // idle | saving | saved
  const saveTimer = useRef(null);
  const sectionRefs = useRef({});
  const [activeSection, setActiveSection] = useState(SECTIONS[0].id);
  const [view, setView] = useState("survey"); // survey | story | worksheet | conversation
  const [inviteState, setInviteState] = useState("idle");
  const shareApp = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: "EHISM-Q",
          text: "A reflective questionnaire worth sitting with \u2014 Explore, Expand, Become.",
          url,
        });
        setInviteState("shared");
      } else {
        await navigator.clipboard.writeText(url);
        setInviteState("copied");
      }
    } catch (e) {
      // user cancelled the share sheet — not an error
    } finally {
      setTimeout(() => setInviteState("idle"), 1800);
    }
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setResponses(JSON.parse(raw));
    } catch (e) {
      // no saved data yet
    } finally {
      setLoaded(true);
    }
  }, []);

  const persist = useCallback((next) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaveState("saving");
    saveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        setSaveState("saved");
      } catch (e) {
        setSaveState("idle");
      }
    }, 500);
  }, []);

  const updateResponse = (n, value) => {
    setResponses((prev) => {
      const next = { ...prev, [n]: value };
      persist(next);
      return next;
    });
  };

  const clearAll = () => {
    if (!window.confirm("Clear every response? This can't be undone.")) return;
    setResponses({});
    try {
      localStorage.removeItem(STORAGE_KEY);
      setSaveState("saved");
    } catch (e) {}
  };

  const answeredCount = SECTIONS.reduce(
    (acc, s) => acc + s.items.filter((it) => (responses[it.n] || "").trim().length > 0).length,
    0
  );
  const pct = Math.round((answeredCount / TOTAL_ITEMS) * 100);

  const scrollToSection = (id) => {
    setActiveSection(id);
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const tally = useMemo(() => {
    const counts = Object.fromEntries(KEY_OPTIONS.map((k) => [k, 0]));
    SELECT_NUMBERS.forEach((n) => {
      const v = responses[n];
      if (v && counts[v] !== undefined) counts[v] += 1;
    });
    const max = Math.max(1, ...Object.values(counts));
    return { counts, max };
  }, [responses]);

  const marksMode = SELECT_NUMBERS.filter((n) => responses[n]).length;

  const specimens = useMemo(
    () => WRITE_FIELDS.map((f) => ({ ...f, value: (responses[f.n] || "").trim() })),
    [responses]
  );
  const pressedCount = specimens.filter((s) => s.value).length;

  // Cosmetic label only — lives in memory for this session, never saved or persisted.
  const [readingName, setReadingName] = useState("");

  const buildReadingLines = useCallback(() => [
    readingName ? `${readingName}\u2019s Rings` : "EHISM-Q — Rings",
    "",
    "Marks pressed:",
    ...KEY_OPTIONS.filter((k) => tally.counts[k] > 0).map((k) => `  ${k}: ${tally.counts[k]}`),
    "",
    "Specimens:",
    ...specimens.map((s) => `  ${s.label} — ${s.value || "(not yet pressed)"}`),
  ], [tally, specimens, readingName]);

  const [copyState, setCopyState] = useState("idle");
  const copyReading = async () => {
    try {
      await navigator.clipboard.writeText(buildReadingLines().join("\n"));
      setCopyState("copied");
      setTimeout(() => setCopyState("idle"), 1800);
    } catch (e) {
      setCopyState("idle");
    }
  };

  // Draws the Rings reading onto an offscreen canvas and returns a PNG blob.
  const renderReadingCanvas = useCallback(async () => {
    try {
      await document.fonts.ready;
    } catch (e) {}

    const width = 640;
    const padding = 40;
    const barRows = KEY_OPTIONS.filter((k) => tally.counts[k] > 0);
    const rowH = 30;
    const specimenBlocks = specimens.length;
    const specimenH = 60;
    const height =
      padding * 2 + 90 + barRows.length * rowH + 50 + specimenBlocks * specimenH + 20;

    const canvas = document.createElement("canvas");
    const scale = 2; // sharper export
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext("2d");
    ctx.scale(scale, scale);

    // background
    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, width, height);

    let y = padding;

    // heading
    ctx.fillStyle = INK;
    ctx.font = "600 24px Fraunces, serif";
    ctx.fillText(readingName ? `${readingName}\u2019s Rings` : "Rings", padding, y);
    ctx.font = "italic 12px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#8A8266";
    y += 22;
    ctx.fillText("a record of your own marks, not a verdict on them", padding, y);
    y += 30;

    // bars
    const barMax = tally.max;
    const barTrackW = width - padding * 2 - 130;
    barRows.forEach((k) => {
      ctx.fillStyle = INK;
      ctx.font = "700 11px 'JetBrains Mono', monospace";
      ctx.fillText(k.toUpperCase(), padding, y + 8);

      const trackX = padding + 95;
      ctx.fillStyle = PAPER_ALT;
      ctx.fillRect(trackX, y - 2, barTrackW, 10);
      ctx.fillStyle = MOSS;
      const w = Math.max(4, (tally.counts[k] / barMax) * barTrackW);
      ctx.fillRect(trackX, y - 2, w, 10);

      ctx.fillStyle = "#8A8266";
      ctx.font = "10px 'JetBrains Mono', monospace";
      ctx.fillText(String(tally.counts[k]), trackX + barTrackW + 12, y + 8);

      y += rowH;
    });

    y += 14;
    ctx.strokeStyle = LINE;
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(width - padding, y);
    ctx.stroke();
    y += 26;

    ctx.fillStyle = "#6B6248";
    ctx.font = "700 11px 'JetBrains Mono', monospace";
    ctx.fillText(`PRESSED SPECIMENS (${pressedCount}/${specimens.length})`, padding, y);
    ctx.font = "10px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#8A8266";
    y += 16;
    ctx.fillText("in your own words", padding, y);
    y += 22;

    specimens.forEach((s) => {
      ctx.fillStyle = GOLD;
      ctx.font = "700 10px 'JetBrains Mono', monospace";
      ctx.fillText(s.label.toUpperCase(), padding, y);
      y += 16;

      ctx.fillStyle = s.value ? INK : "#A9A184";
      ctx.font = s.value ? "italic 14px Fraunces, serif" : "14px Fraunces, serif";
      const text = s.value || "not yet pressed";
      // simple word-wrap
      const maxW = width - padding * 2;
      const words = text.split(" ");
      let line = "";
      words.forEach((word) => {
        const test = line ? `${line} ${word}` : word;
        if (ctx.measureText(test).width > maxW && line) {
          ctx.fillText(line, padding, y);
          y += 18;
          line = word;
        } else {
          line = test;
        }
      });
      if (line) {
        ctx.fillText(line, padding, y);
        y += 18;
      }
      y += 20;
    });

    return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  }, [tally, specimens, pressedCount, readingName]);

  const [imageState, setImageState] = useState("idle");
  const saveAsImage = async () => {
    setImageState("rendering");
    try {
      const blob = await renderReadingCanvas();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "ehism-q-rings.png";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setImageState("saved");
      setTimeout(() => setImageState("idle"), 1800);
    } catch (e) {
      setImageState("idle");
    }
  };

  const [shareState, setShareState] = useState("idle");
  const shareReading = async () => {
    const text = buildReadingLines().join("\n");
    try {
      if (navigator.share) {
        let files;
        try {
          const blob = await renderReadingCanvas();
          const file = new File([blob], "ehism-q-rings.png", { type: "image/png" });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            files = [file];
          }
        } catch (e) {
          // image render failed — fall back to text-only share
        }
        await navigator.share({ title: readingName ? `${readingName}\u2019s Rings` : "EHISM-Q — Rings", text, ...(files ? { files } : {}) });
        setShareState("shared");
      } else {
        await navigator.clipboard.writeText(text);
        setShareState("copied");
      }
    } catch (e) {
      // user cancelled the share sheet — not an error
    } finally {
      setTimeout(() => setShareState("idle"), 1800);
    }
  };

  if (view === "story") return <StoryView onBack={() => setView("survey")} />;
  if (view === "worksheet") return <WorksheetView onBack={() => setView("survey")} />;
  if (view === "conversation") return <ConversationView onBack={() => setView("survey")} />;

  return (
    <div style={{ minHeight: "100vh", background: INK, fontFamily: "'Spectral', serif" }}>
      <GlobalStyle />

      {/* Cover */}
      <div style={{ padding: "48px 20px 32px", textAlign: "center", color: PAPER }}>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: "10px",
          letterSpacing: "0.25em", color: "#8FA06E", marginBottom: "14px",
        }}>
          FIELD EDITION &middot; NO. 9
        </div>
        <h1 style={{
          fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: "clamp(32px, 9vw, 44px)",
          margin: 0, letterSpacing: "-0.01em",
        }}>
          EHISM&#8209;Q
        </h1>
        <p style={{
          fontFamily: "'Fraunces', serif", fontStyle: "italic", fontWeight: 400,
          fontSize: "15px", color: "#C9CBB8", margin: "10px auto 0", maxWidth: "320px", lineHeight: 1.5,
        }}>
          Existential Hyperion Interconnected Sequoia Mindfulness Questionnaire
        </p>
        <p style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: "10.5px",
          color: "#7C8767", marginTop: "10px", letterSpacing: "0.03em",
        }}>
          an absurd survey, for a life examined
        </p>
        <button
          onClick={() => setView("story")}
          style={{
            marginTop: "14px", background: "none", border: "none", cursor: "pointer",
            fontFamily: "'Fraunces', serif", fontStyle: "italic", fontSize: "12px",
            color: "#8FA06E", textDecoration: "underline", textUnderlineOffset: "3px",
          }}
        >
          read how this began &rarr;
        </button>
        <div>
          <button
            onClick={shareApp}
            style={{
              marginTop: "16px", display: "inline-flex", alignItems: "center", gap: "6px",
              fontFamily: "'JetBrains Mono', monospace", fontSize: "10px",
              letterSpacing: "0.05em", textTransform: "uppercase",
              padding: "8px 16px", borderRadius: "20px",
              border: "1px solid #8FA06E",
              background: inviteState === "shared" || inviteState === "copied" ? "#8FA06E" : "transparent",
              color: inviteState === "shared" || inviteState === "copied" ? INK : "#C9D9AE",
              cursor: "pointer", transition: "all 0.15s ease",
            }}
          >
            {inviteState === "shared" ? <Check size={12} /> : inviteState === "copied" ? <Check size={12} /> : <Share2 size={12} />}
            {inviteState === "shared" ? "shared" : inviteState === "copied" ? "link copied" : "share this survey"}
          </button>
        </div>
      </div>

      {/* Sticky index / progress */}
      <div style={{
        position: "sticky", top: 0, zIndex: 10, background: INK,
        borderTop: `1px solid #3A4633`, borderBottom: `1px solid #3A4633`,
        padding: "10px 16px",
      }}>
        <div style={{ display: "flex", gap: "6px", justifyContent: "center", flexWrap: "wrap" }}>
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            const active = activeSection === s.id;
            return (
              <button
                key={s.id}
                onClick={() => scrollToSection(s.id)}
                style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  fontFamily: "'JetBrains Mono', monospace", fontSize: "10.5px",
                  letterSpacing: "0.06em", textTransform: "uppercase",
                  padding: "7px 12px", borderRadius: "20px",
                  border: `1px solid ${active ? "#8FA06E" : "#3A4633"}`,
                  background: active ? "rgba(143,160,110,0.12)" : "transparent",
                  color: active ? "#C9D9AE" : "#7C8767",
                  cursor: "pointer", transition: "all 0.15s ease",
                }}
              >
                <Icon size={13} />
                {s.label}
              </button>
            );
          })}
          <button
            onClick={() => scrollToSection("rings")}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              fontFamily: "'JetBrains Mono', monospace", fontSize: "10.5px",
              letterSpacing: "0.06em", textTransform: "uppercase",
              padding: "7px 12px", borderRadius: "20px",
              border: `1px solid ${activeSection === "rings" ? "#8FA06E" : "#3A4633"}`,
              background: activeSection === "rings" ? "rgba(143,160,110,0.12)" : "transparent",
              color: activeSection === "rings" ? "#C9D9AE" : "#7C8767",
              cursor: "pointer", transition: "all 0.15s ease",
            }}
          >
            <Target size={13} />
            Rings
          </button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "10px", maxWidth: "420px", margin: "10px auto 0" }}>
          <div style={{ flex: 1, height: "3px", background: "#3A4633", borderRadius: "2px", overflow: "hidden" }}>
            <div style={{ width: `${pct}%`, height: "100%", background: "#8FA06E", transition: "width 0.3s ease" }} />
          </div>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "#7C8767", whiteSpace: "nowrap" }}>
            {answeredCount}/{TOTAL_ITEMS}
          </span>
        </div>
      </div>

      {/* Key legend */}
      <div style={{ maxWidth: "620px", margin: "0 auto", padding: "18px 20px 0" }}>
        <div style={{
          background: PAPER_ALT, borderRadius: "6px", padding: "12px 16px",
          display: "flex", flexWrap: "wrap", gap: "6px 10px", justifyContent: "center",
        }}>
          {KEY_OPTIONS.map((k) => (
            <span key={k} style={{
              fontFamily: "'JetBrains Mono', monospace", fontSize: "9.5px",
              letterSpacing: "0.05em", color: "#6B6248", textTransform: "uppercase",
            }}>
              {k}
            </span>
          ))}
        </div>
        <p style={{
          fontFamily: "'Fraunces', serif", fontStyle: "italic", fontSize: "12px",
          color: "#7C8767", textAlign: "center", margin: "8px 4px 0",
        }}>
          entry points, not exits — answer however the statement actually opens you
        </p>
      </div>

      {/* Sections */}
      <div style={{ maxWidth: "620px", margin: "0 auto", padding: "24px 16px 8px" }}>
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          return (
            <div
              key={section.id}
              ref={(el) => (sectionRefs.current[section.id] = el)}
              style={{
                background: PAPER, borderRadius: "10px", padding: "22px 18px",
                marginBottom: "18px", boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
                scrollMarginTop: "120px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                <Icon size={18} color={MOSS} />
                <h2 style={{
                  fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: "20px",
                  color: INK, margin: 0,
                }}>
                  {section.label}
                </h2>
              </div>
              <p style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: "10px",
                color: "#8A8266", margin: "0 0 4px", letterSpacing: "0.03em",
              }}>
                {section.note}
              </p>
              <div>
                {section.items.map((item) => (
                  <Item
                    key={item.n}
                    item={item}
                    value={responses[item.n]}
                    onChange={(val) => updateResponse(item.n, val)}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {/* Rings — the reading */}
        <div
          ref={(el) => (sectionRefs.current["rings"] = el)}
          style={{
            background: PAPER, borderRadius: "10px", padding: "22px 18px",
            marginBottom: "24px", boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
            scrollMarginTop: "120px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <Target size={18} color={GOLD} />
            <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: "20px", color: INK, margin: 0 }}>
              {readingName ? `${readingName}\u2019s Rings` : "Rings"}
            </h2>
          </div>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "#8A8266", margin: "0 0 14px" }}>
            a record of your own marks, not a verdict on them
          </p>

          <div style={{ marginBottom: "20px" }}>
            <label
              htmlFor="reading-name"
              style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: "9.5px",
                letterSpacing: "0.05em", textTransform: "uppercase", color: "#8A8266",
                display: "block", marginBottom: "6px",
              }}
            >
              what should this reading be called?
            </label>
            <input
              id="reading-name"
              type="text"
              value={readingName}
              onChange={(e) => setReadingName(e.target.value)}
              placeholder="optional — used only to label this page"
              style={{
                width: "100%", maxWidth: "320px",
                fontFamily: "'Fraunces', serif", fontStyle: "italic", fontSize: "14.5px",
                color: INK, background: "transparent", border: "none",
                borderBottom: `1.5px solid ${LINE}`, padding: "4px 2px", outline: "none",
              }}
              onFocus={(e) => (e.target.style.borderBottomColor = RUST)}
              onBlur={(e) => (e.target.style.borderBottomColor = LINE)}
            />
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: "#A9A184", margin: "6px 0 0" }}>
              not saved &mdash; clears when you leave this page
            </p>
          </div>

          {marksMode === 0 ? (
            <p style={{ fontFamily: "'Spectral', serif", fontStyle: "italic", fontSize: "14px", color: "#8A8266" }}>
              No rings yet — mark a few statements above, and they'll start to form here.
            </p>
          ) : (
            <div style={{ marginBottom: "22px" }}>
              {KEY_OPTIONS.filter((k) => tally.counts[k] > 0)
                .sort((a, b) => tally.counts[b] - tally.counts[a])
                .map((k) => (
                  <div key={k} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                    <span style={{
                      fontFamily: "'JetBrains Mono', monospace", fontSize: "10px",
                      letterSpacing: "0.05em", color: INK, width: "84px", flexShrink: 0,
                      textTransform: "uppercase",
                    }}>
                      {k}
                    </span>
                    <div style={{ flex: 1, background: PAPER_ALT, borderRadius: "3px", height: "10px", overflow: "hidden" }}>
                      <div style={{
                        width: `${(tally.counts[k] / tally.max) * 100}%`, height: "100%",
                        background: MOSS, borderRadius: "3px", transition: "width 0.3s ease",
                      }} />
                    </div>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "#8A8266", width: "16px", textAlign: "right" }}>
                      {tally.counts[k]}
                    </span>
                  </div>
                ))}
            </div>
          )}

          <div style={{ borderTop: `1px solid ${LINE}`, paddingTop: "16px" }}>
            <h3 style={{
              fontFamily: "'JetBrains Mono', monospace", fontSize: "10.5px", letterSpacing: "0.06em",
              textTransform: "uppercase", color: "#6B6248", margin: "0 0 12px",
            }}>
              Pressed specimens ({pressedCount}/{WRITE_FIELDS.length})
            </h3>
            {specimens.map((s) => (
              <div key={s.n} style={{ marginBottom: "12px" }}>
                <div style={{
                  fontFamily: "'JetBrains Mono', monospace", fontSize: "9.5px",
                  color: GOLD, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "2px",
                }}>
                  {s.label}
                </div>
                <div style={{
                  fontFamily: "'Fraunces', serif", fontStyle: s.value ? "italic" : "normal",
                  fontSize: "14.5px", color: s.value ? INK : "#A9A184", lineHeight: 1.5,
                }}>
                  {s.value || "not yet pressed"}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "16px" }}>
            <button
              onClick={copyReading}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                fontFamily: "'JetBrains Mono', monospace", fontSize: "10px",
                letterSpacing: "0.05em", textTransform: "uppercase",
                padding: "9px 16px", borderRadius: "20px",
                border: `1px solid ${MOSS}`, background: copyState === "copied" ? MOSS : "transparent",
                color: copyState === "copied" ? PAPER : MOSS,
                cursor: "pointer", transition: "all 0.15s ease",
              }}
            >
              {copyState === "copied" ? <Check size={12} /> : <Copy size={12} />}
              {copyState === "copied" ? "copied" : "copy text"}
            </button>

            <button
              onClick={saveAsImage}
              disabled={imageState === "rendering"}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                fontFamily: "'JetBrains Mono', monospace", fontSize: "10px",
                letterSpacing: "0.05em", textTransform: "uppercase",
                padding: "9px 16px", borderRadius: "20px",
                border: `1px solid ${GOLD}`, background: imageState === "saved" ? GOLD : "transparent",
                color: imageState === "saved" ? PAPER : GOLD,
                cursor: imageState === "rendering" ? "wait" : "pointer", transition: "all 0.15s ease",
              }}
            >
              {imageState === "saved" ? <Check size={12} /> : <Download size={12} />}
              {imageState === "rendering" ? "rendering\u2026" : imageState === "saved" ? "saved" : "save as image"}
            </button>

            <button
              onClick={shareReading}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                fontFamily: "'JetBrains Mono', monospace", fontSize: "10px",
                letterSpacing: "0.05em", textTransform: "uppercase",
                padding: "9px 16px", borderRadius: "20px",
                border: `1px solid ${RUST}`,
                background: shareState === "shared" || shareState === "copied" ? RUST : "transparent",
                color: shareState === "shared" || shareState === "copied" ? PAPER : RUST,
                cursor: "pointer", transition: "all 0.15s ease",
              }}
            >
              {shareState === "shared" ? <Check size={12} /> : shareState === "copied" ? <Check size={12} /> : <Share2 size={12} />}
              {shareState === "shared" ? "shared" : shareState === "copied" ? "link copied" : "share"}
            </button>
          </div>
        </div>

        {/* What's next — Worksheet and Second Conversation, offered as siblings */}
        <div style={{
          background: PAPER_ALT, borderRadius: "10px", padding: "22px 18px",
          marginBottom: "24px",
        }}>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: "18px", color: INK, margin: "0 0 4px" }}>
            What's next
          </h2>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "#6B6248", margin: "0 0 18px", lineHeight: 1.6 }}>
            the survey is an opening, not an answer &mdash; two ways to go further, in either order
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <button
              onClick={() => setView("worksheet")}
              style={{
                textAlign: "left", padding: "14px 16px", borderRadius: "8px",
                border: `1px solid ${LINE}`, background: PAPER, cursor: "pointer",
              }}
            >
              <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: "15px", color: INK, marginBottom: "3px" }}>
                Worksheet
              </div>
              <div style={{ fontFamily: "'Spectral', serif", fontStyle: "italic", fontSize: "12.5px", color: "#6B6248" }}>
                a printable copy, for handwriting &mdash; or for handing to someone else
              </div>
            </button>
            <button
              onClick={() => setView("conversation")}
              style={{
                textAlign: "left", padding: "14px 16px", borderRadius: "8px",
                border: `1px solid ${LINE}`, background: PAPER, cursor: "pointer",
              }}
            >
              <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: "15px", color: INK, marginBottom: "3px" }}>
                The Second Conversation
              </div>
              <div style={{ fontFamily: "'Spectral', serif", fontStyle: "italic", fontSize: "12.5px", color: "#6B6248" }}>
                ten prompts that go deeper &mdash; the bridge to an actual conversation with someone else
              </div>
            </button>
          </div>
        </div>

        {/* Footer / status bar */}
        <div style={{
          display: "flex", flexDirection: "column", gap: "4px",
          padding: "4px 6px 40px",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{
              fontFamily: "'JetBrains Mono', monospace", fontSize: "10px",
              color: saveState === "saved" ? "#8FA06E" : "#7C8767",
              display: "flex", alignItems: "center", gap: "5px",
            }}>
              {saveState === "saved" && <Check size={11} />}
              {saveState === "saving" ? "saving\u2026" : saveState === "saved" ? "saved to this browser only" : loaded ? "not yet saved" : "loading\u2026"}
            </span>
            <button
              onClick={clearAll}
              style={{
                display: "flex", alignItems: "center", gap: "5px",
                fontFamily: "'JetBrains Mono', monospace", fontSize: "10px",
                color: "#B08D6E", background: "none", border: "none", cursor: "pointer",
                letterSpacing: "0.04em", textTransform: "uppercase",
              }}
            >
              <RotateCcw size={11} /> erase browser data
            </button>
          </div>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: "9px",
            color: "#5A6350", lineHeight: 1.5,
          }}>
            nothing leaves this device unless you share or download it &mdash; on a shared or public computer, erase before you go
          </span>
          <span style={{
            fontFamily: "'Fraunces', serif", fontStyle: "italic", fontSize: "10px",
            color: "#4A5540", marginTop: "10px",
          }}>
            Concept and direction by The Hopeful Humanist. Drafted with Claude (Anthropic).
          </span>
        </div>
      </div>
    </div>
  );
}
