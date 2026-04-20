import React from "react";
import {
  Avatar,
  Box,
  Chip,
  Container,
  Divider,
  IconButton,
  Link,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Email,
  GitHub,
  Google,
  LinkedIn,
  Link as LinkIcon,
  LocationOn,
  Phone,
  School,
  Translate,
  Work,
  EmojiObjects,
  Lightbulb,
  Twitter,
} from "@mui/icons-material";
import resume from "../settings/resume.json";

const Section = ({ title, icon, children }) => (
  <Box sx={{ mt: 5 }}>
    <Stack
      direction="row"
      spacing={1.5}
      sx={{ mb: 2, alignItems: "center" }}
    >
      {icon}
      <Typography variant="h4" sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
    </Stack>
    <Divider sx={{ mb: 2 }} />
    {children}
  </Box>
);

const TagList = ({ items }) => (
  <Stack direction="row" gap={1} sx={{ flexWrap: "wrap" }}>
    {items.map((item) => (
      <Chip key={item} label={item} variant="outlined" />
    ))}
  </Stack>
);

export const Resume = () => {
  const {
    basics,
    profile,
    experience,
    education,
    skills,
    languages,
    interests,
    patents,
  } = resume;

  const getProfileIcon = (network) => {
    const key = network.toLowerCase();
    if (key.includes("google")) return <Google fontSize="small" />;
    if (key.includes("linkedin")) return <LinkedIn fontSize="small" />;
    if (key.includes("github")) return <GitHub fontSize="small" />;
    if (key.includes("twitter") || key.includes("x")) return <Twitter fontSize="small" />;
    return <LinkIcon fontSize="small" />;
  };

  const getContactIcon = (type) => {
    const key = type.toLowerCase();
    if (key.includes("email")) return <Email fontSize="small" />;
    if (key.includes("phone")) return <Phone fontSize="small" />;
    if (key.includes("location") || key.includes("address")) return <LocationOn fontSize="small" />;
    return <LinkIcon fontSize="small" />;
  };

  const getSectionIcon = (sectionKey) => {
    const key = sectionKey.toLowerCase();
    if (key.includes("profile")) return <EmojiObjects fontSize="medium" />;
    if (key.includes("experience")) return <Work fontSize="medium" />;
    if (key.includes("education")) return <School fontSize="medium" />;
    if (key.includes("skills")) return <Lightbulb fontSize="medium" />;
    if (key.includes("languages")) return <Translate fontSize="medium" />;
    if (key.includes("interests")) return <EmojiObjects fontSize="medium" />;
    if (key.includes("patents")) return <Lightbulb fontSize="medium" />;
    return <LinkIcon fontSize="medium" />;
  };

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Stack spacing={1}>
        <Stack
          direction="row"
          spacing={2}
          sx={{ justifyContent: "space-between", alignItems: "center" }}
        >
          <Box>
        <Typography variant="h3" sx={{ fontWeight: 700 }}>
          {basics.name}
        </Typography>
        <Typography variant="h6" color="text.secondary">
          {basics.job}
        </Typography>
          </Box>
          <Avatar
            src={`/${basics.picture}`}
            alt={basics.name}
            sx={{ width: 72, height: 72 }}
          />
        </Stack>
        <Typography variant="body1" color="text.secondary">
          {basics.summary}
        </Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 1 }}>
          {basics.contacts.map((contact) => {
            const type = contact.type.toLowerCase();
            let href = undefined;
            if (type.includes("email")) {
              href = `mailto:${contact.value}`;
            } else if (type.includes("phone")) {
              href = `tel:${contact.value}`;
            } else if (type.includes("location") || type.includes("address")) {
              href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                contact.value
              )}`;
            }

            const content = (
              <Stack
                direction="row"
                spacing={1}
                sx={{ alignItems: "center" }}
              >
                {getContactIcon(contact.type)}
                <Typography variant="body2">{contact.value}</Typography>
              </Stack>
            );

            return href ? (
              <Link
                key={`${contact.type}-${contact.value}`}
                href={href}
                target={type.includes("location") ? "_blank" : undefined}
                rel={type.includes("location") ? "noopener noreferrer" : undefined}
                underline="hover"
                color="inherit"
              >
                {content}
              </Link>
            ) : (
              <Box key={`${contact.type}-${contact.value}`}>{content}</Box>
            );
          })}
        </Stack>
        <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
          {basics.profiles.map((profileItem) => (
            <Tooltip key={profileItem.network} title={profileItem.network}>
              <IconButton
                component={Link}
                href={profileItem.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={profileItem.network}
              >
                {getProfileIcon(profileItem.network)}
              </IconButton>
            </Tooltip>
          ))}
        </Stack>
      </Stack>

      {profile && (
        <Section title={profile.title} icon={getSectionIcon("profile")}>
          <Typography variant="body1">{profile.content}</Typography>
        </Section>
      )}

      {experience && (
        <Section title={experience.title} icon={getSectionIcon("experience")}>
          <Stack spacing={3}>
            {experience.groups.map((group) => (
              <Box key={group.sectionHeader}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {group.sectionHeader}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {group.description}
                </Typography>
                <Stack spacing={2}>
                  {group.items.map((item) => (
                    <Box key={item.title}>
                      <Link href={item.projectUrl} target="_blank" rel="noopener noreferrer">
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {item.title}
                        </Typography>
                      </Link>
                      <Typography variant="body2" color="text.secondary">
                        {item.description}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            ))}
          </Stack>
        </Section>
      )}

      {education && (
        <Section title={education.title} icon={getSectionIcon("education")}>
          <Stack spacing={2}>
            {education.items.map((item) => (
              <Box key={item.title}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.institution} • {item.rightSide}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Section>
      )}

      {skills && (
        <Section title={skills.title} icon={getSectionIcon("skills")}>
          <TagList items={skills.items} />
        </Section>
      )}

      {languages && (
        <Section title={languages.title} icon={getSectionIcon("languages")}>
          <TagList items={languages.items} />
        </Section>
      )}

      {interests && (
        <Section title={interests.title} icon={getSectionIcon("interests")}>
          <TagList items={interests.items} />
        </Section>
      )}

      {patents && (
        <Section title={patents.title} icon={getSectionIcon("patents")}>
          <Stack spacing={1.5}>
            {patents.items.map((item) => (
              <Box key={item.title}>
                <Link href={item.authorityWebSite} target="_blank" rel="noopener noreferrer">
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {item.title}
                  </Typography>
                </Link>
                <Typography variant="body2" color="text.secondary">
                  {item.authority} • {item.rightSide}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Section>
      )}
    </Container>
  );
};

export { Resume as default };
