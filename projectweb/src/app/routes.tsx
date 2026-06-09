import * as React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RecoverAccount from "./pages/RecoverAccount";
import CreateGroup from "./pages/CreateGroup";
import JoinGroup from "./pages/JoinGroup";
import ProfileSetup from "./pages/ProfileSetup";
import Dashboard from "./pages/Dashboard";
import SmartInventory from "./pages/SmartInventory";
import EventHub from "./pages/EventHub";
import Members from "./pages/Members";
import ProductList from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Chat from "./pages/Chat";
import { RequireAuth } from "./components/RequireAuth";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Navigate to="/login" replace />,
    },
    {
        path: "/home",
        element: (
            <RequireAuth>
                <Landing />
            </RequireAuth>
        ),
    },
    {
        path: "/login",
        Component: Login,
    },
    {
        path: "/register",
        Component: Register,
    },
    {
        path: "/recover-account",
        Component: RecoverAccount,
    },
    {
        path: "/products",
        element: (
            <RequireAuth>
                <ProductList />
            </RequireAuth>
        ),
    },
    {
        path: "/products/:id",
        element: (
            <RequireAuth>
                <ProductDetail />
            </RequireAuth>
        ),
    },
    {
        path: "/create-group",
        element: (
            <RequireAuth>
                <CreateGroup />
            </RequireAuth>
        ),
    },
    {
        path: "/join-group",
        element: (
            <RequireAuth>
                <JoinGroup />
            </RequireAuth>
        ),
    },
    {
        path: "/profile-setup",
        element: (
            <RequireAuth>
                <ProfileSetup />
            </RequireAuth>
        ),
    },
    {
        path: "/dashboard",
        element: (
            <RequireAuth>
                <Dashboard />
            </RequireAuth>
        ),
    },
    {
        path: "/inventory",
        element: (
            <RequireAuth>
                <SmartInventory />
            </RequireAuth>
        ),
    },
    {
        path: "/event-hub",
        element: (
            <RequireAuth>
                <EventHub />
            </RequireAuth>
        ),
    },
    {
        path: "/members",
        element: (
            <RequireAuth>
                <Members />
            </RequireAuth>
        ),
    },
    {
        path: "/chat",
        element: (
            <RequireAuth permission="VIEW_CHAT">
                <Chat />
            </RequireAuth>
        ),
    },
]);
