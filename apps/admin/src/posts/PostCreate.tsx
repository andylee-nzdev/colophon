import {
    BooleanInput,
    Create,
    maxLength,
    required,
    SelectInput,
    SimpleForm,
    TextInput,
} from "react-admin";
import { slugValidators } from "./validators";
import { LOCALES } from "./types";

export const PostCreate = () => (
    <Create redirect="edit">
        <SimpleForm>
            <TextInput source="title" validate={[required(), maxLength(200)]} fullWidth />
            <TextInput
                source="slug"
                validate={slugValidators}
                helperText="resources.posts.helper.slug"
                fullWidth
            />
            <SelectInput
                source="locale"
                choices={LOCALES}
                defaultValue="en"
                validate={required()}
            />
            <TextInput source="excerpt" multiline validate={maxLength(500)} fullWidth />
            <TextInput
                source="body"
                multiline
                rows={10}
                validate={required()}
                helperText="resources.posts.helper.body"
                fullWidth
            />
            <BooleanInput
                source="published"
                defaultValue={false}
                helperText="resources.posts.helper.publishOnCreate"
            />
        </SimpleForm>
    </Create>
);
