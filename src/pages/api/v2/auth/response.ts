import { handlerWithHeaders } from "presentation/pages/api/v2/handlerWithHeaders";
import { withApiAuth } from "src/utils/auth/withApiAuth";

const responseWithAuth = withApiAuth(handlerWithHeaders)

export default responseWithAuth