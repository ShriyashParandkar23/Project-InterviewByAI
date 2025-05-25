import React from 'react'

const FeatureCard = ({heading,text}) => {
    console.log(heading,text)
  return (
    <>
       {/* Card 1 */}
<div
  className="rounded-md p-6 border border-[#ffffff2e] shadow-lg hover:shadow-xl transition relative overflow-hidden"
  style={{
    background: "linear-gradient(to bottom left, rgba(13, 27, 70, 0.6), #000000 90%)",
  }}
>
  <h3 className="text-xl font-semibold mb-3">{heading}</h3>
  <p>
    {text}
  </p>

  {/* Optional: add a subtle blue glow circle at top-right */}
  <span
    className="absolute top-0 right-0 w-20 h-20 rounded-full pointer-events-none"
    style={{
      background:
        "radial-gradient(circle at top right, rgba(13, 27, 70, 0.5), transparent 70%)",
      filter: "blur(20px)",
      transform: "translate(30%, -30%)",
      zIndex: 0,
    }}
  />
</div>

    </>
  )
}

export default FeatureCard