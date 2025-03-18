import * as posts from "@custom/db/schema/posts";
import * as comments from "@custom/db/schema/comments";
import * as categories from "@custom/db/schema/categories";
import * as categoriesToPosts from "@custom/db/schema/categoriesToPosts";
import * as programs from "@custom/db/schema/programs";


export const tableSchemas = {
    posts,
    comments,
    categories,
    categoriesToPosts,
    programs
};