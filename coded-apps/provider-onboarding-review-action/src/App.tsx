import { useCallback, useState } from "react";
import Form from "./components/Form";

function App() {
  const [darkTheme, setDarkTheme] = useState(false);

  const handleInitTheme = useCallback((isDark: boolean) => {
    setDarkTheme(isDark);
    document.body.className = isDark ? "dark" : "light";
  }, []);

  return (
    <div className={darkTheme ? "dark app-root" : "light app-root"}>
      <Form onInitTheme={handleInitTheme} />
    </div>
  );
}

export default App;
