import { Link } from "react-router-dom";
import { 
    Mail, 
    Instagram, 
    X, 
} from "lucide-react";

function Footer() {
  return (
    <footer className="w-full py-6 flex items-center justify-between text-gray-300 text-responsive-regular">
      {/* Left: Logo & Links */}
      <div className="flex items-center gap-8">
        <Link 
          to="/" 
          className="text-white font-['Lexend-Bold',sans-serif] text-2xl font-bold tracking-tight transition-colors duration-200 hover:text-[#fff] hover:brightness-150"
        >
          kebbu
        </Link>
        <Link to="/about" className="text-[#a2a2a2] hover:text-white transition">About Us</Link>
        <Link to="/terms" className="text-[#a2a2a2] hover:text-white transition">Terms & Conditions</Link>
        <Link to="/privacy" className="text-[#a2a2a2] hover:text-white transition">Privacy Policy</Link>
      </div>
      {/* Right: Social Icons */}
      <div className="flex items-center gap-6">
        <a href="mailto:kebbu.workspace@gmail.com" target="_blank" rel="noopener noreferrer" className="text-[#a2a2a2] hover:text-white transition"><Mail size={22} /></a>
        <a href="https://instagram.com/kebbu.id" target="_blank" rel="noopener noreferrer" className="text-[#a2a2a2] hover:text-white transition"><Instagram size={22} /></a>
        <a href="https://x.com/kebbu_id" target="_blank" rel="noopener noreferrer" className="text-[#a2a2a2] hover:text-white transition"><X size={22} /></a>
      </div>
    </footer>
  );
}

export default Footer;
