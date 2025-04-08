import { registerRootComponent } from "expo";
import { LogBox } from "react-native";
import App from "./App";

// Ignore specific logs (optional)
LogBox.ignoreLogs([
  "Remote debugger",
  "Async Storage has been extracted",
  // Add any other warnings you want to suppress
]);

// Register the main component
registerRootComponent(App);
