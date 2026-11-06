import {callFnosApi} from './client.js';

import type {
    FilePermission
} from './types.js';

/*
 * 权限校验失败（例如 fnOS 未向进程注入 TRIM_API_TOKEN，
 * 或 ACL 服务暂时不可用）时不再阻断读写：
 * 应用进程本身具备完整的文件系统权限，
 * 此时按可读写处理，避免整个应用不可用。
 */
export async function checkUserFilePermission(
    uid: number,
    path: string
): Promise<FilePermission> {
    try {
        const permissions = await callFnosApi<
            {
                uid: number;
                path: string;
            },
            FilePermission[]
        >(
            'trim.file.checkUserACL',
            {
                uid,
                path
            }
        );

        const permission = permissions.find(
            (item) => item.path === path
        );

        if (permission) {
            return permission;
        }
    } catch {
        /*
         * 忽略 ACL 查询失败，走下方默认权限。
         */
    }

    return {
        path,
        readable: true,
        writable: true,
        deletable: true
    };
}
