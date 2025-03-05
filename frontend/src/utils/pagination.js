export function paginate(data, itemsPerPage, currentPage) {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = data.slice(startIndex, endIndex);
  const totalPages = Math.ceil(data.length / itemsPerPage);

  return {
    paginatedData,
    currentPage,
    totalPages,
    itemsPerPage,
    totalItems: data.length,
  };
}
