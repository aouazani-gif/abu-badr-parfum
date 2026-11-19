
import { useState } from 'react'

function Navbar({ cartCount, language, setLanguage }) {
  const isArabic = language === 'ar'
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = () => setMenuOpen(false)

  return (
    <nav className="navbar">

      <a
        href="#"
        className="navbar-brand"
        aria-label="Abu Badr Parfum Home"
        onClick={closeMenu}
      >
        <img
          src="/abu-badr-logo.jpg"
          alt="Abu Badr Parfum"
          className="navbar-logo"
        />
      </a>

      <button
        type="button"
        className="mobile-menu-toggle"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={menuOpen}
      >
        <span />
        <span />
        <span />
      </button>

      <ul className={`nav-links ${menuOpen ? 'is-open' : ''}`}>

        <li>
          <a href="#" onClick={closeMenu}>
            {isArabic ? 'الرئيسية' : 'Home'}
          </a>
        </li>

        <li>
          <a href="#products" onClick={closeMenu}>
            {isArabic ? 'العطور' : 'Perfumes'}
          </a>
        </li>

        <li>
          <a href="#cart" onClick={closeMenu}>
            {isArabic
              ? `السلة (${cartCount})`
              : `Cart (${cartCount})`}
          </a>
        </li>

        <li>
          <button
            type="button"
            onClick={() => {
              setLanguage(isArabic ? 'en' : 'ar')
              closeMenu()
            }}
            className="language-switch"
            aria-label={isArabic ? 'Switch to English' : 'التبديل إلى العربية'}
          >
            {isArabic ? 'EN 🇬🇧' : 'AR 🇩🇿'}
          </button>
        </li>

      </ul>

    </nav>
  )
}

export default Navbar
