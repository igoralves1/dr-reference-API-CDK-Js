const handler = async (event, context) => {
  logger.log("Event triggered: ", event);
};

module.exports = {
  handler,
};
