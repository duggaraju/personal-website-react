import React, { useEffect } from "react";
import Resume from "../settings/resume.json";
import Settings from "../settings/settings.json";

export const HelmetMeta = () => {
    useEffect(() => {
        const setMeta = (name, content) => {
            if (!content) return;
            let tag = document.querySelector(`meta[name="${name}"]`);
            if (!tag) {
                tag = document.createElement("meta");
                tag.setAttribute("name", name);
                document.head.appendChild(tag);
            }
            tag.setAttribute("content", content);
        };

        const title = `${Resume.basics.name} | ${Resume.basics.location.city}, ${Resume.basics.location.country}`;
        document.title = title;
        setMeta("theme-color", Settings.colors.primary);
        setMeta("author", Resume.basics.name);
        setMeta("description", Resume.basics.description);
        setMeta("keywords", Resume.basics.keywords);
    }, []);

    return null;
};
