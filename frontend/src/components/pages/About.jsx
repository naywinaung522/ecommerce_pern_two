// frontend/src/components/pages/About.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/About.css';

const About = () => {
  const [activeTab, setActiveTab] = useState('about');

  return (
    <div className="about-container">
      <h2 className="page-title">About Us</h2>
      
      {/* Tab Navigation */}
      <div className="about-tabs">
        <button 
          className={`tab-btn ${activeTab === 'about' ? 'active' : ''}`}
          onClick={() => setActiveTab('about')}
        >
          About Me
        </button>
        <button 
          className={`tab-btn ${activeTab === 'terms' ? 'active' : ''}`}
          onClick={() => setActiveTab('terms')}
        >
          Terms & Conditions
        </button>
        <button 
          className={`tab-btn ${activeTab === 'privacy' ? 'active' : ''}`}
          onClick={() => setActiveTab('privacy')}
        >
          Privacy Policy
        </button>
      </div>

      {/* Content Sections */}
      <div className="about-content">
        {activeTab === 'about' && <AboutMe />}
        {activeTab === 'terms' && <TermsConditions />}
        {activeTab === 'privacy' && <PrivacyPolicy />}
      </div>
    </div>
  );
};

// About Me Component
const AboutMe = () => {
  return (
    <div className="about-section">
      <div className="about-header">
        <div className="about-avatar">👨‍💻</div>
        <h2>Hi, I'm Your E-Commerce Developer</h2>
        <p className="subtitle">Building the future of online shopping</p>
      </div>

      <div className="about-grid">
        <div className="about-card">
          <h3>🚀 My Mission</h3>
          <p>
            To create seamless, secure, and enjoyable online shopping experiences 
            that connect customers with the products they love. I believe in 
            building platforms that are not only functional but also delightful 
            to use.
          </p>
        </div>

        <div className="about-card">
          <h3>💡 My Vision</h3>
          <p>
            To revolutionize e-commerce by combining cutting-edge technology 
            with user-centric design. I strive to make online shopping accessible, 
            trustworthy, and convenient for everyone, everywhere.
          </p>
        </div>

        <div className="about-card">
          <h3>🛠️ Technologies I Use</h3>
          <div className="tech-stack">
            <span className="tech-tag">React</span>
            <span className="tech-tag">Node.js</span>
            <span className="tech-tag">Express</span>
            <span className="tech-tag">PostgreSQL</span>
            <span className="tech-tag">JavaScript</span>
            <span className="tech-tag">HTML/CSS</span>
            <span className="tech-tag">JWT</span>
            <span className="tech-tag">REST API</span>
          </div>
        </div>

        <div className="about-card">
          <h3>📫 Let's Connect</h3>
          <div className="social-links-about">
            <a href="mailto:info@ecommerce.com" className="social-link">
              📧 Email: info@ecommerce.com
            </a>
            <a href="tel:+15551234567" className="social-link">
              📞 Phone: +1 (555) 123-4567
            </a>
            <a href="https://wa.me/15551234567" target="_blank" rel="noopener noreferrer" className="social-link">
              💬 WhatsApp: +1 (555) 123-4567
            </a>
            <a href="#" className="social-link">
              💼 LinkedIn
            </a>
            <a href="#" className="social-link">
              🐙 GitHub
            </a>
          </div>
        </div>
      </div>

      <div className="about-story">
        <h3>📖 My Story</h3>
        <p>
          I'm a passionate full-stack developer with a love for creating 
          elegant, efficient, and user-friendly web applications. This 
          e-commerce platform is a testament to my commitment to quality 
          and innovation in web development.
        </p>
        <p>
          With expertise in the PERN stack (PostgreSQL, Express, React, Node.js), 
          I've built this platform from the ground up to demonstrate best 
          practices in modern web development, including:
        </p>
        <ul>
          <li>✅ Secure user authentication with JWT</li>
          <li>✅ Responsive and intuitive user interface</li>
          <li>✅ Robust backend API architecture</li>
          <li>✅ Efficient database design</li>
          <li>✅ Multiple payment options including Cash on Delivery</li>
          <li>✅ Complete order management system</li>
        </ul>
        <p>
          Whether you're a customer looking for great products or a developer 
          seeking inspiration, I hope this platform serves as a valuable 
          resource and experience.
        </p>

        {/* Quick Contact Section */}
        <div className="quick-contact">
          <h4>📞 Quick Contact</h4>
          <div className="contact-methods">
            <a href="tel:+15551234567" className="contact-method">
              <span className="contact-icon">📞</span>
              <span>Call Now</span>
            </a>
            <a href="https://wa.me/15551234567" target="_blank" rel="noopener noreferrer" className="contact-method">
              <span className="contact-icon">💬</span>
              <span>WhatsApp</span>
            </a>
            <a href="mailto:info@ecommerce.com" className="contact-method">
              <span className="contact-icon">✉️</span>
              <span>Send Email</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

// Terms & Conditions Component
const TermsConditions = () => {
  return (
    <div className="terms-section">
      <h2>📋 Terms & Conditions</h2>
      <p className="last-updated">Last Updated: January 2024</p>

      <div className="terms-content">
        <div className="terms-block">
          <h3>1. Acceptance of Terms</h3>
          <p>
            By using this e-commerce platform, you agree to be bound by these 
            Terms & Conditions. If you do not agree with any part of these terms, 
            please do not use our services.
          </p>
        </div>

        <div className="terms-block">
          <h3>2. User Accounts</h3>
          <ul>
            <li>You must be at least 18 years old to create an account</li>
            <li>You are responsible for maintaining the confidentiality of your account</li>
            <li>You agree to provide accurate and complete information</li>
            <li>You are responsible for all activities under your account</li>
          </ul>
        </div>

        <div className="terms-block">
          <h3>3. Products and Pricing</h3>
          <ul>
            <li>All product descriptions are accurate to the best of our knowledge</li>
            <li>Prices are subject to change without notice</li>
            <li>We reserve the right to modify or discontinue products</li>
            <li>In case of pricing errors, we reserve the right to cancel orders</li>
          </ul>
        </div>

        <div className="terms-block">
          <h3>4. Orders and Payments</h3>
          <ul>
            <li>Orders are confirmed upon successful payment</li>
            <li>We accept multiple payment methods including Cash on Delivery</li>
            <li>All transactions are secure and encrypted</li>
            <li>Order cancellation must be requested within 24 hours</li>
          </ul>
        </div>

        <div className="terms-block">
          <h3>5. Shipping and Delivery</h3>
          <ul>
            <li>Delivery times are estimated and not guaranteed</li>
            <li>Shipping costs are calculated at checkout</li>
            <li>We ship to the provided shipping address</li>
            <li>Risk of loss passes to you upon delivery</li>
          </ul>
        </div>

        <div className="terms-block">
          <h3>6. Returns and Refunds</h3>
          <ul>
            <li>Returns accepted within 30 days of delivery</li>
            <li>Items must be unused and in original packaging</li>
            <li>Refunds processed within 5-10 business days</li>
            <li>Return shipping costs are the responsibility of the buyer</li>
          </ul>
        </div>

        <div className="terms-block">
          <h3>7. Privacy and Data Protection</h3>
          <p>
            We take your privacy seriously. Your personal information is 
            protected and used only for order processing and communication. 
            We do not share your data with third parties except as necessary 
            for order fulfillment.
          </p>
        </div>

        <div className="terms-block">
          <h3>8. Intellectual Property</h3>
          <p>
            All content on this website, including text, graphics, logos, and 
            images, is our property and protected by copyright laws. You may 
            not reproduce, distribute, or create derivative works without 
            explicit permission.
          </p>
        </div>

        <div className="terms-block">
          <h3>9. Limitation of Liability</h3>
          <p>
            We are not liable for any indirect, incidental, or consequential 
            damages arising from the use of our services. Our total liability 
            is limited to the amount paid for the products.
          </p>
        </div>

        <div className="terms-block">
          <h3>10. Changes to Terms</h3>
          <p>
            We reserve the right to modify these terms at any time. Continued 
            use of our services constitutes acceptance of the updated terms.
          </p>
        </div>

        <div className="terms-block contact-info">
          <h3>📧 Contact Us</h3>
          <p>
            For questions about these Terms & Conditions, please contact us:
          </p>
          <p>
            <strong>Email:</strong> legal@ecommerce.com<br />
            <strong>Phone:</strong> +1 (555) 123-4567<br />
            <strong>WhatsApp:</strong> +1 (555) 123-4567
          </p>
        </div>
      </div>
    </div>
  );
};

// Privacy Policy Component
const PrivacyPolicy = () => {
  return (
    <div className="privacy-section">
      <h2>🔒 Privacy Policy</h2>
      <p className="last-updated">Last Updated: January 2024</p>

      <div className="privacy-content">
        <div className="privacy-block">
          <h3>Information We Collect</h3>
          <ul>
            <li>Name and contact information</li>
            <li>Email address</li>
            <li>Shipping address</li>
            <li>Payment information</li>
            <li>Order history</li>
            <li>Browser and device information</li>
          </ul>
        </div>

        <div className="privacy-block">
          <h3>How We Use Your Information</h3>
          <ul>
            <li>Process and fulfill orders</li>
            <li>Communicate about orders and updates</li>
            <li>Improve our products and services</li>
            <li>Send promotional offers (with your consent)</li>
            <li>Prevent fraud and ensure security</li>
          </ul>
        </div>

        <div className="privacy-block">
          <h3>Data Security</h3>
          <p>
            We implement industry-standard security measures to protect your 
            personal information. Your data is encrypted and stored securely. 
            We regularly update our security practices to stay ahead of threats.
          </p>
        </div>

        <div className="privacy-block">
          <h3>Your Rights</h3>
          <ul>
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Opt-out of marketing communications</li>
            <li>Withdraw consent at any time</li>
          </ul>
        </div>

        <div className="privacy-block">
          <h3>Cookies</h3>
          <p>
            We use cookies to enhance your browsing experience, remember your 
            preferences, and analyze site traffic. You can control cookie 
            settings in your browser.
          </p>
        </div>

        <div className="privacy-block">
          <h3>Third-Party Services</h3>
          <p>
            We may use third-party services for payment processing and 
            analytics. These services have their own privacy policies and 
            data handling practices.
          </p>
        </div>

        <div className="privacy-block">
          <h3>Updates to Privacy Policy</h3>
          <p>
            We may update this privacy policy from time to time. We will 
            notify you of any significant changes via email or website notice.
          </p>
        </div>

        <div className="privacy-block contact-info">
          <h3>📧 Privacy Questions</h3>
          <p>
            If you have questions about our privacy practices, please contact us:
          </p>
          <p>
            <strong>Email:</strong> privacy@ecommerce.com<br />
            <strong>Phone:</strong> +1 (555) 123-4567<br />
            <strong>WhatsApp:</strong> +1 (555) 123-4567
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;