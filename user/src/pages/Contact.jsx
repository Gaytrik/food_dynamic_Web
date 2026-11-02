import React, { useState } from "react";
import { MdEmail } from "react-icons/md";
import { IoMdCall } from "react-icons/io";
import { FaWhatsapp } from "react-icons/fa";
import emailjs from "@emailjs/browser"; // ✅ Import EmailJS
import DialogBox from "../components/DialogBox";


export default function ContactPage() {
  const contactMethods = [
    {
      id: 1,
      icon: <MdEmail className="text-3xl" />,
      title: "Email Us",
      href: "mailto:ysd@gmail.com",
      desc: "Get in touch for any inquiries",
      info: "ysd@gmail.com",
      subInfo: "Response within 24 hours",
    },
    {
      id: 2,
      icon: <IoMdCall className="text-3xl" />,
      title: "Call Us",
      href: "tel:+919876543210",
      desc: "Speak with our customer service",
      info: "+91 98765 43210",
      subInfo: "Mon-Sat, 10 AM - 7 PM IST",
    },
    {
      id: 3,
      icon: <FaWhatsapp className="text-3xl" />,
      title: "WhatsApp",
      href: "https://wa.me/919876543210",
      desc: "Quick support via WhatsApp",
      info: "+91 98765 43210",
      subInfo: "Mon-Sat, 10 AM - 7 PM IST",
      target: "_blank",
    },
  ];

  // ✅ FORM STATE
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // DIALOG STATE
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState("contactSuccess"); // or contactError
  const [dialogMessage, setDialogMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ VALIDATION FUNCTION
  const validateForm = () => {
    let newErrors = {};

    if (!/^[A-Za-z ]+$/.test(formData.name.trim())) {
      newErrors.name = "Full Name should contain only letters.";
    }

    if (!/^[0-9]{10}$/.test(formData.phone.trim())) {
      newErrors.phone = "Phone Number must be exactly 10 digits.";
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(formData.email.trim())) {
      newErrors.email = "Enter a valid email address.";
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required.";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message cannot be empty.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

   // helper to open dialog
  const openDialog = ({ type = "contactSuccess", message = "" } = {}) => {
    setDialogType(type);
    setDialogMessage(message);
    setDialogOpen(true);
  };

  // ✅ HANDLE SUBMIT WITH EMAILJS
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setLoading(true);

      const serviceID = "service_aa5mbmg"; // Replace with your EmailJS service ID
      const templateID = "template_6d8j09k"; // Replace with your EmailJS template ID
      const userID = "wyMTolrQlu27fA13m"; // Replace with your EmailJS public key (user ID)

      const templateParams = {
        from_name: formData.name,
        from_email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
      };

      emailjs
        .send(serviceID, templateID, templateParams, userID)
        .then(
          (response) => {
            setLoading(false);
            openDialog({
              type: "contactSuccess",
              message: "Message Sent Successfully!",
            });

            setFormData({
              name: "",
              email: "",
              phone: "",
              subject: "",
              message: "",
            });
          },
          (error) => {
            setLoading(false);
 openDialog({
              type: "contactError",
              message: "Failed to send message. Please try again.",
            });            console.error("EmailJS error:", error);
          }
        );
    }
  };

  return (
    <div className="bg-white">
      {/* HERO SECTION */}
      <section className="relative bg-[var(--accent)] text-white min-h-screen flex items-center -mt-12 pt-20">
        <div className="absolute inset-0">
          <img
            src="Images/food12.jpg"
            alt="Contact Background"
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Contact Us</h1>
          <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto">
            We'd love to hear from you whether you have questions, feedback, or partnership ideas.
          </p>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section className="py-14 bg-white">
        <div className="max-w-full mx-auto px-6 lg:px-10">
          <div className="text-center mb-12">

            <header className="text-center mb-6 relative">
         <div 
              className="absolute inset-0 flex items-center justify-center pointer-events-none 
                         transform -translate-y-4 sm:-translate-y-6"
            >
                <span className="mb-8 md:mb-0 text-5xl sm:text-[1rem] md:text-[2rem] lg:text-[5rem] 
                                 font-extrabold text-[var(--gray)] opacity-10 leading-none tracking-widest">
                    Contact
                </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-[var(--accent)] mb-2">
              Get In Touch
            </h2>
            </header>
            <p className="text-gray-600 text-lg">
              We're here to help and answer any question you might have
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* CONTACT CARDS */}
            <div className="lg:w-80 flex-shrink-0">
              <div className="flex flex-col gap-4">
                {contactMethods.map(({ id, icon, title, href, desc, info, subInfo, target }) => (
                  <a
                    key={id}
                    href={href}
                    target={target || "_self"}
                    rel="noopener noreferrer"
                    className="bg-[var(--secondary)] border-l-2 border-[var(--primary)]/60 shadow-md p-6 hover:-translate-y-2 transition-all duration-300 block"
                  >
                    <div className="flex items-center gap-2 text-2xl font-semibold text-[var(--accent)] mb-2">
                      {icon}
                      <span>{title}</span>
                    </div>
                    <p className="text-gray-600 mb-1">{desc}</p>
                    <p className="font-medium text-[var(--accent)]">{info}</p>
                    <p className="text-sm mt-1 text-gray-500">{subInfo}</p>
                  </a>
                ))}
              </div>
            </div>

            {/* CONTACT FORM */}
            <div className="flex-1">
              <div className="bg-white p-8 border-1 border-[var(--primary)]/60 shadow-xl rounded-lg h-full">
                <h3 className="text-2xl font-bold text-[var(--primary)]/100 mb-6">
                  Send Us a Message
                </h3>

                <form className="space-y-5" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Full Name"
                        className="w-full px-4 py-3 border-2 border-gray-100 rounded-lg text-[var(--accent)] bg-white focus:border-[var(--primary)]"
                      />
                      {errors.name && <p className="text-red-600 text-sm">{errors.name}</p>}
                    </div>

                    <div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Email Address"
                        className="w-full px-4 py-3 border-2 border-gray-100 rounded-lg text-[var(--accent)] bg-white focus:border-[var(--primary)]"
                      />
                      {errors.email && <p className="text-red-600 text-sm">{errors.email}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Phone Number"
                        className="w-full px-4 py-3 border-2 border-gray-100 rounded-lg text-[var(--accent)] bg-white focus:border-[var(--primary)]"
                      />
                      {errors.phone && <p className="text-red-600 text-sm">{errors.phone}</p>}
                    </div>

                    <div>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="Subject"
                        className="w-full px-4 py-3 border-2 border-gray-100 rounded-lg text-[var(--accent)] bg-white focus:border-[var(--primary)]"
                      />
                      {errors.subject && <p className="text-red-600 text-sm">{errors.subject}</p>}
                    </div>
                  </div>

                  <div>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows="6"
                      placeholder="Message"
                      className="w-full px-4 py-3 border-2 border-gray-100 rounded-lg text-[var(--accent)] bg-white focus:border-[var(--primary)] resize-none"
                    ></textarea>
                    {errors.message && <p className="text-red-600 text-sm">{errors.message}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full md:w-auto px-8 py-3.5 bg-[var(--primary)]/100 text-white font-semibold rounded-lg hover:bg-[var(--primary)]/70 transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    {loading ? "Sending..." : "Send Message"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAP */}
      <section className="w-full pt-2 pb-10 bg-[var(--secondary)] ">
        <div className="text-center mb-8">
          <header className="text-center mb-6 relative">
         <div 
              className="absolute inset-0 flex items-center justify-center pointer-events-none 
                         transform -translate-y-4 sm:-translate-y-6"
            >
                <span className="mb-4 md:mb-0 text-5xl sm:text-[1rem] md:text-[2rem] lg:text-[5rem] 
                                 font-extrabold text-[var(--gray)] opacity-10 ">
                    Location
                </span>
            </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[var(--accent)] mb-2">
            Our Location
          </h2>
          </header>
          <p className="text-gray-600 text-lg">Find us on the map</p>
        </div>

        <div className="w-full h-[300px]">
          <iframe
            title="map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d241317.11609674638!2d72.74109979212486!3d19.082197838734014!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c630e6d47fd5%3A0xdea91e8d5f8985df!2sMumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1708600000000!5m2!1sen!2sin"
            width="100%"
            height="100%"
            loading="lazy"
            style={{ border: 0 }}
          ></iframe>
        </div>
      </section>
                 <DialogBox
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        type={dialogType}
        customMessage={dialogMessage}
      />

    </div>
  );
}
