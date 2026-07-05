
const errorHandler = (err, req, res, next) => {
    console.log('***Error:', err);
    let statusCode = err.statusCode ?? 200;
    let errMessage = err.message ?? 'Something went wrong!';
    let respData = err.respData ?? null;

    return res.status(statusCode).json({
        hasError: true,
        msg: errMessage,
        data: respData
    });
}

module.exports = errorHandler;