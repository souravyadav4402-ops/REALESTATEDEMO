import { ImageResponse } from "next/og";

export const alt = "Parcel & Form India — turning Indian square feet into global objects of desire";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width:"100%", height:"100%", display:"flex", flexDirection:"column", justifyContent:"space-between", padding:"64px 72px", color:"#f9f8f6", background:"linear-gradient(130deg,#17241f,#1a1a18)" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", fontSize:24 }}><span>PARCEL &amp; FORM · INDIA</span><span style={{ color:"#c5a059", fontSize:16 }}>LUXURY REAL ESTATE</span></div>
      <div style={{ display:"flex", flexWrap:"wrap", maxWidth:950, fontFamily:"serif", fontSize:76, lineHeight:.95, letterSpacing:"-3px" }}>Turning Indian Square Feet into <span style={{ color:"#c5a059", fontStyle:"italic", marginLeft:"18px" }}>Global Objects of Desire.</span></div>
      <div style={{ display:"flex", justifyContent:"space-between", paddingTop:24, borderTop:"1px solid rgba(255,255,255,.3)", fontSize:16 }}><span>MUMBAI · BENGALURU · LONDON</span><span>PARCELANDFORM.IN</span></div>
    </div>, size,
  );
}
