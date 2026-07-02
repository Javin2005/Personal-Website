import { Mail, GitBranchIcon, GitGraphIcon, FileUser } from "lucide-react";

function Contact() {
  return (
    <section id="contact" className="max-w-4xl mx-auto py-32 px-6 text-center">
      <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
        Get In Touch
      </h2>
      <p className="text-slate-400 text-lg mb-12 max-w-lg mx-auto">
        I'm currently looking for new opportunities! Whether you have a question
        or just want to say hi, my inbox is always open.
      </p>

      <div className="flex flex-wrap justify-center gap-4">
        <a
          href="mailto:your.email@example.com"
          className="flex items-center gap-2 px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-cyan-900/20"
        >
          <Mail size={20} />
          Say Hello
        </a>

        <a
          href="/assets/resume.pdf"
          target="_blank"
          className="flex items-center gap-2 px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl border border-slate-700 transition-all"
        >
          <FileUser size={20} />
          View Resume
        </a>
      </div>

      <div className="mt-16 flex justify-center gap-8 text-slate-500">
        <a
          href="https://github.com/Javin2005"
          className="hover:text-cyan-400 transition-colors"
        >
          <GitBranchIcon size={24} />
        </a>
        <a
          href="https://linkedin.com/in/christian-j-carlson"
          className="hover:text-cyan-400 transition-colors"
        >
          <GitGraphIcon size={24} />
        </a>
      </div>
    </section>
  );
}

export default Contact;
