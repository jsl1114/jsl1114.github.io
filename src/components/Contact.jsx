import { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import ReactGA from "react-ga4";
import {
  containerVariants,
  subtitleVariants,
  titleVariants,
} from "@/constants/variants.js";
import { Loader2, Send } from "lucide-react";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState(""); // 'loading', 'success', 'error', ''

  const serverEndpoint = import.meta.env.VITE_SERVER_ENDPOINT;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");

    try {
      if (!serverEndpoint) {
        throw new Error("Missing VITE_SERVER_ENDPOINT");
      }

      // Send to server to save and email
      await axios.post(`${serverEndpoint}/messages`, {
        name: formData.name,
        email: formData.email,
        message: formData.message,
      });

      setStatus("success");
      setFormData({ name: "", email: "", message: "" });
      ReactGA.event({
        category: "Contact",
        action: "form_submit",
        label: "Contact Form",
      });
      setTimeout(() => setStatus(""), 3000);
    } catch (error) {
      console.error("Error submitting form:", error);
      setStatus("error");
      setTimeout(() => setStatus(""), 3000);
    }
  };

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
        delay: 0.2,
      },
    },
  };

  return (
    <motion.div
      className="flex flex-wrap flex-col border-b border-neutral-300 dark:border-neutral-800 pt-10 justify-center items-center w-full"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
    >
      <motion.h1
        variants={titleVariants}
        className="mt-2 text-5xl lg:text-6xl tracking-tight font-semibold text-center text-neutral-900 dark:text-white mb-2"
      >
        Contact
      </motion.h1>
      <motion.h2
        variants={subtitleVariants}
        className="text-md text-center text-neutral-600 dark:text-neutral-400 mb-8"
      >
        Reach out!
      </motion.h2>

      <motion.form
        variants={formVariants}
        onSubmit={handleSubmit}
        className="w-full max-w-md px-6 flex flex-col gap-4 mb-10"
      >
        <div className="flex flex-col gap-2">
          <label
            htmlFor="name"
            className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
          >
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg glass text-neutral-900 dark:text-white outline-none transition-all focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-accent)_55%,transparent)] focus:border-transparent"
            placeholder="Your name"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="email"
            className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg glass text-neutral-900 dark:text-white outline-none transition-all focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-accent)_55%,transparent)] focus:border-transparent"
            placeholder="your@email.com"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="message"
            className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
          >
            Message
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={4}
            value={formData.message}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg glass text-neutral-900 dark:text-white outline-none transition-all focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-accent)_55%,transparent)] focus:border-transparent resize-none"
            placeholder="How can I help you?"
          />
        </div>

        <button
          type="submit"
          disabled={status === "loading"}
          className="mt-2 w-full px-6 py-3 rounded-lg bg-[var(--color-accent)] text-white font-medium hover:bg-[var(--color-accent-strong)] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 hover:cursor-pointer"
        >
          {status === "loading" ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Sending...
            </>
          ) : status === "success" ? (
            "Message Sent!"
          ) : status === "error" ? (
            "Error - Try Again"
          ) : (
            <>
              Send Message
              <Send className="w-4 h-4" />
            </>
          )}
        </button>
        <p className="text-xs text-neutral-600 dark:text-neutral-400">
          A confirmation email will be sent when your message is delivered
        </p>
      </motion.form>

      {/* <motion.div
        variants={dockVariants}
        className='w-full px-2 rounded-xl flex flex-col items-center justify-center gap-4 mb-5'
      >
          <BottomNav />
      </motion.div> */}
    </motion.div>
  );
};
export default Contact;
