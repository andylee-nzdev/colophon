import polyglotI18nProvider from "ra-i18n-polyglot";
import englishMessages from "ra-language-english";
import chineseMessages from "ra-language-chinese";
import type { TranslationMessages } from "react-admin";

/**
 * `ra-language-chinese` predates react-admin 5, so it is layered over the English
 * messages rather than replacing them: any key it never got shows English instead of a
 * raw `ra.action.something`.
 *
 * The chrome it provides is 简体. If the temple's volunteers prefer 繁體, swapping the
 * base import is the only change needed — the colophon-specific labels below move with it.
 */
function merge<T>(base: T, ...layers: Record<string, unknown>[]): T {
    return layers.reduce<Record<string, unknown>>((acc, layer) => {
        for (const [key, value] of Object.entries(layer)) {
            acc[key] =
                value && typeof value === "object" && !Array.isArray(value)
                    ? merge(
                          (acc[key] as Record<string, unknown>) ?? {},
                          value as Record<string, unknown>,
                      )
                    : value;
        }
        return acc;
    }, { ...base } as Record<string, unknown>) as T;
}

const colophonEn = {
    resources: {
        posts: {
            helper: {
                slug: "Lowercase words and hyphens, e.g. spring-festival-2026. Unique per locale.",
                body: "Markdown is supported.",
                publishOnCreate: "Publish immediately instead of saving a draft.",
            },
        },
    },
    colophon: {
        action: { publish: "Publish", unpublish: "Unpublish" },
        notification: { published: "Published", unpublished: "Unpublished" },
        filter: { published: "Published", draft: "Draft" },
    },
};

const colophonZh = {
    // Keys react-admin 5 added after `ra-language-chinese` was last published. Without
    // these the volunteer-facing screens fall back to English mid-sentence.
    ra: {
        action: {
            clear_array_input: "清空列表",
            create_item: "新建 %{item}",
            remove_all_filters: "移除所有检索条件",
            reset: "重置",
            search_columns: "检索列",
            select_all: "全选",
            select_all_button: "全选",
            select_row: "选择此行",
            update: "更新",
            move_up: "上移",
            move_down: "下移",
            open: "打开",
            toggle_theme: "切换明暗主题",
            select_columns: "选择列",
            update_application: "刷新应用",
        },
        page: {
            access_denied: "无访问权限",
            authentication_error: "认证错误",
        },
        message: {
            access_denied: "你没有访问此页面的权限。",
            authentication_error: "认证服务返回错误，无法确认你的身份。",
            auth_error: "认证令牌校验失败。",
            bulk_update_title: "更新 %{name} |||| 更新 %{smart_count} 项 %{name}",
            bulk_update_content:
                "确定要更新这项 %{name} 吗？ |||| 确定要更新这 %{smart_count} 项吗？",
            clear_array_input: "确定要清空整个列表吗？",
            details: "详情",
            select_all_limit_reached: "选中项过多，只保留了前 %{max} 项。",
            placeholder_data_warning: "数据加载失败。",
        },
        navigation: {
            clear_filters: "清除检索条件",
            no_filtered_results: "没有符合当前检索条件的%{name}。",
            partial_page_range_info: "第 %{offsetBegin}-%{offsetEnd} 项，共超过 %{offsetEnd} 项",
            current_page: "第 %{page} 页",
            page: "第 %{page} 页",
            first: "首页",
            last: "末页",
            previous: "上一页",
        },
        auth: { email: "邮箱" },
        notification: {
            not_authorized: "你没有执行此操作的权限。",
            application_update_available: "有新版本可用。",
            offline: "当前处于离线状态，显示的内容可能不是最新的。",
        },
        validation: { unique: "必须唯一" },
    },
    resources: {
        posts: {
            name: "文章 |||| 文章",
            fields: {
                title: "标题",
                slug: "网址代号",
                locale: "语言",
                excerpt: "摘要",
                body: "内容",
                published: "已发布",
                publishedAt: "发布时间",
                createdAt: "建立时间",
                updatedAt: "更新时间",
            },
            helper: {
                slug: "小写英数字与连字号，例如 spring-festival-2026。同一语言下不可重复。",
                body: "支持 Markdown。",
                publishOnCreate: "建立后立即发布，否则先存为草稿。",
            },
        },
    },
    colophon: {
        action: { publish: "发布", unpublish: "取消发布" },
        notification: { published: "已发布", unpublished: "已取消发布" },
        filter: { published: "已发布", draft: "草稿" },
    },
};

const zh = merge(englishMessages, chineseMessages, colophonZh);
const en = merge(englishMessages, colophonEn);

export const i18nProvider = polyglotI18nProvider(
    (locale: string) => (locale === "en" ? en : zh) as TranslationMessages,
    "zh",
    [
        { locale: "zh", name: "中文" },
        { locale: "en", name: "English" },
    ],
);
