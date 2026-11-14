import * as env from "./env.js";
import * as session from "./session.js";
import * as api from "./http.js";
import * as format from "./format.js";
import * as events from "./events.js";
import * as a11y from "./a11y.js";
import * as courses from "../domain/courses.js";
import * as actions from "../domain/actions.js";
import * as purchases from "../domain/purchases.js";

window.EcoCampus = {
    env,
    session,
    api,
    format,
    events,
    a11y,
    domain: {
        courses,
        actions,
        purchases
    }
};
