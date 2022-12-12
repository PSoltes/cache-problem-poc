import { handler } from "presentation/pages/api/v2/handler";
import { withApiAuth } from "src/utils/auth/withApiAuth";

const middlewareWithApi = withApiAuth(handler)

export default middlewareWithApi