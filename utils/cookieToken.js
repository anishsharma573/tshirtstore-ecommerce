const cookieToken = (user, res) => {
    // Use the getJwtToken method on the user object
    const token = user.getJwtToken();

    const options = {
        expires: new Date(
            Date.now() + process.env.COOKIE_TIME * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
    }

    // Clear the password before sending the response
    user.password = undefined;

    // Send the response with the token and user details
    res.status(200).cookie('token', token, options).json({
        success: true,
        token,
        user,
    });
}

module.exports = cookieToken;
