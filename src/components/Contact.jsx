import { useState } from "react";
import { motion } from "framer-motion";
import { useHomeEntrance } from "@/hooks/useHomeEntrance";
import axios from "axios";
import ReactGA from "react-ga4";
import {
  containerVariants,
  subtitleVariants,
  titleVariants,
} from "@/constants/variants.js";
import { CalendarClock, Loader2, Send } from "lucide-react";
import { FaLinkedinIn } from "react-icons/fa6";
import { FiGithub } from "react-icons/fi";
import { MdArrowOutward } from "react-icons/md";
import { CONTACT_CHANNELS } from "@/constants/const.js";

const CHANNEL_ICONS = {
  linkedin: FaLinkedinIn,
  github: FiGithub,
  meet: CalendarClock,
};

// Hairline-ruled rows: a micro label, the value in ink, an arrow that steps out
// on hover. No filled badges — same treatment as the roster rows elsewhere.
const ChannelList = () => (
  <div className="mt-6">
    {CONTACT_CHANNELS.map(({ label, value, href, icon }) => {
      const Icon = CHANNEL_ICONS[icon];
      return (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() =>
            ReactGA.event({
              category: "Contact",
              action: "channel_click",
              label,
            })
          }
          className="group flex items-center gap-4 border-b border-black/10 py-4 first:border-t dark:border-white/[.08]"
        >
          <Icon className="h-[18px] w-[18px] shrink-0 text-[var(--color-muted)] transition-colors group-hover:text-black dark:text-[var(--color-muted-dark)] dark:group-hover:text-white" />
          <span className="min-w-0 flex-1">
            <span className="block text-[10px] font-medium tracking-[0.14em] text-[var(--color-muted)] uppercase dark:text-[var(--color-muted-dark)]">
              {label}
            </span>
            <span className="mt-0.5 block truncate text-[15px] text-neutral-900 dark:text-white">
              {value}
            </span>
          </span>
          <MdArrowOutward className="link-symbol shrink-0" />
        </a>
      );
    })}
  </div>
);

const Contact = () => {
  const firstVisit = useHomeEntrance();
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
      className="flex flex-wrap flex-col border-b border-black/10 dark:border-white/[.08] pt-10 justify-center items-center w-full"
      variants={containerVariants}
      initial={firstVisit ? "hidden" : "visible"}
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
    >
      <motion.h1
        variants={titleVariants}
        className="mt-2 text-5xl lg:text-6xl tracking-[-0.025em] text-center text-neutral-900 dark:text-white mb-2"
      >
        Contact
      </motion.h1>
      <motion.h2
        variants={subtitleVariants}
        className="font-sans text-[18px] text-center text-[var(--color-muted)] dark:text-[var(--color-muted-dark)] mb-8"
      >
        Reach out!
      </motion.h2>

      <div className="mx-auto grid w-full max-w-5xl gap-10 px-2 pb-12 lg:grid-cols-2 lg:gap-16">
      <motion.form
        variants={formVariants}
        onSubmit={handleSubmit}
        className="flex w-full flex-col gap-4"
      >
        <div className="flex flex-col gap-2">
          <label
            htmlFor="name"
            className="text-sm font-medium text-[var(--color-muted)] dark:text-[var(--color-muted-dark)]"
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
            className="w-full px-4 py-2.5 rounded-lg glass text-neutral-900 dark:text-white outline-none transition-colors focus:border-black/50 dark:focus:border-white/50"
            placeholder="Your name"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="email"
            className="text-sm font-medium text-[var(--color-muted)] dark:text-[var(--color-muted-dark)]"
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
            className="w-full px-4 py-2.5 rounded-lg glass text-neutral-900 dark:text-white outline-none transition-colors focus:border-black/50 dark:focus:border-white/50"
            placeholder="your@email.com"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="message"
            className="text-sm font-medium text-[var(--color-muted)] dark:text-[var(--color-muted-dark)]"
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
            className="w-full px-4 py-2.5 rounded-lg glass text-neutral-900 dark:text-white outline-none transition-colors focus:border-black/50 dark:focus:border-white/50 resize-none"
            placeholder="How can I help you?"
          />
        </div>

        <button
          type="submit"
          disabled={status === "loading"}
          className="pill mt-2 w-full py-3.5"
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
        <p className="text-xs text-[var(--color-muted)] dark:text-[var(--color-muted-dark)]">
          A confirmation email will be sent when your message is delivered
        </p>
      </motion.form>

      <motion.div variants={formVariants} className="w-full lg:pt-1">
        <ChannelList />
      </motion.div>
      </div>

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
