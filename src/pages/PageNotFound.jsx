import React from "react";
import { Button, Container, Typography } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { Link } from "react-router-dom";

export const PageNotFound = () => {
    return (
        <Container component="main" maxWidth="sm" sx={{ py: 8 }}>
            <Typography variant="h2" component="h1" gutterBottom>
                Page not found
            </Typography>
            <Typography sx={{ mb: 3 }}>
                The page you requested does not exist.
            </Typography>
            <Button component={Link} to="/" startIcon={<ArrowBack />}>
                Return home
            </Button>
        </Container>
    );
};

export default PageNotFound;
