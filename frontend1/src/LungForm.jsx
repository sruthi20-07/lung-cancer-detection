import { useState } from "react";

export default function LungForm() {
  const fields = [
    "Gender","Age","Smoking","Yellow Fingers","Anxiety","Peer Pressure",
    "Chronic Disease","Fatigue","Allergy","Wheezing","Alcohol Consuming",
    "Coughing","Shortness of Breath","Swallowing Difficulty","Chest Pain"
  ];

  const [values, setValues] = useState(Array(15).fill(""));
  const [errors, setErrors] = useState(Array(15).fill(""));
  const [popup, setPopup] = useState(null);

  function validate(i, val) {
    let msg = "";
    const n = Number(val);
    if (val === "") return "";
    if (i === 0 && !(n === 0 || n === 1)) msg = "Only 0 or 1";
    else if (i === 1 && (n < 1 || n > 120)) msg = "Age 1–120";
    else if (i > 1 && !(n === 1 || n === 2)) msg = "Only 1 or 2";
    return msg;
  }

  function handleChange(i, val) {
    const v = [...values];
    v[i] = val;
    setValues(v);

    const e = [...errors];
    e[i] = validate(i, val);
    setErrors(e);
  }

  async function submit() {
    let valid = true;
    let e = [...errors];

    for (let i = 0; i < 15; i++) {
      if (!values[i]) { e[i] = "Required"; valid = false; }
      if (e[i]) valid = false;
    }
    setErrors(e);
    if (!valid) return;

    const data = values.map(Number);

    // 🔴 FIX: Send all required backend fields
    const res = await fetch("http://127.0.0.1:8000/predict", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({
        name: "Demo User",
        age: data[1],
        symptoms: "N/A",
        features: data
      })
    });

    const r = await res.json();

    const symptoms = data.slice(2);
    const allNo = symptoms.every(v => v === 1);

    if (allNo) {
      setPopup({ 
        type: "safe", 
        message: "Lung cancer NOT DETECTED — No significant signs observed"
      });
    }
    else if (r.prediction === "High Risk") {
      setPopup({ 
        type: "danger", 
        message: "Lung cancer DETECTED — High risk. Immediate medical consultation advised."
      });
    }
    else {
      setPopup({ 
        type: "safe", 
        message: "Lung cancer NOT DETECTED — No significant signs observed"
      });
    }
  }

  function reset() {
    setValues(Array(15).fill(""));
    setErrors(Array(15).fill(""));
    setPopup(null);
  }

  return (
    <div style={{background:"#e8f0f8",minHeight:"100vh",padding:"30px"}}>

      {/* Sticky Legend */}
      <div style={legendBox}>
        <b>Legend</b><br/>
        <span style={badge}>0</span> Female &nbsp;
        <span style={badge}>1</span> Male<br/><br/>
        <span style={badge}>1</span> No &nbsp;
        <span style={badge}>2</span> Yes
      </div>

      {/* Main Card */}
      <div style={card}>
        <h2 style={{textAlign:"center",color:"#0a2c5c"}}>
          Lung Cancer Risk Prediction
        </h2>

        {fields.map((f,i)=>(
          <div key={i} style={{marginBottom:14}}>
            <label style={{fontWeight:600}}>{f}</label>
            <input
              value={values[i]}
              onChange={e=>handleChange(i,e.target.value)}
              style={inputStyle}
            />
            <div style={{color:"#dc2626",fontSize:12}}>
              {errors[i]}
            </div>
          </div>
        ))}

        <div style={{display:"flex",gap:12}}>
          <button onClick={submit} style={btnPrimary}>Predict</button>
          <button onClick={reset} style={btnSecondary}>Reset</button>
        </div>
      </div>

      {/* Popup Modal */}
      {popup && (
        <div style={overlay}>
          <div style={{
            ...popupBox,
            borderColor: popup.type === "danger" ? "#dc2626" : "#16a34a"
          }}>
            <span onClick={()=>setPopup(null)} style={closeBtn}>×</span>
            <h3 style={{
              color: popup.type === "danger" ? "#dc2626" : "#16a34a"
            }}>
              {popup.message}
            </h3>
          </div>
        </div>
      )}

    </div>
  );
}

/* Styles */
const card = {
  maxWidth:620, margin:"auto", background:"white",
  padding:30, borderRadius:14,
  boxShadow:"0 0 20px rgba(0,0,0,.15)"
};

const inputStyle = {
  width:"100%", padding:9,
  borderRadius:6, border:"1px solid #cbd5e1", marginTop:4
};

const btnPrimary = {
  flex:1, padding:12,
  background:"#0a2c5c", color:"white",
  border:"none", borderRadius:8, fontSize:15
};

const btnSecondary = {
  flex:1, padding:12,
  background:"#6b7280", color:"white",
  border:"none", borderRadius:8, fontSize:15
};

const legendBox = {
  position:"fixed", top:20, right:20, background:"white",
  padding:"14px 18px", borderRadius:10,
  boxShadow:"0 0 12px rgba(0,0,0,.15)", fontSize:13
};

const badge = {
  background:"#0a2c5c",
  color:"white", padding:"3px 7px",
  borderRadius:5, fontSize:12
};

const overlay = {
  position:"fixed", inset:0, background:"rgba(0,0,0,.4)",
  display:"flex", justifyContent:"center", alignItems:"center"
};

const popupBox = {
  background:"white", padding:30, borderRadius:12,
  width:360, textAlign:"center", border:"3px solid"
};

const closeBtn = {
  position:"absolute", top:12, right:16,
  cursor:"pointer", fontSize:22
};
