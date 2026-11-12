import "../global.css";
import { HeroUINativeProvider } from "heroui-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AdminApp } from "./screens/admin";
import { MiniApp } from "./screens/mini";
import { PublicSite } from "./screens/public";
import { styles } from "./theme/styles";
import type { SurfaceName } from "./types";

function getSurface(): SurfaceName {
  if (typeof window === "undefined") return "mini";
  if (window.location.hostname === "cbf1488.com") {
    const destination = new URL(window.location.href);
    destination.hostname = "www.cbf1488.com";
    destination.protocol = "https:";
    window.location.replace(destination.toString());
    return "public";
  }
  const requested = new URLSearchParams(window.location.search).get("surface");
  if (requested === "mini" || requested === "admin" || requested === "public") return requested;
  if (window.location.hostname === "admin.cbf1488.com") return "admin";
  if (window.location.hostname === "www.cbf1488.com") return "public";
  return "mini";
}

function RootSurface() {
  const surface = getSurface();
  if (surface === "public") return <PublicSite />;
  if (surface === "admin") return <AdminApp />;
  return <MiniApp />;
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <HeroUINativeProvider>
          <RootSurface />
        </HeroUINativeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
