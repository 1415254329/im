function Chat(options) {
    uni.showLoading({
        title: '加载中'
    });
    setTimeout(function () {
        uni.hideLoading();
    }, 5000);
    return uni.request({
        url: options.url,
        method: options.method,
        data: options.data,
        header: {
            "Cookie": "JSESSIONID=" + options.jsonid
        },
    })

}

export default Chat;
