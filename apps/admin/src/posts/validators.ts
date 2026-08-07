import { maxLength, regex, required } from "react-admin";

/** Same rule as the API's `@Pattern` and the `post_slug_format_chk` constraint. */
export const slugValidators = [
    required(),
    maxLength(160),
    regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "resources.posts.helper.slug"),
];
