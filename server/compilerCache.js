// compilerCache.js
import NodeCache from "node-cache";

const compilerCache = new NodeCache({ stdTTL: 600 }); // Cache expires in 10 minutes

export default compilerCache;
