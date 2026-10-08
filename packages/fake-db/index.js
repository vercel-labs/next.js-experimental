function query(sql) {
  // Dependency-internal promise chain: the current-time read happens in a
  // callback owned by the dependency, with no application frame below it.
  return Promise.resolve(sql).then(function stampRow(s) {
    return [{ sql: s, fetchedAt: new Date().toISOString() }]
  })
}
module.exports = { query }
