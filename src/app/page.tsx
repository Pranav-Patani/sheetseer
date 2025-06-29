import Main from "@/components/Main";
import { AppProvider } from "@/components/context/AppContext";

export default function Page() {
  return (
    <AppProvider>
      <Main />
    </AppProvider>
  );
}
