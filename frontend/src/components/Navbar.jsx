"use client"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { logout } from "../redux/slices/authSlice"
import { Menu, User, LogOut, Bell } from "react-feather"

const Navbar = ({ toggleSidebar }) => {
  const { user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    dispatch(logout())
    navigate("/login")
  }

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleSidebar} 
            className="text-gray-600 hover:text-primary focus:outline-none"
            style={{ transition: 'color var(--transition-fast)' }}
          >
            <Menu size={22} />
          </button>
          <Link to="/dashboard" className="navbar-brand">
            TaskManager
          </Link>
        </div>

        {user && (
          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{user.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <button 
                className="relative p-2 rounded-full bg-light hover:bg-gray-200" 
                title="Notifications"
                style={{ transition: 'all var(--transition-fast)' }}
              >
                <Bell size={18} color="var(--text-secondary)" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full shadow-sm" 
                  style={{ boxShadow: '0 0 0 2px white' }}></span>
              </button>
              <Link 
                to="/profile" 
                className={`p-2 rounded-full ${location.pathname === '/profile' 
                  ? 'bg-primary/10 text-primary' 
                  : 'bg-light hover:bg-gray-200'}`}
                title="Profile"
                style={{ transition: 'all var(--transition-fast)' }}
              >
                <User size={18} color={location.pathname === '/profile' ? 'var(--primary)' : 'var(--text-secondary)'} />
              </Link>
              <button 
                onClick={handleLogout} 
                className="p-2 rounded-full bg-light hover:bg-danger/10 hover:text-danger" 
                title="Logout"
                style={{ transition: 'all var(--transition-fast)' }}
              >
                <LogOut size={18} color="var(--text-secondary)" />
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
