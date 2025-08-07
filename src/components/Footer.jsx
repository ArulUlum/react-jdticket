import { Link } from "react-router-dom";
import { 
    Mail, 
    Instagram, 
    X, 
} from "lucide-react";

function Footer() {
  return (
    <footer className="max-w-3xl px-6 mx-auto w-full pt-5 pb-2 flex items-center justify-between text-gray-300 text-xs">
      {/* Left: Logo & Links */}
      <div className="flex items-center gap-8">
        <Link 
          to="/" 
          className="text-white font-['Lexend-Bold',sans-serif] text-xl font-bold tracking-tight transition-colors duration-200 hover:text-[#fff] hover:brightness-150"
        >
          kebbu
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/about" className="text-[#a2a2a2] hover:text-white transition">About Us</Link>
          <Link to="/terms" className="text-[#a2a2a2] hover:text-white transition">Terms & Conditions</Link>
          <Link to="/privacy" className="text-[#a2a2a2] hover:text-white transition">Privacy Policy</Link>
        </div>
      </div>
      {/* Right: Social Icons */}
      <div className="flex items-center gap-6">
        <a href="mailto:kebbu.workspace@gmail.com" target="_blank" rel="noopener noreferrer" className="text-[#a2a2a2] hover:text-white transition"><Mail size={15} /></a>
        <a href="https://instagram.com/kebbu.id" target="_blank" rel="noopener noreferrer" className="text-[#a2a2a2] hover:text-white transition"><Instagram size={15} /></a>
        <a href="https://x.com/kebbu_id" target="_blank" rel="noopener noreferrer" className="text-[#a2a2a2] hover:text-white transition"><X size={15} /></a>
      </div>
    </footer>
  );
}

export default Footer;
