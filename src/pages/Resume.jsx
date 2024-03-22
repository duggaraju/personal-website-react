import React from "react";
import CV from "react-cv";
import resume from "../settings/resume.json";

export const Resume = () => {
  const { basics } = resume;
  const personalData = {
    name: basics.name,
    title: basics.job,
    image: basics.picture,
    contacts: basics.contacts.concat(basics.profiles.map((x) => ({
      type: x.network === 'Google' ? 'email' : x.network.toLowerCase(),
      value: x.network === 'Google' ? x.url.substring(7): x.url,
    }))),
  };

  const sections = Object.keys(resume).filter(k => k !== 'basics').map(k => resume[k]);

  return (
    <CV
      personalData={personalData}
      sections={sections}
      branding={false}
    />
  );
};

export { Resume as default };
