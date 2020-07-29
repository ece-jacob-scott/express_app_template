class APIError extends Error {
  constructor(status, message) {
    super();
    this.status = status;
    this.message = message;
  }
}

const handleError = (err, res) => {
  if (!("status" in err)) {
    res.status(500).json({
      status: 500,
      message: `Unhandlable Error: ${err}`,
    });
  } else {
    res.status(err.status).json(err);
  }
};

module.exports.APIError = APIError;

module.exports.handleError = handleError;
