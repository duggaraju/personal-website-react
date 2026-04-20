import React, { useContext } from "react";
import { ThemeContext } from "./ThemeProvider";
import { Tooltip, IconButton, Zoom } from "@mui/material";
import { Brightness4, Brightness7 } from "@mui/icons-material";

export const ThemeToggle = () => {
    const { theme, toggleTheme } = useContext(ThemeContext);

    return (
        <Tooltip
            title={"Toggle theme"}
            placement="right"
            slots={{ transition: Zoom }}
        >
            <IconButton
                color="inherit"
                onClick={toggleTheme}
                aria-label={"Toggle theme"}
                sx={(muiTheme) => ({
                    position: "absolute",
                    bottom: muiTheme.spacing(6),
                    right: muiTheme.spacing(6),
                    height: "2.5rem",
                    width: "2.5rem",
                })}
            >
                {theme === "light" ? (
                    <Brightness4 sx={{ fontSize: "1.25rem" }} />
                ) : (
                    <Brightness7 sx={{ fontSize: "1.25rem" }} />
                )}
            </IconButton>
        </Tooltip>
    );
};
