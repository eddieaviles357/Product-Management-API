function sanitizePagination(page, limit) {
  const p = Math.max(1, Number(page) || 1);
  const l = Math.max(1, Number(limit) || 10);

  return {
    page: p,
    limit: l,
    offset: (p - 1) * l
  };
}

module.exports = sanitizePagination;