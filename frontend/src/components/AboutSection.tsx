import type { About } from "../types";
import { GitBranch, GitForkIcon, Code2 } from "lucide-react";

function AboutSection({ about }: { about: About }) {
  if (!about) return null;
  return (
    <section id="about" className="max-w-6xl mx-auto py-20 px-6">
      <h2 className="text-3xl font-bold text-white mb-12 flex items-center gap-4">
        <span className="text-cyan-500 font-mono text-xl">01.</span>
        About Me
        <div className="h-px bg-slate-800 grow"></div>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-start">
        <div className="relative group mx-auto md:mx-0">
          <div
            className="absolute -insect-1 bg-linear-to-r from-cyan-500 to-blue-600 rounded-2xl blur opacity-25 
                    group-hover:opacity-50 transition duration-1000"
          ></div>
          <img
            src={about.profile_pic}
            alt={about.name}
            className="relative rounded-2xl w-64 h-64 object-cover border-2 border-slate-700"
          />
        </div>

        <div className="md:col-span-2 space-y-6">
          <p className="text-slate-300 text-lg leading-relaxed">{about.bio}</p>

          <div>
            <h4 className="text-white font-bold mb-4 flex items-center gap-2">
              <Code2 className="text-cyan-500 w-5 h-5" />
              Tech I work with right now:
            </h4>
            <div className="flex flex-wrap gap-3">
              {about.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-slate-800/50 text-cyan-400 border border-cyan-900/30 
                                    rounded-full  hover:border-cyan-500/50 group transition-colors text-sm font-mono"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
          <div className="flex gap-6 pt-4">
            {about.socials.map((link) => (
              <a
                key={link.platform}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-2"
              >
                {link.platform === "GitHub" && <GitBranch size={20} />}
                {link.platform === "LinkedIn" && <GitForkIcon size={20} />}
                <span className="text-sm font-medium">{link.platform}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutSection;
