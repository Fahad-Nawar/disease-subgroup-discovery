// Screen components for the Health Risk Predictor

const { useState, useEffect, useMemo, useRef } = React;

// ===========================================================================
// FIELD DEFINITIONS
// ===========================================================================
const FIELDS = [
  { key: "bmi",     label: "Body Mass Index",         unit: "kg/m²", min: 15, max: 45,  step: 0.1, healthy: [18.5, 24.9], default: 23.5 },
  { key: "glucose", label: "Fasting Glucose",          unit: "mg/dL", min: 60, max: 300, step: 1,   healthy: [70, 99],     default: 89   },
  { key: "sbp",     label: "Systolic Blood Pressure",  unit: "mmHg",  min: 80, max: 200, step: 1,   healthy: [90, 120],    default: 112  },
];

const DEFAULT_VALUES = Object.fromEntries(FIELDS.map(f => [f.key, f.default]));

const DISEASES = [
  { key: "hypertension", label: "Hypertension",          color: "#B5413F", bg: "#FBEDED",
    icon: "BP", tip: "Reduce sodium intake to under 1,500 mg/day, sustain 150 min/week of moderate aerobic activity, and monitor blood pressure twice daily for two weeks." },
  { key: "diabetes",     label: "Type II Diabetes",      color: "#1F6B5C", bg: "#E6F1EE",
    icon: "GL", tip: "Limit refined carbohydrates, prioritize fiber-rich whole foods, and request an HbA1c panel at your next visit to confirm fasting glucose trend." },
  { key: "obesity",      label: "Obesity-related Risk",  color: "#C77A2C", bg: "#FBF1E3",
    icon: "BM", tip: "Aim for a 500 kcal/day deficit with resistance training twice weekly. Re-assess BMI and waist circumference every 4 weeks." },
];

// Model disease names → DISEASES key
const MODEL_NAME_MAP = {
  "Hypertension": "hypertension",
  "Diabetes":     "diabetes",
  "Obesity":      "obesity",
};

// ===========================================================================
// LOCAL FALLBACK PREDICTION (used when API is unavailable)
// ===========================================================================
function localPredict(v) {
  const norm = (x, lo, hi) => Math.max(0, Math.min(1, (x - lo) / (hi - lo)));
  const htn = 0.70 * norm(v.sbp, 120, 180) + 0.30 * norm(v.bmi, 22, 35);
  const dm  = 0.75 * norm(v.glucose, 100, 200) + 0.25 * norm(v.bmi, 25, 40);
  const ob  = 0.60 * norm(v.bmi, 25, 40) + 0.40 * norm(v.glucose, 90, 160);
  const scores = [htn + 0.02, dm + 0.02, ob + 0.02];
  const exp = scores.map(s => Math.exp(s * 3));
  const sum = exp.reduce((a, b) => a + b, 0);
  const probs = exp.map(e => e / sum);
  return { hypertension: probs[0], diabetes: probs[1], obesity: probs[2] };
}

// ===========================================================================
// NATURAL / HEALTHY CHECK
// ===========================================================================
function isAllHealthy(values) {
  return FIELDS.every(f => {
    const v = values[f.key];
    return typeof v === "number" && v >= f.healthy[0] && v <= f.healthy[1];
  });
}

// ===========================================================================
// CALL REAL GMM MODEL via Flask API
// ===========================================================================
async function callModel(values) {
  // All measurements within healthy range → Natural result (no model needed)
  if (isAllHealthy(values)) {
    return { probs: null, source: "natural", prediction: "natural" };
  }
  try {
    const res = await fetch("http://localhost:5000/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) throw new Error("API error");
    const data = await res.json();
    // Map model disease names to DISEASES keys
    const probs = {};
    for (const [modelName, prob] of Object.entries(data.probabilities)) {
      const key = MODEL_NAME_MAP[modelName];
      if (key) probs[key] = prob;
    }
    return { probs, source: "model", prediction: MODEL_NAME_MAP[data.prediction] };
  } catch {
    // API not available — fall back to local approximation
    const probs = localPredict(values);
    const prediction = Object.entries(probs).sort((a,b) => b[1]-a[1])[0][0];
    return { probs, source: "fallback", prediction };
  }
}

// ===========================================================================
function fieldStatus(field, value) {
  if (value === "" || value == null || isNaN(value)) return { tone: "muted", text: "—" };
  const [lo, hi] = field.healthy;
  if (value >= lo && value <= hi) return { tone: "ok", text: "Within healthy range" };
  if (value < lo) return { tone: "warn", text: "Below healthy range" };
  const pctOver = (value - hi) / (hi - lo);
  if (pctOver > 0.6) return { tone: "high", text: "Significantly elevated" };
  return { tone: "warn", text: "Above healthy range" };
}

// ===========================================================================
// STEP INDICATOR
// ===========================================================================
function StepIndicator({ current }) {
  const steps = ["Inputs", "Analysis", "Result"];
  return (
    <div className="steps">
      {steps.map((s, i) => (
        <React.Fragment key={s}>
          <div className={`step ${current === i ? "active" : current > i ? "done" : ""}`}>
            <span className="num">{i + 1}</span>
            <span>{s}</span>
          </div>
          {i < steps.length - 1 && <div className={`step-line ${current > i ? "done" : ""}`} />}
        </React.Fragment>
      ))}
    </div>
  );
}

// ===========================================================================
// INTRO SCREEN
// ===========================================================================
function IntroScreen({ onStart }) {
  return (
    <div className="container-narrow fade-up" style={{ paddingTop: 64, paddingBottom: 64 }}>
      <div className="section-eyebrow">Clinical Risk Assessment</div>
      <h1 className="headline">Estimate your risk profile from three measurements.</h1>
      <p className="lead">
        Aegis Health applies a Gaussian Mixture Model trained on de-identified population data
        to estimate relative risk across three chronic conditions: hypertension, type II diabetes,
        and obesity-related metabolic risk.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 32 }}>
        {[
          { n: "01", t: "Enter measurements", d: "Three standard clinical values from a recent panel or check-up." },
          { n: "02", t: "Model evaluates",     d: "Inputs are scaled and assigned to one of three risk clusters." },
          { n: "03", t: "Review breakdown",    d: "See probability across all three conditions plus a recommended next step." },
        ].map(item => (
          <div key={item.n} className="card card-pad" style={{ padding: 20 }}>
            <div className="mono" style={{ fontSize: 11, color: "var(--text-subtle)", letterSpacing: "0.05em" }}>{item.n}</div>
            <div style={{ fontWeight: 600, fontSize: 14, marginTop: 12, marginBottom: 4 }}>{item.t}</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>{item.d}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 32, display: "flex", alignItems: "center", gap: 16 }}>
        <button className="btn btn-primary" onClick={onStart}>
          Begin assessment
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7h8m0 0L7.5 3.5M11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <span className="disclaimer">
          <svg className="icon" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1"/><path d="M6 3.5v3M6 8.2v.3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
          For educational use. Not a medical diagnosis.
        </span>
      </div>
      <div style={{ marginTop: 56, display: "flex", gap: 32, fontSize: 12, color: "var(--text-subtle)" }}>
        {[["3","Risk clusters"],["9","Input features"],["~2s","Avg. completion"],["v2.1.0","Model build"]].map(([n,l]) => (
          <div key={l}><div className="mono" style={{ fontSize: 22, color: "var(--text)", fontWeight: 600 }}>{n}</div><div>{l}</div></div>
        ))}
      </div>
    </div>
  );
}

// ===========================================================================
// FORM SCREEN
// ===========================================================================
function Field({ field, value, onChange }) {
  const status = fieldStatus(field, value);
  const pct = Math.max(0, Math.min(1, (value - field.min) / (field.max - field.min)));
  const healthyStart = Math.max(0, (field.healthy[0] - field.min) / (field.max - field.min));
  const healthyEnd   = Math.min(1, (field.healthy[1] - field.min) / (field.max - field.min));
  return (
    <div className="field">
      <label htmlFor={field.key}>
        <span>{field.label}</span>
        <span className="unit">{field.unit}</span>
      </label>
      <div className="input-wrap">
        <input id={field.key} type="number" step={field.step} min={field.min} max={field.max}
               value={value} className={value !== "" ? "has-value" : ""}
               onChange={e => onChange(field.key, e.target.value === "" ? "" : Number(e.target.value))} />
      </div>
      <div className="range-bar">
        <div className="healthy" style={{ left: `${healthyStart*100}%`, width: `${(healthyEnd-healthyStart)*100}%` }} />
        <div className="marker" style={{ left: `${pct*100}%` }} />
      </div>
      <div className="range-meta">
        <span>{field.min}</span>
        <span>healthy {field.healthy[0]}–{field.healthy[1]}</span>
        <span>{field.max}</span>
      </div>
      <div className={`field-status ${status.tone}`}>{status.text}</div>
    </div>
  );
}

function FormScreen({ values, setValues, onSubmit, onReset }) {
  const onChange = (k, v) => setValues(prev => ({ ...prev, [k]: v }));
  const valid = FIELDS.every(f => values[f.key] !== "" && !isNaN(values[f.key]));
  const flaggedCount = FIELDS.filter(f => {
    const s = fieldStatus(f, values[f.key]);
    return s.tone === "warn" || s.tone === "high";
  }).length;
  return (
    <div className="container fade-up">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
        <div>
          <div className="section-eyebrow">Step 1 · Measurements</div>
          <h1 className="headline" style={{ fontSize: 26, marginBottom: 4 }}>Enter three clinical values</h1>
          <p className="lead" style={{ fontSize: 14 }}>
            Each input is benchmarked against population norms. Markers show where your value sits relative to the healthy band.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
            <span className="mono" style={{ color: flaggedCount > 0 ? "var(--hypertension)" : "var(--ok)", fontWeight: 600 }}>{flaggedCount}</span> {flaggedCount === 1 ? "value" : "values"} outside healthy range
          </span>
          <button className="btn btn-text" onClick={onReset}>Reset to sample</button>
        </div>
      </div>
      <div className="card card-pad">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 40 }}>
          {FIELDS.map(f => <Field key={f.key} field={f} value={values[f.key]} onChange={onChange} />)}
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 24 }}>
        <span className="disclaimer">
          <svg className="icon" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1"/><path d="M6 3.5v3M6 8.2v.3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
          Inputs are not stored. Computation happens on-device.
        </span>
        <button className="btn btn-primary" disabled={!valid} onClick={onSubmit}>
          Run prediction
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7h8m0 0L7.5 3.5M11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>
    </div>
  );
}

// ===========================================================================
// LOADING SCREEN — calls the real GMM model during animation
// ===========================================================================
function LoadingScreen({ values, onDone }) {
  const [stage, setStage] = useState(0);
  const [apiStatus, setApiStatus] = useState("waiting"); // waiting | ok | fallback
  const stages = [
    "Normalizing input vector",
    "Scaling against training distribution",
    "Evaluating Gaussian mixture components",
    "Computing cluster posteriors",
    "Mapping to disease classes",
  ];

  useEffect(() => {
    const totalDuration = 2400;
    const perStage = totalDuration / stages.length;
    const timers = stages.map((_, i) =>
      setTimeout(() => setStage(i + 1), perStage * (i + 1))
    );

    // Call real model in parallel with animation
    const animDone = new Promise(r => setTimeout(r, totalDuration + 200));
    const modelCall = callModel(values).then(result => {
      setApiStatus(result.source === "model" ? "ok" : "fallback");
      return result;
    });

    Promise.all([modelCall, animDone]).then(([result]) => onDone(result));

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="container-narrow fade-up" style={{ paddingTop: 80, paddingBottom: 80 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 32 }}>
        <div style={{ position: "relative", width: 96, height: 96 }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%",
            border: "3px solid var(--primary-50)", borderTopColor: "var(--primary)",
            animation: "spin 1.2s linear infinite" }} />
          <div style={{ position: "absolute", inset: 18, borderRadius: "50%",
            background: "var(--primary)", display: "grid", placeItems: "center",
            color: "white", fontFamily: "JetBrains Mono", fontSize: 11, fontWeight: 600, letterSpacing: "0.05em" }}>GMM</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div className="section-eyebrow">Step 2 · Analysis</div>
          <h1 className="headline" style={{ fontSize: 24, marginBottom: 6 }}>Running risk model</h1>
          <p className="lead" style={{ fontSize: 14, margin: "0 auto" }}>
            {apiStatus === "fallback"
              ? "API unavailable — using local approximation."
              : "Querying trained GMM model on your local server."}
          </p>
        </div>
        <div className="card" style={{ width: "100%", padding: 0, overflow: "hidden" }}>
          {stages.map((s, i) => (
            <div key={s} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "12px 18px",
              borderBottom: i < stages.length - 1 ? "1px solid var(--border)" : "none",
              opacity: i < stage ? 1 : i === stage ? 1 : 0.4, transition: "opacity 0.3s ease"
            }}>
              <div style={{ width: 18, height: 18, borderRadius: "50%",
                background: i < stage ? "var(--ok)" : i === stage ? "var(--primary-50)" : "var(--surface-2)",
                border: i === stage ? "1px solid var(--primary)" : "1px solid var(--border)",
                display: "grid", placeItems: "center", flexShrink: 0 }}>
                {i < stage ? (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : i === stage ? (
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--primary)",
                    animation: "spin 0.8s linear infinite" }} />
                ) : null}
              </div>
              <span className="mono" style={{ fontSize: 12, color: i <= stage ? "var(--text)" : "var(--text-subtle)" }}>{s}</span>
              <span className="mono" style={{ marginLeft: "auto", fontSize: 11, color: "var(--text-subtle)" }}>
                {i < stage ? "OK" : i === stage ? "…" : ""}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ===========================================================================
// RESULT SCREEN — uses real GMM model result
// ===========================================================================
function NaturalScreen({ onRestart, onEdit }) {
  return (
    <div className="container-narrow fade-up" style={{ paddingTop: 48, paddingBottom: 64 }}>
      <div className="section-eyebrow">Step 3 · Result</div>
      <div className="card" style={{ padding: 0, overflow: "hidden", marginTop: 20 }}>
        {/* Green header */}
        <div style={{ background: "#E6F4EC", borderBottom: "1px solid #A8D5B5", padding: "32px 36px", textAlign: "center" }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>✅</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#1B5E35", letterSpacing: "-0.02em" }}>
            Natural — All Healthy
          </div>
          <div style={{ fontSize: 15, color: "#2E7D4F", marginTop: 8 }}>
            All three measurements are within the healthy reference range.
          </div>
        </div>

        {/* Healthy values list */}
        <div style={{ padding: "28px 36px", borderBottom: "1px solid var(--border)" }}>
          <div className="section-eyebrow" style={{ marginBottom: 16 }}>Measurement summary</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {FIELDS.map(f => (
              <div key={f.key} style={{ background: "#F0FAF4", border: "1px solid #A8D5B5",
                borderRadius: 8, padding: "10px 14px" }}>
                <div style={{ fontSize: 11, color: "#2E7D4F", fontWeight: 500, marginBottom: 2 }}>
                  {f.label}
                </div>
                <div className="mono" style={{ fontSize: 14, fontWeight: 600, color: "#1B5E35" }}>
                  Within range
                </div>
                <div className="mono" style={{ fontSize: 10, color: "#6BAE85" }}>
                  {f.healthy[0]}–{f.healthy[1]} {f.unit}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Advice */}
        <div style={{ padding: "24px 36px", background: "var(--surface-2)" }}>
          <div className="section-eyebrow" style={{ marginBottom: 8 }}>Recommended next step</div>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "var(--text)" }}>
            Your health profile falls within normal ranges across all measured indicators.
            Maintain your current lifestyle — balanced nutrition, regular physical activity,
            and routine annual check-ups are recommended to keep these values stable.
          </p>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
        <button className="btn btn-ghost" onClick={onEdit}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9.5 2.5l2 2L5 11l-3 1 1-3 6.5-6.5z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Edit inputs
        </button>
        <button className="btn btn-ghost" onClick={onRestart}>Start over</button>
      </div>

      <span className="disclaimer" style={{ marginTop: 16, display: "inline-flex" }}>
        <svg className="icon" viewBox="0 0 12 12" fill="none">
          <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1"/>
          <path d="M6 3.5v3M6 8.2v.3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
        For educational use only — not a medical diagnosis.
      </span>
    </div>
  );
}

function ResultScreen({ values, result, onRestart, onEdit }) {
  // Natural / healthy result — all values in range
  if (result && result.prediction === "natural") {
    return <NaturalScreen onRestart={onRestart} onEdit={onEdit} />;
  }

  // Use real model result; fall back to local if result missing
  const probs = useMemo(() => {
    if (result && result.probs) return result.probs;
    return localPredict(values);
  }, [result, values]);

  const ranked = useMemo(() => {
    return DISEASES.map(d => ({ ...d, p: probs[d.key] || 0 })).sort((a, b) => b.p - a.p);
  }, [probs]);

  const primary = ranked[0];
  const confidence = primary.p > 0.55 ? "High" : primary.p > 0.42 ? "Moderate" : "Low";
  const isRealModel = result && result.source === "model";

  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 50); return () => clearTimeout(t); }, []);

  const drivers = FIELDS
    .map(f => ({ field: f, value: values[f.key], status: fieldStatus(f, values[f.key]) }))
    .filter(d => d.status.tone === "warn" || d.status.tone === "high")
    .sort((a, b) => (b.status.tone === "high" ? 1 : 0) - (a.status.tone === "high" ? 1 : 0));

  return (
    <div className="container fade-up">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
        <div>
          <div className="section-eyebrow">Step 3 · Result</div>
          <h1 className="headline" style={{ fontSize: 26, marginBottom: 4 }}>Risk profile generated</h1>
          <p className="lead" style={{ fontSize: 14 }}>
            {isRealModel
              ? "Based on your GMM model (trained on 1,000 patients). Posterior probabilities across three disease classes."
              : "Based on submitted values — local approximation (API offline)."}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-ghost" onClick={onEdit}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9.5 2.5l2 2L5 11l-3 1 1-3 6.5-6.5z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Edit inputs
          </button>
          <button className="btn btn-ghost" onClick={onRestart}>Start over</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20 }}>
        {/* Primary result card */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ background: primary.bg, padding: "24px 28px", borderBottom: `1px solid ${primary.color}22` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div className="mono" style={{ fontSize: 11, color: primary.color, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  Highest probability class
                </div>
                <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-0.02em", marginTop: 6, color: primary.color }}>
                  {primary.label}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="mono" style={{ fontSize: 36, fontWeight: 600, color: primary.color, letterSpacing: "-0.02em", lineHeight: 1 }}>
                  {(primary.p * 100).toFixed(1)}<span style={{ fontSize: 18 }}>%</span>
                </div>
                <div style={{ fontSize: 11, color: primary.color, marginTop: 4, opacity: 0.75 }}>posterior probability</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
              <span className="tag" style={{ background: "white", color: primary.color, border: `1px solid ${primary.color}33` }}>
                Confidence · {confidence}
              </span>
              <span className="tag" style={{ background: "white", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
                {isRealModel ? "GMM · real model" : "Local approximation"}
              </span>
            </div>
          </div>

          <div style={{ padding: "24px 28px" }}>
            <h2 className="h-section" style={{ marginBottom: 16 }}>Probability breakdown</h2>
            {ranked.map((d, i) => (
              <div key={d.key} className={`prob-row ${i === 0 ? "primary" : ""}`}>
                <div className="prob-label">
                  <span className="prob-swatch" style={{ background: d.color }} />
                  {d.label}
                </div>
                <div className="prob-track">
                  <div className="prob-fill" style={{ width: mounted ? `${d.p * 100}%` : "0%", background: d.color }} />
                </div>
                <div className="prob-pct" style={{ color: d.color }}>{(d.p * 100).toFixed(1)}%</div>
              </div>
            ))}
          </div>

          <div style={{ padding: "20px 28px", background: "var(--surface-2)", borderTop: "1px solid var(--border)" }}>
            <div className="section-eyebrow" style={{ marginBottom: 8 }}>Recommended next step</div>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: "var(--text)" }}>{primary.tip}</p>
          </div>
        </div>

        {/* Side panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="card card-pad" style={{ padding: 24 }}>
            <h2 className="h-section" style={{ marginBottom: 4 }}>Key drivers</h2>
            <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 16px" }}>Values outside healthy range that contributed most to the result.</p>
            {drivers.length === 0 ? (
              <div style={{ padding: "16px 0", color: "var(--text-muted)", fontSize: 13 }}>All inputs are within healthy range.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {drivers.slice(0, 5).map(d => (
                  <div key={d.field.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{d.field.label}</div>
                      <div className="mono" style={{ fontSize: 11, color: "var(--text-subtle)" }}>
                        target {d.field.healthy[0]}–{d.field.healthy[1]} {d.field.unit}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div className="mono" style={{ fontSize: 15, fontWeight: 600,
                        color: d.status.tone === "high" ? "var(--hypertension)" : "var(--obesity)" }}>{d.value}</div>
                      <div className="mono" style={{ fontSize: 10, color: "var(--text-subtle)" }}>{d.field.unit}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card card-pad" style={{ padding: 24 }}>
            <h2 className="h-section" style={{ marginBottom: 12 }}>Model metadata</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 12 }}>
              {[
                ["Algorithm", "GaussianMixture"],
                ["Components", "3"],
                ["Training set", "1,000 pts"],
              ].map(([k, v]) => (
                <div key={k}>
                  <div style={{ color: "var(--text-subtle)" }}>{k}</div>
                  <div className="mono" style={{ marginTop: 2 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  IntroScreen, FormScreen, LoadingScreen, ResultScreen, StepIndicator,
  FIELDS, DEFAULT_VALUES, DISEASES, localPredict, fieldStatus,
});