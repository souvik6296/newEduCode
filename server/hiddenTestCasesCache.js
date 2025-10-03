// hiddenTestCasesCache.js
import NodeCache from "node-cache";

const hiddenTestCasesCache = new NodeCache({ stdTTL: 600 }); // Cache expires in 10 minutes

export default hiddenTestCasesCache;
