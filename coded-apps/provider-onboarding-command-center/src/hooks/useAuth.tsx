import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { getAppBase } from "@uipath/uipath-typescript";
import { UiPath, type UiPathSDKConfig } from "@uipath/uipath-typescript/core";

type AuthState = "idle" | "loading" | "authenticated" | "error";

type AuthContextValue = {
  sdk: unknown | null;
  status: AuthState;
  error: string | null;
  signIn: () => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function getMetaValue(name: string): string {
  return document.querySelector(`meta[name="${name}"]`)?.getAttribute("content")?.trim() ?? "";
}

function hasCodedAppMetaConfig(): boolean {
  return Boolean(
    getMetaValue("uipath:client-id") &&
      getMetaValue("uipath:scope") &&
      getMetaValue("uipath:base-url") &&
      getMetaValue("uipath:org-name") &&
      getMetaValue("uipath:tenant-name") &&
      getMetaValue("uipath:redirect-uri")
  );
}

function getRuntimeRedirectUri(): string {
  const appBase = getAppBase();
  const normalizedPath = appBase === "/" ? "/" : appBase.replace(/\/$/, "");
  return new URL(normalizedPath, window.location.origin).toString();
}

function getLocalConfig(): UiPathSDKConfig {
  return {
    clientId: import.meta.env.VITE_UIPATH_CLIENT_ID,
    scope: import.meta.env.VITE_UIPATH_SCOPE,
    baseUrl: import.meta.env.VITE_UIPATH_BASE_URL,
    orgName: import.meta.env.VITE_UIPATH_ORG_NAME,
    tenantName: import.meta.env.VITE_UIPATH_TENANT_NAME,
    redirectUri: getRuntimeRedirectUri()
  };
}

async function createClient(): Promise<unknown> {
  const sdk = hasCodedAppMetaConfig() ? new UiPath() : new UiPath(getLocalConfig());
  await sdk.initialize();
  return sdk;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sdk, setSdk] = useState<unknown | null>(null);
  const [status, setStatus] = useState<AuthState>("idle");
  const [error, setError] = useState<string | null>(null);

  const value = useMemo<AuthContextValue>(
    () => ({
      sdk,
      status,
      error,
      signIn: async () => {
        setStatus("loading");
        setError(null);
        try {
          const client = await createClient();
          setSdk(client);
          setStatus("authenticated");
        } catch (authError) {
          setSdk(null);
          setStatus("error");
          setError(authError instanceof Error ? authError.message : "Unable to authenticate with UiPath.");
        }
      },
      signOut: () => {
        setSdk(null);
        setStatus("idle");
        setError(null);
      }
    }),
    [error, sdk, status]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }
  return value;
}
