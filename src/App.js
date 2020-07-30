import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import "./components/NameAnimation.css";
import { Footer } from "./components/Footer";
import { NavBar } from "./components/NavBar";
import { Content } from "./components/Content";
import { lightTheme, darkTheme } from "./theme";
import { MuiThemeProvider } from "@material-ui/core/styles";
import { CssBaseline } from "@material-ui/core";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";

const useStyles = makeStyles((theme) => ({
    root: {
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
    },
    main: {
        marginTop: theme.spacing(8),
        marginBottom: theme.spacing(2),
    },
    footer: {
        padding: theme.spacing(3, 2),
        marginTop: "auto",
    },
    fab: {
        margin: theme.spacing(2),
    },
}));

export const App = () => {
    const classes = useStyles();

    const [theme, setTheme] = useState("light");

    const toggleTheme = () => {
        if (theme === "light") {
            setTheme("dark");
        } else {
            setTheme("light");
        }
    };

    return (
        <MuiThemeProvider theme={theme === "light" ? lightTheme : darkTheme}>
            <CssBaseline />
            <div className={classes.root}>
                <NavBar />
                <FormControlLabel
                    control={
                        <Switch
                            checked={theme === "dark"}
                            onChange={toggleTheme}
                            name="dark mode"
                        />
                    }
                />
                <Content mainClasses={classes.main} />

                <Footer footerClasses={classes.footer} />
            </div>
        </MuiThemeProvider>
    );
};
