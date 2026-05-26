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
            <span style={{ color: "var(--text-subtle)", fontWeight: 400, fontSize: 12 }}>Risk Predictor</span>
          </div>
        </div>
        <div className="nav-right">
          <span><span className="dot"></span>Model online</span>
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
          <TweakButton label="All healthy"      onClick={() => { setValues({bmi:22.0, glucose:88,  sbp:112}); setScreen("form"); }} />
          <TweakButton label="Hypertensive"     onClick={() => { setValues({bmi:27.0, glucose:105, sbp:158}); setScreen("form"); }} />
          <TweakButton label="Diabetic profile" onClick={() => { setValues({bmi:31.0, glucose:178, sbp:128}); setScreen("form"); }} />
          <TweakButton label="Obesity profile"  onClick={() => { setValues({bmi:36.5, glucose:108, sbp:124}); setScreen("form"); }} />
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);