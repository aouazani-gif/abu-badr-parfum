
function Navbar({ cartCount, language, setLanguage }) {
  const isArabic = language === 'ar'

  return (
    <nav className="navbar">

      <a
        href="#"
        className="navbar-brand"
        aria-label="Abu Badr Parfum Home"
      >
        <img
          src="/abu-badr-logo.jpg"
          alt="Abu Badr Parfum"
          className="navbar-logo"
        />
      </a>

      <ul className="nav-links">

        <li>
          <a href="#">
            {isArabic ? 'الرئيسية' : 'Home'}
          </a>
        </li>

        <li>
          <a href="#products">
            {isArabic ? 'العطور' : 'Perfumes'}
          </a>
        </li>

        <li>
          <a href="#cart">
            {isArabic
              ? `السلة (${cartCount})`
              : `Cart (${cartCount})`}
          </a>
        </li>

        <li>
          <button
            type="button"
            onClick={() => setLanguage(isArabic ? 'en' : 'ar')}
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
