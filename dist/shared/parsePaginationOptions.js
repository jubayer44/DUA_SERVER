"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePaginationOptions = void 0;
const parsePaginationOptions = (query) => {
    return {
        page: parseInt(query.page, 10) || 1, // Default to page 1 if not provided
        limit: parseInt(query.limit, 10) || 10, // Default to 10 items per page
        sortBy: query.sortBy,
        sortOrder: query.sortOrder === "asc" || query.sortOrder === "desc"
            ? query.sortOrder
            : undefined, // Ensure correct values for sortOrder
    };
};
exports.parsePaginationOptions = parsePaginationOptions;
