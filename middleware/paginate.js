

exports.getPagination = (page, size) => {
    const limit = parseInt(size) ? parseInt(size) : 10;
    const offset = parseInt(page) ? parseInt(page) * limit : 0;

    return { limit, offset };
};
exports.getPagingData = (data, page, limit) => {
    const { totalItems, results } = data;
    const currentPage = parseInt(page) ? parseInt(page) : 0;
    const totalPages = Math.ceil(totalItems / limit);

    return { totalItems, results, totalPages, currentPage };
};