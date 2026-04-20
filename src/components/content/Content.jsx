import React from "react";
import { Typography, Container } from "@mui/material";
import { TextDecrypt } from "./TextDecrypt";
import Resume from "../../settings/resume.json";
import { FirstName } from "../../utils/getName";

export const Content = () => {
    return (
        <Container
            component="main"
            maxWidth="sm"
            sx={(muiTheme) => ({
                marginTop: "auto",
                marginBottom: "auto",
                [muiTheme.breakpoints.down("md")]: {
                    marginLeft: muiTheme.spacing(4),
                },
            })}
        >
            <Typography variant="h2" component="h1" gutterBottom>
                <TextDecrypt text={`${Resume.basics.x_title} ${FirstName}`} />
            </Typography>
            <Typography variant="h5" component="h2" gutterBottom>
                <TextDecrypt text={`a ${Resume.basics.job}`} />
                <TextDecrypt text={`from ${Resume.basics.location.country}`} />
            </Typography>
        </Container>
    );
};
