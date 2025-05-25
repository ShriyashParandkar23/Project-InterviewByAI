import React,{useState} from 'react'
import { Link } from 'react-router-dom';

const Navbar = () => {
    const [navOpen, setNavOpen] = useState(false);

  return (
    <nav className="w-full px-6 py-4 flex justify-between items-center bg-[#000000] fixed top-0 z-50">
    <Link to="/" >
    <div className="text-xl font-bold tracking-wide">
      Radison AI Interview
    </div>
    </Link>

    {/* Hamburger menu - mobile */}
    <button
      onClick={() => setNavOpen(!navOpen)}
      className="sm:hidden focus:outline-none"
      aria-label="Toggle menu"
    >
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        {navOpen ? (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        ) : (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        )}
      </svg>
    </button>

    {/* Desktop & Mobile menu */}
    <ul
      className={`sm:flex sm:items-center sm:space-x-6 absolute sm:static top-16 left-0 w-full sm:w-auto bg-black sm:bg-transparent transition-all duration-300 ease-in ${
        navOpen ? "block" : "hidden"
      }`}
    >
      <li>
        <a href="#features" className="block px-4 py-2 hover:text-blue-400">
          Features
        </a>
      </li>
      <li>
        <a
          href="#how-it-works"
          className="block px-4 py-2 hover:text-blue-400"
        >
          How It Works
        </a>
      </li>
      <li>
        <a href="#pricing" className="block px-4 py-2 hover:text-blue-400">
          Pricing
        </a>
      </li>
      <li>
        <a href="#contact" className="block px-4 py-2 hover:text-blue-400">
          Contact
        </a>
      </li>
    </ul>
  </nav>  )
}

export default Navbar