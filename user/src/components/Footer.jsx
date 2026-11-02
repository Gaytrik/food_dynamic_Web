import React from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Instagram,
  Facebook,
  Twitter,
  Utensils,
  Home,
  Menu,
  Users,
  Clock,
  HelpCircle
} from 'lucide-react';

// Reusable Footer Link
const FooterLink = ({ href = "#", children }) => (
  <a
    href={href}
    className="text-[var(--secondary)]/70 hover:text-[var(--primary)] transition-colors duration-200 hover:scale-103 text-sm py-0.5 block "
  >
    {children}
  </a>
);

const Footer = () => {
  const currentYear = new Date().getFullYear();

  // Helper component for Contact Info Items
  const ContactItem = ({ Icon, text, href = "#" }) => (
    <p className="flex items-start">
      <Icon className="w-4 h-4 text-[var(--secondary)] mr-2 mt-0.5 flex-shrink-0 hover:scale-110" />
      <a
        href={href}
        target={href.startsWith('http') ? "_blank" : "_self"}
        rel="noopener noreferrer"
        className="hover:text-[var(--primary)] transition hover:scale-105"
      >
        {text}
      </a>
    </p>
  );

  // Helper component for Social Icons
  const SocialIcon = ({ Icon, href, label }) => (
    <a 
      href={href} 
      aria-label={label} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="text-[var(--secondary)]/70 hover:text-[var(--primary)] transition p-1 rounded-full hover:scale-110 hover:bg-[var(--secondary)]/10"
    >
      <Icon className="w-5 h-5" />
    </a>
  );

  const SectionTitle = ({ children }) => (
    <h3 
      className="text-base font-extrabold text-[var(--secondary)] mb-3 inline-block"
     
    >
      {children}
    </h3>
  );

  return (
    <footer className="bg-[var(--accent)] text-[var(--secondary)] pt-12 pb-6">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Grid: Fully Responsive Layout */}
        {/* Mobile (sm): 2 cols | Tablet (md): 3 cols | Large (lg): 5 cols */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-y-8 gap-x-6 border-b border-[var(--primary)]/30 pb-3">
          
          {/* 1. Brand & Slogan Column (Takes 2 columns on all smaller screens, 2 on large) */}
          <div className="col-span-2 lg:col-span-2 pr-4">
            <div className="flex items-center text-3xl font-extrabold" style={{ color: 'var(--secondary)' }}>
              Aadhi Jevan
            </div>
            <p className="text-[var(--secondary)]/70 text-sm mt-3 mb-4 max-w-sm hover:scale-103 hover:text-[var(--primary)]">
              Aadhi Jevan provides high-quality, eco-friendly meals that fuel humans to perform better every day. Healthy, convenient, and kind to the planet.
            </p>
           
            
            {/* Social Icons */}
            <div className="flex space-x-3 mt-4">
              <SocialIcon Icon={Instagram} href="https://instagram.com" label="Instagram" />
              <SocialIcon Icon={Facebook} href="https://facebook.com" label="Facebook" />
              <SocialIcon Icon={Twitter} href="https://twitter.com" label="Twitter" />
            </div>
          </div>

          {/* 2. Quick Links (Takes 1 column) */}
          <div className="col-span-1"> 
            <SectionTitle>Quick Links</SectionTitle>
            <nav className="space-y-1">
              <FooterLink href="/"><Home className="w-4 h-4 inline-block mr-2" />Home</FooterLink>
              <FooterLink href="/menu"><Menu className="w-4 h-4 inline-block mr-2" />Our Meals</FooterLink>
              <FooterLink href="/about"><Users className="w-4 h-4 inline-block mr-2" />About Us</FooterLink>
              <FooterLink href="/support"><HelpCircle className="w-4 h-4 inline-block mr-2" />FAQ</FooterLink>
             
            </nav>
          </div>

          {/* 3. Opening Hours (Takes 1 column) */}
          <div className="col-span-1">
            <SectionTitle>Opening Hours</SectionTitle>
           <div className="space-y-1 text-sm text-[var(--secondary)]/70">
  <div className="flex items-center text-[var(--secondary)] font-semibold mb-1">
    <Clock className="w-4 h-4 mr-2" /> Daily Schedule
  </div>
  <p className='hover:scale-105 hover:text-[var(--primary)]'><span className="font-medium ">Mon - Fri :</span> <span className="ml-1">9:00 AM - 9:00 PM</span></p>
  <p className='hover:scale-105 hover:text-[var(--primary)]'><span className="font-medium ">Saturday :</span> <span className="ml-1">10:00 AM - 7:00 PM</span></p>
  <p className='hover:scale-105 hover:text-[var(--primary)]'><span className="font-medium ">Sunday :</span> <span className="ml-1">Closed</span></p>
</div>

          </div>

          {/* 4. Get In Touch (Takes 2 columns on mobile, 1 on tablet/large) */}
          <div className="col-span-2 md:col-span-1"> 
            <SectionTitle>Get In Touch</SectionTitle>
            <div className="space-y-3 text-sm text-[var(--secondary)]/70">
              <ContactItem 
                Icon={MapPin} 
                text="101, Aadhi Tower, Tech Park, Mumbai, 400072" 
                href="https://maps.google.com/?q=101,+Aadhi+Tower,+Tech+Park,+Mumbai,+400072"
              />
              <ContactItem 
                Icon={Phone} 
                text="+91 98765 43210" 
                href="tel:+919876543210"
              />
              <ContactItem 
                Icon={Mail} 
                text="support@aadhijeevan.in" 
                href="mailto:support@aadhijeevan.in"
              />
            </div>
          </div>
        </div>

        {/* Bottom Section (Copyright) */}
        <div className="pt-6 text-center text-xs text-[var(--secondary)]/60">
          © {currentYear} <span className="text-[var(--secondary)] font-semibold">Aadhi Jevan</span>. All Rights Reserved. |
          Designed by{" "}
          <a
            href="https://rbrickkstechnology.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--secondary)] font-semibold hover:text-[var(--primary)] hover:scale-105 "
          >
            Rbrickks Technology
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;