import { useState } from "react";
import type { MouseEvent } from "react";
import {
    Button,
    useDataProvider,
    useNotify,
    useRecordContext,
    useRefresh,
} from "react-admin";
import type { ColophonDataProvider } from "../dataProvider";
import type { Post } from "./types";

/**
 * Publication state is not part of the edit form: the API changes it through its own
 * endpoints, and `PUT` deliberately ignores the field.
 */
export const PublishButton = () => {
    const record = useRecordContext<Post>();
    const dataProvider = useDataProvider<ColophonDataProvider>();
    const notify = useNotify();
    const refresh = useRefresh();
    const [busy, setBusy] = useState(false);

    if (!record) return null;

    const publishing = !record.published;

    const handleClick = async (event: MouseEvent) => {
        // In a datagrid row the click would otherwise also open the edit view.
        event.stopPropagation();
        setBusy(true);
        try {
            await (publishing
                ? dataProvider.publish(record.id)
                : dataProvider.unpublish(record.id));
            notify(
                publishing
                    ? "colophon.notification.published"
                    : "colophon.notification.unpublished",
                { type: "success" },
            );
            refresh();
        } catch (error) {
            notify((error as Error).message, { type: "error" });
        } finally {
            setBusy(false);
        }
    };

    return (
        <Button
            label={publishing ? "colophon.action.publish" : "colophon.action.unpublish"}
            onClick={handleClick}
            disabled={busy}
        />
    );
};
