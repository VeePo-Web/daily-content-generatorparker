import { Link } from "react-router-dom";
import FooterEmailCapture from "./FooterEmailCapture";
import veepoLogo from "@/assets/veepo-logo.png";

const Footer = () => {
  return (
    <footer className="w-full bg-stone-900 text-white pt-12 md:pt-16 pb-4 px-4 xs:px-6 safe-area-bottom">
      <div className="">
        {/* Email Capture Section */}
        <FooterEmailCapture />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 mb-8">
          {/* Brand - Left side */}
          <div>
            <h2 className="text-xl md:text-2xl font-light mb-4 tracking-wide">
              LINE OF <span className="text-champagne-500">JUDAH</span>
            </h2>
            <p className="text-sm font-light text-white/70 leading-relaxed max-w-md mb-6">
              For those who walk different. If you're not for us, that's okay — this isn't for everyone.
            </p>
            
            {/* Contact Information */}
            <div className="space-y-2 text-sm font-light text-white/70">
              <div>
                <p className="font-normal text-white mb-1">Contact Us</p>
                <a href="mailto:hello@lineofjudah.com" className="hover:text-champagne-500 transition-colors touch-target-sm inline-flex items-center">
                  hello@lineofjudah.com
                </a>
              </div>
              {/* Social Links - Larger touch targets */}
              <div className="flex gap-6 mt-4">
                <a 
                  href="https://instagram.com/lineofjudahwear" 
                  className="text-white/70 hover:text-champagne-500 transition-colors touch-target-sm py-2"
                  aria-label="Instagram"
                >
                  Instagram
                </a>
                <a 
                  href="https://tiktok.com/@lineofjudah" 
                  className="text-white/70 hover:text-champagne-500 transition-colors touch-target-sm py-2"
                  aria-label="TikTok"
                >
                  TikTok
                </a>
                <a 
                  href="https://youtube.com/@lineofjudah" 
                  className="text-white/70 hover:text-champagne-500 transition-colors touch-target-sm py-2"
                  aria-label="YouTube"
                >
                  YouTube
                </a>
              </div>
            </div>
          </div>

          {/* Link lists - Right side */}
          <div className="grid grid-cols-2 xs:grid-cols-3 gap-6 md:gap-8">
            {/* Shop */}
            <div>
              <h4 className="text-sm font-normal text-white mb-3 md:mb-4">Shop</h4>
              <ul className="space-y-1">
                <li>
                  <Link to="/category/tees" className="text-sm font-light text-white/70 hover:text-champagne-500 transition-colors touch-target-sm py-2 inline-block">
                    T-Shirts
                  </Link>
                </li>
                <li>
                  <Link to="/category/hoodies" className="text-sm font-light text-white/70 hover:text-champagne-500 transition-colors touch-target-sm py-2 inline-block">
                    Hoodies
                  </Link>
                </li>
                <li>
                  <Link to="/category/accessories" className="text-sm font-light text-white/70 hover:text-champagne-500 transition-colors touch-target-sm py-2 inline-block">
                    Accessories
                  </Link>
                </li>
                <li>
                  <Link to="/category/sale" className="text-sm font-light text-white/70 hover:text-champagne-500 transition-colors touch-target-sm py-2 inline-block">
                    Sale
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-sm font-normal text-white mb-3 md:mb-4">Support</h4>
              <ul className="space-y-1">
                <li>
                  <Link to="/faq" className="text-sm font-light text-white/70 hover:text-champagne-500 transition-colors touch-target-sm py-2 inline-block">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link to="/shipping" className="text-sm font-light text-white/70 hover:text-champagne-500 transition-colors touch-target-sm py-2 inline-block">
                    Shipping
                  </Link>
                </li>
                <li>
                  <Link to="/returns" className="text-sm font-light text-white/70 hover:text-champagne-500 transition-colors touch-target-sm py-2 inline-block">
                    Returns
                  </Link>
                </li>
                <li>
                  <Link to="/about/size-guide" className="text-sm font-light text-white/70 hover:text-champagne-500 transition-colors touch-target-sm py-2 inline-block">
                    Size Guide
                  </Link>
                </li>
                <li className="hidden xs:block">
                  <Link to="/accessibility" className="text-sm font-light text-white/70 hover:text-champagne-500 transition-colors touch-target-sm py-2 inline-block">
                    Accessibility
                  </Link>
                </li>
              </ul>
            </div>

            {/* About */}
            <div className="col-span-2 xs:col-span-1">
              <h4 className="text-sm font-normal text-white mb-3 md:mb-4">About</h4>
              <ul className="space-y-1">
                <li>
                  <Link to="/about/our-story" className="text-sm font-light text-white/70 hover:text-champagne-500 transition-colors touch-target-sm py-2 inline-block">
                    Our Mission
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-sm font-light text-white/70 hover:text-champagne-500 transition-colors touch-target-sm py-2 inline-block">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link to="/ambassador" className="text-sm font-light text-white/70 hover:text-champagne-500 transition-colors touch-target-sm py-2 inline-block">
                    Ambassadors
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom section - edge to edge separator */}
      <div className="border-t border-white/10 -mx-4 xs:-mx-6 px-4 xs:px-6 pt-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-xs md:text-sm font-light text-white/50 text-center md:text-left">
            © 2026 Line of Judah. All rights reserved.
          </p>
          <div className="flex space-x-4 md:space-x-6">
            <Link to="/privacy-policy" className="text-xs md:text-sm font-light text-white/50 hover:text-champagne-500 transition-colors touch-target-sm py-2">
              Privacy Policy
            </Link>
            <Link to="/terms-of-service" className="text-xs md:text-sm font-light text-white/50 hover:text-champagne-500 transition-colors touch-target-sm py-2">
              Terms of Service
            </Link>
          </div>
        </div>
        <div className="border-t border-white/5 mt-4 pt-4">
          <a
            href="https://veepo.ca/case-studies"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center justify-center gap-1.5 transition-all duration-500 hover:scale-[1.02]"
            aria-label="Visit VeePo case studies"
          >
            <p className="text-xs tracking-[0.15em] uppercase text-white/40 transition-colors duration-500">
              This{' '}
              <span className="transition-colors duration-500 group-hover:text-[#FF6B35]">Vision</span>
              {' '}Is{' '}
              <span className="transition-colors duration-500 group-hover:text-[#4CAF50]">Powered</span>
              {' '}By
            </p>
            <img
              src={veepoLogo}
              alt="veepo.ca — Where Vision Meets Precision"
              className="h-8 w-auto transition-all duration-500 opacity-50 group-hover:opacity-100 group-hover:brightness-125"
            />
            <span className="text-[10px] tracking-[0.2em] uppercase text-white/30 group-hover:text-white/60 transition-colors duration-500">veepo.ca</span>
            <span className="text-[9px] tracking-[0.15em] italic text-white/20 group-hover:text-white/40 transition-colors duration-500">Where Vision Meets Precision</span>
            {/* Gradient underline reveal */}
            <span className="block h-px w-24 bg-gradient-to-r from-[#FF6B35] to-[#4CAF50] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;