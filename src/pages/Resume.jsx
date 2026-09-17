import React from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  IconButton,
  Link,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  ArrowBack,
  Print,
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
      sx={{ mb: 2, alignItems: "center", "@media print": { breakAfter: "avoid", breakInside: "avoid" } }}
    >
      {icon}
      <Typography variant="h4" sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
    </Stack>
    <Divider sx={{ mb: 2, "@media print": { breakAfter: "avoid" } }} />
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
    <Container
      component="main"
      maxWidth="md"
      sx={{
        py: 6,
        "@media print": {
          py: 0,
          px: 0,
          maxWidth: "none",
          color: "#111",
          backgroundColor: "#fff",
          "& *": { color: "#111 !important", boxShadow: "none !important" },
          "& .MuiChip-root, & .MuiDivider-root": { borderColor: "#aaa" },
          "& .MuiTypography-h4": { breakAfter: "avoid" },
          "& p, & li": { orphans: 3, widows: 3 },
          "& .resume-actions": { display: "none" },
        },
      }}
    >
      <Stack
        component="nav"
        aria-label="Resume actions"
        className="resume-actions"
        direction="row"
        sx={{ mb: 3, alignItems: "center", justifyContent: "space-between" }}
      >
        <Button component={RouterLink} to="/" startIcon={<ArrowBack />}>
          Home
        </Button>
        <Tooltip title="Print or save as PDF">
          <IconButton aria-label="Print or save resume as PDF" onClick={() => window.print()}>
            <Print />
          </IconButton>
        </Tooltip>
      </Stack>
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
          <Table size="small" aria-label="Patents and publications" sx={{
            "& th, & td": { px: 1, py: 1, verticalAlign: "top" },
            "@media screen and (max-width: 599px)": {
              "&, & tbody": { display: "block" },
              "& thead": { display: "none" },
              "& tr": { display: "grid", gridTemplateColumns: "1fr auto", py: 1, borderBottom: 1, borderColor: "divider" },
              "& th, & td": { display: "block", border: 0, px: 0, py: 0.25 },
              "& tbody th": { gridColumn: "1 / -1" },
            },
            "@media print": { "& tr": { breakInside: "avoid" }, "& th, & td": { borderColor: "#aaa" } },
          }}>
            <TableHead>
              <TableRow>
                <TableCell scope="col">Title</TableCell>
                <TableCell scope="col">Patent / Publication</TableCell>
                <TableCell scope="col" align="right">Year</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
            {patents.items.filter((item) => !item.authority.endsWith("-A1") || !patents.items.some(
              (grant) => /-B[12]$/.test(grant.authority) && grant.authority === patents.publicationGrants?.[item.authority]
            )).map((item) => (
              <TableRow key={item.authority}>
                <TableCell component="th" scope="row">
                  <Link href={item.authorityWebSite} target="_blank" rel="noopener noreferrer" sx={{ fontWeight: 600 }}>
                    {item.title}
                  </Link>
                </TableCell>
                <TableCell sx={{ color: "text.secondary" }}>
                  {item.authority}
                  {item.authority.endsWith("-A1") && (
                    <Typography variant="caption" sx={{ display: "block" }}>Published application</Typography>
                  )}
                </TableCell>
                <TableCell align="right" sx={{ whiteSpace: "nowrap", color: "text.secondary" }}>{item.rightSide}</TableCell>
              </TableRow>
            ))}
            </TableBody>
          </Table>
        </Section>
      )}
    </Container>
  );
};

export { Resume as default };
