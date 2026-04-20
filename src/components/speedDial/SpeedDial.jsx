import React from "react";
import { SpeedDial, SpeedDialIcon, SpeedDialAction } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Resume from "../../settings/resume.json";

export const SpeedDials = () => {
    const theme = useTheme();

    const [open, setOpen] = React.useState(false);

    const handleClose = () => {
        setOpen(false);
    };

    const handleOpen = () => {
        setOpen(true);
    };

    const actionIcons = Resume.basics.profiles.map((action) => (
        <SpeedDialAction
            key={action.network.toLowerCase()}
            icon={<i className={action.x_icon} style={{ color: theme.palette.foreground.default }}></i>}
            tooltipTitle={action.network}
            onClick={handleClose}
            FabProps={{
                component: "a",
                href: action.url,
                target: "_blank",
                rel: "noopener noreferrer",
            }}
        />
    ));

    return (
        <>
            <SpeedDial
                ariaLabel="SpeedDial"
                hidden={false}
                icon={<SpeedDialIcon />}
                onClose={handleClose}
                onOpen={handleOpen}
                open={open}
                direction="down"
                sx={(muiTheme) => ({
                    position: "absolute",
                    top: muiTheme.spacing(6),
                    right: muiTheme.spacing(6),
                })}
            >
                {actionIcons}
            </SpeedDial>
        </>
    );
};
