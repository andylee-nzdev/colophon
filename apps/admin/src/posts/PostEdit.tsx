import {
    BooleanInput,
    DateField,
    DeleteButton,
    Edit,
    Labeled,
    maxLength,
    required,
    SaveButton,
    SelectInput,
    SimpleForm,
    TextInput,
    Toolbar,
} from "react-admin";
import { PublishButton } from "./PublishButton";
import { slugValidators } from "./validators";
import { LOCALES } from "./types";

const PostEditToolbar = () => (
    <Toolbar>
        <SaveButton />
        <PublishButton />
        <DeleteButton />
    </Toolbar>
);

/**
 * Pessimistic saves on purpose: the interesting failures here — a duplicate slug (409),
 * a rejected field (400) — come from the server, and optimistic mode would show a
 * success the API never gave.
 */
export const PostEdit = () => (
    <Edit mutationMode="pessimistic">
        <SimpleForm toolbar={<PostEditToolbar />}>
            <TextInput source="title" validate={[required(), maxLength(200)]} fullWidth />
            <TextInput
                source="slug"
                validate={slugValidators}
                helperText="resources.posts.helper.slug"
                fullWidth
            />
            <SelectInput source="locale" choices={LOCALES} validate={required()} />
            <TextInput source="excerpt" multiline validate={maxLength(500)} fullWidth />
            <TextInput
                source="body"
                multiline
                rows={10}
                validate={required()}
                helperText="resources.posts.helper.body"
                fullWidth
            />
            {/* Read-only: the toolbar's publish button owns this, not the form. */}
            <BooleanInput source="published" readOnly />
            <Labeled source="publishedAt">
                <DateField source="publishedAt" showTime />
            </Labeled>
        </SimpleForm>
    </Edit>
);
