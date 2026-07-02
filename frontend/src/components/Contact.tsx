import React, { useState } from "react";
import { Send, Mail, User, MessageSquare } from "lucide-react";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("Sending...");

    try {
      const response = await fetch("http:/localhost:8000/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus("Message sent succssfully!");
        setFormData({ name: "", email: "", message: "" });
      }
    } catch (err) {
      setStatus("Error sending message.");
    }
  };

  return (
    <section id="contact" className="max-w-4xl mx-auto py-32 px-6">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Let's Connect
        </h2>
        <p className="text-slate-400">
          Have a project in mind or just want to chat? Shoot me a message.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-slate-900/50 p-8 rounded-2xl border border-slate-800 backdrop-blur-sm"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase text-slate-500 flex items-center gap-2">
              <User size={12} /> Full Name
            </label>
            <input
              required
              type="text"
              className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl text-white focus:border-cyan-500 outline-none transition-all"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono uppercase text-slate-500 flex items-center gap-2">
              <Mail size={12} /> Email Address
            </label>
            <input
              required
              type="email"
              className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl text-white focus:border-cyan-500 outline-none transition-all"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-mono uppercase text-slate-500 flex items-center gap-2">
            <MessageSquare size={12} /> Message
          </label>
          <textarea
            required
            rows={5}
            className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl text-white focus:border-cyan-500 outline-none transition-all resize-none"
            value={formData.message}
            onChange={(e) =>
              setFormData({ ...formData, message: e.target.value })
            }
          />
        </div>

        <button
          disabled={status === "sending"}
          type="submit"
          className="group w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {status === "sending"
            ? "Transmitting..."
            : status === "success"
              ? "Message Received!"
              : "Send Message"}
          <Send
            size={18}
            className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
          />
        </button>

        {status === "error" && (
          <p className="text-red-400 text-sm text-center">
            Connection failed. Please try again.
          </p>
        )}
      </form>
    </section>
  );
}

export default Contact;
