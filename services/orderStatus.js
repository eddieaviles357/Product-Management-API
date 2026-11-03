const fulfillmentTransitions = new Map([
  ["paid", "pending"],
  ["cancelled", "pending"],
  ["shipped", "paid"],
  ["refunded", "paid"],
  ["delivered", "shipped"],
]);

function getExpectedStatus(requestedStatus) {
  return fulfillmentTransitions.get(requestedStatus);
}

module.exports = { getExpectedStatus };