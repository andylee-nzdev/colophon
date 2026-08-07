import {
    BooleanField,
    Datagrid,
    DateField,
    EditButton,
    List,
    SelectInput,
    TextField,
} from "react-admin";
import { PublishButton } from "./PublishButton";
import { LOCALES } from "./types";

/**
 * Both filters are always on because the API cannot list across them: it reads one
 * locale at a time, and its `published` parameter has no "either" value — omitting it
 * means published-only. Until an authenticated editor can ask for everything, the
 * draft/published toggle is the way to see drafts.
 */
const postFilters = [
    <SelectInput key="locale" source="locale" choices={LOCALES} alwaysOn />,
    <SelectInput
        key="published"
        source="published"
        alwaysOn
        choices={[
            { id: true, name: "colophon.filter.published" },
            { id: false, name: "colophon.filter.draft" },
        ]}
    />,
];

export const PostList = () => (
    <List
        filters={postFilters}
        filterDefaultValues={{ locale: "en", published: true }}
        sort={{ field: "publishedAt", order: "DESC" }}
        perPage={20}
    >
        <Datagrid rowClick="edit">
            <TextField source="title" />
            <TextField source="slug" />
            <TextField source="locale" />
            <BooleanField source="published" />
            <DateField source="publishedAt" showTime />
            <DateField source="updatedAt" showTime />
            <PublishButton />
            <EditButton />
        </Datagrid>
    </List>
);
