import { logger } from "../../utils";

export default defineTask({
  meta: {
    name: 'health-check',
    description: 'Performs a health check of the server and its dependencies',
  },
  async run() {
    const response = await $fetch('/api/healthz');

    logger.debug('Health check response:', response);

    return response;
  }
})
