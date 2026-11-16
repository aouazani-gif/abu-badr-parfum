
function Navbar({ cartCount }) {
  return (
    <nav className="navbar">
      <a href="#" className="navbar-brand" aria-label="Abu Badr Parfum Home">
        <img
          src="/abu-badr-logo.jpg"
          alt="Abu Badr Parfum"
          className="navbar-logo"
        />
      </a>

      <ul className="nav-links">
        <li>
          <a href="#">Home</a>
        </li>
        <li>
          <a href="#products">Perfumes</a>
        </li>
        <li>
          <a href="#cart">Cart ({cartCount})</a>
        </li>
      </ul>
    </nav>
  )
}

export default Navbar
