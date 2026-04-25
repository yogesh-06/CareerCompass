import { createApplication } from "./app.js";
import { environment } from "./infrastructure/configuration/environment.js";

const app = createApplication();

app.listen(environment.port, () => {
  console.log(`CareerCompass backend listening on port ${environment.port}`);
});
