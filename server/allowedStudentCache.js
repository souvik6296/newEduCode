// allowedStudentCache.js
import NodeCache from "node-cache";

const allowedStudentCache = new NodeCache({ stdTTL: 7200 }); // Cache expires in 2 hours

export default allowedStudentCache;
