import { getConfig } from '../../app/utils/config.ts'

export default defineEventHandler(async (event) => {
    setResponseHeader(event, 'Content-Type', 'application/json');
    return await getConfig();
});
