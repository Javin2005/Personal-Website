import type { ComponentType } from "react";
import Hero from "../components/Hero";
import PublicLayout from "../components/PublicLayout";
import AboutSection from "../components/sections/AboutSection";
import ContactSection from "../components/sections/ContactSection";
import EducationSection from "../components/sections/EducationSection";
import ExperienceSection from "../components/sections/ExperienceSection";
import InterestsSection from "../components/sections/InterestsSection";
import ProjectsSection from "../components/sections/ProjectsSection";
import { useSite } from "../site/useSite";
import type { SectionId, SectionSettings } from "../types";

// Which component draws which section. The order and visibility come from
// the admin settings, so the homepage is built from data, not hard-coded.
const SECTIONS: Record<SectionId, ComponentType<{ section: SectionSettings; next?: SectionSettings }>> = {
  about: AboutSection,
  interests: InterestsSection,
  experience: ExperienceSection,
  education: EducationSection,
  projects: ProjectsSection,
  contact: ContactSection,
};

export default function Home() {
  const { site } = useSite();
  const visible = site.settings.sections.filter((s) => s.visible);

  return (
    <PublicLayout home>
      <Hero />
      {visible.map((section, i) => {
        const Component = SECTIONS[section.id];
        return <Component key={section.id} section={section} next={visible[i + 1]} />;
      })}
    </PublicLayout>
  );
}
