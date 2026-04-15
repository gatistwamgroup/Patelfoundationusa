/**
 * @desc Test reach of the API
 * @route GET /api/test
 * @access Public
 */
const getTestMessage = (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend working"
  });
};

module.exports = {
  getTestMessage,
};
