import React from 'react';

const PricingCard = ({ title, description, price, highlighted }) => {
  const bgGradient = 'linear-gradient(to bottom, #000000, #0900427f, #000000)';

  const border = highlighted ? 'border-blue-500' : 'border-[#ffffff2e]';
  const buttonBg = highlighted
    ? 'bg-blue-900 hover:bg-blue-800'
    : 'bg-blue-600 hover:bg-blue-700';

  return (
    <div
      className={`rounded-md p-6 shadow-lg flex flex-col border-2 transition relative overflow-hidden ${border}`}
      style={{ background: bgGradient }}
    >
      <h3 className="text-2xl font-semibold mb-4 text-white">{title}</h3>
      <p className="mb-6 text-gray-300">{description}</p>
      <p className="text-3xl font-bold mb-6 text-white">
  {price === "Contact Sales" ? price : `$${price}`}
  {price !== "Contact Sales" && (
    <span className="text-base font-normal text-gray-400">/mo</span>
  )}
</p>
      <button
        className={`mt-auto ${buttonBg} rounded-md px-5 py-3 font-semibold transition text-white`}
      >
        Choose Plan
      </button>

      {/* Subtle top-right glow */}
      <span
        className="absolute top-0 right-0 w-20 h-20 rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at top right, rgba(13, 27, 70, 0.5), transparent 70%)',
          filter: 'blur(20px)',
          transform: 'translate(30%, -30%)',
          zIndex: 0,
        }}
      />
    </div>
  );
};

export default PricingCard;
