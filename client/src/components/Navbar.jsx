
function Navbar({ cartCount }) {
  return (
    <nav className="navbar">
      <div className="logo">
        ABU BADR <span>PARFUM</span>
      </div>

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
