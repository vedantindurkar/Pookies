import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav style={{ padding: "10px", background: "#333", color: "white" }}>
      <h2>CoupleGram</h2>
      <ul style={{ display: "flex", listStyle: "none", gap: "15px" }}>
        <li>
          <Link to="/" style={{ color: "white", textDecoration: "none" }}>
            Home
          </Link>
        </li>
        <li>
          <Link to="/login" style={{ color: "white", textDecoration: "none" }}>
            Login
          </Link>
        </li>
        <li>
          <Link
            to="/register"
            style={{ color: "white", textDecoration: "none" }}
          >
            Register
          </Link>
        </li>
        <li>
          <Link
            to="/profile"
            style={{ color: "white", textDecoration: "none" }}
          >
            Profile
          </Link>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
