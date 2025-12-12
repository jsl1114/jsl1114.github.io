import app from './app.js';
import { config } from './config/config.js';

app.listen(config.port, () => {
  console.log(`Email server running at http://localhost:${config.port}`);
});
