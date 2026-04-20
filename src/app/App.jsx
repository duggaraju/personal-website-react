import React, { Suspense, lazy } from "react";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { HelmetMeta } from "./HelmetMeta";
import { ThemeProvider } from "../components/theme/ThemeProvider";
import { CssBaseline } from "@mui/material";
import { logCredits } from "../utils/logCredits";

import { Home } from "../pages/Home";

const Resume = lazy(() => import("../pages/Resume"));
const PageNotFound = lazy(() => import("../pages/PageNotFound"));

export const App = () => {
  logCredits();

  return (
    <ThemeProvider>
      <CssBaseline />
      <Router>
        <Suspense fallback={<>Loading...</>}>
          <HelmetMeta />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/resume" element={<Resume />} />
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </Suspense>
      </Router>
    </ThemeProvider>
  );
};
