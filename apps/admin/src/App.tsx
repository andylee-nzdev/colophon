import { Admin, Resource } from "react-admin";
import { dataProvider } from "./dataProvider";
import { i18nProvider } from "./i18nProvider";
import { PostCreate, PostEdit, PostList } from "./posts";

/**
 * No `authProvider` yet — the API's write endpoints are still open. When JWT auth lands,
 * add one here and a bearer header in the data provider's `request`.
 */
const App = () => (
    <Admin
        dataProvider={dataProvider}
        i18nProvider={i18nProvider}
        title="colophon"
        disableTelemetry
    >
        <Resource
            name="posts"
            list={PostList}
            edit={PostEdit}
            create={PostCreate}
            recordRepresentation="title"
        />
    </Admin>
);

export default App;
