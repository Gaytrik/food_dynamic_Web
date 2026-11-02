import React, { useEffect, useState, useRef } from "react";
import { useLocation, Link } from "react-router-dom";
import { Home, Phone, Mail } from "lucide-react";

const SupportPage = () => {
  const mainRef = useRef(null);
  const sidebarRef = useRef(null);
  const location = useLocation();

  const faqData = [
    {
      id: "how-to-place-an-order",
      question: "How To Place an Order",
      answer: (
        <>
          <h2 className="text-2xl font-bold mb-4 text-gray-900">
            How To Place an Order
          </h2>

          <p className="text-gray-700 w-full md:w-1/2 leading-relaxed mb-4">
            Ordering your favorite food or subscribing to our tiffin plan is
            quick and easy. Here’s how:
          </p>

          <ul className="list-disc list-inside space-y-3 text-gray-700">
            <li>
              <strong> Browse Menu:</strong> Explore our restaurant menu or
              tiffin plans section. You can filter items by cuisine, meal type
              (Breakfast, Lunch, Dinner), or price.
            </li>
            <li>
              <strong> Select Your Meal:</strong> Click on the item to view
              details, portion size, and price.
            </li>
            <li>
              <strong> Add to Cart:</strong> Choose the quantity and click{" "}
              <strong>“Add to Cart”</strong>.
            </li>
            <li>
              <strong> Review Your Order:</strong> Open your cart to review
              all items, update quantities, or remove items.
            </li>
            <li>
              <strong> Checkout:</strong> Enter your name, contact info, and
              delivery address accurately.
            </li>
            <li>
              <strong> Payment:</strong> Pay securely using UPI, Credit/Debit
              Card, Net Banking, or opt for Cash on Delivery (if available).
            </li>
            <li>
              <strong> Confirmation:</strong> You’ll receive an instant order
              confirmation via SMS or WhatsApp.
            </li>
          </ul>

          <p className="text-gray-700 w-full md:w-1/2 leading-relaxed mt-4">
            For bulk or party orders, please reach out to our{" "}
            <strong className="text-[var(--primary)] cursor-pointer hover:underline">
              customer support
            </strong>{" "}
            team directly.
          </p>
        </>
      ),
    },

    {
      id: "tiffin-service",
      question: "Tiffin Service Details",
      answer: (
        <>
          <h2 className="text-2xl font-bold mb-4 text-gray-900">
            Tiffin Service Details
          </h2>
          <p className="text-gray-700 mb-4">
            Our tiffin service provides fresh, homemade-style meals for students,
            professionals, and families. Meals are prepared daily using quality
            ingredients and delivered hot to your doorstep.
          </p>

          <h3 className="text-lg font-semibold mb-2 text-gray-900">
            Meal Timings
          </h3>
          <ul className="list-disc list-inside text-gray-700 mb-4">
            <li>Lunch Delivery: 11:30 AM – 2:00 PM</li>
            <li>Dinner Delivery: 7:00 PM – 9:30 PM</li>
          </ul>

          <h3 className="text-lg font-semibold mb-2 text-gray-900">
            Subscription Options
          </h3>
          <ul className="list-disc list-inside text-gray-700 mb-4">
            <li>Daily, Weekly, and Monthly plans available</li>
            <li>Veg and Non-Veg options</li>
            <li>Customizable meal preferences (e.g., less spicy, without onion/garlic)</li>
          </ul>

          <p className="text-gray-700">
            You can pause or resume your subscription anytime by contacting
            support at{" "}
            <strong className="text-[var(--primary)]">support@yourrestaurant.com</strong>.
          </p>
        </>
      ),
    },

    {
      id: "delivery-policy",
      question: "Delivery Policy",
      answer: (
        <>
          <h2 className="text-2xl font-bold mb-4 text-gray-900">
            Delivery Policy
          </h2>

          <p className="text-gray-700 mb-4">
            We ensure your food reaches you hot and on time. Below are our
            delivery guidelines:
          </p>

          <ul className="list-disc list-inside space-y-3 text-gray-700">
            <li>
              <strong>Delivery Areas:</strong> We currently deliver within 5–8 km
              radius of our restaurant location.
            </li>
            <li>
              <strong>Delivery Time:</strong> Average delivery time is{" "}
              <strong>30–45 minutes</strong> depending on location and order size.
            </li>
            <li>
              <strong>Live Tracking:</strong> You’ll receive a live tracking link
              once your food is out for delivery.
            </li>
            <li>
              <strong>Packaging:</strong> All meals are hygienically packed in
              spill-proof containers.
            </li>
          </ul>

          <p className="text-gray-700 mt-4">
            For delayed deliveries or special requests, contact{" "}
            <strong className="text-[var(--primary)]">+91-99999-99999</strong>.
          </p>
        </>
      ),
    },

    {
      id: "refund-policy",
      question: "Refund & Cancellation Policy",
      answer: (
        <>
          <h2 className="text-2xl font-bold mb-4 text-gray-900">
            Refund & Cancellation Policy
          </h2>
          <p className="text-gray-700 mb-4">
            We strive to provide the best dining and delivery experience. If you
            face an issue, our refund and cancellation terms are below:
          </p>

          <ul className="list-disc list-inside space-y-3 text-gray-700 mb-4">
            <li>
              Orders can be cancelled within <strong>5 minutes</strong> of
              placement if food preparation hasn’t started.
            </li>
            <li>
              Refunds are processed within <strong>5–7 business days</strong> to
              your original payment method.
            </li>
            <li>
              No refund will be issued for incorrect addresses or unresponsive
              customers.
            </li>
            <li>
              In case of wrong or spoiled food, we’ll provide a replacement or
              full refund after verification.
            </li>
          </ul>

          <p className="text-gray-700">
            To request a refund, email{" "}
            <strong className="text-[var(--primary)]">support@yourrestaurant.com</strong>{" "}
            or call <strong className="text-[var(--primary)]">+91-99999-99999</strong>.
          </p>
        </>
      ),
    },

    {
      id: "return-policy",
      question: "Return Policy",
      answer: (
        <>
          <h2 className="text-2xl font-bold mb-4 text-gray-900">
            Return Policy
          </h2>
          <p className="text-gray-700 mb-4">
            Due to the perishable nature of food, returns are not accepted.
            However, we take full responsibility for incorrect or damaged
            deliveries.
          </p>
          <p className="text-gray-700">
            Please share a clear photo of the received meal within{" "}
            <strong>30 minutes</strong> of delivery, and our team will review and
            assist with a refund or replacement immediately.
          </p>
        </>
      ),
    },

    {
      id: "terms-and-conditions",
      question: "Terms & Conditions",
      answer: (
        <>
          <h2 className="text-2xl font-bold mb-4 text-gray-900">
            Terms & Conditions
          </h2>
          <p className="text-gray-700 mb-3">
            By ordering from our restaurant or subscribing to our tiffin plans,
            you agree to the following terms:
          </p>

          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Prices and menu items are subject to change without notice.</li>
            <li>
              Orders once confirmed cannot be modified after 5 minutes of
              placement.
            </li>
            <li>We are not liable for delays due to external factors like traffic or weather.</li>
            <li>
              Misuse of discount codes or fraudulent transactions will lead to
              cancellation.
            </li>
          </ul>
        </>
      ),
    },

    {
      id: "contact-support",
      question: "Contact Customer Support",
      answer: (
        <>
          <h2 className="text-2xl font-bold mb-4 text-gray-900">
            Contact Customer Support
          </h2>
          <p className="text-gray-700 w-full md:w-1/2 leading-relaxed mb-4">
            Need help with your food order, tiffin plan, or payment issue? We’re
            here for you.
          </p>
             <div className="flex flex-col space-y-3 mb-4 text-gray-700">
  <div className="flex items-center">
    <Phone className="w-5 h-5 text-[var(--primary)] mr-2" />
    <span>
      <strong>+91-99999-99999</strong> (Mon–Sat, 9 AM – 9 PM)
    </span>
  </div>

  <div className="flex items-center">
    <Mail className="w-5 h-5 text-[var(--primary)] mr-2" />
    <span>
      <strong className="text-[var(--primary)]">
        support@yourrestaurant.com
      </strong>
    </span>
  </div>
</div>

          <div className="bg-white-50 border border-green-200 rounded-lg p-4 mt-4 w-full md:w-1/2">
            <h3 className="text-lg font-semibold text-black mb-2">
              Business Hours
            </h3>
            <ul className="list-disc list-inside text-gray-700 leading-relaxed">
              <li>Monday – Saturday: 9:00 AM – 9:00 PM</li>
              <li>Sunday: 10:00 AM – 5:00 PM</li>
            </ul>
          </div>

       

        </>
      ),
    },
  ];

  const [activeId, setActiveId] = useState("contact-support");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Sidebar toggle logic
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsSidebarOpen(false);
      }
    };
    if (isSidebarOpen)
      document.addEventListener("mousedown", handleClickOutside);
    else document.removeEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSidebarOpen]);

  const handleQuestionClick = (id) => {
    if (window.location.hash !== `#${id}`) window.location.hash = id;
    else setActiveId(id);
    setIsSidebarOpen(false);
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1);
      if (hash) setActiveId(hash);
      else setActiveId("contact-support");
      if (mainRef.current) {
        mainRef.current.scrollTo({ top: 0, behavior: "smooth" });
      }
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const activeItem = faqData.find((item) => item.id === activeId);

  return (
    <div className="min-h-full bg-gray-50 text-gray-900 font-display transition-colors duration-300">
      

      <div className="container mx-auto p-4 sm:p-8 relative h-full flex flex-col">
        <div className="md:hidden flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold">Support Center</h1>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="px-4 py-2 border rounded-md bg-gray-100 hover:bg-gray-200 transition"
          >
            {isSidebarOpen ? "Close" : "FAQ Topics"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_1px_3fr] gap-8">
          {/* Sidebar */}
          <aside
            ref={sidebarRef}
            className={`fixed md:static top-0 left-0 h-full md:h-auto bg-white shadow-md md:shadow-none z-50 md:z-auto transform transition-transform duration-300 ease-in-out ${
              isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            } md:translate-x-0 w-64 md:w-auto p-6 md:p-0 overflow-y-auto sm:mt-0 mt-13`}
          >
            <nav className="space-y-2">
              {faqData.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleQuestionClick(item.id)}
                  className={`group block w-full text-left py-2 px-3 rounded-md transition-colors duration-300 ${
                    activeId === item.id
                      ? "font-bold text-black"
                      : "text-gray-600 hover:text-black"
                  }`}
                >
                  <span className="relative inline-block">
                    {item.question}
                    <span
                      className={`absolute left-0 bottom-0 h-[2px] bg-black transition-all duration-300 origin-left ${
                        activeId === item.id
                          ? "w-full"
                          : "w-0 "
                      }`}
                    ></span>
                  </span>
                </button>
              ))}
            </nav>
          </aside>

          {isSidebarOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-30 z-40 md:hidden"></div>
          )}

          <div className="hidden md:block bg-gray-300 w-px"></div>

          <main ref={mainRef} className="bg-white shadow-md p-6 transition-all duration-300">
            {activeItem ? (
              <div id={activeItem.id} className="animate-fadeIn">
                {activeItem.answer}
              </div>
            ) : (
              <p className="text-gray-600">
                Select a topic from the left to view order, delivery, and support information.
              </p>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;
