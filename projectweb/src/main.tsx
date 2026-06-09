import * as React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./app/routes";
import { AuthProvider } from "./app/context/AuthContext";
import { GroupProvider } from "./app/context/GroupContext";
import { setTracking } from "./app/utils/cookieTracker";
import "./styles/index.css";

const root = document.getElementById("root");

if (!root) {
    throw new Error("Root not found");
}

setTracking({
    lastRoute: window.location.pathname,
    lastRouteAt: new Date().toISOString(),
});

router.subscribe((state) => {
    setTracking({
        lastRoute: state.location.pathname,
        lastRouteAt: new Date().toISOString(),
    });
});

ReactDOM.createRoot(root).render(
    <React.StrictMode>
        <AuthProvider>
            <GroupProvider>
                <RouterProvider router={router} />
            </GroupProvider>
        </AuthProvider>
    </React.StrictMode>
);
