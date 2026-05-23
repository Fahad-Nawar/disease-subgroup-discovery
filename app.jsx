// Main app — state machine

const { useState, useEffect } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "clinical",
  "showStepper": true
}/*EDITMODE-END*/;

const THEMES = {
  clinical:  { label: "Clinical Blue", "--primary": "#1F4E8C", "--primary-700": "#163A6B", "--primary-50": "#EAF1FB" },
  sage:      { label: "Sage Clinic",   "--primary": "#3B6E5A", "--primary-700": "#264A3D", "--primary-50": "#E6F0EC" },
  graphite:  { label: "Graphite",      "--primary": "#2A2F38", "--primary-700": "#16191F", "--primary-50": "#ECEDEF" },
};

function applyTheme(name) {
  const t = THEMES[name] || THEMES.clinical;
  Object.entries(t).forEach(([k, v]) => {
    if (k.startsWith("--")) document.documentElement.style.setProperty(k, v);
  });
}

function App() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [screen, setScreen] = useState("intro"); // intro | form | loading | result
  const [values, setValues] = useState(DEFAULT_VALUES);
  const [result, setResult] = useState(null);    // real GMM prediction result

  useEffect(() => { applyTheme(tweaks.theme); }, [tweaks.theme]);

  const stepIndex = screen === "form" ? 0 : screen === "loading" ? 1 : screen === "result" ? 2 : -1;

  const go = {
    start:   () => setScreen("form"),
    submit:  () => setScreen("loading"),
    done:    (r) => { setResult(r); setScreen("result"); },   // receives real model result
    edit:    () => setScreen("form"),
    restart: () => { setValues(DEFAULT_VALUES); setResult(null); setScreen("intro"); },
    reset:   () => setValues(DEFAULT_VALUES),
  };

  return (
    <div className="app" data-screen-label={
      screen === "intro" ? "01 Intro" : screen === "form" ? "02 Inputs" :
      screen === "loading" ? "03 Analysis" : "04 Result"
    }>
      {/* Top bar */}
      <div className="topbar">
        <div className="brand">
          <div className="brand-mark">A</div>
          <div>
            Aegis Health
            <span style={{ color: "var(--text-subtle)", fontWeight: 400, marginLeft: 8, fontSize: 12 }}>Risk Predictor</span>
          </div>
        </div>
        <div className="nav-right">
          <span><span className="dot"></span>Model online</span>
          <span className="mono" style={{ fontSize: 12 }}>v2.1.0</span>
          <span style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--primary-50)",
            color: "var(--primary)", display: "grid", placeItems: "center", fontSize: 12, fontWeight: 600 }}>DR</span>
        </div>
      </div>

      {tweaks.showStepper && screen !== "intro" && <StepIndicator current={stepIndex} />}

      <div className="main">
        {screen === "intro"   && <IntroScreen onStart={go.start} />}
        {screen === "form"    && <FormScreen values={values} setValues={setValues} onSubmit={go.submit} onReset={go.reset} />}
        {screen === "loading" && <LoadingScreen values={values} onDone={go.done} />}
        {screen === "result"  && <ResultScreen values={values} result={result} onRestart={go.restart} onEdit={go.edit} />}
      </div>

      <div className="footer">
        <span>© 2026 Aegis Health Systems · Clinical Decision Support</span>
        <span className="mono">Session secured · Inputs not retained</span>
      </div>

      <TweaksPanel>
        <TweakSection title="Theme">
          <TweakRadio label="Color palette" value={tweaks.theme} onChange={v => setTweak("theme", v)}
            options={[{value:"clinical",label:"Clinical"},{value:"sage",label:"Sage"},{value:"graphite",label:"Graphite"}]} />
        </TweakSection>
        <TweakSection title="Layout">
          <TweakToggle label="Show step indicator" value={tweaks.showStepper} onChange={v => setTweak("showStepper", v)} />
        </TweakSection>
        <TweakSection title="Flow">
          <TweakButton label="Reset to intro" onClick={go.restart} />
          <TweakButton label="Jump to result" onClick={() => { setValues(DEFAULT_VALUES); setResult(null); setScreen("result"); }} />
          <TweakButton label="Replay analysis" onClick={() => setScreen("loading")} />
        </TweakSection>
        <TweakSection title="Try a profile">
          <TweakButton label="Low risk" onClick={() => { setValues({age:35,bmi:22,glucose:88,chol:175,sbp:112,dbp:72,hr:65,kcal:2100,activity:240}); setScreen("form"); }} />
          <TweakButton label="Hypertensive" onClick={() => { setValues({age:58,bmi:29,glucose:142,chol:235,sbp:152,dbp:94,hr:84,kcal:2800,activity:60}); setScreen("form"); }} />
          <TweakButton label="Diabetic profile" onClick={() => { setValues({age:47,bmi:33,glucose:178,chol:220,sbp:128,dbp:82,hr:76,kcal:3100,activity:45}); setScreen("form"); }} />
          <TweakButton label="Obesity profile" onClick={() => { setValues({age:39,bmi:36,glucose:108,chol:245,sbp:124,dbp:80,hr:78,kcal:3600,activity:30}); setScreen("form"); }} />
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);